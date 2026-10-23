
const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')

const app = express()
const PORT = 5000
const MONGO_URI = 'mongodb://127.0.0.1:27017/jobtrack'

app.use(cors())
app.use(express.json())

// Define the structure of a job application
const applicationSchema = new mongoose.Schema(
  {
    company: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    status: {
      type: String,
      required: true,
      enum: ['Applied', 'Interview', 'Rejected', 'Offer'],
      default: 'Applied',
    },
    date: { type: String, default: '' },
  },
  { timestamps: true }
)

const Application = mongoose.model('Application', applicationSchema)

// Keep the response format compatible with your React frontend
function formatApplication(application) {
  return {
    id: application._id.toString(),
    company: application.company,
    role: application.role,
    status: application.status,
    date: application.date || '',
  }
}

// Test route
app.get('/', (req, res) => {
  res.send('JobTrack backend is running successfully!')
})

// GET: Retrieve all applications
app.get('/api/applications', async (req, res) => {
  try {
    const applications = await Application.find().sort({ createdAt: -1 })
    res.json(applications.map(formatApplication))
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Failed to load applications.' })
  }
})

// POST: Add an application
app.post('/api/applications', async (req, res) => {
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
      company: company.trim(),
      role: role.trim(),
      status,
      date: date || '',
    })

    res.status(201).json(formatApplication(application))
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Failed to save application.' })
  }
})

// PUT: Update an application
app.put('/api/applications/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid application ID.' })
    }

    const { company, role, status, date } = req.body
    const updates = {}

    if (company !== undefined) updates.company = company
    if (role !== undefined) updates.role = role
    if (status !== undefined) updates.status = status
    if (date !== undefined) updates.date = date

    const application = await Application.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    )

    if (!application) {
      return res.status(404).json({ message: 'Application not found.' })
    }

    res.json(formatApplication(application))
  } catch (error) {
    console.error(error)
    res.status(400).json({ message: 'Failed to update application.' })
  }
})

// DELETE: Remove an application
app.delete('/api/applications/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid application ID.' })
    }

    const application = await Application.findByIdAndDelete(req.params.id)

    if (!application) {
      return res.status(404).json({ message: 'Application not found.' })
    }

    res.json({
      message: 'Application deleted successfully.',
      application: formatApplication(application),
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Failed to delete application.' })
  }
})

// Connect to MongoDB, then start the server
async function startServer() {
  try {
    await mongoose.connect(MONGO_URI)
    console.log('Connected to MongoDB successfully!')

    app.listen(PORT, () => {
      console.log(`JobTrack server is running on port ${PORT}`)
    })
  } catch (error) {
    console.error('MongoDB connection failed:', error.message)
    process.exit(1)
  }
}

startServer()
