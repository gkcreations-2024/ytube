const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const sanitize = require('sanitize-filename');

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // Needed for JSON POST and fetch
app.use(express.static('public'));

// Serve homepage
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 🎯 API to fetch video info (title, thumbnail, etc.)
app.get('/fetch-video-info', (req, res) => {
  const videoURL = req.query.url;
  if (!videoURL) return res.status(400).json({ error: 'Missing video URL' });

  const command = `yt-dlp --skip-download --print-json "${videoURL}"`;

  exec(command, (err, stdout, stderr) => {
    if (err) {
      console.error('❌ Error fetching video info:', stderr);
      return res.status(500).json({ error: 'Failed to fetch video info' });
    }

    try {
      const info = JSON.parse(stdout);
      return res.json({
        title: info.title,
        duration: info.duration_string || `${Math.floor(info.duration / 60)}:${info.duration % 60}`,
        thumbnail: info.thumbnail,
      });
    } catch (parseError) {
      console.error('❌ JSON Parse Error:', parseError);
      return res.status(500).json({ error: 'Invalid video data' });
    }
  });
});

// 🎯 Download Endpoint
app.post('/download', (req, res) => {
  const videoURL = req.body.videoURL;
  const format = req.body.format || 'mp4'; // 'mp4' or 'mp3'

  if (!videoURL) return res.status(400).send('Missing video URL');

  const fileExt = format === 'mp3' ? 'mp3' : 'mp4';
  const fileName = sanitize(`video_${Date.now()}.${fileExt}`);

  // Command for yt-dlp
  const command =
    format === 'mp3'
      ? `yt-dlp -x --audio-format mp3 -o "${fileName}" "${videoURL}"`
      : `yt-dlp -f best -o "${fileName}" "${videoURL}"`;

  exec(command, (err, stdout, stderr) => {
    if (err) {
      console.error("❌ Download error:", stderr);
      return res.status(500).send("Download failed. Please check the URL.");
    }

    const filePath = path.join(__dirname, fileName);

    res.download(filePath, fileName, (downloadErr) => {
      if (downloadErr) {
        console.error('❌ File download error:', downloadErr);
      }

      // Clean up
      fs.unlink(filePath, () => {});
    });
  });
});

app.listen(3000, () => {
  console.log('✅ Server running on http://localhost:3000');
});
