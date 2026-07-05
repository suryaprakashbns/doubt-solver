import api from './api.js'

const userService = {
  getProfile: async (userId) => {
    const response = await api.get(`/users/${userId}`)
    return response.data
  },

  updateProfile: async (data) => {
    const response = await api.put('/users/profile', data)
    return response.data
  },

  getUserQuestions: async (userId) => {
    const response = await api.get(`/users/${userId}/questions`)
    return response.data
  },

  getUserAnswers: async (userId) => {
    const response = await api.get(`/users/${userId}/answers`)
    return response.data
  },
}

export default userService