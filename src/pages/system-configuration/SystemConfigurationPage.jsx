import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { AuthContext } from '../../auth/AuthContext'
import { getSystemConfigs, updateSystemConfig } from '../../api/systemConfig'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import Table from '../../components/ui/Table'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'

const SystemConfigurationPage = () => {
  const { token } = useContext(AuthContext)
  const [configs, setConfigs] = useState([])
  const [drafts, setDrafts] = useState({})
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [savingKey, setSavingKey] = useState('')

  const loadConfigs = useCallback(async () => {
    setError('')
    setSuccessMessage('')
    try {
      const data = await getSystemConfigs(token)
      const list = Array.isArray(data) ? data : []
      setConfigs(list)
      setDrafts(
        list.reduce((acc, config) => {
          acc[config.configKey] = config.configValue ?? ''
          return acc
        }, {})
      )
    } catch (err) {
      setError(err.message || 'Unable to load system configuration')
    }
  }, [token])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadConfigs()
  }, [loadConfigs])

  const handleChange = (key, value) => {
    setError('')
    setSuccessMessage('')
    setDrafts((prev) => ({ ...prev, [key]: value }))
  }

  const validateValue = (key, value) => {
    if (key !== 'MAX_HOURS_PER_DAY') {
      return ''
    }

    const parsed = Number(value)
    if (!Number.isInteger(parsed)) {
      return 'MAX_HOURS_PER_DAY must be a whole number of minutes.'
    }
    if (parsed < 60 || parsed > 1440) {
      return 'MAX_HOURS_PER_DAY must be between 60 and 1440 minutes.'
    }
    return ''
  }

  const handleSave = async (key) => {
    setError('')
    setSuccessMessage('')

    const validationError = validateValue(key, drafts[key])
    if (validationError) {
      setError(validationError)
      return
    }

    setSavingKey(key)
    try {
      const updated = await updateSystemConfig(token, key, drafts[key])
      setConfigs((prev) =>
        prev.map((config) => (config.configKey === key ? updated : config))
      )
      setSuccessMessage('Configuration updated.')
    } catch (err) {
      setError(err.message || 'Unable to update configuration')
    } finally {
      setSavingKey('')
    }
  }

  const hasConfigs = configs.length > 0
  const helperText = useMemo(() => '', [])

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="System Configuration"
        actions={
          <Button variant="ghost" onClick={loadConfigs}>
            Refresh
          </Button>
        }
      />

      <Card>
        <div className="flex flex-col gap-2">
          <h3>Configuration values</h3>
          {helperText && <p className="text-sm text-slate-500">{helperText}</p>}
          {error && <p className="text-orange-700">{error}</p>}
          {successMessage && <p className="text-emerald-700">{successMessage}</p>}
        </div>

        {hasConfigs ? (
          <Table columns={['Key', 'Value', 'Action']}>
            {configs.map((config) => (
              <tr key={config.configKey}>
                <td className="font-semibold text-slate-700">
                  {config.configKey === 'MAX_HOURS_PER_DAY'
                    ? 'MAX_HOURS_PER_DAY (minutes)'
                    : config.configKey}
                </td>
                <td>
                  <Input
                    type={
                      config.configKey === 'MAX_HOURS_PER_DAY'
                        ? 'number'
                        : 'text'
                    }
                    min={config.configKey === 'MAX_HOURS_PER_DAY' ? 60 : undefined}
                    max={config.configKey === 'MAX_HOURS_PER_DAY' ? 1440 : undefined}
                    value={drafts[config.configKey] ?? ''}
                    onChange={(event) =>
                      handleChange(config.configKey, event.target.value)
                    }
                    placeholder={
                      config.configKey === 'MAX_HOURS_PER_DAY'
                        ? 'Minutes, e.g. 540'
                        : ''
                    }
                  />
                </td>
                <td>
                  <Button
                    type="button"
                    onClick={() => handleSave(config.configKey)}
                    disabled={savingKey === config.configKey}
                  >
                    {savingKey === config.configKey ? 'Saving...' : 'Save'}
                  </Button>
                </td>
              </tr>
            ))}
          </Table>
        ) : (
          <EmptyState
            title="No configuration values"
            description="Default configuration values have not been seeded yet."
          />
        )}
      </Card>
    </div>
  )
}

export default SystemConfigurationPage
