import { useSearchParams } from 'react-router-dom'

const useQueryParams = () => {
  const [searchParams, setSearchParams] = useSearchParams()

  const getParam = (key, fallback = '') =>
    searchParams.get(key) ?? fallback

  const setParams = (nextParams) => {
    const updated = new URLSearchParams(searchParams)
    Object.entries(nextParams).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') {
        updated.delete(key)
      } else {
        updated.set(key, value)
      }
    })
    setSearchParams(updated)
  }

  return { searchParams, getParam, setParams }
}

export default useQueryParams
