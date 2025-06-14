const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

app.post('/api/download', (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'No URL provided' });

  // Set headers for download
  res.setHeader('Content-Disposition', 'attachment; filename="video.mp4"');
  res.setHeader('Content-Type', 'video/mp4');

  // Spawn yt-dlp process
  const ytdlp = spawn('yt-dlp', [
    '-N', '8', // Increase fragments/connections
    '-o', '-',
    '-f', 'best[ext=mp4]/best',
    url
  ]);

  ytdlp.stdout.pipe(res);

  ytdlp.stderr.on('data', (data) => {
    console.error(`yt-dlp error: ${data}`);
  });

  ytdlp.on('error', (err) => {
    console.error('Failed to start yt-dlp:', err);
    res.status(500).json({ error: 'yt-dlp failed to start' });
  });

  ytdlp.on('close', (code) => {
    if (code !== 0) {
      console.error(`yt-dlp exited with code ${code}`);
    }
    res.end();
  });
});

app.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}`);
});