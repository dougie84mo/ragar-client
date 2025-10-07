import { useEffect } from 'react'

/**
 * Custom hook to manage page titles
 * Updates the document title when the component mounts
 */
export const usePageTitle = (title: string, suffix: string = 'RAGAR') => {
  useEffect(() => {
    const fullTitle = `${title} | ${suffix}`
    document.title = fullTitle
    
    // Cleanup: reset to default title when component unmounts
    return () => {
      document.title = 'RAGAR - AI Gaming Assistant'
    }
  }, [title, suffix])
}

export default usePageTitle
