const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');  // Adding UUID for unique _id generation
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

let users = [];
let exercises = [];

// Create a New User
app.post('/api/users', (req, res) => {
  const { username } = req.body;
  const newUser = { username, _id: uuidv4() };  // Use UUID to generate unique ID
  users.push(newUser);
  res.json(newUser);
});

// Get all users
app.get('/api/users', (req, res) => {
  res.json(users.map(user => ({
    username: user.username,
    _id: user._id
  })));
});

// Add exercises
app.post('/api/users/:_id/exercises', (req, res) => {
  const userId = req.params._id;
  const { description, duration, date } = req.body;

  const exerciseDate = date ? new Date(date) : new Date();
  const user = users.find(u => u._id === userId);
  if (!user) {
    return res.status(404).send('User not found');
  }

  const newExercise = {
    _id: userId,
    username: user.username,
    description,
    duration: +duration, // Convert to number if not already
    date: exerciseDate.toDateString(), // Format date to dateString
  };
  exercises.push(newExercise);

  res.json(newExercise);
});

// Get user's exercise log
app.get('/api/users/:_id/logs', (req, res) => {
  const userId = req.params._id;
  const { from, to, limit } = req.query;

  let filteredExercises = exercises.filter(ex => ex._id === userId);

  if (from) {
    const fromDate = new Date(from);
    filteredExercises = filteredExercises.filter(ex => new Date(ex.date) >= fromDate);
  }
  if (to) {
    const toDate = new Date(to);
    filteredExercises = filteredExercises.filter(ex => new Date(ex.date) <= toDate);
  }
  if (limit) {
    filteredExercises = filteredExercises.slice(0, parseInt(limit));
  }

  const user = users.find(u => u._id === userId);
  if (!user) {
    return res.status(404).send('User not found');
  }

  const log = {
    username: user.username,
    count: filteredExercises.length,
    _id: userId,
    log: filteredExercises.map(ex => ({
      description: ex.description,
      duration: ex.duration,
      date: ex.date
    })),
  };

  res.json(log);
});

// Start the server
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
