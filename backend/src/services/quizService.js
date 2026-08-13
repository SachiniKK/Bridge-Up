const prisma = require('../lib/prisma');

const SKILL_QUIZZES = {
  'REST APIs': {
    title: 'REST APIs Fundamentals Quiz',
    questions: [
      {
        question: 'Which HTTP method is typically used to create a new resource on the server?',
        options: ['GET', 'POST', 'PUT', 'DELETE'],
        correctOption: 1
      },
      {
        question: 'What does the HTTP status code 404 represent?',
        options: ['OK', 'Internal Server Error', 'Not Found', 'Unauthorized'],
        correctOption: 2
      },
      {
        question: 'Which HTTP header is commonly used to send JWT authentication tokens?',
        options: ['Authorization', 'Content-Type', 'Accept', 'User-Agent'],
        correctOption: 0
      }
    ]
  },
  'Git & Version Control': {
    title: 'Git Version Control Quiz',
    questions: [
      {
        question: 'Which command initializes a new local Git repository?',
        options: ['git commit', 'git add', 'git init', 'git push'],
        correctOption: 2
      },
      {
        question: 'How do you create a new branch and switch to it immediately?',
        options: ['git branch <name>', 'git checkout -b <name>', 'git checkout <name>', 'git merge <name>'],
        correctOption: 1
      },
      {
        question: 'What is the command to upload local commits to a remote repository?',
        options: ['git pull', 'git fetch', 'git clone', 'git push'],
        correctOption: 3
      }
    ]
  },
  'SQL / Databases': {
    title: 'SQL & Database Basics Quiz',
    questions: [
      {
        question: 'Which keyword is used to filter records in a SQL query?',
        options: ['WHERE', 'GROUP BY', 'ORDER BY', 'HAVING'],
        correctOption: 0
      },
      {
        question: 'Which join returns all matching records from both tables?',
        options: ['LEFT JOIN', 'INNER JOIN', 'RIGHT JOIN', 'CROSS JOIN'],
        correctOption: 1
      },
      {
        question: 'What SQL clause is used to group rows that have the same values?',
        options: ['ORDER BY', 'GROUP BY', 'SORT BY', 'HAVING'],
        correctOption: 1
      }
    ]
  }
};

const DEFAULT_QUIZ = {
  title: 'General Skill Assessment Quiz',
  questions: [
    {
      question: 'Is programming a valuable skill in modern tech careers?',
      options: ['No', 'Maybe', 'Yes, absolutely', 'Not sure'],
      correctOption: 2
    },
    {
      question: 'What does DRY stand for in software engineering?',
      options: ['Don\'t Repeat Yourself', 'Do Repeat Yourself', 'Data Resource Yield', 'Dynamic Route Yield'],
      correctOption: 0
    }
  ]
};

/**
 * Get or create quiz for a completed learning resource.
 */
async function startQuiz(studentId, resourceId) {
  const resource = await prisma.roadmapResource.findUnique({
    where: { id: resourceId },
    include: { step: { include: { roadmap: true } } }
  });

  if (!resource) throw new Error('Resource not found');
  if (resource.step.roadmap.studentId !== studentId) {
    throw new Error('Unauthorized access to this resource');
  }

  // US-75: Quiz is available only after marking resource complete
  if (!resource.completed) {
    throw new Error('You must mark this resource as completed before taking the quiz.');
  }

  let quiz = await prisma.quiz.findFirst({
    where: { resourceId }
  });

  if (!quiz) {
    const data = SKILL_QUIZZES[resource.step.skillName] || DEFAULT_QUIZ;
    quiz = await prisma.quiz.create({
      data: {
        resourceId,
        title: data.title,
        questions: data.questions
      }
    });
  }

  return quiz;
}

/**
 * Submit answers and score a quiz attempt.
 */
async function submitQuiz(studentId, quizId, answers) {
  const quiz = await prisma.quiz.findUnique({ where: { id: quizId } });
  if (!quiz) throw new Error('Quiz not found');

  const questions = quiz.questions;
  if (!answers || !Array.isArray(answers) || answers.length !== questions.length) {
    throw new Error('Invalid answers submission size.');
  }

  let correctCount = 0;
  for (let i = 0; i < questions.length; i++) {
    if (answers[i] === questions[i].correctOption) {
      correctCount++;
    }
  }

  const score = Math.round((correctCount / questions.length) * 100);
  const passed = score >= 66; // 66% passing threshold (e.g. 2/3 correct)

  const attempt = await prisma.quizAttempt.create({
    data: {
      studentId,
      quizId,
      score,
      passed
    }
  });

  return {
    attempt,
    correctCount,
    totalQuestions: questions.length,
    score,
    passed
  };
}

/**
 * Get quiz history/attempts for a student.
 */
async function getQuizHistory(studentId) {
  return await prisma.quizAttempt.findMany({
    where: { studentId },
    include: { quiz: true },
    orderBy: { submittedAt: 'desc' }
  });
}

module.exports = {
  startQuiz,
  submitQuiz,
  getQuizHistory
};
