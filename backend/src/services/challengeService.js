const prisma = require('../lib/prisma');
const { awardXPOnce } = require('./xpService');

function getTodayUTC() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
}

async function getCurrentChallenge() {
  const today = getTodayUTC();

  const challenge = await prisma.weeklyChallenge.findFirst({
    where: {
      isActive: true,
      startDate: { lte: today },
      deadline: { gte: today }
    },
    orderBy: { startDate: 'desc' }
  });

  return challenge;
}

async function getChallengeById(challengeId) {
  const challenge = await prisma.weeklyChallenge.findUnique({ where: { id: challengeId } });
  if (!challenge) throw new Error('Challenge not found');
  return challenge;
}

async function submitChallenge(studentId, challengeId, responseText, responseLink) {
  if (!responseText?.trim() && !responseLink?.trim()) {
    throw new Error('Submission must include text or a link');
  }

  const challenge = await getChallengeById(challengeId);
  const today = getTodayUTC();

  if (today > challenge.deadline) {
    throw new Error('The deadline for this challenge has passed. Late submissions are not accepted.');
  }

  const existing = await prisma.challengeSubmission.findUnique({
    where: { challengeId_studentId: { challengeId, studentId } }
  });
  if (existing) {
    return {
      alreadySubmitted: true,
      submission: existing,
      xpAwarded: false,
      late: false
    };
  }

  const submission = await prisma.challengeSubmission.create({
    data: {
      challengeId,
      studentId,
      responseText: responseText?.trim() || null,
      responseLink: responseLink?.trim() || null,
      status: 'accepted'
    }
  });

  const { awarded, xpResult } = await awardXPOnce(
    studentId, challenge.xpReward, 'challenge_completed', challengeId
  );

  return {
    alreadySubmitted: false,
    submission,
    xpAwarded: awarded,
    xpResult,
    late: false
  };
}

async function getStudentSubmission(studentId, challengeId) {
  return await prisma.challengeSubmission.findUnique({
    where: { challengeId_studentId: { challengeId, studentId } }
  });
}

module.exports = {
  getCurrentChallenge,
  getChallengeById,
  submitChallenge,
  getStudentSubmission
};
