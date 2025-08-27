const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync'); // <-- New for parsing csv

const app = express();
const PORT = 5000;
const db = require('./db');

app.use(cors());
app.use(bodyParser.json());

// Load CSV data into memory once when server starts
let videoData = [];

const loadCSV = () => {
  try {
    const valenceFile = fs.readFileSync(path.join(__dirname, 'metadata/InducedEmotion_valence.csv'));
    const arousalFile = fs.readFileSync(path.join(__dirname, 'metadata/InducedEmotion_arousal.csv'));

    const valenceRecords = parse(valenceFile, { columns: true, skip_empty_lines: true });
    const arousalRecords = parse(arousalFile, { columns: true, skip_empty_lines: true });

    const dataMap = new Map();

    // Process valence
    valenceRecords.forEach(row => {
      const movie = row.movie_clip;
      const scores = Object.values(row).slice(1).map(Number);
      const avg = Math.ceil(scores.reduce((a, b) => a + b, 0) / scores.length);
      dataMap.set(movie, { valence: avg });
    });

    // Process arousal and merge
    arousalRecords.forEach(row => {
      const movie = row.movie_clip;
      const scores = Object.values(row).slice(1).map(Number);
      const avg = Math.ceil(scores.reduce((a, b) => a + b, 0) / scores.length);
      if (dataMap.has(movie)) {
        dataMap.get(movie).arousal = avg;
      }
    });

    // Convert Map to array
    videoData = Array.from(dataMap.entries()).map(([movie_clip, values]) => ({
      movie_clip,
      valence: values.valence,
      arousal: values.arousal
    }));
    
    // make sure valence and arousal are integers
    videoData.forEach(video => {
      video.valence = parseInt(video.valence, 10);
      video.arousal = parseInt(video.arousal, 10);
    });

    console.log('CSV Loaded:', videoData.length, 'videos with valence and arousal scores');
  } catch (error) {
    console.error('Error loading CSVs:', error);
  }
};


// Function to find matching videos
const findMatchingVideos = (valence, arousal) => {
  return videoData
    .filter(video =>
      video.valence === parseInt(valence) &&
      video.arousal === parseInt(arousal)
    )
    .map(video => video.movie_clip);
};


// Function to randomly pick one video
const pickRandomVideo = (videos) => {
  if (videos.length === 0) return null;
  // uncomment this section (next two lines) and comment the next one to pick a random video from all videos
  // const randomIndex = Math.floor(Math.random() * videos.length);
  // return videos[randomIndex];

  // due to space constraints, we're only picking videos from The Theory of Everything
  // and the videos are named in a specific way, so we can filter them out
  // make sure the video starts with "TheTheoryOfEverything_"
  const filteredVideos = videos.filter(video => video.startsWith('TheTheoryOfEverything_'));
  if (filteredVideos.length > 0) {
    const randomIndex = Math.floor(Math.random() * filteredVideos.length);
    return filteredVideos[randomIndex];
  } else {
    return videos[Math.floor(Math.random() * videos.length)];
  }

};

// API endpoint
app.post('/api/video', (req, res) => {
  const { valence, arousal, timestamp, submittype, userID } = req.body;

  console.log('Received data:', { valence, arousal, timestamp, submittype, userID });

  // Save to SQLite Database
  const stmt = db.prepare(`
    INSERT INTO EmotionInputs (userID, valence, arousal, timestamp, submittype)
    VALUES (?, ?, ?, ?, ?)
  `);
  stmt.run(userID, valence, arousal, timestamp, submittype);
  
  // prevent database growth beyond a certain size
  const rowCount = db.prepare('SELECT COUNT(*) as count FROM EmotionInputs').get().count;
  if (rowCount > 10000) { // Adjust this number as needed
    // db.prepare('DELETE FROM EmotionInputs WHERE id IN (SELECT id FROM EmotionInputs ORDER BY id ASC LIMIT 1000)').run(); // Delete oldest entries
    console.log('Database size exceeded limit, consider deleting old entries or increasing the limit.');
  }

  // check if directory exists, if not create it
  const logsDir = path.join(__dirname, 'logs');
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
  }

  // Also save to a log file (optional)
  const logEntry = `${timestamp}, ${userID}, ${valence}, ${arousal}, ${submittype}\n`;
  fs.appendFileSync(path.join(__dirname, 'logs', 'emotion_inputs.log'), logEntry, 'utf8');

  const matchingVideos = findMatchingVideos(valence, arousal);
  const selectedVideo = pickRandomVideo(matchingVideos);
  console.log('Selected video:', selectedVideo);

  if (!selectedVideo) {
    return res.status(404).json({ error: 'No matching video found' });
  }


  const videoPath = path.join(__dirname, 'videos', `${selectedVideo}.mp4`); // Assuming videos are in /videos folder
  if (fs.existsSync(videoPath)) {
    res.setHeader('Content-Type', 'video/mp4');
    const videoStream = fs.createReadStream(videoPath);
    videoStream.pipe(res);
  } else {
    // res.status(404).json({ error: 'Video file not found on server' });
    res.setHeader('Content-Type', 'video/mp4');
    const videoStream = fs.createReadStream(path.join(__dirname, 'videos', 'sample.mp4')); // Fallback to a default video (for now)
    videoStream.pipe(res);
  }
});

// API endpoint to save user data
app.post('/user-data', (req, res) => {
  const { name, email, gender, age, watchesEnglishMovies } = req.body;

  if (!name || !email || !gender || !age || !watchesEnglishMovies) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const stmt = db.prepare(`
      INSERT INTO UserData (name, email, gender, age, watchesEnglishMovies, timestamp)
      VALUES (?, ?, ?, ?, ?, datetime('now'))
    `);

    stmt.run(name, email, gender, age, watchesEnglishMovies);

    // Prepare log line
    const logLine = `${new Date().toISOString()} | Name: ${name}, Email: ${email}, Gender: ${gender}, Age: ${age}, WatchesEnglishMovies: ${watchesEnglishMovies}\n`;

    // Ensure logs directory exists
    const logDir = path.join(__dirname, 'logs');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir);
    }

    // Append log line
    fs.appendFileSync(path.join(logDir, 'user_data.log'), logLine, 'utf8');

    res.status(200).json({ message: 'User data saved successfully' });
  } catch (err) {
    console.error('DB/logging error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});




// Start the server and load the CSV
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  loadCSV();
});
