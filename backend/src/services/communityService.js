const prisma = require('../lib/prisma');
const { awardXPOnce } = require('./xpService');
const { COMMUNITY_JOIN, DISCUSSION_CREATE, COMMENT_CREATE } = require('../config/xpRewards');

async function listCommunities(studentId) {
  const communities = await prisma.community.findMany({
    orderBy: { memberCount: 'desc' }
  });

  const memberships = await prisma.communityMembership.findMany({
    where: { studentId },
    select: { communityId: true }
  });
  const joinedIds = new Set(memberships.map(m => m.communityId));

  return communities.map(c => ({
    id: c.id,
    name: c.name,
    description: c.description,
    skillTag: c.skillTag,
    memberCount: c.memberCount,
    isMember: joinedIds.has(c.id)
  }));
}

async function getMyCommunities(studentId) {
  const memberships = await prisma.communityMembership.findMany({
    where: { studentId },
    include: { community: true },
    orderBy: { joinedAt: 'desc' }
  });

  return memberships.map(m => ({
    id: m.community.id,
    name: m.community.name,
    skillTag: m.community.skillTag,
    memberCount: m.community.memberCount,
    joinedAt: m.joinedAt
  }));
}

async function joinCommunity(studentId, communityId) {
  const community = await prisma.community.findUnique({ where: { id: communityId } });
  if (!community) throw new Error('Community not found');

  const existing = await prisma.communityMembership.findUnique({
    where: { communityId_studentId: { communityId, studentId } }
  });
  if (existing) {
    return { alreadyMember: true, membership: existing, xpAwarded: false };
  }

  const result = await prisma.$transaction(async (tx) => {
    const membership = await tx.communityMembership.create({
      data: { communityId, studentId }
    });
    await tx.community.update({
      where: { id: communityId },
      data: { memberCount: { increment: 1 } }
    });
    return membership;
  });

  const { awarded, xpResult } = await awardXPOnce(
    studentId, COMMUNITY_JOIN, 'community_joined', communityId
  );

  return { alreadyMember: false, membership: result, xpAwarded: awarded, xpResult };
}

async function leaveCommunity(studentId, communityId) {
  const membership = await prisma.communityMembership.findUnique({
    where: { communityId_studentId: { communityId, studentId } }
  });
  if (!membership) {
    throw new Error('You are not a member of this community');
  }

  await prisma.$transaction(async (tx) => {
    await tx.communityMembership.delete({ where: { id: membership.id } });
    await tx.community.update({
      where: { id: communityId },
      data: { memberCount: { decrement: 1 } }
    });
  });

  return { success: true };
}

async function assertMembership(studentId, communityId) {
  const membership = await prisma.communityMembership.findUnique({
    where: { communityId_studentId: { communityId, studentId } }
  });
  if (!membership) throw new Error('You must be a member of this community');
  return membership;
}

async function getCommunityFeed(communityId, studentId) {
  const community = await prisma.community.findUnique({ where: { id: communityId } });
  if (!community) throw new Error('Community not found');

  const discussions = await prisma.discussion.findMany({
    where: { communityId },
    orderBy: { createdAt: 'desc' },
    include: {
      author: { select: { id: true, name: true } },
      likes: { where: { studentId }, select: { id: true } }
    }
  });

  return {
    community: {
      id: community.id,
      name: community.name,
      description: community.description,
      skillTag: community.skillTag,
      memberCount: community.memberCount
    },
    discussions: discussions.map(d => ({
      id: d.id,
      title: d.title,
      body: d.body,
      likeCount: d.likeCount,
      commentCount: d.commentCount,
      createdAt: d.createdAt,
      author: d.author,
      likedByMe: d.likes.length > 0
    }))
  };
}

async function createDiscussion(studentId, communityId, title, body) {
  if (!title || !title.trim()) throw new Error('Title is required');
  if (!body || !body.trim()) throw new Error('Body is required');

  await assertMembership(studentId, communityId);

  const discussion = await prisma.discussion.create({
    data: {
      communityId,
      authorId: studentId,
      title: title.trim(),
      body: body.trim()
    },
    include: { author: { select: { id: true, name: true } } }
  });

  const { awarded, xpResult } = await awardXPOnce(
    studentId, DISCUSSION_CREATE, 'discussion_created', discussion.id
  );

  return { discussion, xpAwarded: awarded, xpResult };
}

async function createComment(studentId, discussionId, body) {
  if (!body || !body.trim()) throw new Error('Comment body is required');

  const discussion = await prisma.discussion.findUnique({
    where: { id: discussionId },
    include: { community: true }
  });
  if (!discussion) throw new Error('Discussion not found');

  await assertMembership(studentId, discussion.communityId);

  const result = await prisma.$transaction(async (tx) => {
    const comment = await tx.discussionComment.create({
      data: { discussionId, authorId: studentId, body: body.trim() },
      include: { author: { select: { id: true, name: true } } }
    });
    await tx.discussion.update({
      where: { id: discussionId },
      data: { commentCount: { increment: 1 } }
    });
    return comment;
  });

  const { awarded, xpResult } = await awardXPOnce(
    studentId, COMMENT_CREATE, 'comment_created', result.id
  );

  return { comment: result, xpAwarded: awarded, xpResult };
}

async function getComments(discussionId) {
  return await prisma.discussionComment.findMany({
    where: { discussionId },
    orderBy: { createdAt: 'asc' },
    include: { author: { select: { id: true, name: true } } }
  });
}

async function toggleLike(studentId, discussionId) {
  const discussion = await prisma.discussion.findUnique({ where: { id: discussionId } });
  if (!discussion) throw new Error('Discussion not found');

  const existing = await prisma.discussionLike.findUnique({
    where: { discussionId_studentId: { discussionId, studentId } }
  });

  if (existing) {
    await prisma.$transaction(async (tx) => {
      await tx.discussionLike.delete({ where: { id: existing.id } });
      await tx.discussion.update({
        where: { id: discussionId },
        data: { likeCount: { decrement: 1 } }
      });
    });
    const updated = await prisma.discussion.findUnique({ where: { id: discussionId } });
    return { liked: false, likeCount: updated.likeCount };
  }

  await prisma.$transaction(async (tx) => {
    await tx.discussionLike.create({ data: { discussionId, studentId } });
    await tx.discussion.update({
      where: { id: discussionId },
      data: { likeCount: { increment: 1 } }
    });
  });
  const updated = await prisma.discussion.findUnique({ where: { id: discussionId } });
  return { liked: true, likeCount: updated.likeCount };
}

module.exports = {
  listCommunities,
  getMyCommunities,
  joinCommunity,
  leaveCommunity,
  getCommunityFeed,
  createDiscussion,
  createComment,
  getComments,
  toggleLike
};
