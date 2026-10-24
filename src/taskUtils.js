export const STORAGE_KEY = 'study-planner.tasks.v1'

export function localDate(date = new Date()) {
  return [
    String(date.getFullYear()).padStart(4, '0'),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-')
}

export function validDeadline(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(value + 'T00:00:00')
  return !Number.isNaN(date.getTime()) && date.getFullYear() > 0 && localDate(date) === value
}

function validTask(task) {
  return task && typeof task === 'object'
    && typeof task.id === 'string' && task.id.length > 0
    && typeof task.title === 'string' && task.title.trim().length > 0 && task.title.length <= 100
    && typeof task.subject === 'string' && task.subject.trim().length > 0 && task.subject.length <= 50
    && validDeadline(task.deadline)
    && Number.isInteger(task.minutes) && task.minutes >= 5 && task.minutes <= 600
    && typeof task.completed === 'boolean'
}

export function loadTasks(storage) {
  const raw = storage.getItem(STORAGE_KEY)
  if (raw === null) return []
  const saved = JSON.parse(raw)
  if (!Array.isArray(saved) || !saved.every(validTask)) {
    throw new Error('Invalid saved assignments')
  }
  if (new Set(saved.map((task) => task.id)).size !== saved.length) {
    throw new Error('Duplicate saved assignment IDs')
  }
  return saved
}

export function saveTasks(storage, tasks) {
  storage.setItem(STORAGE_KEY, JSON.stringify(tasks))
}

export function isOverdue(task, today) {
  return !task.completed && task.deadline < today
}

export function filterTasks(tasks, filter) {
  if (filter === 'active') return tasks.filter((task) => !task.completed)
  if (filter === 'completed') return tasks.filter((task) => task.completed)
  return tasks
}

export function taskSummary(tasks, today) {
  const active = tasks.filter((task) => !task.completed)
  return {
    active: active.length,
    completed: tasks.length - active.length,
    minutes: active.reduce((total, task) => total + task.minutes, 0),
    overdue: active.filter((task) => isOverdue(task, today)).length,
  }
}

export function formatMinutes(minutes) {
  const hours = Math.floor(minutes / 60)
  const remainder = minutes % 60
  if (hours === 0) return remainder + ' min'
  return hours + ' h' + (remainder ? ' ' + remainder + ' min' : '')
}
