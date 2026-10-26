
require('dotenv').config()

const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')

const authRoutes = require('./routes/auth')
const authMiddleware = require('./middleware/authMiddleware')

const app = express()
const PORT = process.env.PORT || 5000
const MONGO_URI = process.env.MONGO_URI

app.use(cors())
app.use(express.json())

// Authentication APIs: register and login
app.use('/api/auth', authRoutes)

// Job application schema
const applicationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    company: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['Applied', 'Interview', 'Rejected', 'Offer'],
      default: 'Applied',
    },
    date: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
)

const Application = mongoose.model('Application', applicationSchema)

// Format the response for the frontend
function formatApplication(application) {
  return {
    id: application._id.toString(),
    company: application.company,
    role: application.role,
    status: application.status,
    date: application.date || '',
  }
}

// Backend test route
app.get('/', (req, res) => {
  res.send('JobTrack backend is running successfully!')
})

// All application routes below this point require a valid JWT.

// GET: Retrieve only the logged-in user's applications
app.get('/api/applications', authMiddleware, async (req, res) => {
  try {
    const applications = await Application.find({
      user: req.user.userId,
    }).sort({ createdAt: -1 })

    res.json(applications.map(formatApplication))
  } catch (error) {
    console.error('Load applications error:', error)
    res.status(500).json({ message: 'Failed to load applications.' })
  }
})

// POST: Create an application for the logged-in user
app.post('/api/applications', authMiddleware, async (req, res) => {
  try {
    const { company, role, status, date } = req.body

    if (
      typeof company !== 'string' ||
      !company.trim() ||
      typeof role !== 'string' ||
      !role.trim() ||
      !['Applied', 'Interview', 'Rejected', 'Offer'].includes(status)
    ) {
      return res.status(400).json({
        message: 'Please provide a company, role, and valid status.',
      })
    }

    const application = await Application.create({
      user: req.user.userId,
      company: company.trim(),
      role: role.trim(),
      status,
      date: typeof date === 'string' ? date : '',
    })

    res.status(201).json(formatApplication(application))
  } catch (error) {
    console.error('Create application error:', error)
    res.status(500).json({ message: 'Failed to save application.' })
  }
})

// PUT: Update only an application owned by the logged-in user
app.put('/api/applications/:id', authMiddleware, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid application ID.' })
    }

    const { company, role, status, date } = req.body
    const updates = {}

    if (company !== undefined) {
      if (typeof company !== 'string' || !company.trim()) {
        return res.status(400).json({ message: 'Company cannot be empty.' })
      }
      updates.company = company.trim()
    }

    if (role !== undefined) {
      if (typeof role !== 'string' || !role.trim()) {
        return res.status(400).json({ message: 'Role cannot be empty.' })
      }
      updates.role = role.trim()
    }

    if (status !== undefined) {
      if (!['Applied', 'Interview', 'Rejected', 'Offer'].includes(status)) {
        return res.status(400).json({ message: 'Invalid application status.' })
      }
      updates.status = status
    }

    if (date !== undefined) {
      if (typeof date !== 'string') {
        return res.status(400).json({ message: 'Invalid application date.' })
      }
      updates.date = date
    }

    const application = await Application.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user.userId,
      },
      updates,
      { new: true, runValidators: true }
    )

    if (!application) {
      return res.status(404).json({
        message: 'Application not found for this account.',
      })
    }

    res.json(formatApplication(application))
  } catch (error) {
    console.error('Update application error:', error)
    res.status(500).json({ message: 'Failed to update application.' })
  }
})

// DELETE: Delete only an application owned by the logged-in user
app.delete('/api/applications/:id', authMiddleware, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid application ID.' })
    }

    const application = await Application.findOneAndDelete({
      _id: req.params.id,
      user: req.user.userId,
    })

    if (!application) {
      return res.status(404).json({
        message: 'Application not found for this account.',
      })
    }

    res.json({
      message: 'Application deleted successfully.',
      application: formatApplication(application),
    })
  } catch (error) {
    console.error('Delete application error:', error)
    res.status(500).json({ message: 'Failed to delete application.' })
  }
})

// Connect to MongoDB and start the backend
async function startServer() {
  try {
    if (!MONGO_URI) {
      throw new Error('MONGO_URI is missing from server/.env')
    }

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is missing from server/.env')
    }

    await mongoose.connect(MONGO_URI)
    console.log('Connected to MongoDB successfully!')

    app.listen(PORT, () => {
      console.log(`JobTrack server is running on port ${PORT}`)
    })
  } catch (error) {
    console.error('Server startup failed:', error.message)
    process.exit(1)
  }
}

startServer()
