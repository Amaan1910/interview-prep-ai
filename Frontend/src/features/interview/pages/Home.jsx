import { useState, useRef } from 'react'
import "../style/home.scss"
import { useInterview } from '../hooks/useInterview.js'
import { useNavigate } from 'react-router'

const formatFileSize = (bytes) => {
  if (bytes === null || bytes === undefined) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const Home = () => {

    const { loading, generateReport, reports } = useInterview()
    const [ jobDescription, setJobDescription ] = useState("")
    const [ selfDescription, setSelfDescription ] = useState("")
    const navigate = useNavigate()
    const resumeInputRef = useRef()
    const [ resumeFile, setResumeFile ] = useState(null)

    const handleGenerateReport = async () => {
        const resumeFile = resumeInputRef.current.files[0]
        const data = await generateReport({ jobDescription, selfDescription, resumeFile })
        navigate(`/interview/${data._id}`)
    }

    const handleResumeChange = (e) => {
        const file = e.target.files?.[0] || null
        setResumeFile(file)
    }

    const handleRemoveResume = () => {
        setResumeFile(null)
        if (resumeInputRef.current) {
            resumeInputRef.current.value = ''
        }
    }

    if (loading) {
        return(<main><h1>Loading your interview plan...</h1></main>)
    }

  return (
    <main className="home">
      <header className="hero">
        <h1>
          Create Your Custom <span className="accent">Interview Plan</span>
        </h1>
        <p>Let our AI analyze the job requirements and your unique profile to build a winning strategy.</p>
      </header>

      <section className="plan-card">
        <div className="interview-input-group">
          <div className="left">
            <div className="section-header">
              <span className="section-header__icon section-header__icon--job" aria-hidden="true" />
              <h2>Target Job Description</h2>
              <span className="badge badge--required">Required</span>
            </div>

            <div className="input-group input-group--textarea">
              <textarea
                onChange={(e) => setJobDescription(e.target.value)}
                name="jobDescription"
                id="jobDescription"
                placeholder={"Paste the full job description here...\ne.g. 'Senior Frontend Engineer at Google requires proficiency in React, TypeScript, and large-scale system design...'"}
                maxLength={5000}
              ></textarea>
              <span className="char-count">0 / 5000 chars</span>
            </div>
          </div>

          <div className="right">
            <div className="section-header">
              <span className="section-header__icon section-header__icon--profile" aria-hidden="true" />
              <h2>Your Profile</h2>
            </div>

            <div className="input-group">
              <div className="input-group__label-row">
                <span className="input-group__label">Upload Resume</span>
                <span className="badge badge--best">Best Results</span>
              </div>

              {/* <label className="file-dropzone" htmlFor="resume">
                <span className="file-dropzone__icon" aria-hidden="true" />
                <strong>Click to upload or drag &amp; drop</strong>
                <small>PDF or DOCX (Max 5MB)</small>
              </label>
              <input
                ref={resumeInputRef}
                hidden
                type="file"
                id="resume"
                name="resume"
                accept=".pdf,.docx"
              /> */}
              {resumeFile ? (
                <div className="file-preview">
                  <span className="file-preview__icon" aria-hidden="true" />
                  <div className="file-preview__meta">
                    <strong title={resumeFile.name}>{resumeFile.name}</strong>
                    <small>{formatFileSize(resumeFile.size)}</small>
                  </div>
                  <div className="file-preview__actions">
                    <button type="button" className="file-preview__link" onClick={() => resumeInputRef.current?.click()}>
                      Replace
                    </button>
                    <button
                      type="button"
                      className="file-preview__remove"
                      onClick={handleRemoveResume}
                      aria-label="Remove uploaded resume"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ) : (
                <label className="file-dropzone" htmlFor="resume">
                  <span className="file-dropzone__icon" aria-hidden="true" />
                  <strong>Click to upload or drag &amp; drop</strong>
                  <small>PDF (Max 5MB)</small>
                </label>
              )}
              <input
                ref={resumeInputRef}
                hidden
                type="file"
                id="resume"
                name="resume"
                accept=".pdf"
                onChange={handleResumeChange}
              />
            </div>

            <div className="divider">
              <span>OR</span>
            </div>

            <div className="input-group input-group--textarea input-group--self">
              <p className="input-group__label">Quick Self-Description</p>
              <textarea
                onChange={(e) => setSelfDescription(e.target.value)}
                name="selfDescription"
                id="selfDescription"
                placeholder="Briefly describe your experience, key skills, and years of experience if you don't have a resume handy..."
              ></textarea>
            </div>

            <div className="info-note">
              <span className="info-note__icon" aria-hidden="true" />
              <p>
                Either a <strong>Resume</strong> or a <strong>Self Description</strong> is required to generate a personalized plan.
              </p>
            </div>
          </div>
        </div>

        <div className="plan-card__footer">
          <p className="footer-note">
            AI-Powered Strategy Generation <span className="footer-note__dot">•</span> Approx 30s
          </p>
          <button onClick={handleGenerateReport} type="button" className="button primary-button">
            <span className="primary-button__icon" aria-hidden="true">✦</span>
            Generate My Interview Strategy
          </button>
        </div>
      </section>

      {reports.length > 0 && (
        <section className="previous-reports">
          <h2>Previous Reports</h2>
          <ul className="report-list">
            {reports.map((report) => (
              <li key={report._id} className="report-item" onClick={() => navigate(`/interview/${report._id}`)}>
                <h3>{report.title || 'Untitled Position'}</h3>
                <p className="report-meta">Generated on {new Date(report.createdAt).toLocaleDateString()}</p>
                <p className={`match-score ${report.matchScore >= 70 ? 'score--high' : report.matchScore >= 50 ? 'score--medium' : 'score--low'}`}>
                  Match Score: {report.matchScore}%
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  )
}

export default Home
