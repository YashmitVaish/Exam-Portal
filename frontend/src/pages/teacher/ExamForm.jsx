import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { examsApi } from '../../api/client'
import QuestionBuilder from '../../components/QuestionBuilder'
import './ExamForm.css'

function toLocalDatetime(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  // format as YYYY-MM-DDTHH:MM for datetime-local input
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function ExamForm() {
  const { id } = useParams()          // undefined when creating
  const isEditing = Boolean(id)
  const { auth } = useAuth()
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [duration, setDuration] = useState(60)
  const [randomize, setRandomize] = useState(false)
  const [startAt, setStartAt] = useState('')
  const [endAt, setEndAt] = useState('')
  const [questions, setQuestions] = useState([])

  const [loadingData, setLoadingData] = useState(isEditing)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isEditing) return
    ;(async () => {
      try {
        const d = await examsApi.get(id, auth.token)
        setTitle(d.title || '')
        setDuration(d.duration_minutes || 60)
        setRandomize(d.randomize_order || false)
        setStartAt(toLocalDatetime(d.start_at))
        setEndAt(toLocalDatetime(d.end_at))
        setQuestions(d.questions || [])
      } catch (e) {
        setError(e.detail || 'Failed to load exam')
      } finally {
        setLoadingData(false)
      }
    })()
  }, [id, isEditing, auth.token])

  const save = async () => {
    if (!title.trim()) { setError('Exam title is required'); return }
    setError('')
    setSaving(true)

    const body = {
      title: title.trim(),
      duration_minutes: Number(duration),
      randomize_order: randomize,
      start_at: startAt ? new Date(startAt).toISOString() : undefined,
      end_at: endAt ? new Date(endAt).toISOString() : undefined,
      questions: questions.map((q) => ({
        text: q.text,
        q_type: q.q_type,
        correct_answer: q.correct_answer,
        ...(q.q_type === 'mcq' ? { options: q.options } : {}),
      })),
    }

    try {
      if (isEditing) {
        await examsApi.update(id, body, auth.token)
      } else {
        await examsApi.create(body, auth.token)
      }
      navigate('/')
    } catch (e) {
      setError(e.detail || 'Failed to save exam')
    } finally {
      setSaving(false)
    }
  }

  if (loadingData) return <div className="loading-page"><span className="spinner" /></div>

  return (
    <>
      <div className="page-header">
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/')} style={{ marginBottom: '.75rem' }}>
          ← Back
        </button>
        <h1>{isEditing ? 'Edit exam' : 'New exam'}</h1>
        <p>{isEditing ? 'Update exam details and questions.' : 'Set up your exam and add questions.'}</p>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>⚠ {error}</div>}

      <div className="exam-form">
        {/* ── Basic info ── */}
        <section className="form-section">
          <div className="form-section-label">Basic info</div>
          <div className="form-stack">
            <div className="field">
              <label className="label">Exam title</label>
              <input
                className="input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Midterm — Biology"
              />
            </div>

            <div className="form-row">
              <div className="field">
                <label className="label">Duration (minutes)</label>
                <input
                  className="input"
                  type="number"
                  min={1}
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                />
              </div>
              <div className="field" style={{ justifyContent: 'flex-end' }}>
                <label className="checkbox-field" style={{ paddingBottom: '.35rem' }}>
                  <input
                    type="checkbox"
                    checked={randomize}
                    onChange={(e) => setRandomize(e.target.checked)}
                  />
                  Randomize question order per student
                </label>
              </div>
            </div>

            <div className="form-row">
              <div className="field">
                <label className="label">Opens at <span className="hint">(optional)</span></label>
                <input
                  className="input"
                  type="datetime-local"
                  value={startAt}
                  onChange={(e) => setStartAt(e.target.value)}
                />
              </div>
              <div className="field">
                <label className="label">Closes at <span className="hint">(optional)</span></label>
                <input
                  className="input"
                  type="datetime-local"
                  value={endAt}
                  onChange={(e) => setEndAt(e.target.value)}
                />
              </div>
            </div>
          </div>
        </section>

        {/* ── Questions ── */}
        <section className="form-section">
          <QuestionBuilder questions={questions} onChange={setQuestions} />
        </section>

        {/* ── Actions ── */}
        <div className="form-actions">
          <button className="btn btn-ghost" onClick={() => navigate('/')}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={save} disabled={saving}>
            {saving ? (
              <><span className="spinner spinner--white" /> Saving…</>
            ) : isEditing ? (
              'Save changes'
            ) : (
              'Create exam'
            )}
          </button>
        </div>
      </div>
    </>
  )
}
