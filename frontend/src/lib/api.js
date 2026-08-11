const API_BASE = 'http://localhost:5000/api';

function getAuthHeaders() {
  const token = localStorage.getItem('bridgeup_token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

export function getStudentId() {
  return localStorage.getItem('bridgeup_student_id') || 'test-student-id';
}

async function request(url, options = {}) {
  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: { ...getAuthHeaders(), ...options.headers },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  // XP
  getXP: (studentId) => request(`/students/${studentId}/xp`),
  awardXP: (studentId, amount, reason, relatedEntityId) =>
    request(`/students/${studentId}/xp/award`, {
      method: 'POST',
      body: JSON.stringify({ amount, reason, relatedEntityId })
    }),

  // Daily Tasks
  getTodaysTasks: (studentId) => request(`/students/${studentId}/tasks/today`),
  completeTask: (studentId, taskId) =>
    request(`/students/${studentId}/tasks/${taskId}/complete`, { method: 'POST' }),
  skipTask: (studentId, taskId) =>
    request(`/students/${studentId}/tasks/${taskId}/skip`, { method: 'POST' }),

  // Communities
  listCommunities: (studentId) => request(`/students/${studentId}/communities`),
  getMyCommunities: (studentId) => request(`/students/${studentId}/communities/mine`),
  joinCommunity: (studentId, communityId) =>
    request(`/students/${studentId}/communities/${communityId}/join`, { method: 'POST' }),
  leaveCommunity: (studentId, communityId) =>
    request(`/students/${studentId}/communities/${communityId}/leave`, { method: 'POST' }),
  getCommunityFeed: (studentId, communityId) =>
    request(`/students/${studentId}/communities/${communityId}/feed`),
  createDiscussion: (studentId, communityId, title, body) =>
    request(`/students/${studentId}/communities/${communityId}/discussions`, {
      method: 'POST',
      body: JSON.stringify({ title, body }),
    }),
  getComments: (studentId, discussionId) =>
    request(`/students/${studentId}/discussions/${discussionId}/comments`),
  createComment: (studentId, discussionId, body) =>
    request(`/students/${studentId}/discussions/${discussionId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ body }),
    }),
  toggleLike: (studentId, discussionId) =>
    request(`/students/${studentId}/discussions/${discussionId}/like`, { method: 'POST' }),

  // Challenges
  getCurrentChallenge: (studentId) => request(`/students/${studentId}/challenges/current`),
  submitChallenge: (studentId, challengeId, responseText, responseLink) =>
    request(`/students/${studentId}/challenges/${challengeId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ responseText, responseLink }),
    }),

  // Events
  listEvents: (studentId, skill) => {
    const params = skill ? `?skill=${encodeURIComponent(skill)}` : '';
    return request(`/students/${studentId}/events${params}`);
  },
  getEventSkills: (studentId) => request(`/students/${studentId}/events/skills`),
  registerForEvent: (studentId, eventId) =>
    request(`/students/${studentId}/events/${eventId}/register`, { method: 'POST' }),
  getRegisteredEvents: (studentId) => request(`/students/${studentId}/events/registered`),
  unregisterFromEvent: (studentId, eventId) =>
    request(`/students/${studentId}/events/${eventId}/register`, { method: 'DELETE' }),
  createEvent: (data) =>
    request('/students/events', { method: 'POST', body: JSON.stringify(data) }),

  // Admin & Authentication Additions
  login: (email, password) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (formData) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify(formData) }),
  adminLogin: (email, password) =>
    request('/auth/admin/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  updateProfile: (studentId, data) =>
    request(`/auth/students/${studentId}/profile`, { method: 'PUT', body: JSON.stringify(data) }),
  updateOnboarding: (studentId, data) =>
    request(`/auth/students/${studentId}/onboarding`, { method: 'PUT', body: JSON.stringify(data) }),
  suggestRoles: (text) =>
    request('/auth/suggest-roles', { method: 'POST', body: JSON.stringify({ text }) }),

  // Employer Skill Signals
  createEmployerSignal: (data) =>
    request('/employer/signals', { method: 'POST', body: JSON.stringify(data) }),
  listEmployerSignals: () => request('/employer/signals'),
  deleteEmployerSignal: (id) => request(`/employer/signals/${id}`, { method: 'DELETE' }),

  // Personalized Roadmap
  getRoadmap: (studentId) => request(`/students/${studentId}/roadmap`),
  regenerateRoadmap: (studentId, data) =>
    request(`/students/${studentId}/roadmap/regenerate`, { method: 'POST', body: JSON.stringify(data) }),
  completeResource: (studentId, resourceId) =>
    request(`/students/${studentId}/roadmap/resources/${resourceId}/complete`, { method: 'POST' }),
  getSkillSignals: (studentId, skillName) =>
    request(`/students/${studentId}/roadmap/skills/${encodeURIComponent(skillName)}/signals`),

  // Career & Trends
  predictCareer: (studentId) => request(`/students/${studentId}/career/predict`),
  getSkillTrends: (studentId) => request(`/students/${studentId}/trends`),

  // Quiz System
  getQuiz: (studentId, resourceId) =>
    request(`/students/${studentId}/roadmap/resources/${resourceId}/quiz`),
  submitQuiz: (studentId, quizId, answers) =>
    request(`/students/${studentId}/quizzes/${quizId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ answers }),
    }),
  getQuizHistory: (studentId) => request(`/students/${studentId}/quizzes/attempts`),

  // Peer Review
  submitVerification: (studentId, data) =>
    request(`/students/${studentId}/verifications`, { method: 'POST', body: JSON.stringify(data) }),
  getPendingVerifications: (studentId) =>
    request(`/students/${studentId}/verifications/pending`),
  reviewVerification: (studentId, id, approved, comment) =>
    request(`/students/${studentId}/verifications/${id}/review`, {
      method: 'POST',
      body: JSON.stringify({ approved, comment }),
    }),
  getStudentVerifications: (studentId) =>
    request(`/students/${studentId}/verifications/my`),

  // Skill Passport
  getPassport: (studentId) => request(`/students/${studentId}/passport`),
  updatePassportSharing: (studentId, isPublic) =>
    request(`/students/${studentId}/passport/sharing`, {
      method: 'PUT',
      body: JSON.stringify({ isPublic }),
    }),
  getSharedPassport: (token) => request(`/students/passport/share/${token}`),

  // Notifications
  getNotifications: (studentId) => request(`/students/${studentId}/notifications`),
  markNotificationRead: (studentId, id) =>
    request(`/students/${studentId}/notifications/${id}/read`, { method: 'POST' }),
  triggerNotificationReminder: (studentId) =>
    request(`/students/${studentId}/notifications/trigger-reminder`, { method: 'POST' }),
};

export function saveAuthSession({ user, token, studentId }) {
  localStorage.setItem('bridgeup_user', JSON.stringify(user));
  if (token) localStorage.setItem('bridgeup_token', token);
  if (studentId) localStorage.setItem('bridgeup_student_id', studentId);
}

export function clearAuthSession() {
  localStorage.removeItem('bridgeup_user');
  localStorage.removeItem('bridgeup_token');
  localStorage.removeItem('bridgeup_student_id');
}
