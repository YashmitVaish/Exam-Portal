import { formatTime } from '../hooks/useCountdown'
import './ExamTimer.css'

export default function ExamTimer({ secsLeft, pct, urgent, onSubmit, submitting }) {
  return (
    <div className={`timer-bar ${urgent ? 'timer-bar--urgent' : ''}`}>
      <div className="timer-left">
        <div className={`timer-display ${urgent ? 'timer-display--urgent' : ''}`}>
          {secsLeft != null ? formatTime(secsLeft) : '--:--'}
        </div>
        <div className="timer-label">remaining</div>
      </div>

      <div className="timer-track">
        <div
          className={`timer-fill ${urgent ? 'timer-fill--urgent' : ''}`}
          style={{ width: `${Math.max(0, pct)}%` }}
        />
      </div>

      <button
        className="btn btn-accent"
        onClick={onSubmit}
        disabled={submitting}
      >
        {submitting ? (
          <>
            <span className="spinner spinner--white" /> Submitting…
          </>
        ) : (
          'Submit exam'
        )}
      </button>
    </div>
  )
}
