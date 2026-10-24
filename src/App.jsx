import { useEffect, useState } from 'react'
import {
  filterTasks, formatMinutes, isOverdue, loadTasks, localDate,
  saveTasks, taskSummary, validDeadline,
} from './taskUtils.js'
import './App.css'

const emptyForm = { title: '', subject: '', deadline: '', minutes: '45' }

function formatDeadline(value) {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  }).format(new Date(`${value}T00:00:00`))
}

function readInitialTasks() {
  try {
    return { tasks: loadTasks(window.localStorage), blocked: false }
  } catch {
    // Keep unreadable saved data instead of overwriting it.
    return { tasks: [], blocked: true }
  }
}

function App() {
  // Form values and the task list are separate pieces of React state.
  const [form, setForm] = useState(emptyForm)
  const [initialData] = useState(readInitialTasks)
  const [tasks, setTasks] = useState(initialData.tasks)
  const [filter, setFilter] = useState('all')
  const [today, setToday] = useState(localDate)
  const [saveError, setSaveError] = useState('')
  const [formError, setFormError] = useState('')
  const [announcement, setAnnouncement] = useState('')

  // Refresh overdue badges when the date changes or the window regains focus.
  useEffect(() => {
    const refreshDate = () => setToday(localDate())
    const interval = window.setInterval(refreshDate, 60000)
    window.addEventListener('focus', refreshDate)
    return () => {
      window.clearInterval(interval)
      window.removeEventListener('focus', refreshDate)
    }
  }, [])

  const summary = taskSummary(tasks, today)
  const visibleTasks = filterTasks(tasks, filter)
  const storageMessage = initialData.blocked
    ? 'Saved tasks could not be read. This list will not be saved; existing data was kept.'
    : saveError
  const filters = [
    { value: 'all', label: 'All', count: tasks.length },
    { value: 'active', label: 'Active', count: summary.active },
    { value: 'completed', label: 'Completed', count: summary.completed },
  ]

  function updateTasks(nextTasks) {
    setTasks(nextTasks)
    if (initialData.blocked) return
    try {
      saveTasks(window.localStorage, nextTasks)
      setSaveError('')
    } catch {
      setSaveError('Could not save. Keep this page open.')
    }
  }

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

    if (!title || !subject || !validDeadline(form.deadline)) {
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
    updateTasks([...tasks, newTask])
    setFilter('all')
    setForm(emptyForm)
    setFormError('')
    setAnnouncement(`Added: ${title}.`)
  }

  function toggleTask(id) {
    // map creates an updated list without changing the existing state.
    updateTasks(tasks.map((task) => (
      task.id === id ? { ...task, completed: !task.completed } : task
    )))
    setAnnouncement('Task status updated.')
  }

  function deleteTask(id) {
    updateTasks(tasks.filter((task) => task.id !== id))
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

        <section className="workload-summary" aria-label="Study workload">
          <div>
            <span className="summary-label">Active assignments</span>
            <strong>{summary.active}</strong>
          </div>
          <div>
            <span className="summary-label">Estimated time left</span>
            <strong>{formatMinutes(summary.minutes)}</strong>
          </div>
          <div className={summary.overdue > 0 ? 'summary-overdue' : ''}>
            <span className="summary-label">Overdue assignments</span>
            <strong>{summary.overdue}</strong>
          </div>
          <p>Time left includes all active assignments.</p>
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
                  <label htmlFor="task-minutes">Estimated time (min)</label>
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
              <span className="task-count">
                {filter !== 'all' && visibleTasks.length + ' of '}
                {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
              </span>
            </div>

            <div className="task-filters" role="group" aria-label="Filter assignments">
              {filters.map((item) => (
                <button key={item.value} type="button" className="filter-button"
                  aria-pressed={filter === item.value} onClick={() => setFilter(item.value)}>
                  {item.label}<span aria-hidden="true">{item.count}</span>
                </button>
              ))}
            </div>

            {visibleTasks.length === 0 ? (
              <div className="empty-state">
                <span className="empty-symbol" aria-hidden="true">✓</span>
                <h3>{tasks.length === 0 ? 'Your list starts here'
                  : filter === 'completed' ? 'No completed assignments yet' : 'No active assignments'}</h3>
                <p>{tasks.length === 0 ? 'Add your first assignment using the form.'
                  : filter === 'completed' ? 'Tick an assignment when you finish it.'
                    : 'All your assignments are completed. Add a new task when you need one.'}</p>
              </div>
            ) : (
              <ul className="task-list">
                {visibleTasks.map((task) => (
                  <li key={task.id} className={'task-item' + (task.completed ? ' is-complete' : '')
                    + (isOverdue(task, today) ? ' is-overdue' : '')}>
                    <input className="task-checkbox" type="checkbox" checked={task.completed}
                      onChange={() => toggleTask(task.id)} aria-label={`Mark ${task.title} as ${task.completed ? 'active' : 'completed'}`} />
                    <div className="task-content">
                      <div className="task-labels">
                        <span className="subject-label">{task.subject}</span>
                        {task.completed && <span className="completed-label">Completed</span>}
                        {isOverdue(task, today) && <span className="overdue-label">Overdue</span>}
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
            <div className="list-note">
              <span>Tick a task when it is done.</span>
              <span className={storageMessage ? 'save-status save-error' : 'save-status'}
                role={storageMessage ? 'alert' : undefined}>
                {storageMessage || 'Saved automatically in this browser'}
              </span>
            </div>
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
