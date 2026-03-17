import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useApi } from '../../hooks/useApi'
import { analyticsApi } from '../../api/client'
import './AnalyticsPage.css'

function difficultyLabel(pct) {
  if (pct >= 80) return { text: 'Easy', cls: 'badge-green' }
  if (pct >= 50) return { text: 'Medium', cls: 'badge-amber' }
  return { text: 'Hard', cls: 'badge-red' }
}

function barClass(pct) {
  if (pct >= 70) return ''
  if (pct >= 40) return 'bar--mid'
  return 'bar--low'
}

export default function AnalyticsPage() {
  const { id } = useParams()
  const { auth } = useAuth()
  const navigate = useNavigate()

  const { data, loading, error } = useApi(
    () => analyticsApi.get(id, auth.token),
    [id, auth.token]
  )

  // sort hardest first
  const sorted = data ? [...data].sort((a, b) => a.pct_correct - b.pct_correct) : []

  return (
    <>
      <div className="page-header">
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/')} style={{ marginBottom: '.75rem' }}>
          ← Back
        </button>
        <h1>Question analytics</h1>
        <p>Per-question breakdown across all graded submissions, sorted by difficulty.</p>
      </div>

      {loading && <div className="loading-page"><span className="spinner" /></div>}
      {error && <div className="alert alert-error">⚠ {error}</div>}

      {!loading && data?.length === 0 && (
        <div className="empty">
          <div className="empty-icon">📊</div>
          <h3>No analytics yet</h3>
          <p>Data appears after students submit graded exams.</p>
        </div>
      )}

      {sorted.length > 0 && (
        <div className="card analytics-card">
          <div className="analytics-legend">
            <span className="legend-item"><span className="legend-dot dot-green" />≥ 70% correct</span>
            <span className="legend-item"><span className="legend-dot dot-amber" />40–69%</span>
            <span className="legend-item"><span className="legend-dot dot-red" />&lt; 40% correct</span>
          </div>
          <hr className="divider" />
          {sorted.map((q) => {
            const diff = difficultyLabel(q.pct_correct)
            return (
              <div className="analytics-row" key={q.question_index}>
                <div className="analytics-qnum mono">Q{q.question_index + 1}</div>
                <div className="analytics-body">
                  <div className="analytics-text">{q.text}</div>
                  <div className="analytics-bar-wrap">
                    <div className="analytics-track">
                      <div
                        className={`analytics-fill ${barClass(q.pct_correct)}`}
                        style={{ width: `${q.pct_correct}%` }}
                      />
                    </div>
                    <div className="analytics-meta">
                      {q.correct}/{q.total_attempts} correct
                      {q.avg_time_seconds != null && (
                        <> · avg {q.avg_time_seconds.toFixed(1)}s per student</>
                      )}
                    </div>
                  </div>
                </div>
                <div className="analytics-right">
                  <div className="analytics-pct mono">{q.pct_correct.toFixed(1)}%</div>
                  <span className={`badge ${diff.cls}`}>{diff.text}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}
