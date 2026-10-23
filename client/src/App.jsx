
import { useState, useEffect } from 'react'
import './App.css'

const API_URL = 'http://localhost:5000/api/applications'

function App() {
  const [company, setCompany] = useState('')
  const [role, setRole] = useState('')
  const [status, setStatus] = useState('Applied')
  const [date, setDate] = useState('')
  const [applications, setApplications] = useState([])
  const [editId, setEditId] = useState(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchApplications() {
      try {
        const response = await fetch(API_URL)

        if (!response.ok) {
          throw new Error('Failed to load applications.')
        }

        setApplications(await response.json())
      } catch {
        setError('Could not connect to the backend. Make sure the server is running.')
      } finally {
        setLoading(false)
      }
    }

    fetchApplications()
  }, [])

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
        isEditing ? `${API_URL}/${editId}` : API_URL,
        {
          method: isEditing ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(applicationData),
        }
      )

      const savedApplication = await response.json()

      if (!response.ok) {
        throw new Error(savedApplication.message || 'Failed to save application.')
      }

      if (isEditing) {
        setApplications((current) =>
          current.map((item) => item.id === editId ? savedApplication : item)
        )
      } else {
        setApplications((current) => [savedApplication, ...current])
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
      const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' })
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Failed to delete application.')
      }

      setApplications((current) => current.filter((item) => item.id !== id))

      if (editId === id) resetForm()
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
    const matchesSearch =
      application.company.toLowerCase().includes(search.toLowerCase()) ||
      application.role.toLowerCase().includes(search.toLowerCase())

    const matchesStatus =
      statusFilter === 'All' || application.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const totalApplications = applications.length
  const totalInterviews = applications.filter((item) => item.status === 'Interview').length
  const totalOffers = applications.filter((item) => item.status === 'Offer').length
  const totalRejected = applications.filter((item) => item.status === 'Rejected').length

  const stats = [
    { label: 'Total Applications', value: totalApplications, icon: '▤', color: 'purple' },
    { label: 'Interviews', value: totalInterviews, icon: '◷', color: 'blue' },
    { label: 'Offers', value: totalOffers, icon: '✓', color: 'green' },
    { label: 'Rejected', value: totalRejected, icon: '↘', color: 'orange' },
  ]

  return (
    <div className="jobtrack">
      <header className="topbar">
        <a className="brand" href="#dashboard">
          <span className="brand-icon">J</span>
          <span>JobTrack<span className="brand-dot">.</span></span>
        </a>

        <div className="topbar-right">
          <span className="online-dot" />
          <span>Personal Workspace</span>
          <div className="avatar">JT</div>
        </div>
      </header>

      <div className="app-layout">
        <aside className="sidebar">
          <p className="sidebar-label">WORKSPACE</p>
          <a className="side-link active" href="#dashboard">
            <span>▦</span> Dashboard
          </a>
          <a className="side-link" href="#application-form">
            <span>＋</span> Add Application
          </a>
          <a className="side-link" href="#applications-list">
            <span>▤</span> My Applications
          </a>

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
                  <span className={`stat-icon ${stat.color}`}>{stat.icon}</span>
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
                <span>⌕</span>
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
                <div className="empty-icon">◌</div>
                <h3>Loading applications...</h3>
                <p>Please wait while your saved applications load.</p>
              </div>
            ) : filteredApplications.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">▤</div>
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
