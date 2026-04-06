"use client"

import { createContext, useContext, useState, useCallback } from "react"

interface ProgressContextValue {
  completedLessonIds: string[]
  markComplete: (id: string) => void
  markIncomplete: (id: string) => void
}

const ProgressContext = createContext<ProgressContextValue>({
  completedLessonIds: [],
  markComplete: () => {},
  markIncomplete: () => {},
})

export function ProgressProvider({
  children,
  initialCompletedIds,
}: {
  children: React.ReactNode
  initialCompletedIds: string[]
}) {
  const [completedLessonIds, setCompleted] = useState(initialCompletedIds)

  const markComplete = useCallback((id: string) => {
    setCompleted((prev) => (prev.includes(id) ? prev : [...prev, id]))
  }, [])

  const markIncomplete = useCallback((id: string) => {
    setCompleted((prev) => prev.filter((i) => i !== id))
  }, [])

  return (
    <ProgressContext.Provider value={{ completedLessonIds, markComplete, markIncomplete }}>
      {children}
    </ProgressContext.Provider>
  )
}

export const useProgress = () => useContext(ProgressContext)
