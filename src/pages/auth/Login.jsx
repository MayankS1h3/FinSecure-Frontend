import { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../../auth/AuthContext'
import Button from '../../components/ui/Button'
import FormField from '../../components/ui/FormField'
import Input from '../../components/ui/Input'

const Login = () => {
  const navigate = useNavigate()
  const { login } = useContext(AuthContext)
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form)
      navigate('/')
    } catch (err) {
      setError(err.message || 'Unable to sign in')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_top_right,#dbeafe_0%,#f4f7f9_55%)] p-8">
      <div className="w-full max-w-[460px] rounded-2xl bg-white p-9 shadow-[0_20px_45px_-25px_rgba(15,23,42,0.4)]">
        <div className="[&>h1]:my-2 [&>h1]:mb-3 [&>h1]:font-display">
          <p className="m-0 text-xs uppercase tracking-[0.24em] text-slate-500">FinSecure</p>
          <h1>Sign In</h1>
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
            <div className="relative">
              <Input
                className="pr-[72px]"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                className="absolute top-1/2 right-2 -translate-y-1/2 cursor-pointer border-none bg-transparent font-semibold text-blue-700"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </FormField>
          {error && <p className="m-0 text-orange-700">{error}</p>}
          <Button type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>
      </div>
    </div>
  )
}

export default Login
