import { useContext, useEffect, useMemo, useState } from 'react'
import { AuthContext } from '../../auth/AuthContext'
import { createWeeklyEntries } from '../../api/timesheetEntries'
import { getProjectsForTimesheetEntryDropdown } from '../../api/projects'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import FormField from '../../components/ui/FormField'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import TextArea from '../../components/ui/TextArea'
import {
  BASE_YEAR,
  FUTURE_YEAR_BUFFER,
  MAX_WEEK_NUMBER,
  createEmptyEntry,
  isEntryEmpty,
  getEntryValidationError,
  getWeekDateOptions,
  getWeekBounds,
  getDefaultWeekNumberForDate,
} from '../../utils/weeklyTimesheet'

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

const WEEK_OPTIONS = Array.from({ length: MAX_WEEK_NUMBER + 1 }, (_, index) => ({
  value: String(index),
  label: `Week ${index}`,
}))

const ENTRY_FIELD_CONFIG = [
  { label: 'Entry date', field: 'date', control: 'input', type: 'date', required: true, readOnly: true },
  { label: 'Hours', field: 'hours', control: 'input', type: 'number', min: '0', max: '24', step: '1', required: true },
  { label: 'Minutes', field: 'minutes', control: 'input', type: 'number', min: '0', max: '59', step: '1', required: true },
  { label: 'Project', field: 'projectId', control: 'select', required: true },
  { label: 'Description', field: 'taskDescription', control: 'textarea', rows: '3', required: true },
]

const WeeklyTimesheetEntryPage = () => {
  const { token } = useContext(AuthContext)
  const today = new Date()
  const defaultWeekNumber = getDefaultWeekNumberForDate(today)
  const [month, setMonth] = useState(String(today.getMonth() + 1))
  const [year, setYear] = useState(String(today.getFullYear()))
  const [weekNumber, setWeekNumber] = useState(defaultWeekNumber)
  const [entries, setEntries] = useState([createEmptyEntry()])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeDate, setActiveDate] = useState('')
  const [projectOptions, setProjectOptions] = useState([])
  const [projectError, setProjectError] = useState('')

  const currentYear = today.getFullYear()
  const yearOptions = Array.from({ length: currentYear - BASE_YEAR + FUTURE_YEAR_BUFFER }, (_, index) =>
    String(BASE_YEAR + index),
  )

  const weekBounds = useMemo(
    () => getWeekBounds(year, month, weekNumber),
    [year, month, weekNumber],
  )

  const weekDateOptions = useMemo(() => getWeekDateOptions(weekBounds), [weekBounds])

  useEffect(() => {
    if (weekDateOptions.length === 0) {
      setActiveDate('')
      return
    }

    setActiveDate((prev) => {
      const hasPreviousDate = weekDateOptions.some((option) => option.value === prev)
      if (hasPreviousDate) {
        return prev
      }
      return weekDateOptions[0].value
    })
  }, [weekDateOptions])

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

  const dateEntryCounts = useMemo(() => {
    return entries.reduce((acc, entry) => {
      if (!entry.date) {
        return acc
      }
      acc[entry.date] = (acc[entry.date] || 0) + 1
      return acc
    }, {})
  }, [entries])

  const visibleEntries = useMemo(() => {
    const entriesWithIndex = entries.map((entry, index) => ({ entry, originalIndex: index }))

    if (!activeDate) {
      return entriesWithIndex
    }

    return entriesWithIndex.filter(({ entry }) => entry.date === activeDate)
  }, [entries, activeDate])

  const handleEntryChange = (index, field, value) => {
    setEntries((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], [field]: value }
      return next
    })
  }

  const handleProjectChange = (index, value) => {
    const selectedProject = projectOptions.find(
      (project) => String(project.projectId) === value,
    )

    setEntries((prev) => {
      const next = [...prev]
      next[index] = {
        ...next[index],
        projectId: value,
        projectName: selectedProject?.projectName || '',
      }
      return next
    })
  }

  const addEntryRow = () => {
    setEntries((prev) => [...prev, { ...createEmptyEntry(), date: activeDate || '' }])
  }

  const handleWeekDateClick = (dateValue) => {
    setActiveDate(dateValue)
    setEntries((prev) => {
      if (prev.some((entry) => entry.date === dateValue)) {
        return prev
      }

      const firstWithoutDateIndex = prev.findIndex((entry) => !entry.date)

      if (firstWithoutDateIndex >= 0) {
        return prev.map((entry, index) =>
          index === firstWithoutDateIndex ? { ...entry, date: dateValue } : entry,
        )
      }

      return [...prev, { ...createEmptyEntry(), date: dateValue }]
    })
  }

  const removeEntryRow = (index) => {
    setEntries((prev) => {
      if (prev.length === 1) {
        return [createEmptyEntry()]
      }
      return prev.filter((_, currentIndex) => currentIndex !== index)
    })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    const parsedWeekNumber = Number(weekNumber)
    if (!Number.isInteger(parsedWeekNumber) || parsedWeekNumber < 0 || parsedWeekNumber > MAX_WEEK_NUMBER) {
      setError('Please select a valid week number from Week 0 to Week 5.')
      return
    }

    const nonEmptyEntries = entries.filter((entry) => !isEntryEmpty(entry))

    if (nonEmptyEntries.length === 0) {
      setError('Please fill at least one weekly entry.')
      return
    }

    const payloadEntries = []

    for (let index = 0; index < nonEmptyEntries.length; index += 1) {
      const entry = nonEmptyEntries[index]
      const rowNo = index + 1

      const validationError = getEntryValidationError(entry, rowNo, weekBounds)
      if (validationError) {
        setError(validationError)
        return
      }

      const hours = Number(entry.hours)
      const minutes = Number(entry.minutes)
      const selectedProject = projectOptions.find(
        (project) => String(project.projectId) === String(entry.projectId),
      )
      const projectId = Number(selectedProject?.projectId)

      if (!selectedProject || !Number.isInteger(projectId) || projectId <= 0) {
        setError(`Please select a valid project for entry ${rowNo}.`)
        return
      }

      payloadEntries.push({
        date: entry.date,
        hours,
        minutes,
        taskDescription: entry.taskDescription.trim(),
        projectName: selectedProject.projectName,
        projectId,
      })
    }

    setIsSubmitting(true)
    try {
      const response = await createWeeklyEntries(token, {
        weekNumber: parsedWeekNumber,
        entries: payloadEntries,
      })

      const savedCount = Array.isArray(response?.responseList)
        ? response.responseList.length
        : payloadEntries.length

      setSuccess(`Saved ${savedCount} weekly entr${savedCount === 1 ? 'y' : 'ies'} successfully.`)
      setEntries([createEmptyEntry()])
    } catch (err) {
      setError(err.message || 'Unable to save weekly entries')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Weekly Timesheet Entry"
        subtitle="Select a week and save multiple timesheet entries in one submit."
      />

      <Card>
        <form className="flex flex-col gap-3.5" onSubmit={handleSubmit}>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3">
            <FormField label="Month">
              <Select value={month} onChange={(event) => setMonth(event.target.value)}>
                {MONTH_OPTIONS.map((optionMonth) => (
                  <option key={optionMonth.value} value={optionMonth.value}>
                    {optionMonth.label}
                  </option>
                ))}
              </Select>
            </FormField>

            <FormField label="Year">
              <Select value={year} onChange={(event) => setYear(event.target.value)}>
                {yearOptions.map((optionYear) => (
                  <option key={optionYear} value={optionYear}>
                    {optionYear}
                  </option>
                ))}
              </Select>
            </FormField>

            <FormField label="Week Number" helper="Week 0 is the first partial week of the month.">
              <Select
                value={weekNumber}
                onChange={(event) => setWeekNumber(event.target.value)}
              >
                {WEEK_OPTIONS.map((optionWeek) => (
                  <option key={optionWeek.value} value={optionWeek.value}>
                    {optionWeek.label}
                  </option>
                ))}
              </Select>
            </FormField>
          </div>

          {weekBounds ? (
            <p className="text-xs text-slate-500">
              Allowed date range for selected week: {weekBounds.start} to {weekBounds.end}
            </p>
          ) : (
            <p className="text-orange-700">Selected week does not exist for this month.</p>
          )}

          {weekDateOptions.length > 0 && (
            <div className="flex flex-wrap gap-2" aria-label="Dates in selected week">
              {weekDateOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-2.5 py-1.5 text-xs transition-colors ${
                    activeDate === option.value
                      ? 'border-blue-700 bg-blue-700 text-white hover:bg-blue-800'
                      : dateEntryCounts[option.value]
                        ? 'border-blue-700/45 bg-blue-700/8 text-[#132134] hover:bg-blue-700/15'
                        : 'border-slate-300 bg-white text-[#132134] hover:bg-slate-100'
                  }`}
                  onClick={() => handleWeekDateClick(option.value)}
                >
                  <span>{option.label}</span>
                  {dateEntryCounts[option.value] ? (
                    <strong
                      className={`inline-flex size-[18px] items-center justify-center rounded-full text-[11px] ${
                        activeDate === option.value
                          ? 'bg-white/25'
                          : 'bg-slate-900/10'
                      }`}
                    >
                      {dateEntryCounts[option.value]}
                    </strong>
                  ) : null}
                </button>
              ))}
            </div>
          )}

          {activeDate && (
            <p className="text-xs text-slate-500">Showing entries for {activeDate}. Save Weekly will submit all dates in this week.</p>
          )}

          <div className="flex flex-col gap-3.5">
            {visibleEntries.length === 0 && (
              <p className="text-xs text-slate-500">No entries yet for this date. Click Add another entry to start.</p>
            )}

            {visibleEntries.map(({ entry, originalIndex }, visibleIndex) => (
              <div key={`weekly-entry-${originalIndex + 1}`} className="rounded-[10px] border border-slate-300 bg-slate-100 p-3.5">
                <div className="mb-2.5 flex items-center justify-between gap-2">
                  <h4 className="m-0 text-sm uppercase tracking-[0.08em] text-slate-500">Entry {visibleIndex + 1}</h4>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => removeEntryRow(originalIndex)}
                  >
                    Remove
                  </Button>
                </div>

                {ENTRY_FIELD_CONFIG.map((fieldConfig) => {
                  const commonProps = {
                    value: fieldConfig.field === 'date' ? (entry[fieldConfig.field] || activeDate) : entry[fieldConfig.field],
                    onChange: (event) => handleEntryChange(originalIndex, fieldConfig.field, event.target.value),
                    required: fieldConfig.required,
                    readOnly: fieldConfig.readOnly,
                  }

                  return (
                    <FormField key={fieldConfig.field} label={fieldConfig.label}>
                      {fieldConfig.control === 'textarea' ? (
                        <TextArea {...commonProps} rows={fieldConfig.rows} />
                      ) : fieldConfig.control === 'select' ? (
                        <Select
                          {...commonProps}
                          value={entry.projectId}
                          onChange={(event) =>
                            handleProjectChange(originalIndex, event.target.value)
                          }
                        >
                          <option value="">Select project</option>
                          {projectOptions.map((project) => (
                            <option key={project.projectId} value={project.projectId}>
                              {project.projectName}
                            </option>
                          ))}
                          {entry.projectId &&
                            !projectOptions.some(
                              (project) =>
                                String(project.projectId) === String(entry.projectId),
                            ) && (
                              <option value={entry.projectId}>
                                {entry.projectName || `Project ${entry.projectId}`}
                              </option>
                            )}
                        </Select>
                      ) : (
                        <Input
                          {...commonProps}
                          type={fieldConfig.type}
                          min={fieldConfig.min}
                          max={fieldConfig.max}
                          step={fieldConfig.step}
                        />
                      )}
                    </FormField>
                  )
                })}
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2.5">
            <Button type="button" variant="secondary" onClick={addEntryRow}>
              Add another entry
            </Button>
            <Button type="submit" disabled={isSubmitting || !weekBounds}>
              {isSubmitting ? 'Saving...' : 'Save weekly entries'}
            </Button>
          </div>
        </form>

        {projectError && <p className="text-orange-700">{projectError}</p>}
        {error && <p className="text-orange-700">{error}</p>}
        {success && <p className="mt-[-10px] mb-0 text-sm font-semibold text-green-700">{success}</p>}
      </Card>
    </div>
  )
}

export default WeeklyTimesheetEntryPage
