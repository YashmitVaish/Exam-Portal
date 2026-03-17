import './QuestionBuilder.css'

const LETTERS = ['A', 'B', 'C', 'D']

export default function QuestionBuilder({ questions, onChange }) {
  const add = () =>
    onChange([
      ...questions,
      { text: '', q_type: 'mcq', options: ['', '', '', ''], correct_answer: '' },
    ])

  const remove = (i) => onChange(questions.filter((_, idx) => idx !== i))

  const update = (i, field, val) => {
    const next = [...questions]
    next[i] = { ...next[i], [field]: val }

    if (field === 'q_type') {
      if (val === 'mcq') {
        next[i].options = next[i].options?.length ? next[i].options : ['', '', '', '']
        next[i].correct_answer = ''
      } else if (val === 'truefalse') {
        delete next[i].options
        next[i].correct_answer = 'true'
      } else {
        delete next[i].options
        next[i].correct_answer = ''
      }
    }
    onChange(next)
  }

  const updateOption = (qi, oi, val) => {
    const next = [...questions]
    const opts = [...(next[qi].options || [])]
    opts[oi] = val
    next[qi] = { ...next[qi], options: opts }
    onChange(next)
  }

  return (
    <div className="qb">
      <div className="qb-header">
        <div className="form-section-title">Questions ({questions.length})</div>
        <button type="button" className="btn btn-ghost btn-sm" onClick={add}>
          + Add question
        </button>
      </div>

      {questions.length === 0 && (
        <div className="qb-empty">
          No questions yet. Add at least one before publishing.
        </div>
      )}

      {questions.map((q, i) => (
        <div className="q-card" key={i}>
          <div className="q-num">Question {i + 1}</div>
          <button
            type="button"
            className="q-remove"
            onClick={() => remove(i)}
            title="Remove question"
          >
            ×
          </button>

          <div className="form-stack">
            <div className="field">
              <label className="label">Question text</label>
              <textarea
                className="textarea"
                rows={2}
                value={q.text}
                onChange={(e) => update(i, 'text', e.target.value)}
                placeholder="Enter your question…"
              />
            </div>

            <div className="form-row">
              <div className="field">
                <label className="label">Type</label>
                <select
                  className="select"
                  value={q.q_type}
                  onChange={(e) => update(i, 'q_type', e.target.value)}
                >
                  <option value="mcq">Multiple choice (MCQ)</option>
                  <option value="truefalse">True / False</option>
                  <option value="short">Short answer</option>
                </select>
              </div>

              {q.q_type !== 'truefalse' && (
                <div className="field">
                  <label className="label">Correct answer</label>
                  <input
                    className="input"
                    value={q.correct_answer}
                    onChange={(e) => update(i, 'correct_answer', e.target.value)}
                    placeholder={
                      q.q_type === 'mcq'
                        ? 'Must match one option exactly'
                        : 'Expected answer…'
                    }
                  />
                </div>
              )}

              {q.q_type === 'truefalse' && (
                <div className="field">
                  <label className="label">Correct answer</label>
                  <select
                    className="select"
                    value={q.correct_answer}
                    onChange={(e) => update(i, 'correct_answer', e.target.value)}
                  >
                    <option value="true">True</option>
                    <option value="false">False</option>
                  </select>
                </div>
              )}
            </div>

            {q.q_type === 'mcq' && (
              <div className="field">
                <label className="label">Options</label>
                <div className="options-grid">
                  {(q.options || ['', '', '', '']).map((opt, oi) => (
                    <div key={oi} className="option-input-wrap">
                      <span className="option-letter-prefix">{LETTERS[oi]}</span>
                      <input
                        className="input"
                        value={opt}
                        onChange={(e) => updateOption(i, oi, e.target.value)}
                        placeholder={`Option ${LETTERS[oi]}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
