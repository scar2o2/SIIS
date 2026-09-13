import { useState } from 'react'
import SiteHeader from '../components/SiteHeader'
import { login, register } from '../services/authService'
import '../App.css'

function AuthPage({ mode = 'login' }) {
  const isRegister = mode === 'register'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)
    try {
      if (isRegister) {
        await register({ name, email, password })
      } else {
        await login({ email, password })
      }
      window.location.href = '/detect'
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="app-shell">
      <SiteHeader />
      <main className="main-content auth-page">
        <section className="panel auth-panel">
          <p className="eyebrow">{isRegister ? 'Create account' : 'Welcome back'}</p>
          <h1>{isRegister ? 'Register' : 'Sign in'}</h1>
          <form className="auth-form" onSubmit={handleSubmit} autoComplete="on" noValidate>
            {isRegister && (
              <div className="auth-field">
                <label htmlFor="auth-name" className="auth-label">Full name</label>
                <input
                  id="auth-name"
                  type="text"
                  autoComplete="name"
                  placeholder="Jane Smith"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                />
              </div>
            )}
            <div className="auth-field">
              <label htmlFor="auth-email" className="auth-label">Email address</label>
              <input
                id="auth-email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
            <div className="auth-field">
              <label htmlFor="auth-password" className="auth-label">
                <span>Password</span>
                {isRegister && <span className="auth-hint">At least 8 characters</span>}
              </label>
              <input
                id="auth-password"
                type="password"
                autoComplete={isRegister ? 'new-password' : 'current-password'}
                placeholder={isRegister ? 'Create a strong password' : 'Enter your password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength="8"
                required
              />
            </div>
            {error && <p className="message message-error" role="alert">{error}</p>}
            <button className="button button-primary auth-submit" disabled={isSubmitting}>
              {isSubmitting ? 'Please wait...' : isRegister ? 'Create account' : 'Sign in'}
            </button>
          </form>
          <p className="auth-switch">
            {isRegister ? 'Already have an account?' : 'Need an account?'}{' '}
            <a href={isRegister ? '/login' : '/register'}>
              {isRegister ? 'Sign in' : 'Register'}
            </a>
          </p>
        </section>
      </main>
    </div>
  )
}

export default AuthPage