import { useCallback, useContext, useEffect, useState } from 'react'
import { AuthContext } from '../../auth/AuthContext'
import { createHoliday, deleteHoliday, getHolidays } from '../../api/holidays'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import FormField from '../../components/ui/FormField'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Table from '../../components/ui/Table'
import EmptyState from '../../components/ui/EmptyState'
import { formatDate } from '../../utils/format'

const HolidaysPage = () => {
  const { token, user } = useContext(AuthContext)
  const [form, setForm] = useState({
    date: '',
    name: '',
    type: 'NATIONAL',
  })
  const [year, setYear] = useState(String(new Date().getFullYear()))
  const [holidays, setHolidays] = useState([])
  const [error, setError] = useState('')

  const loadHolidays = useCallback(async () => {
    setError('')
    try {
      const data = await getHolidays(token, { year })
      setHolidays(data || [])
    } catch (err) {
      setError(err.message || 'Unable to load holidays')
    }
  }, [token, year])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadHolidays()
  }, [loadHolidays])

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    try {
      await createHoliday(token, form)
      setForm({ date: '', name: '', type: 'NATIONAL' })
      await loadHolidays()
    } catch (err) {
      setError(err.message || 'Unable to add holiday')
    }
  }

  const handleDelete = async (holidayId) => {
    setError('')
    try {
      await deleteHoliday(token, holidayId)
      await loadHolidays()
    } catch (err) {
      setError(err.message || 'Unable to delete holiday')
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Holiday Calendar"
        subtitle="Manage upcoming holidays and seasonal events."
        actions={
          <Input
            type="number"
            value={year}
            onChange={(event) => setYear(event.target.value)}
          />
        }
      />
      {user?.role === 'HR' && (
        <Card>
          <h3>Add holiday</h3>
          <form className="flex flex-col gap-3.5" onSubmit={handleSubmit}>
            <FormField label="Holiday date">
              <Input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                required
              />
            </FormField>
            <FormField label="Name">
              <Input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </FormField>
            <FormField label="Type">
              <Select
                name="type"
                value={form.type}
                onChange={handleChange}
              >
                <option value="NATIONAL">National</option>
                <option value="RELIGIOUS">Religious</option>
              </Select>
            </FormField>
            <Button type="submit">Add holiday</Button>
          </form>
        </Card>
      )}

      <Card>
        <h3>Holidays</h3>
        {error && <p className="text-orange-700">{error}</p>}
        {holidays.length === 0 ? (
          <EmptyState
            title="No holidays"
            description="No holidays are configured for this year."
          />
        ) : (
          <Table columns={['Date', 'Name', 'Type', 'Action']}>
            {holidays.map((holiday) => (
              <tr key={holiday.holidayId || holiday.date}>
                <td>{formatDate(holiday.date)}</td>
                <td>{holiday.name}</td>
                <td>{holiday.type}</td>
                <td>
                  {user?.role === 'HR' ? (
                    <Button
                      variant="ghost"
                      onClick={() => handleDelete(holiday.holidayId)}
                    >
                      Delete
                    </Button>
                  ) : (
                    '-'
                  )}
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Card>
    </div>
  )
}

export default HolidaysPage
