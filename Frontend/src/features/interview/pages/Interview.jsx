import React, { useState, useEffect } from 'react'
import "../style/interview.scss"
import { useInterview } from '../hooks/useInterview.js'
import { useNavigate, useParams } from 'react-router'
import LoadingState from '../loader/Loadingstate.jsx'

const NAV_ITEMS = [
  { id: 'technical', label: 'Technical Questions' },
  { id: 'behavioral', label: 'Behavioral Questions' },
  { id: 'roadmap', label: 'Road Map' },
]

const Interview = () => {
  const [activeSection, setActiveSection] = useState('technical')
  const [expandedKey, setExpandedKey] = useState(null)
  const { report, getReportById, loading, getResumePdf } = useInterview()
  const { interviewId } = useParams()

  useEffect(() => {
    if (interviewId) {
      getReportById(interviewId)
    }
  }, [interviewId])

  const {
    matchScore,
    technicalQuestions = [],
    behavioralQuestions = [],
    skillGaps = [],
    preparationPlan = [],
  } = report || {}

  const toggleExpanded = (key) => {
    setExpandedKey((prev) => (prev === key ? null : key))
  }

  const renderQuestionList = (questions, prefix) => {
    if (questions.length === 0) {
      return <p className="empty-state">No questions in this section yet.</p>
    }

    return (
      <div className="question-list">
        {questions.map((q, index) => {
          const key = `${prefix}-${index}`
          const isOpen = expandedKey === key

          return (
            <article className={`question-card ${isOpen ? 'is-open' : ''}`} key={key}>
              <button
                type="button"
                className="question-card__trigger"
                onClick={() => toggleExpanded(key)}
                aria-expanded={isOpen}
              >
                <span className="question-card__index">{String(index + 1).padStart(2, '0')}</span>
                <span className="question-card__question">{q.question}</span>
                <span className="question-card__chevron" aria-hidden="true" />
              </button>

              {isOpen && (
                <div className="question-card__body">
                  <p className="question-card__label">Why they're asking</p>
                  <p className="question-card__text">{q.intention}</p>
                  <p className="question-card__label">How to answer</p>
                  <p className="question-card__text">{q.answer}</p>
                </div>
              )}
            </article>
          )
        })}
      </div>
    )
  }

  const renderRoadmap = () => {
    if (preparationPlan.length === 0) {
      return <p className="empty-state">No preparation plan yet.</p>
    }

    return (
      <div className="roadmap">
        {preparationPlan.map((day) => (
          <div className="roadmap-day" key={day.day}>
            <div className="roadmap-day__marker">
              <span>Day {day.day}</span>
            </div>
            <div className="roadmap-day__content">
              <h3>{day.focus}</h3>
              <ul>
                {day.tasks.map((task, idx) => (
                  <li key={idx}>{task}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    )
  }

  const renderMainContent = () => {
    if (activeSection === 'technical') return renderQuestionList(technicalQuestions, 'tech')
    if (activeSection === 'behavioral') return renderQuestionList(behavioralQuestions, 'behav')
    return renderRoadmap()
  }

  const activeLabel = NAV_ITEMS.find((item) => item.id === activeSection)?.label

  if (loading) {
    return (
      <main className="interview">
        <LoadingState messages={['Loading your interview plan...']} />
      </main>
    )
  }

  return (
    <main className="interview">
      <div className="interview-card">
        <aside className="interview-sidebar interview-sidebar--nav">
          {typeof matchScore === 'number' && (
            <div className="match-score">
              <span className="match-score__value">{matchScore}%</span>
              <span className="match-score__label">Match Score</span>
            </div>
          )}

          <nav className="section-nav">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`section-nav__item ${activeSection === item.id ? 'is-active' : ''}`}
                onClick={() => setActiveSection(item.id)}
              >
                {item.label}
              </button>
            ))}
            <button onClick={() => getResumePdf(interviewId)} type="button" className="button primary-button download-btn">
              <span className="primary-button__icon" aria-hidden="true">✦</span>{" "}
              Download Resume
            </button>
          </nav>
        </aside>

        <section className="interview-main">
          <header className="interview-main__header">
            <h2>{activeLabel}</h2>
          </header>
          {renderMainContent()}
        </section>

        <aside className="interview-sidebar interview-sidebar--gaps">
          <h3 className="interview-sidebar__title">Skill Gaps</h3>

          <div className="skill-gap-list">
            {skillGaps.length === 0 && <p className="empty-state">No skill gaps found.</p>}
            {skillGaps.map((gap, idx) => (
              <span className={`skill-pill skill-pill--${gap.severity}`} key={idx}>
                {gap.skill}
              </span>
            ))}
          </div>
        </aside>
      </div>
    </main>
  )
}

export default Interview