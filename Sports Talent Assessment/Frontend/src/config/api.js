// src/config/api.js

// Use your PC's IPv4 when using real device.
// Example: "http://10.186.239.210:5000"
export const BASE_URL = 'http://10.186.239.210:5000'; // <-- change if needed

export const apiRoutes = {
  login: '/auth/login',
  register: '/auth/register',
  analyze: (userId, testType) => `/tests/analyze/${userId}/${testType}`,
  history: (userId) => `/tests/history/${userId}`,
  testById: (id) => `/tests/${id}`,
  profile: (userId) => `/user/profile/${userId}`,
};
