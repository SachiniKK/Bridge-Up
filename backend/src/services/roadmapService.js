const prisma = require('../lib/prisma');

const ROLE_TEMPLATES = {
  'Backend Developer': [
    {
      skillName: 'REST APIs',
      demandPercent: 87,
      durationWeeks: 6,
      description: 'Asked in 87% of backend JDs across Colombo. Without this, you won\'t pass first-round interviews.',
      weeksDetails: [
        { weeks: 'Wk 1-2', content: 'HTTP methods, status codes, headers' },
        { weeks: 'Wk 3-4', content: 'Build your first API (Express.js / Flask)' },
        { weeks: 'Wk 5-6', content: 'JWT auth + deploy API' }
      ],
      resources: [
        {
          title: 'Intro: REST APIs & why Sri Lankan devs need this now',
          type: 'youtube',
          url: 'https://www.youtube.com/watch?v=REST_INTRO',
          durationMins: 45,
          xpReward: 120,
          justification: 'Required for 87% of local job postings including WSO2 and Sysco LABS.'
        },
        {
          title: 'Node.js & Express REST API Crash Course',
          type: 'coursera',
          url: 'https://www.coursera.org/learn/node-express-apis',
          durationMins: 180,
          xpReward: 150,
          justification: 'Highly recommended by Sysco LABS for internship eligibility.'
        }
      ]
    },
    {
      skillName: 'Git & Version Control',
      demandPercent: 82,
      durationWeeks: 3,
      description: 'Every Sri Lankan tech company uses Git. Not knowing it signals lack of real project experience.',
      weeksDetails: [
        { weeks: 'Wk 1', content: 'Init, commit, branching' },
        { weeks: 'Wk 2', content: 'Pull requests & teamwork' },
        { weeks: 'Wk 3', content: 'Resolve merge conflicts' }
      ],
      resources: [
        {
          title: 'Git and GitHub Crash Course for Beginners',
          type: 'youtube',
          url: 'https://www.youtube.com/watch?v=GIT_INTRO',
          durationMins: 30,
          xpReward: 80,
          justification: 'Required by 82% of entry-level engineering postings.'
        }
      ]
    },
    {
      skillName: 'SQL / Databases',
      demandPercent: 74,
      durationWeeks: 4,
      description: 'Backend roles almost always require databases. SQL is the most transferable skill.',
      weeksDetails: [
        { weeks: 'Wk 1', content: 'SELECT, WHERE, JOIN' },
        { weeks: 'Wk 2', content: 'GROUP BY, aggregations' },
        { weeks: 'Wk 3-4', content: 'Schema design + integrate with API' }
      ],
      resources: [
        {
          title: 'SQL Databases Tutorial for Backend Engineers',
          type: 'edx',
          url: 'https://www.edx.org/learn/sql-databases',
          durationMins: 120,
          xpReward: 100,
          justification: 'Required for IFS screening assessment.'
        }
      ]
    }
  ],
  'Frontend Developer': [
    {
      skillName: 'React.js',
      demandPercent: 88,
      durationWeeks: 5,
      description: 'Industry standard frontend framework. Essential for building rich interactive interfaces.',
      weeksDetails: [
        { weeks: 'Wk 1-2', content: 'Components, props, state' },
        { weeks: 'Wk 3-4', content: 'Hooks, context, router' },
        { weeks: 'Wk 5', content: 'State management (Redux/Zustand)' }
      ],
      resources: [
        {
          title: 'React Course for Beginners 2026',
          type: 'youtube',
          url: 'https://www.youtube.com/watch?v=REACT_INTRO',
          durationMins: 60,
          xpReward: 100,
          justification: 'Directly requested in 88% of frontend postings including Creative Software.'
        }
      ]
    },
    {
      skillName: 'JavaScript',
      demandPercent: 84,
      durationWeeks: 4,
      description: 'Fundamental language for modern web applications.',
      weeksDetails: [
        { weeks: 'Wk 1-2', content: 'ES6+ syntax, promises, async/await' },
        { weeks: 'Wk 3-4', content: 'DOM operations, Fetch API' }
      ],
      resources: [
        {
          title: 'Modern JS from the Beginning',
          type: 'coursera',
          url: 'https://www.coursera.org/learn/modern-javascript',
          durationMins: 150,
          xpReward: 120,
          justification: 'Base requirement for Virtusa frontend training track.'
        }
      ]
    }
  ]
};

const DEFAULT_TEMPLATE = [
  {
    skillName: 'General Programming',
    demandPercent: 60,
    durationWeeks: 4,
    description: 'Master general programming concepts and algorithmic logic.',
    weeksDetails: [
      { weeks: 'Wk 1-2', content: 'Variables, loops, and conditions' },
      { weeks: 'Wk 3-4', content: 'Functions and basic data structures' }
    ],
    resources: [
      {
        title: 'Introduction to Programming Principles',
        type: 'youtube',
        url: 'https://www.youtube.com/watch?v=PROG_INTRO',
        durationMins: 45,
        xpReward: 100,
        justification: 'Baseline skill for all technology paths.'
      }
    ]
  }
];

/**
 * Generate roadmap for a student based on target role.
 */
async function generateRoadmap(studentId, targetRole, selfAssessments = {}) {
  // Clear any existing roadmap
  const existing = await prisma.learningRoadmap.findUnique({
    where: { studentId }
  });
  if (existing) {
    await prisma.learningRoadmap.delete({ where: { id: existing.id } });
  }

  const template = ROLE_TEMPLATES[targetRole] || DEFAULT_TEMPLATE;
  const totalWeeks = template.reduce((sum, item) => sum + item.durationWeeks, 0);
  const potentialXP = template.reduce((sum, item) => {
    return sum + item.resources.reduce((rSum, res) => rSum + res.xpReward, 0);
  }, 0);

  const roadmap = await prisma.learningRoadmap.create({
    data: {
      studentId,
      targetRole,
      totalWeeks,
      potentialXP
    }
  });

  for (let i = 0; i < template.length; i++) {
    const item = template[i];
    const skillRating = selfAssessments[item.skillName] || 'None';

    // Status: Completed if rated Comfortable, active if first step, locked otherwise
    let status = 'locked';
    if (skillRating === 'Comfortable') {
      status = 'completed';
    } else if (i === 0 || (i > 0 && template[i - 1].skillName && selfAssessments[template[i - 1].skillName] === 'Comfortable')) {
      status = 'active';
    }

    // fallback active step rule if nothing matches active
    if (i === 0 && status === 'locked') {
      status = 'active';
    }

    const step = await prisma.roadmapStep.create({
      data: {
        roadmapId: roadmap.id,
        skillName: item.skillName,
        demandPercent: item.demandPercent,
        durationWeeks: item.durationWeeks,
        status,
        order: i + 1,
        description: item.description,
        weeksDetails: item.weeksDetails
      }
    });

    for (const res of item.resources) {
      await prisma.roadmapResource.create({
        data: {
          stepId: step.id,
          title: res.title,
          type: res.type,
          url: res.url,
          durationMins: res.durationMins,
          xpReward: res.xpReward,
          completed: status === 'completed',
          justification: res.justification
        }
      });
    }
  }

  // Ensure at least one step is active if there are incomplete steps
  await ensureActiveStep(roadmap.id);

  return await prisma.learningRoadmap.findUnique({
    where: { id: roadmap.id },
    include: {
      steps: {
        orderBy: { order: 'asc' },
        include: { resources: true }
      }
    }
  });
}

/**
 * Ensure that the first incomplete step is active
 */
async function ensureActiveStep(roadmapId) {
  const steps = await prisma.roadmapStep.findMany({
    where: { roadmapId },
    orderBy: { order: 'asc' }
  });

  const firstIncompleteIdx = steps.findIndex(s => s.status !== 'completed');
  if (firstIncompleteIdx !== -1) {
    for (let i = 0; i < steps.length; i++) {
      let targetStatus = steps[i].status;
      if (i < firstIncompleteIdx) {
        targetStatus = 'completed';
      } else if (i === firstIncompleteIdx) {
        targetStatus = 'active';
      } else {
        targetStatus = 'locked';
      }

      if (steps[i].status !== targetStatus) {
        await prisma.roadmapStep.update({
          where: { id: steps[i].id },
          data: { status: targetStatus }
        });
      }
    }
  }
}

/**
 * Complete a resource in the roadmap
 */
async function completeResource(studentId, resourceId) {
  const resource = await prisma.roadmapResource.findUnique({
    where: { id: resourceId },
    include: { step: { include: { roadmap: true } } }
  });

  if (!resource) throw new Error('Resource not found');
  if (resource.step.roadmap.studentId !== studentId) {
    throw new Error('Unauthorized access to this resource');
  }

  if (resource.completed) {
    return { alreadyCompleted: true, resource };
  }

  const updatedResource = await prisma.roadmapResource.update({
    where: { id: resourceId },
    data: { completed: true, completedAt: new Date() }
  });

  // Award XP
  const xpService = require('./xpService');
  const xpResult = await xpService.awardXP(
    studentId,
    resource.xpReward,
    'learning_resource_completed',
    null,
    resourceId
  );

  // Check if all resources in this step are completed
  const allResources = await prisma.roadmapResource.findMany({
    where: { stepId: resource.stepId }
  });
  const allDone = allResources.every(r => r.completed);

  if (allDone) {
    await prisma.roadmapStep.update({
      where: { id: resource.stepId },
      data: { status: 'completed' }
    });
    // Unlock next steps
    await ensureActiveStep(resource.step.roadmap.id);
  }

  return { alreadyCompleted: false, resource: updatedResource, xpResult };
}

/**
 * Get student learning roadmap
 */
async function getRoadmap(studentId) {
  const roadmap = await prisma.learningRoadmap.findUnique({
    where: { studentId },
    include: {
      steps: {
        orderBy: { order: 'asc' },
        include: { resources: true }
      }
    }
  });

  return roadmap;
}

module.exports = {
  generateRoadmap,
  completeResource,
  getRoadmap
};
