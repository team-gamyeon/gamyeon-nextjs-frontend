import { useEffect, useState } from 'react'

export function useColumnsPerRow() {
  const [cols, setCols] = useState(2)

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth
      setCols(w >= 1280 ? 5 : w >= 1024 ? 4 : w >= 640 ? 3 : 2)
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  return cols
}
