import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { submissionsApi } from '../../api/client'
import { useCountdown } from '../../hooks/useCountdown'
import ExamTimer from '../../components/ExamTimer'
import './TakeExam.css'

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']

// ── individual question renderers ─────────────────────────────────────────────

function MCQQuestion({ question, answer, onAnswer }) {
  return (
    <div className="options-list">
      {(question.options || []).map((opt, i) => (
        <button
          key={i}
          className={`option-btn ${answer === opt ? 'option-btn--selected' : ''}`}
          onClick={() => onAnswer(opt)}
        >
          <span className="option-letter">{LETTERS[i]}</span>
          {opt}
        </button>
      ))}
    </div>
  )
}

function TrueFalseQuestion({ answer, onAnswer }) {
  return (
    <div className="tf-row">
      <button
        className={`tf-btn ${answer === 'true' ? 'tf-btn--true' : ''}`}
        onClick={() => onAnswer('true')}
      >
        ✓ True
      </button>
      <button
        className={`tf-btn ${answer === 'false' ? 'tf-btn--false' : ''}`}
        onClick={() => onAnswer('false')}
      >
        ✗ False
      </button>
    </div>
  )
}

function ShortQuestion({ answer, onAnswer }) {
  return (
    <textarea
      className="textarea"
      rows={4}
      value={answer || ''}
      onChange={(e) => onAnswer(e.target.value)}
      placeholder="Type your answer here…"
    />
  )
}

// ── main component ────────────────────────────────────────────────────────────

export default function TakeExam() {
  const { id: examId } = useParams()
  const { auth } = useAuth()
  const navigate = useNavigate()

  // joining state
  const [status, setStatus] = useState('joining') // joining | taking | error
  const [joinError, setJoinError] = useState('')

  // exam state
  const [submissionId, setSubmissionId] = useState(null)
  const [questions, setQuestions] = useState([])
  const [deadlineSecs, setDeadlineSecs] = useState(null)

  // answer state
  const [answers, setAnswers] = useState({})       // { shuffledIndex: value }
  const [timings, setTimings] = useState({})       // { shuffledIndex: seconds }
  const [currentQ, setCurrentQ] = useState(0)
  const qStartRef = useRef(Date.now())

  // submission state
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  // ── join ──
  useEffect(() => {
    ;(async () => {
      try {
        const d = await submissionsApi.join(examId, auth.token)
        setSubmissionId(d.submission_id)
        setQuestions(d.questions)
        const secs = Math.max(0, Math.floor((new Date(d.deadline) - Date.now()) / 1000))
        setDeadlineSecs(secs)
        setStatus('taking')
      } catch (e) {
        setJoinError(e.detail || 'Failed to join exam')
        setStatus('error')
      }
    })()
  }, [examId, auth.token])

  // ── record timing when navigating away from a question ──
  const recordTiming = useCallback((qIdx) => {
    const spent = Math.round((Date.now() - qStartRef.current) / 1000)
    setTimings((t) => ({ ...t, [String(qIdx)]: (t[String(qIdx)] || 0) + spent }))
    qStartRef.current = Date.now()
  }, [])

  const goTo = useCallback((i) => {
    recordTiming(currentQ)
    setCurrentQ(i)
  }, [currentQ, recordTiming])

  const setAnswer = useCallback((qIndex, val) => {
    setAnswers((a) => ({ ...a, [String(qIndex)]: val }))
  }, [])

  // ── submit ──
  const handleSubmit = useCallback(async (auto = false) => {
    if (submitting) return
    if (!auto && !confirm('Submit your exam? You cannot change answers afterwards.')) return

    recordTiming(currentQ)

    setSubmitting(true)
    setSubmitError('')

    try {
      const finalTimings = { ...timings }
      const result = await submissionsApi.submit(submissionId, answers, finalTimings, auth.token)
      navigate('/student/result', { state: result })
    } catch (e) {
      setSubmitError(e.detail || 'Submission failed. Please try again.')
      setSubmitting(false)
    }
  }, [submitting, submissionId, answers, timings, currentQ, recordTiming, auth.token, navigate])

  // ── countdown ──
  const { secsLeft, pct, urgent, stop } = useCountdown(
    status === 'taking' ? deadlineSecs : null,
    () => handleSubmit(true)
  )

  // stop timer on unmount
  useEffect(() => () => stop(), [stop])

  // ── render: joining ──
  if (status === 'joining') {
    return <div className="loading-page"><span className="spinner" /></div>
  }

  // ── render: error ──
  if (status === 'error') {
    return (
      <div className="card" style={{ maxWidth: 440 }}>
        <h2 style={{ marginBottom: '1rem' }}>Cannot join exam</h2>
        <div className="alert alert-error">⚠ {joinError}</div>
        <br />
        <button className="btn btn-ghost" onClick={() => navigate('/')}>← Back to home</button>
      </div>
    )
  }

  const q = questions[currentQ]
  const qIndexStr = String(q.index)
  const currentAnswer = answers[qIndexStr]
  const answeredCount = Object.keys(answers).length

  return (
    <div className="take-exam">
      {/* Timer bar */}
      <ExamTimer
        secsLeft={secsLeft}
        pct={pct}
        urgent={urgent}
        onSubmit={() => handleSubmit(false)}
        submitting={submitting}
      />

      {submitError && (
        <div className="alert alert-error" style={{ marginBottom: '1rem' }}>⚠ {submitError}</div>
      )}

      {/* Question navigator */}
      <div className="q-nav">
        {questions.map((_, i) => {
          const isAnswered = answers[String(questions[i].index)] !== undefined
          const isCurrent = i === currentQ
          return (
            <button
              key={i}
              className={`q-dot ${isAnswered ? 'q-dot--answered' : ''} ${isCurrent ? 'q-dot--current' : ''}`}
              onClick={() => goTo(i)}
            >
              {i + 1}
            </button>
          )
        })}
        <span className="q-nav-count">
          {answeredCount}/{questions.length} answered
        </span>
      </div>

      {/* Question panel */}
      <div className="q-panel">
        <div className="q-index">Question {currentQ + 1} of {questions.length}</div>
        <div className="q-text">{q.text}</div>

        {q.q_type === 'mcq' && (
          <MCQQuestion
            question={q}
            answer={currentAnswer}
            onAnswer={(v) => setAnswer(q.index, v)}
          />
        )}
        {q.q_type === 'truefalse' && (
          <TrueFalseQuestion
            answer={currentAnswer}
            onAnswer={(v) => setAnswer(q.index, v)}
          />
        )}
        {q.q_type === 'short' && (
          <ShortQuestion
            answer={currentAnswer}
            onAnswer={(v) => setAnswer(q.index, v)}
          />
        )}
      </div>

      {/* Prev / Next */}
      <div className="q-nav-actions">
        <button
          className="btn btn-ghost"
          onClick={() => goTo(currentQ - 1)}
          disabled={currentQ === 0}
        >
          ← Previous
        </button>
        <button
          className="btn btn-ghost"
          onClick={() => goTo(currentQ + 1)}
          disabled={currentQ === questions.length - 1}
        >
          Next →
        </button>
      </div>
    </div>
  )
}
