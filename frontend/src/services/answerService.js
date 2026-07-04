// ─────────────────────────────────────────────
// services/answerService.js
//
// All answer-related API calls.
// ─────────────────────────────────────────────

import api from './api.js'

const answerService = {
  // Post a new answer
  // data: { body, questionId }
  create: async (data) => {
    const response = await api.post('/answers', data)
    return response.data
  },

  // Edit an answer
  // data: { body }
  update: async (id, data) => {
    const response = await api.put(`/answers/${id}`, data)
    return response.data
  },

  // Delete an answer
  delete: async (id) => {
    const response = await api.delete(`/answers/${id}`)
    return response.data
  },

  // Toggle vote on an answer
  vote: async (id) => {
    const response = await api.put(`/answers/${id}/vote`)
    return response.data
  },

  // Accept an answer as best answer
  accept: async (id) => {
    const response = await api.put(`/answers/${id}/accept`)
    return response.data
  },
}

export default answerService