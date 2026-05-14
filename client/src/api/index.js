import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.patch('/auth/profile', data),
  changePassword: (data) => api.patch('/auth/change-password', data),
};

export const courseApi = {
  getAll: (params) => api.get('/courses', { params }),
  getBySlug: (slug) => api.get(`/courses/${slug}`),
  getById: (id) => api.get(`/courses/${id}/with-lessons`),
  getMyCourses: () => api.get('/courses/my-courses'),
  create: (data) => api.post('/courses', data),
  update: (id, data) => api.patch(`/courses/${id}`, data),
  publish: (id) => api.patch(`/courses/${id}/publish`),
  delete: (id) => api.delete(`/courses/${id}`),
};

export const moduleApi = {
  create: (courseId, data) => api.post(`/courses/${courseId}/modules`, data),
  update: (id, data) => api.patch(`/courses/modules/${id}`, data),
  delete: (id) => api.delete(`/courses/modules/${id}`),
};

export const lessonApi = {
  create: (moduleId, data) => api.post(`/modules/${moduleId}/lessons`, data),
  get: (id) => api.get(`/lessons/${id}`),
  update: (id, data) => api.patch(`/lessons/${id}`, data),
  delete: (id) => api.delete(`/lessons/${id}`),
  streamUrl: (id) => `/api/lessons/${id}/stream`,
};

export const enrollmentApi = {
  enrollFree: (courseId) => api.post(`/enrollments/courses/${courseId}/enroll`),
  getMyEnrollments: () => api.get('/enrollments/my'),
  checkEnrollment: (courseId) => api.get(`/enrollments/courses/${courseId}/check`),
};

export const progressApi = {
  markComplete: (lessonId) => api.post(`/progress/lessons/${lessonId}/complete`),
  updateWatchTime: (lessonId, watchedSeconds) =>
    api.patch(`/progress/lessons/${lessonId}/watch-time`, { watchedSeconds }),
  getCourseProgress: (courseId) => api.get(`/progress/courses/${courseId}`),
};

export const quizApi = {
  create: (lessonId, data) => api.post(`/quizzes/lessons/${lessonId}`, data),
  addQuestion: (quizId, data) => api.post(`/quizzes/${quizId}/questions`, data),
  getByLesson: (lessonId) => api.get(`/quizzes/lessons/${lessonId}`),
  submit: (quizId, data) => api.post(`/quizzes/${quizId}/submit`, data),
  getAttempts: (quizId) => api.get(`/quizzes/${quizId}/my-attempts`),
};

export const paymentApi = {
  initiate: (courseId) => api.post('/payments/initiate', { courseId }),
  verify: (txnId) => api.get(`/payments/verify?txnId=${txnId}`),
  getHistory: () => api.get('/payments/history'),
};

export const liveApi = {
  getSessions: (params) => api.get('/live', { params }),
  getSession: (meetingId) => api.get(`/live/${meetingId}`),
  getMySessions: () => api.get('/live/my'),
  create: (data) => api.post('/live', data),
  start: (id) => api.patch(`/live/${id}/start`),
  end: (id) => api.patch(`/live/${id}/end`),
  update: (id, data) => api.patch(`/live/${id}`, data),
  delete: (id) => api.delete(`/live/${id}`),
};

export default api;
