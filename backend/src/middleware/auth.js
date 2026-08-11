const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');

const JWT_SECRET = process.env.JWT_SECRET || 'bridgeup_secret_key';

/**
 * Resolve authenticated user from JWT or fall back to test student for dev.
 */
async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);

      const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
      if (!user) return res.status(401).json({ error: 'Invalid token' });

      let student = await prisma.student.findUnique({ where: { userId: user.id } });
      if (!student && user.role === 'student') {
        student = await prisma.student.create({
          data: {
            userId: user.id,
            email: user.email,
            name: `${user.firstName} ${user.lastName}`
          }
        });
      }

      req.user = {
        userId: user.id,
        id: student?.id || null,
        role: user.role,
        email: user.email
      };
    } else {
      req.user = { userId: null, id: 'test-student-id', role: 'student', email: 'test@bridgeup.dev' };
    }

    const paramStudentId = req.params.studentId;
    if (paramStudentId && req.user.id && paramStudentId !== req.user.id) {
      req.params.studentId = req.user.id;
    }

    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

/**
 * Require employer role for event creation routes.
 */
async function requireEmployer(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user) return res.status(401).json({ error: 'Invalid token' });
    if (user.role !== 'employer') {
      return res.status(403).json({ error: 'Employer access required' });
    }

    req.user = { userId: user.id, role: user.role, email: user.email };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = { requireAuth, requireEmployer };
