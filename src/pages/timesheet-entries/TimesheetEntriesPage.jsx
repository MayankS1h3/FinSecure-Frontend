import { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { AuthContext } from '../../auth/AuthContext'
import {
  createEntry,
  deleteEntry,
  getEntries,
  updateEntry,
} from '../../api/timesheetEntries'
import { getProjectsForTimesheetEntryDropdown } from '../../api/projects'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import FormField from '../../components/ui/FormField'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import TextArea from '../../components/ui/TextArea'
import EmptyState from '../../components/ui/EmptyState'

const MONTH_OPTIONS = [
  { value: '1', label: 'January' },
  { value: '2', label: 'February' },
  { value: '3', label: 'March' },
  { value: '4', label: 'April' },
  { value: '5', label: 'May' },
  { value: '6', label: 'June' },
  { value: '7', label: 'July' },
  { value: '8', label: 'August' },
  { value: '9', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
]

const TimesheetEntriesPage = () => {
  const { token } = useContext(AuthContext)
  const [entries, setEntries] = useState([])
  const [month, setMonth] = useState(String(new Date().getMonth() + 1))
  const [year, setYear] = useState(String(new Date().getFullYear()))
  const [editing, setEditing] = useState(null)
  const [projectOptions, setProjectOptions] = useState([])
  const [projectError, setProjectError] = useState('')
  const [form, setForm] = useState({
    date: '',
    hours: '',
    minutes: '',
    taskDescription: '',
    projectName: '',
    projectId: '',
  })
  const [error, setError] = useState('')
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageInfo, setPageInfo] = useState({ page: 0, totalPages: 0 })
  const formCardRef = useRef(null)
  const currentYear = new Date().getFullYear()
  const yearOptions = Array.from({ length: currentYear - 2000 + 6 }, (_, index) =>
    String(2000 + index),
  )

  const loadEntries = useCallback(async (nextMonth = month, nextYear = year) => {
    setError('')
    try {
      const data = await getEntries(token, { month: nextMonth, year: nextYear, page: currentPage, size: pageSize })
      setPageInfo({ page: data?.pageNumber || currentPage, totalPages: data?.totalPages || 0 })
      if (Array.isArray(data)) {
        setEntries(data)
      } else if (Array.isArray(data?.content)) {
        setEntries(data.content)
      } else {
        setEntries([])
      }
    } catch (err) {
      setError(err.message || 'Unable to load entries')
    }
  }, [token, month, year, currentPage, pageSize])

  useEffect(() => {
    setCurrentPage(0);
  }, [month, year])

  useEffect(() => {
    loadEntries()
  }, [loadEntries])

  useEffect(() => {
    const loadProjects = async () => {
      setProjectError('')
      try {
        const data = await getProjectsForTimesheetEntryDropdown(token)
        setProjectOptions(Array.isArray(data) ? data : [])
      } catch (err) {
        setProjectError(err.message || 'Unable to load projects')
        setProjectOptions([])
      }
    }

    if (token) {
      loadProjects()
    }
  }, [token])

  useEffect(() => {
    if (editing) {
      formCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [editing])

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }))
  }

  const handleProjectChange = (event) => {
    const selectedId = event.target.value
    const selectedProject = projectOptions.find(
      (project) => String(project.projectId) === selectedId,
    )

    setForm((prev) => ({
      ...prev,
      projectId: selectedId,
      projectName: selectedProject?.projectName || '',
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    try {
      const hours = Number(form.hours)
      const minutes = Number(form.minutes)
      const selectedProject = projectOptions.find(
        (project) => String(project.projectId) === form.projectId,
      )
      const projectId = Number(selectedProject?.projectId)

      if (!Number.isInteger(hours) || hours < 0 || hours > 24) {
        setError('Hours must be between 0 and 24')
        return
      }

      if (!Number.isInteger(minutes) || minutes < 0 || minutes > 59) {
        setError('Minutes must be between 0 and 59')
        return
      }

      if (hours === 24 && minutes > 0) {
        setError('If hours is 24, minutes must be 0')
        return
      }

      if (!selectedProject || !Number.isInteger(projectId) || projectId <= 0) {
        setError('Please select a valid project')
        return
      }

      if (!form.taskDescription.trim()) {
        setError('Task description is required')
        return
      }

      const payload = {
        date: form.date,
        hours,
        minutes,
        taskDescription: form.taskDescription.trim(),
        projectName: selectedProject.projectName,
        projectId,
      }

      const selectedDate = new Date(payload.date)
      const nextMonth = !Number.isNaN(selectedDate.getTime())
        ? String(selectedDate.getMonth() + 1)
        : month
      const nextYear = !Number.isNaN(selectedDate.getTime())
        ? String(selectedDate.getFullYear())
        : year

      if (editing) {
        await updateEntry(token, editing.timesheetEntryId, payload)
      } else {
        await createEntry(token, payload)
      }
      setMonth(nextMonth)
      setYear(nextYear)
      setForm({
        date: '',
        hours: '',
        minutes: '',
        taskDescription: '',
        projectName: '',
        projectId: '',
      })
      setEditing(null)
      await loadEntries(nextMonth, nextYear)
    } catch (err) {
      setError(err.message || 'Unable to save entry')
    }
  }

  const handleEdit = (entry) => {
    setEditing(entry)
    const entryMinutes = Number(entry.totalMinutesWorked)
    const safeMinutes = Number.isFinite(entryMinutes) ? entryMinutes : 0
    const entryHours = Math.floor(safeMinutes / 60)
    const remainderMinutes = safeMinutes % 60

    setForm({
      date: entry.date || '',
      hours: String(entryHours),
      minutes: String(remainderMinutes),
      taskDescription: entry.taskDescription || '',
      projectName: entry.projectName || '',
      projectId:
        typeof entry.projectId === 'number' ? String(entry.projectId) : '',
    })
  }

  const handleCancelEdit = () => {
    setEditing(null)
    setForm({
      date: '',
      hours: '',
      minutes: '',
      taskDescription: '',
      projectName: '',
      projectId: '',
    })
  }

  const handleDelete = async (entryId) => {
    setError('')
    try {
      await deleteEntry(token, entryId)
      await loadEntries()
    } catch (err) {
      setError(err.message || 'Unable to delete entry')
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Timesheet Entries"
        subtitle="Log daily work entries for your timesheet."
      />

      <Card ref={formCardRef}>
        <h3>{editing ? 'Edit entry' : 'New entry'}</h3>
        {editing && (
          <p className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Editing entry for {editing.date}. Update the fields below and click Update to save changes.
          </p>
        )}
        <form className="flex flex-col gap-3.5" onSubmit={handleSubmit}>
          <FormField label="Entry date">
            <Input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              required
            />
          </FormField>
          <FormField label="Hours">
            <Input
              type="number"
              name="hours"
              value={form.hours}
              onChange={handleChange}
              min="0"
              max="24"
              step="1"
              required
            />
          </FormField>
          <FormField label="Minutes">
            <Input
              type="number"
              name="minutes"
              value={form.minutes}
              onChange={handleChange}
              min="0"
              max="59"
              step="1"
              required
            />
          </FormField>
          <FormField label="Project">
            <Select
              name="projectId"
              value={form.projectId}
              onChange={handleProjectChange}
              required
            >
              <option value="">Select project</option>
              {projectOptions.map((project) => (
                <option key={project.projectId} value={project.projectId}>
                  {project.projectName}
                </option>
              ))}
              {form.projectId &&
                !projectOptions.some(
                  (project) => String(project.projectId) === form.projectId,
                ) && (
                  <option value={form.projectId}>
                    {form.projectName || `Project ${form.projectId}`}
                  </option>
                )}
            </Select>
          </FormField>
          <FormField label="Description">
            <TextArea
              name="taskDescription"
              value={form.taskDescription}
              onChange={handleChange}
              rows="3"
              required
            />
          </FormField>
          <div className="flex flex-wrap gap-2.5">
            <Button type="submit">{editing ? 'Update entry' : 'Add entry'}</Button>
            {editing && (
              <Button type="button" variant="ghost" onClick={handleCancelEdit}>
                Cancel edit
              </Button>
            )}
          </div>
        </form>
        {projectError && <p className="text-orange-700">{projectError}</p>}
        {error && <p className="text-orange-700">{error}</p>}
      </Card>

      <Card>
        <h3>Filters</h3>
        <div className="flex flex-wrap items-center gap-3">
          <Select value={month} onChange={(event) => setMonth(event.target.value)}>
            {MONTH_OPTIONS.map((optionMonth) => (
              <option key={optionMonth.value} value={optionMonth.value}>
                {optionMonth.label}
              </option>
            ))}
          </Select>
          <Select value={year} onChange={(event) => setYear(event.target.value)}>
            {yearOptions.map((optionYear) => (
              <option key={optionYear} value={optionYear}>
                {optionYear}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      <Card>
        <h3>Entries for selected month</h3>
        <p className="-mt-1.5 mb-3 text-[13px] text-slate-500">Click any row to expand entry details.</p>
        {entries.length === 0 ? (
          <EmptyState
            title="No entries"
            description="Add a timesheet entry to see it listed here."
          />
        ) : (
          <div className="flex flex-col gap-3">
            {entries.map((entry) => (
              <details
                key={entry.timesheetEntryId}
                className="group rounded-2xl border border-slate-300 bg-slate-50 p-0"
              >
                <summary className="flex cursor-pointer items-center justify-between rounded-[10px] border border-transparent px-5 py-[18px] text-left text-lg font-semibold text-slate-800 hover:border-indigo-200 hover:bg-indigo-50 [&::-webkit-details-marker]:hidden">
                  <span>
                    {entry.date} | {entry.formattedTime || '-'} | {entry.projectName || '-'}
                  </span>
                  <span className="inline-flex text-lg text-slate-700 transition-transform duration-200 group-open:rotate-180">▾</span>
                </summary>
                <div className="px-5 pb-5">
                  <p>
                    <strong>Date:</strong> {entry.date || '-'}
                  </p>
                  <p>
                    <strong>Hours:</strong>{' '}
                    {typeof entry.totalMinutesWorked === 'number'
                      ? Math.floor(entry.totalMinutesWorked / 60)
                      : '-'}
                  </p>
                  <p>
                    <strong>Minutes:</strong>{' '}
                    {typeof entry.totalMinutesWorked === 'number'
                      ? entry.totalMinutesWorked % 60
                      : '-'}
                  </p>
                  <p>
                    <strong>Formatted Time:</strong> {entry.formattedTime || '-'}
                  </p>
                  <p>
                    <strong>Project Name:</strong> {entry.projectName || '-'}
                  </p>
                  <p>
                    <strong>Description:</strong> {entry.taskDescription || '-'}
                  </p>
                  <p>
                    <strong>Project ID:</strong> {entry.projectId ?? '-'}
                  </p>
                  <div className="flex flex-wrap gap-2.5">
                    <Button type="button" variant="warning" onClick={() => handleEdit(entry)}>
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant="danger"
                      onClick={() => handleDelete(entry.timesheetEntryId)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </details>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <label htmlFor="pageSize" className="text-sm font-medium text-slate-700">
              Page Size:
            </label>
            <div className="w-20">
              <Input
                id="pageSize"
                type="number"
                min="1"
                value={pageSize}
                onChange={(e) => {
                  const newSize = parseInt(e.target.value, 10);
                  if (newSize > 0) {
                    setPageSize(newSize);
                    setCurrentPage(0);
                  }
                }}
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-slate-600">
              Page {pageInfo.totalPages > 0 ? pageInfo.page + 1 : 0} of {pageInfo.totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
                disabled={pageInfo.page <= 0}
              >
                &lt;
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setCurrentPage((prev) => Math.min(pageInfo.totalPages - 1, prev + 1))}
                disabled={pageInfo.totalPages === 0 || pageInfo.page >= pageInfo.totalPages - 1}
              >
                &gt;
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default TimesheetEntriesPage
