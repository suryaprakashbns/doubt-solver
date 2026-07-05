import { useState, useEffect, useCallback } from 'react'
import userService from '../services/userService.js'

const useProfile = (userId) => {
  const [profile,   setProfile]   = useState(null)
  const [questions, setQuestions] = useState([])
  const [answers,   setAnswers]   = useState([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState(null)

  const fetchProfile = useCallback(async () => {
    if (!userId) {
      console.log('useProfile: no userId provided')
      setLoading(false)
      return
    }

    console.log('useProfile: fetching for userId:', userId)

    try {
      setLoading(true)
      setError(null)

      const [profileData, questionsData, answersData] = await Promise.all([
        userService.getProfile(userId),
        userService.getUserQuestions(userId),
        userService.getUserAnswers(userId),
      ])

      console.log('useProfile: profileData received:', profileData)

      setProfile(profileData)
      setQuestions(questionsData.questions || [])
      setAnswers(Array.isArray(answersData) ? answersData : [])

    } catch (err) {
      console.error('useProfile: error:', err)
      console.error('useProfile: error response:', err?.response?.data)
      setError(
        err?.response?.data?.message || 'Failed to load profile.'
      )
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  const updateProfileLocally = useCallback((updates) => {
    setProfile(prev => prev ? { ...prev, ...updates } : prev)
  }, [])

  return {
    profile,
    questions,
    answers,
    loading,
    error,
    refetch: fetchProfile,
    updateProfileLocally,
  }
}

export default useProfile