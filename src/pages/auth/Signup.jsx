import { useContext, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../../auth/AuthContext'
import Button from '../../components/ui/Button'
import FormField from '../../components/ui/FormField'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'

const Signup = () => {
  const navigate = useNavigate()
  const { signup } = useContext(AuthContext)
  const [form, setForm] = useState({
    username: '',
    password: '',
    role: 'EMPLOYEE',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signup(form)
      navigate('/login')
    } catch (err) {
      setError(err.message || 'Unable to sign up')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_top_right,#dbeafe_0%,#f4f7f9_55%)] p-8">
      <div className="w-full max-w-[460px] rounded-2xl bg-white p-9 shadow-[0_20px_45px_-25px_rgba(15,23,42,0.4)]">
        <div className="[&>h1]:my-2 [&>h1]:mb-3 [&>h1]:font-display">
          <p className="m-0 text-xs uppercase tracking-[0.24em] text-slate-500">FinSecure</p>
          <h1>Create a new account</h1>
          <p>Choose your role to tailor the operational console.</p>
        </div>
        <form className="mt-4 flex flex-col gap-4" onSubmit={handleSubmit}>
          <FormField label="Username">
            <Input
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="jane.doe"
              required
            />
          </FormField>
          <FormField label="Password">
            <Input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </FormField>
          <FormField label="Role">
            <Select name="role" value={form.role} onChange={handleChange}>
              <option value="EMPLOYEE">Employee</option>
              <option value="MANAGER">Manager</option>
              <option value="HR">HR</option>
              <option value="FINANCE">Finance</option>
            </Select>
          </FormField>
          {error && <p className="m-0 text-orange-700">{error}</p>}
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create account'}
          </Button>
        </form>
        <p className="mt-4 text-sm text-slate-500">
          Already registered? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  )
}

export default Signup
