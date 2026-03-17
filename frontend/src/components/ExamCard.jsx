import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { examsApi } from '../api/client'
import './ExamCard.css'

function fmtDate(iso) {
  return iso ? new Date(iso).toLocaleString() : null
}

export default function ExamCard({ exam, onRefresh }) {
  const { auth } = useAuth()
  const navigate = useNavigate()

  const handleDelete = async () => {
    if (!confirm(`Delete "${exam.title}" permanently?`)) return
    try {
      await examsApi.delete(exam.id, auth.token)
      onRefresh()
    } catch (e) {
      alert(e.detail || 'Failed to delete exam')
    }
  }

  const handlePublish = async () => {
    try {
      await examsApi.publish(exam.id, auth.token)
      onRefresh()
    } catch (e) {
      alert(e.detail || 'Failed to publish exam')
    }
  }

  const start = fmtDate(exam.start_at)
  const end = fmtDate(exam.end_at)

  return (
    <div className="exam-card">
      <div className="exam-card-top">
        <div className="exam-card-info">
          <div className="exam-title">{exam.title}</div>
          <div className="exam-meta">
            {exam.is_published ? (
              <span className="badge badge-green">Published</span>
            ) : (
              <span className="badge badge-amber">Draft</span>
            )}
            {exam.duration_minutes && (
              <span className="exam-meta-item">⏱ {exam.duration_minutes} min</span>
            )}
            {start && <span className="exam-meta-item">Opens {start}</span>}
            {end && <span className="exam-meta-item">Closes {end}</span>}
          </div>
          <div className="exam-id mono">ID: {exam.id}</div>
        </div>

        <div className="card-actions">
          {!exam.is_published && (
            <>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => navigate(`/teacher/exams/${exam.id}/edit`)}
              >
                Edit
              </button>
              <button className="btn btn-accent btn-sm" onClick={handlePublish}>
                Publish
              </button>
            </>
          )}
          {exam.is_published && (
            <>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => navigate(`/teacher/exams/${exam.id}/results`)}
              >
                Results
              </button>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => navigate(`/teacher/exams/${exam.id}/analytics`)}
              >
                Analytics
              </button>
            </>
          )}
          <button className="btn btn-danger btn-sm" onClick={handleDelete}>
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
