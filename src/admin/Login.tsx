import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminApi } from './api'
import { Logo } from '../components/Logo'
import { Icon } from '../components/Icon'

export function AdminLogin() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      await adminApi.login(email, password)
      navigate('/admin', { replace: true })
    } catch {
      setError('Credenciais inválidas. Verifique e-mail e senha.')
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface-container-lowest flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10 text-primary">
          <Logo className="h-16 w-auto mx-auto" />
          <p className="font-label-sm text-label-sm text-status-gold uppercase tracking-widest mt-4">
            Painel Administrativo
          </p>
        </div>
        <form
          onSubmit={submit}
          className="bg-surface-container border border-outline-variant/30 p-8 space-y-5"
        >
          <div>
            <label className="font-label-sm text-label-sm text-silver-gray uppercase block mb-2">
              E-mail
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-surface-container-low border-b border-outline-variant focus:border-status-gold p-3 text-primary outline-none transition-all"
            />
          </div>
          <div>
            <label className="font-label-sm text-label-sm text-silver-gray uppercase block mb-2">
              Senha
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-surface-container-low border-b border-outline-variant focus:border-status-gold p-3 text-primary outline-none transition-all"
            />
          </div>
          {error && (
            <p className="text-error text-body-md flex items-center gap-2">
              <Icon name="error" className="text-base" /> {error}
            </p>
          )}
          <button
            type="submit"
            disabled={busy}
            className="w-full btn-shine bg-primary text-pure-black font-label-sm text-label-sm uppercase tracking-widest py-4 hover:bg-status-gold transition-colors disabled:opacity-50"
          >
            {busy ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
