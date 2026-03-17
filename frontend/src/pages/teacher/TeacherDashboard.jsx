import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useApi } from '../../hooks/useApi'
import { examsApi } from '../../api/client'
import ExamCard from '../../components/ExamCard'

export default function TeacherDashboard() {
  const { auth } = useAuth()
  const navigate = useNavigate()

  const { data: exams, loading, error, refetch } = useApi(
    () => examsApi.list(auth.token),
    [auth.token]
  )

  return (
    <>
      <div className="page-header">
        <h1>Your Exams</h1>
        <p>Create and manage exams, then share the exam ID with your students.</p>
      </div>

      <div className="section-header">
        <span style={{ color: 'var(--ink3)', fontSize: '.875rem' }}>
          {exams ? `${exams.length} exam${exams.length !== 1 ? 's' : ''}` : ''}
        </span>
        <button className="btn btn-primary" onClick={() => navigate('/teacher/exams/new')}>
          + New exam
        </button>
      </div>

      {loading && <div className="loading-page"><span className="spinner" /></div>}

      {error && <div className="alert alert-error">⚠ {error}</div>}

      {!loading && exams?.length === 0 && (
        <div className="empty">
          <div className="empty-icon">📋</div>
          <h3>No exams yet</h3>
          <p>Create your first exam to get started.</p>
          <br />
          <button className="btn btn-primary" onClick={() => navigate('/teacher/exams/new')}>
            Create exam
          </button>
        </div>
      )}

      {exams?.map((exam) => (
        <ExamCard key={exam.id} exam={exam} onRefresh={refetch} />
      ))}
    </>
  )
}
