const prisma = require('../lib/prisma');

async function seedCommunitiesAndChallenges() {
  const communityCount = await prisma.community.count();
  if (communityCount === 0) {
    await prisma.community.createMany({
      data: [
        {
          name: 'Frontend Developers',
          description: 'Connect with peers learning HTML, CSS, JavaScript, and modern frontend frameworks.',
          skillTag: 'Frontend Development',
          memberCount: 0
        },
        {
          name: 'Python Programmers',
          description: 'A community for students mastering Python programming and data science.',
          skillTag: 'Python',
          memberCount: 0
        },
        {
          name: 'Backend Engineers',
          description: 'Discuss APIs, databases, server-side architecture, and backend best practices.',
          skillTag: 'Backend Development',
          memberCount: 0
        },
        {
          name: 'Data Science Enthusiasts',
          description: 'Share insights on data analysis, machine learning, and statistical modeling.',
          skillTag: 'Data Science',
          memberCount: 0
        },
        {
          name: 'Mobile App Developers',
          description: 'Build and discuss mobile applications for iOS and Android platforms.',
          skillTag: 'Mobile Development',
          memberCount: 0
        }
      ]
    });
    console.log('[Seed] Created default communities');
  }

  const challengeCount = await prisma.weeklyChallenge.count();
  if (challengeCount === 0) {
    const now = new Date();
    const startDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const deadline = new Date(startDate);
    deadline.setUTCDate(deadline.getUTCDate() + 7);

    await prisma.weeklyChallenge.create({
      data: {
        title: 'Build a Responsive Landing Page',
        description: 'Create a fully responsive landing page using HTML and CSS. Include a hero section, features grid, and a contact form. Submit a link to your hosted page or a GitHub repository.',
        skillTag: 'Frontend Development',
        xpReward: 75,
        startDate,
        deadline,
        isActive: true
      }
    });
    console.log('[Seed] Created current weekly challenge');
  }

  const employer = await prisma.user.findFirst({ where: { role: 'employer' } });
  if (!employer) {
    const bcrypt = require('bcrypt');
    const hashed = await bcrypt.hash('employer123', 10);
    const newEmployer = await prisma.user.create({
      data: {
        email: 'employer@bridgeup.dev',
        password: hashed,
        role: 'employer',
        firstName: 'Sysco',
        lastName: 'Labs',
        age: 0,
        city: 'Colombo',
        university: 'N/A',
        degree: 'N/A',
        currentYear: 'N/A',
        selectedRoles: [],
        companyName: 'Sysco Labs'
      }
    });

    const eventCount = await prisma.event.count();
    if (eventCount === 0) {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 14);

      await prisma.event.createMany({
        data: [
          {
            employerId: newEmployer.id,
            title: 'Backend Community Check-in',
            description: 'Join our backend engineers for a live Q&A session about API design, database optimization, and career paths in backend development.',
            mode: 'online',
            link: 'https://meet.bridgeup.dev/backend-checkin',
            eventDate: futureDate,
            capacity: 50,
            skills: ['Backend Development', 'Python']
          },
          {
            employerId: newEmployer.id,
            title: 'Sysco Labs Industry Visit',
            description: 'Visit Sysco Labs headquarters to learn about their tech stack, meet the engineering team, and explore internship opportunities.',
            mode: 'physical',
            location: 'Sysco Labs, Colombo 03',
            eventDate: new Date(futureDate.getTime() + 7 * 24 * 60 * 60 * 1000),
            capacity: 30,
            skills: ['Frontend Development', 'Backend Development']
          },
          {
            employerId: newEmployer.id,
            title: 'Data Science Workshop',
            description: 'Hands-on workshop covering Python data analysis with pandas and introductory machine learning concepts.',
            mode: 'hybrid',
            location: 'University of Colombo, Faculty of Science',
            link: 'https://meet.bridgeup.dev/data-science-workshop',
            eventDate: new Date(futureDate.getTime() + 21 * 24 * 60 * 60 * 1000),
            capacity: 100,
            skills: ['Data Science', 'Python']
          }
        ]
      });
      console.log('[Seed] Created sample employer and events');
    }
  }
}

module.exports = { seedCommunitiesAndChallenges };
