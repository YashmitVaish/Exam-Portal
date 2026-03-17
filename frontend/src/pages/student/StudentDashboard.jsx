import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { examsApi } from '../../api/client'
import './StudentDashboard.css'

function fmtDate(iso) {
  return iso ? new Date(iso).toLocaleString() : null
}

export default function StudentDashboard() {
  const { auth } = useAuth()
  const navigate = useNavigate()

  const [examId, setExamId] = useState('')
  const [examInfo, setExamInfo] = useState(null)
  const [looking, setLooking] = useState(false)
  const [lookError, setLookError] = useState('')

  const lookup = async () => {
    const trimmed = examId.trim()
    if (!trimmed) return
    setLookError('')
    setExamInfo(null)
    setLooking(true)
    try {
      const d = await examsApi.get(trimmed, auth.token)
      setExamInfo(d)
    } catch (e) {
      setLookError(e.detail || 'Exam not found or not published')
    } finally {
      setLooking(false)
    }
  }

  const start = examInfo?.start_at ? fmtDate(examInfo.start_at) : null
  const end   = examInfo?.end_at   ? fmtDate(examInfo.end_at)   : null

  return (
    <>
      <div className="page-header">
        <h1>Join an exam</h1>
        <p>Enter the exam ID your teacher shared with you.</p>
      </div>

      <div className="join-card card">
        <div className="field">
          <label className="label">Exam ID</label>
          <input
            className="input"
            value={examId}
            onChange={(e) => { setExamId(e.target.value); setExamInfo(null); setLookError('') }}
            placeholder="e.g. 64f1a2b3c4d5e6f7a8b9c0d1"
            onKeyDown={(e) => e.key === 'Enter' && lookup()}
            autoFocus
          />
          <span className="hint">Paste the ID exactly as given — it's case-sensitive.</span>
        </div>

        {lookError && (
          <div className="alert alert-error" style={{ marginTop: '.75rem' }}>⚠ {lookError}</div>
        )}

        {examInfo && (
          <div className="exam-preview">
            <div className="exam-preview-title">{examInfo.title}</div>
            <div className="exam-preview-meta">
              <span>⏱ {examInfo.duration_minutes} min</span>
              {start && <span>Opens {start}</span>}
              {end && <span>Closes {end}</span>}
              {examInfo.randomize_order && <span>🔀 Questions randomised</span>}
            </div>
            <div className="alert alert-info" style={{ marginTop: '.75rem', fontSize: '.82rem' }}>
              Once you start, the timer begins immediately and cannot be paused.
            </div>
          </div>
        )}

        <div className="join-actions">
          <button className="btn btn-ghost" onClick={lookup} disabled={looking || !examId.trim()}>
            {looking ? <><span className="spinner" /> Looking up…</> : 'Look up exam'}
          </button>
          {examInfo && (
            <button
              className="btn btn-accent btn-lg"
              onClick={() => navigate(`/student/exam/${examId.trim()}`)}
            >
              Start exam →
            </button>
          )}
        </div>
      </div>
    </>
  )
}
