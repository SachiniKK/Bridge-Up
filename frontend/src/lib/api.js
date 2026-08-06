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
