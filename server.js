const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Load data
const loadData = (filename) => {
  try {
    const data = fs.readFileSync(path.join(__dirname, 'data', filename), 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error loading ${filename}:`, error);
    return [];
  }
};

// API Routes
app.get('/api/jobs', (req, res) => {
  const jobs = loadData('jobs.json');
  const { category, state, search } = req.query;
  
  let filteredJobs = jobs;
  
  if (category) {
    filteredJobs = filteredJobs.filter(job => job.category.toLowerCase() === category.toLowerCase());
  }
  
  if (state) {
    filteredJobs = filteredJobs.filter(job => job.state.toLowerCase() === state.toLowerCase());
  }
  
  if (search) {
    filteredJobs = filteredJobs.filter(job => 
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.department.toLowerCase().includes(search.toLowerCase())
    );
  }
  
  res.json(filteredJobs);
});

app.get('/api/results', (req, res) => {
  const results = loadData('results.json');
  const { search } = req.query;
  
  let filteredResults = results;
  
  if (search) {
    filteredResults = filteredResults.filter(result => 
      result.examName.toLowerCase().includes(search.toLowerCase()) ||
      result.department.toLowerCase().includes(search.toLowerCase())
    );
  }
  
  res.json(filteredResults);
});

app.get('/api/admit-cards', (req, res) => {
  const admitCards = loadData('admit-cards.json');
  res.json(admitCards);
});

app.get('/api/answer-keys', (req, res) => {
  const answerKeys = loadData('answer-keys.json');
  res.json(answerKeys);
});

app.get('/api/latest-updates', (req, res) => {
  const updates = loadData('latest-updates.json');
  res.json(updates.slice(0, 10)); // Return latest 10 updates
});

// Serve main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 404 handler
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Sarkari Results server running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});