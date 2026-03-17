import { useLocation, useNavigate } from 'react-router-dom'
import './ResultView.css'

export default function ResultView() {
  const { state } = useLocation()
  const navigate = useNavigate()

  // state comes from navigate('/student/result', { state: submitResult })
  const score = state?.score
  const graded = state?.graded

  const scoreColor = () => {
    if (score == null) return ''
    if (score >= 70) return 'score--good'
    if (score >= 40) return 'score--mid'
    return 'score--low'
  }

  return (
    <div className="result-wrap">
      <div className="result-card card">
        {graded ? (
          <>
            <div className={`score-display ${scoreColor()}`}>
              <div className="score-num">{score?.toFixed(1) ?? '—'}%</div>
              <div className="score-label">Your score</div>
            </div>
            <div className="score-message">
              {score >= 70 && '🎉 Great work!'}
              {score >= 40 && score < 70 && '👍 Good effort.'}
              {score < 40 && '💪 Keep practising.'}
            </div>
          </>
        ) : (
          <>
            <div className="score-display">
              <div className="score-num" style={{ fontSize: '3rem' }}>⏳</div>
              <div className="score-label">Pending review</div>
            </div>
            <div className="alert alert-info" style={{ marginTop: '1.5rem' }}>
              Your answers have been submitted. Short-answer questions require manual grading — your teacher will finalise your score soon.
            </div>
          </>
        )}

        <hr className="divider" />

        <button className="btn btn-ghost btn-block" onClick={() => navigate('/')}>
          ← Back to home
        </button>
      </div>
    </div>
  )
}
