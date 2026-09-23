import { useState, useEffect } from 'react'
import "../style/loadingstate.scss"

const DEFAULT_MESSAGES = [
  'Reading your resume...',
  'Matching your profile against the job description...',
  'Generating tailored interview questions...',
  'Almost ready...',
]

const LoadingState = ({ messages = DEFAULT_MESSAGES, intervalMs = 2500 }) => {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (messages.length <= 1) return
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length)
    }, intervalMs)
    return () => clearInterval(timer)
  }, [messages, intervalMs])

  return (
    <div className="loading-state">
      <div className="loading-state__spinner" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>

      <p className="loading-state__message" key={index}>
        {messages[index]}
      </p>

      <div className="loading-state__skeleton">
        <div className="skeleton-line skeleton-line--wide" />
        <div className="skeleton-line skeleton-line--medium" />
        <div className="skeleton-line skeleton-line--wide" />
      </div>
    </div>
  )
}

export default LoadingState