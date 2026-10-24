import { useState } from 'react'
import './App.css'

const emptyForm = { title: '', subject: '', deadline: '', minutes: '45' }

function formatDeadline(value) {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  }).format(new Date(`${value}T00:00:00`))
}

function App() {
  // Form values and the task list are separate pieces of React state.
  const [form, setForm] = useState(emptyForm)
  const [tasks, setTasks] = useState([])
  const [formError, setFormError] = useState('')
  const [announcement, setAnnouncement] = useState('')

  function updateForm(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setFormError('')
  }

  function addTask(event) {
    event.preventDefault()
    const title = form.title.trim()
    const subject = form.subject.trim()
    const minutes = Number(form.minutes)

    if (!title || !subject || !form.deadline) {
      setFormError('Enter a task title, subject and deadline.')
      return
    }
    if (!Number.isInteger(minutes) || minutes < 5 || minutes > 600) {
      setFormError('Estimated time must be a whole number from 5 to 600 minutes.')
      return
    }

    const newTask = {
      id: crypto.randomUUID(),
      title,
      subject,
      deadline: form.deadline,
      minutes,
      completed: false,
    }
    setTasks((current) => [...current, newTask])
    setForm(emptyForm)
    setFormError('')
    setAnnouncement(`Added: ${title}.`)
  }

  function toggleTask(id) {
    // map creates an updated list without changing the existing state.
    setTasks((current) => current.map((task) => (
      task.id === id ? { ...task, completed: !task.completed } : task
    )))
    setAnnouncement('Task status updated.')
  }

  function deleteTask(id) {
    setTasks((current) => current.filter((task) => task.id !== id))
    setAnnouncement('Task removed.')
  }

  return (
    <div className="planner">
      <header className="site-header">
        <a className="brand" href="#" aria-label="Study Planner home">
          <span className="brand-mark" aria-hidden="true">SP</span>
          <span>Study Planner<small>Your coursework organiser</small></span>
        </a>
        <a className="header-link" href="#task-title">Add an assignment <span aria-hidden="true">↗</span></a>
      </header>

      <main>
        <section className="intro" aria-labelledby="page-title">
          <div>
            <p className="eyebrow">University assignments</p>
            <h1 id="page-title">Plan your coursework.</h1>
            <p className="intro-description">Keep each assignment with its subject, deadline and time estimate.</p>
          </div>
          <p className="intro-note"><strong>Start with one task.</strong> Give it a clear deadline and a realistic amount of study time.</p>
        </section>

        <div className="workspace">
          <section className="entry-panel" aria-labelledby="new-task-title">
            <div className="section-heading">
              <span className="section-number" aria-hidden="true">01</span>
              <h2 id="new-task-title">New assignment</h2>
            </div>
            <form onSubmit={addTask}>
              <label htmlFor="task-title">What needs to be done?</label>
              <input id="task-title" name="title" value={form.title} onChange={updateForm}
                placeholder="e.g. Finish laboratory work 2" maxLength={100} required />

              <label htmlFor="task-subject">Subject</label>
              <input id="task-subject" name="subject" value={form.subject} onChange={updateForm}
                placeholder="e.g. Web Programming" maxLength={50} required />

              <div className="form-row">
                <div>
                  <label htmlFor="task-deadline">Deadline</label>
                  <input id="task-deadline" name="deadline" type="date" max="9999-12-31" value={form.deadline}
                    onChange={updateForm} required />
                </div>
                <div>
                  <label htmlFor="task-minutes">Time, in minutes</label>
                  <input id="task-minutes" name="minutes" type="number" value={form.minutes}
                    onChange={updateForm} min="5" max="600" step="1" aria-describedby="time-hint" required />
                </div>
              </div>
              <p id="time-hint" className="field-hint">Estimate 5–600 minutes for one assignment.</p>
              {formError && <p className="form-error" role="alert">{formError}</p>}
              <button className="add-button" type="submit">Add assignment <span aria-hidden="true">+</span></button>
            </form>
          </section>

          <section className="list-panel" aria-labelledby="task-list-title">
            <div className="list-heading">
              <div className="section-heading">
                <span className="section-number" aria-hidden="true">02</span>
                <h2 id="task-list-title">Your assignments</h2>
              </div>
              <span className="task-count">{tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}</span>
            </div>

            {tasks.length === 0 ? (
              <div className="empty-state">
                <span className="empty-symbol" aria-hidden="true">✓</span>
                <h3>Your list starts here</h3>
                <p>Add your first assignment using the form.<br />Each task will have a deadline and a time estimate.</p>
              </div>
            ) : (
              <ul className="task-list">
                {tasks.map((task) => (
                  <li key={task.id} className={`task-item${task.completed ? ' is-complete' : ''}`}>
                    <input className="task-checkbox" type="checkbox" checked={task.completed}
                      onChange={() => toggleTask(task.id)} aria-label={`Mark ${task.title} as ${task.completed ? 'active' : 'completed'}`} />
                    <div className="task-content">
                      <div className="task-labels">
                        <span className="subject-label">{task.subject}</span>
                        {task.completed && <span className="completed-label">Completed</span>}
                      </div>
                      <h3>{task.title}</h3>
                      <p className="task-details">
                        <span>Due <time dateTime={task.deadline}>{formatDeadline(task.deadline)}</time></span>
                        <span>{task.minutes} min estimated</span>
                      </p>
                    </div>
                    <button className="delete-button" type="button" onClick={() => deleteTask(task.id)}
                      aria-label={`Delete ${task.title}`}>Delete</button>
                  </li>
                ))}
              </ul>
            )}
            <p className="list-note">Tick a task when it is done. Keep the rest ready for your next study session.</p>
          </section>
        </div>
        <p className="screen-reader-only" role="status" aria-live="polite">{announcement}</p>
      </main>

      <footer className="site-footer">
        <span>Study Planner</span>
        <span>A place for your university assignments.</span>
      </footer>
    </div>
  )
}

export default App
