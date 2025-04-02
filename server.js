const NodeMediaServer = require('node-media-server');
const { spawn } = require('child_process');
const os = require('os');
const path = require('path');
const express = require('express');
const http = require('http');

const config = {
  rtmp: {
    port: 1935,
    chunk_size: 60000,
    gop_cache: true,
    ping: 30,
    ping_timeout: 60,
  },
  http: {
    port: 8000,
    allow_origin: '*',
  },
  trans: {
    ffmpeg: process.platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg',
    tasks: [
      {
        app: 'live',
        hls: true,
        hlsFlags: '[hls_time=2:hls_list_size=3:hls_flags=delete_segments]',
      },
    ],
  },
};

const app = express();
const httpServer = http.createServer(app);
const controlPort = 3000;

const nms = new NodeMediaServer(config);
nms.run();

function getLocalIpAddress() {
  const nets = os.networkInterfaces();

  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return 'localhost';
}

const videoPath = path.join(__dirname, 'movie.mkv');

let isStreamPaused = false;
let ffmpegProcess = null;
let currentTimestamp = 0;
let timestampInterval = null;

function startStream(seekPosition = 400) {
  if (timestampInterval) {
    clearInterval(timestampInterval);
  }

  currentTimestamp = seekPosition;

  timestampInterval = setInterval(() => {
    if (!isStreamPaused) {
      currentTimestamp++;
    }
  }, 1000);

  const ffmpegParams = ['-re', '-hwaccel', 'auto'];

  if (seekPosition > 0) {
    ffmpegParams.push('-ss', seekPosition.toString());
  }

  ffmpegParams.push(
    '-i',
    videoPath,
    '-vf',
    'scale=-2:720',
    '-c:v',
    'libx264',
    '-preset',
    'ultrafast',
    '-tune',
    'zerolatency',
    '-b:v',
    '2500k',
    '-maxrate',
    '2500k',
    '-bufsize',
    '5000k',
    '-x264-params',
    'keyint=60:min-keyint=60:scenecut=0',
    // '-r',
    // '24',
    '-c:a',
    'aac',
    '-b:a',
    '128k',
    '-ar',
    '44100',
    '-ac',
    '2',
    '-threads',
    '4',
    '-f',
    'flv',
    `rtmp://localhost:${config.rtmp.port}/s`
  );

  ffmpegProcess = spawn('ffmpeg', ffmpegParams);

  ffmpegProcess.stderr.on('data', (data) => {
    console.log(`FFmpeg: ${data}`);
  });

  ffmpegProcess.on('error', (err) => {
    console.error('Failed to start FFmpeg:', err);
    console.error('Make sure FFmpeg is installed on your system');
  });

  ffmpegProcess.on('exit', (code) => {
    console.log(`FFmpeg process exited with code ${code}`);

    if (!isStreamPaused && code !== 0 && code !== null) {
      console.log('Unexpected exit, restarting stream...');
      startStream(currentTimestamp);
    }
  });
}

startStream();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/status', (req, res) => {
  res.json({ paused: isStreamPaused });
});

app.post('/api/pause', (req, res) => {
  if (!isStreamPaused && ffmpegProcess) {
    isStreamPaused = true;

    console.log(`Stream paused at timestamp: ${currentTimestamp} seconds`);
    ffmpegProcess.kill('SIGTERM');
    res.json({ success: true, paused: true, timestamp: currentTimestamp });
  } else {
    res.json({
      success: false,
      paused: isStreamPaused,
      timestamp: currentTimestamp,
    });
  }
});

app.post('/api/resume', (req, res) => {
  if (isStreamPaused) {
    isStreamPaused = false;
    console.log(`Resuming stream from timestamp: ${currentTimestamp} seconds`);
    startStream(currentTimestamp);
    res.json({ success: true, paused: false, timestamp: currentTimestamp });
  } else {
    res.json({
      success: false,
      paused: isStreamPaused,
      timestamp: currentTimestamp,
    });
  }
});

app.get('/api/timestamp', (req, res) => {
  res.json({ timestamp: currentTimestamp, paused: isStreamPaused });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

httpServer.listen(controlPort, () => {
  const localIp = getLocalIpAddress();
  console.log(`\n--- Streaming Server Started ---`);
  console.log(`Media Server running on http://${localIp}:${config.http.port}`);
  console.log(`Control panel available at http://${localIp}:${controlPort}`);
  console.log(`\nStream URLs (accessible from any device on your network):`);
  console.log(`RTMP: rtmp://${localIp}:${config.rtmp.port}/s`);
  console.log(`HTTP-FLV: http://${localIp}:${config.http.port}/s.flv`);
  console.log(`HLS: http://${localIp}:${config.http.port}/s/index.m3u8`);
  console.log(`\nYou can play these URLs in VLC Media Player or similar apps`);
  console.log(`You can pause/resume the stream from the control panel`);
});
