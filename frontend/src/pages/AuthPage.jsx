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
          <form className="auth-form" onSubmit={handleSubmit}>
            {isRegister && <label>Name<input value={name} onChange={(event) => setName(event.target.value)} required /></label>}
            <label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
            <label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength="8" required /></label>
            {error && <p className="message message-error">{error}</p>}
            <button className="button button-primary" disabled={isSubmitting}>{isSubmitting ? 'Please wait...' : isRegister ? 'Create account' : 'Sign in'}</button>
          </form>
          <p className="auth-switch">{isRegister ? 'Already have an account?' : 'Need an account?'} <a href={isRegister ? '/login' : '/register'}>{isRegister ? 'Sign in' : 'Register'}</a></p>
        </section>
      </main>
    </div>
  )
}

export default AuthPage
