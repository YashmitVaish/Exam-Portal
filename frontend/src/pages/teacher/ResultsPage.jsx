import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useApi } from '../../hooks/useApi'
import { submissionsApi } from '../../api/client'
import './ResultsPage.css'

function fmtDate(iso) {
  return iso ? new Date(iso).toLocaleString() : '—'
}

function StatCard({ label, value }) {
  return (
    <div className="stat-card">
      <div className="stat-value serif">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  )
}

export default function ResultsPage() {
  const { id } = useParams()
  const { auth } = useAuth()
  const navigate = useNavigate()

  const { data: results, loading, error } = useApi(
    () => submissionsApi.results(id, auth.token),
    [id, auth.token]
  )

  const graded = results?.filter((r) => r.score != null) ?? []
  const avg = graded.length
    ? (graded.reduce((a, r) => a + r.score, 0) / graded.length).toFixed(1)
    : null
  const highest = graded.length
    ? Math.max(...graded.map((r) => r.score)).toFixed(1)
    : null
  const lowest = graded.length
    ? Math.min(...graded.map((r) => r.score)).toFixed(1)
    : null

  const scoreColor = (s) => {
    if (s == null) return 'badge-gray'
    if (s >= 70) return 'badge-green'
    if (s >= 40) return 'badge-amber'
    return 'badge-red'
  }

  return (
    <>
      <div className="page-header">
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/')} style={{ marginBottom: '.75rem' }}>
          ← Back
        </button>
        <h1>Submission results</h1>
        <p>All graded submissions for this exam.</p>
      </div>

      {loading && <div className="loading-page"><span className="spinner" /></div>}
      {error && <div className="alert alert-error">⚠ {error}</div>}

      {!loading && results && (
        <>
          <div className="stats-row">
            <StatCard label="Total submissions" value={results.length} />
            <StatCard label="Average score" value={avg != null ? `${avg}%` : '—'} />
            <StatCard label="Highest score" value={highest != null ? `${highest}%` : '—'} />
            <StatCard label="Lowest score" value={lowest != null ? `${lowest}%` : '—'} />
          </div>

          {results.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">📭</div>
              <h3>No submissions yet</h3>
              <p>Results will appear here once students submit.</p>
            </div>
          ) : (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Student ID</th>
                    <th>Score</th>
                    <th>Submitted at</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r, i) => (
                    <tr key={r.student_id}>
                      <td className="mono" style={{ color: 'var(--ink3)', fontSize: '.8rem' }}>
                        {i + 1}
                      </td>
                      <td className="mono" style={{ fontSize: '.8rem' }}>
                        {r.student_id}
                      </td>
                      <td>
                        <span className={`badge ${scoreColor(r.score)}`}>
                          {r.score != null ? `${r.score.toFixed(1)}%` : 'Pending'}
                        </span>
                      </td>
                      <td style={{ color: 'var(--ink3)', fontSize: '.85rem' }}>
                        {fmtDate(r.submitted_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </>
  )
}
