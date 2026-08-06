/**
 * Stubbed Authentication Middleware.
 * In a real application, this would verify JWT tokens/session cookies
 * and populate `req.user` with the authenticated student details.
 * If no authorization header is provided, it falls back to a default test student ID.
 */
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    req.user = { id: token };
  } else {
    // Stub default student for development/testing
    req.user = { id: "test-student-id" };
  }

  // Validate that the requested studentId matches the authenticated student
  const paramStudentId = req.params.studentId;
  if (paramStudentId && paramStudentId !== req.user.id) {
    return res.status(403).json({ error: "Access denied. Student ID mismatch." });
  }

  next();
}

module.exports = {
  requireAuth
};
