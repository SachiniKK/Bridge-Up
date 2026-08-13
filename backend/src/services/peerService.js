const prisma = require('../lib/prisma');

const APPROVAL_THRESHOLD = 2; // Requires 2 approvals to verify a skill

/**
 * Submit a skill verification claim (submit evidence/work).
 */
async function submitVerification(studentId, skillName, responseText, responseLink) {
  if (!responseText?.trim() && !responseLink?.trim()) {
    throw new Error('Please provide a description or a link as evidence.');
  }

  // Check if there is an existing verification
  const existing = await prisma.skillVerification.findUnique({
    where: { studentId_skillName: { studentId, skillName } }
  });

  if (existing) {
    // If it was already approved, return it
    if (existing.status === 'approved') {
      return { alreadyApproved: true, verification: existing };
    }

    // Reset status to pending and clear old reviews
    return await prisma.$transaction(async (tx) => {
      await tx.peerReview.deleteMany({ where: { verificationId: existing.id } });
      const updated = await tx.skillVerification.update({
        where: { id: existing.id },
        data: {
          responseText: responseText?.trim() || null,
          responseLink: responseLink?.trim() || null,
          status: 'pending'
        }
      });
      return { alreadyApproved: false, verification: updated };
    });
  }

  const verification = await prisma.skillVerification.create({
    data: {
      studentId,
      skillName,
      responseText: responseText?.trim() || null,
      responseLink: responseLink?.trim() || null,
      status: 'pending'
    }
  });

  return { alreadyApproved: false, verification };
}

/**
 * List pending verifications of peers that the current student can review.
 * Excludes self-submissions and submissions already reviewed by this student.
 */
async function getPendingVerifications(studentId) {
  return await prisma.skillVerification.findMany({
    where: {
      studentId: { not: studentId },
      status: 'pending',
      reviews: {
        none: { reviewerId: studentId }
      }
    },
    include: {
      student: { select: { id: true, name: true } }
    },
    orderBy: { createdAt: 'desc' }
  });
}

/**
 * Submit a peer review (approve/reject) for a student's verification claim.
 */
async function reviewVerification(reviewerId, verificationId, approved, comment = null) {
  const verification = await prisma.skillVerification.findUnique({
    where: { id: verificationId }
  });

  if (!verification) throw new Error('Verification request not found');
  if (verification.studentId === reviewerId) {
    throw new Error('You cannot review your own verification request.');
  }
  if (verification.status !== 'pending') {
    throw new Error('This verification request is already resolved.');
  }

  const result = await prisma.$transaction(async (tx) => {
    // Save peer review
    const review = await tx.peerReview.create({
      data: {
        verificationId,
        reviewerId,
        approved,
        comment: comment?.trim() || null
      }
    });

    // Recalculate approvals/rejections
    const reviews = await tx.peerReview.findMany({
      where: { verificationId }
    });

    const approvals = reviews.filter(r => r.approved).length;
    const rejections = reviews.filter(r => !r.approved).length;

    let newStatus = 'pending';
    if (approvals >= APPROVAL_THRESHOLD) {
      newStatus = 'approved';
    } else if (rejections >= APPROVAL_THRESHOLD) {
      newStatus = 'rejected';
    }

    if (newStatus !== 'pending') {
      await tx.skillVerification.update({
        where: { id: verificationId },
        data: { status: newStatus }
      });
    }

    return { review, approvals, rejections, resolvedStatus: newStatus };
  });

  return result;
}

/**
 * Get verifications submitted by the student and their feedback status.
 */
async function getStudentVerifications(studentId) {
  return await prisma.skillVerification.findMany({
    where: { studentId },
    include: {
      reviews: {
        include: {
          reviewer: { select: { name: true } }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
}

module.exports = {
  submitVerification,
  getPendingVerifications,
  reviewVerification,
  getStudentVerifications
};
