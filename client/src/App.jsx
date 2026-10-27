import { useState, useEffect } from 'react'
import './App.css'

const API_BASE ='https://jobtrack-api-fck9.onrender.com/api'

function App() {
  const [token, setToken] = useState(() => localStorage.getItem('jobtrack_token') || '')
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('jobtrack_user') || 'null')
    } catch {
      return null
    }
  })

  const [authMode, setAuthMode] = useState('login')
  const [authName, setAuthName] = useState('')
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authLoading, setAuthLoading] = useState(false)

  const [company, setCompany] = useState('')
  const [role, setRole] = useState('')
  const [status, setStatus] = useState('Applied')
  const [date, setDate] = useState('')
  const [applications, setApplications] = useState([])
  const [editId, setEditId] = useState(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function logout() {
    localStorage.removeItem('jobtrack_token')
    localStorage.removeItem('jobtrack_user')
    setToken('')
    setUser(null)
    setApplications([])
    setError('')
    resetForm()
  }

  // Send the login or registration request
  async function handleAuthSubmit(event) {
    event.preventDefault()
    setError('')
    setAuthLoading(true)

    const endpoint = authMode === 'register' ? 'register' : 'login'

    const body =
      authMode === 'register'
        ? { name: authName.trim(), email: authEmail.trim(), password: authPassword }
        : { email: authEmail.trim(), password: authPassword }

    try {
      const response = await fetch(`${API_BASE}/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Authentication failed.')
      }

      // Registration creates the account. Log in separately afterwards.
      if (authMode === 'register') {
        setAuthMode('login')
        setAuthPassword('')
        setError('')
        alert('Account created successfully! Please log in.')
        return
      }

      localStorage.setItem('jobtrack_token', result.token)
      localStorage.setItem('jobtrack_user', JSON.stringify(result.user))

      setToken(result.token)
      setUser(result.user)
      setAuthPassword('')
      setError('')
    } catch (err) {
      setError(err.message || 'Could not connect to the backend.')
    } finally {
      setAuthLoading(false)
    }
  }

  // Load applications whenever the authenticated user/token changes
 
  // Load applications whenever the authenticated user/token changes
  useEffect(() => {
    let cancelled = false

    async function fetchApplications() {
      if (!token) {
        setApplications([])
        setLoading(false)
        return
      }

      setLoading(true)
      setError('')

      try {
        const response = await fetch(`${API_BASE}/applications`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        const result = await response.json()

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Your session expired. Please log in again.')
          }

          throw new Error(result.message || 'Failed to load applications.')
        }

        if (!cancelled) {
          setApplications(result)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Could not connect to the backend.')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchApplications()

    return () => {
      cancelled = true
    }
  }, [token])


  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    const applicationData = {
      company: company.trim(),
      role: role.trim(),
      status,
      date,
    }

    try {
      const isEditing = editId !== null
      const response = await fetch(
        isEditing
          ? `${API_BASE}/applications/${editId}`
          : `${API_BASE}/applications`,
        {
          method: isEditing ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(applicationData),
        }
      )

      const result = await response.json()

      if (!response.ok) {
        if (response.status === 401) {
          logout()
          throw new Error('Your session expired. Please log in again.')
        }
        throw new Error(result.message || 'Failed to save application.')
      }

      if (isEditing) {
        setApplications((current) =>
          current.map((item) => item.id === editId ? result : item)
        )
      } else {
        setApplications((current) => [result, ...current])
      }

      resetForm()
    } catch (err) {
      setError(err.message || 'Could not save the application.')
    }
  }

  function resetForm() {
    setCompany('')
    setRole('')
    setStatus('Applied')
    setDate('')
    setEditId(null)
  }

  async function deleteApplication(id) {
    if (!window.confirm('Are you sure you want to delete this application?')) {
      return
    }

    setError('')

    try {
      const response = await fetch(`${API_BASE}/applications/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })

      const result = await response.json()

      if (!response.ok) {
        if (response.status === 401) {
          logout()
          throw new Error('Your session expired. Please log in again.')
        }
        throw new Error(result.message || 'Failed to delete application.')
      }

      setApplications((current) => current.filter((item) => item.id !== id))

      if (editId === id) {
        resetForm()
      }
    } catch (err) {
      setError(err.message || 'Could not delete the application.')
    }
  }

  function editApplication(application) {
    setCompany(application.company)
    setRole(application.role)
    setStatus(application.status)
    setDate(application.date || '')
    setEditId(application.id)
    setError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const filteredApplications = applications.filter((application) => {
    const query = search.toLowerCase()
    const matchesSearch =
      application.company.toLowerCase().includes(query) ||
      application.role.toLowerCase().includes(query)

    const matchesStatus =
      statusFilter === 'All' || application.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const stats = [
    { label: 'Total Applications', value: applications.length, color: 'purple' },
    {
      label: 'Interviews',
      value: applications.filter((item) => item.status === 'Interview').length,
      color: 'blue',
    },
    {
      label: 'Offers',
      value: applications.filter((item) => item.status === 'Offer').length,
      color: 'green',
    },
    {
      label: 'Rejected',
      value: applications.filter((item) => item.status === 'Rejected').length,
      color: 'orange',
    },
  ]

  // Show login/register screen when there is no token
  if (!token) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-brand">
            <span className="brand-icon">J</span>
            <span>JobTrack<span className="brand-dot">.</span></span>
          </div>

          <h1>{authMode === 'register' ? 'Create your account' : 'Welcome back'}</h1>
          <p className="auth-subtitle">
            {authMode === 'register'
              ? 'Create an account to start tracking your job search.'
              : 'Log in to manage your job applications.'}
          </p>

          {error && <div className="error-message" role="alert">{error}</div>}

          <form className="auth-form" onSubmit={handleAuthSubmit}>
            {authMode === 'register' && (
              <div className="form-field">
                <label htmlFor="auth-name">Full name</label>
                <input
                  id="auth-name"
                  type="text"
                  placeholder="Enter your name"
                  value={authName}
                  onChange={(event) => setAuthName(event.target.value)}
                  maxLength={60}
                  autoComplete="name"
                  required
                />
              </div>
            )}

            <div className="form-field">
              <label htmlFor="auth-email">Email address</label>
              <input
                id="auth-email"
                type="email"
                placeholder="you@example.com"
                value={authEmail}
                onChange={(event) => setAuthEmail(event.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="auth-password">Password</label>
              <input
                id="auth-password"
                type="password"
                placeholder="At least 8 characters"
                value={authPassword}
                onChange={(event) => setAuthPassword(event.target.value)}
                minLength={authMode === 'register' ? 8 : 1}
                autoComplete={authMode === 'register' ? 'new-password' : 'current-password'}
                required
              />
            </div>

            <button className="primary-button auth-submit" type="submit" disabled={authLoading}>
              {authLoading
                ? 'Please wait...'
                : authMode === 'register'
                  ? 'Create account'
                  : 'Log in'}
            </button>
          </form>

          <p className="auth-switch">
            {authMode === 'register'
              ? 'Already have an account? '
              : "Don't have an account? "}
            <button
              className="text-button"
              type="button"
              onClick={() => {
                setAuthMode(authMode === 'register' ? 'login' : 'register')
                setError('')
              }}
            >
              {authMode === 'register' ? 'Log in' : 'Sign up'}
            </button>
          </p>
        </div>
      </div>
    )
  }

  // Main dashboard, visible after login
  return (
    <div className="jobtrack">
      <header className="topbar">
        <a className="brand" href="#dashboard">
          <span className="brand-icon">J</span>
          <span>JobTrack<span className="brand-dot">.</span></span>
        </a>

        <div className="topbar-right">
          <span className="online-dot" />
          <span>{user?.name || user?.email || 'Personal Workspace'}</span>
          <button className="secondary-button logout-button" type="button" onClick={logout}>
            Log out
          </button>
        </div>
      </header>

      <div className="app-layout">
        <aside className="sidebar">
          <p className="sidebar-label">WORKSPACE</p>
          <a className="side-link active" href="#dashboard">Dashboard</a>
          <a className="side-link" href="#application-form">Add Application</a>
          <a className="side-link" href="#applications-list">My Applications</a>

          <div className="sidebar-bottom">
            <div className="tip-icon">✦</div>
            <h4>Stay organized</h4>
            <p>Keep your job search moving forward. Track every opportunity in one place.</p>
          </div>
        </aside>

        <main className="dashboard" id="dashboard">
          <div className="welcome-row">
            <div>
              <p className="eyebrow">YOUR CAREER WORKSPACE</p>
              <h1>Dashboard</h1>
              <p className="page-subtitle">
                Keep track of your applications and take the next step in your career.
              </p>
            </div>
            <a className="primary-button add-top-button" href="#application-form">
              + Add application
            </a>
          </div>

          <section className="stats-container" aria-label="Application statistics">
            {stats.map((stat) => (
              <div className="stats-card" key={stat.label}>
                <div className="stat-top">
                  <span className="stat-label">{stat.label}</span>
                  <span className={`stat-icon ${stat.color}`}>●</span>
                </div>
                <p className="stat-number">{stat.value}</p>
                <p className="stat-caption">Applications tracked</p>
              </div>
            ))}
          </section>

          {error && <div className="error-message" role="alert">{error}</div>}

          <section className="content-card form-card" id="application-form">
            <div className="section-heading">
              <div>
                <h2>{editId === null ? 'Add a job application' : 'Edit job application'}</h2>
                <p>Record the details of a job opportunity.</p>
              </div>
              <span className="heading-icon">＋</span>
            </div>

            <form onSubmit={handleSubmit} className="application-form">
              <div className="form-field">
                <label htmlFor="company">Company name <span>*</span></label>
                <input
                  id="company"
                  type="text"
                  placeholder="e.g. Infosys"
                  value={company}
                  onChange={(event) => setCompany(event.target.value)}
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="role">Job role <span>*</span></label>
                <input
                  id="role"
                  type="text"
                  placeholder="e.g. Software Developer"
                  value={role}
                  onChange={(event) => setRole(event.target.value)}
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="status">Application status</label>
                <select id="status" value={status} onChange={(event) => setStatus(event.target.value)}>
                  <option value="Applied">Applied</option>
                  <option value="Interview">Interview</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Offer">Offer</option>
                </select>
              </div>

              <div className="form-field">
                <label htmlFor="date">Application date <span className="optional">(optional)</span></label>
                <input id="date" type="date" value={date} onChange={(event) => setDate(event.target.value)} />
              </div>

              <div className="form-actions">
                <button className="primary-button" type="submit">
                  {editId === null ? '+ Add application' : 'Save changes'}
                </button>
                {editId !== null && (
                  <button className="secondary-button" type="button" onClick={resetForm}>
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </section>

          <section className="content-card applications-card" id="applications-list">
            <div className="section-heading applications-heading">
              <div>
                <h2>My applications</h2>
                <p>Review and manage your job search activity.</p>
              </div>
              <span className="count-pill">{applications.length} total</span>
            </div>

            <div className="list-toolbar">
              <div className="search-box">
                <input
                  aria-label="Search applications"
                  type="search"
                  placeholder="Search company or role..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>

              <select
                className="filter-select"
                aria-label="Filter by status"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="All">All statuses</option>
                <option value="Applied">Applied</option>
                <option value="Interview">Interview</option>
                <option value="Rejected">Rejected</option>
                <option value="Offer">Offer</option>
              </select>
            </div>

            {loading ? (
              <div className="empty-state">
                <h3>Loading applications...</h3>
                <p>Please wait while your saved applications load.</p>
              </div>
            ) : filteredApplications.length === 0 ? (
              <div className="empty-state">
                <h3>{applications.length === 0 ? 'Your journey starts here' : 'No matching applications'}</h3>
                <p>
                  {applications.length === 0
                    ? 'Add your first job application to start tracking your progress.'
                    : 'Try another search term or change the status filter.'}
                </p>
              </div>
            ) : (
              <div className="applications-list">
                {filteredApplications.map((application) => (
                  <article className="application-item" key={application.id}>
                    <div className="company-mark">
                      {application.company.trim().charAt(0).toUpperCase()}
                    </div>

                    <div className="application-info">
                      <h3>{application.company}</h3>
                      <p>{application.role}</p>
                      <span className="application-date">
                        {application.date
                          ? new Date(`${application.date}T00:00:00`).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })
                          : 'Date not selected'}
                      </span>
                    </div>

                    <span className={`status-badge status-${application.status.toLowerCase()}`}>
                      <span className="status-dot" />
                      {application.status}
                    </span>

                    <div className="application-actions">
                      <button
                        className="icon-button edit-button"
                        type="button"
                        aria-label={`Edit ${application.company}`}
                        title="Edit application"
                        onClick={() => editApplication(application)}
                      >
                        ✎
                      </button>
                      <button
                        className="icon-button delete-button"
                        type="button"
                        aria-label={`Delete ${application.company}`}
                        title="Delete application"
                        onClick={() => deleteApplication(application.id)}
                      >
                        ×
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <footer className="page-footer">
            <span>JobTrack · Your job search, organized.</span>
            <span>Built to keep you moving forward.</span>
          </footer>
        </main>
      </div>
    </div>
  )
}

export default App