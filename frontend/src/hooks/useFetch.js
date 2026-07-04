// ─────────────────────────────────────────────
// hooks/useFetch.js
//
// Generic hook for fetching data from the API.
// Handles loading, error, and data states.
//
// Usage:
//   const { data, loading, error, refetch } =
//     useFetch(() => questionService.getAll({ sort }), [sort])
//
// Parameters:
//   fetchFn     — async function that returns data
//   dependencies — array like useEffect's deps array
//                  re-fetches when these change
// ─────────────────────────────────────────────

import { useState, useEffect, useCallback } from 'react'

const useFetch = (fetchFn, dependencies = []) => {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  const execute = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await fetchFn()
      setData(result)
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err?.message ||
        'Something went wrong'
      )
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies)

  useEffect(() => {
    execute()
  }, [execute])

  // refetch lets components manually trigger a re-fetch
  // e.g. after posting a new question
  return { data, loading, error, refetch: execute }
}

export default useFetch