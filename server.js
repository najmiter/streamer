const NodeMediaServer = require('node-media-server');
const { spawn } = require('child_process');
const os = require('os');
const path = require('path');
const express = require('express');
const http = require('http');

const config = {
  rtmp: {
    port: 1935,
    chunk_size: 65536, // chunk size
    gop_cache: true,
    ping: 30,
    ping_timeout: 60,
  },
  http: {
    port: 8000,
    allow_origin: '*',
    mediaroot: './media',
  },
  trans: {
    ffmpeg: process.platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg',
    tasks: [
      {
        app: 'live',
        hls: true,
        hlsFlags: '[hls_time=1:hls_list_size=5:hls_flags=delete_segments+independent_segments]',
        dash: false,
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

const videoPath = path.join(
  '/Users/partialnerd/Downloads/ipman',
  'Ip.Man.4.The.Finale.2019.DUAL-AUDIO.CHI-ENG.1080p.10bit.BluRay.8CH.x265.HEVC-PSA.mkv'
);

let isStreamPaused = false;
let ffmpegProcess = null;
let currentTimestamp = 0;
let timestampInterval = null;

function getHardwareAcceleration() {
  if (process.platform === 'darwin') {
    return {
      hwaccel: 'videotoolbox',
      encoder: 'h264_videotoolbox',
      vaapi: false,
    };
  } else if (process.platform === 'win32') {
    return {
      hwaccel: 'dxva2',
      encoder: 'h264_nvenc',
      vaapi: false,
    };
  } else {
    return {
      hwaccel: 'vaapi',
      encoder: 'h264_vaapi',
      vaapi: true,
    };
  }
}

function startStream(seekPosition = 0) {
  if (timestampInterval) {
    clearInterval(timestampInterval);
  }

  currentTimestamp = seekPosition;

  timestampInterval = setInterval(() => {
    if (!isStreamPaused) {
      currentTimestamp++;
    }
  }, 1000);

  const hwConfig = getHardwareAcceleration();
  const ffmpegParams = ['-re'];

  if (hwConfig.vaapi) {
    ffmpegParams.push('-hwaccel', hwConfig.hwaccel, '-hwaccel_device', '/dev/dri/renderD128');
  } else {
    ffmpegParams.push('-hwaccel', hwConfig.hwaccel);
  }

  if (seekPosition > 0) {
    ffmpegParams.push('-ss', seekPosition.toString());
  }

  ffmpegParams.push(
    '-i',
    videoPath,
    '-vf',
    'format=yuv420p',
    '-c:v',
    hwConfig.encoder,

    '-preset',
    'fast',
    '-tune',
    'zerolatency',
    '-profile:v',
    'high',
    '-level',
    '4.1',

    '-b:v',
    '8000k',
    '-maxrate',
    '10000k',
    '-bufsize',
    '16000k',

    '-g',
    '60',
    '-keyint_min',
    '60',
    '-sc_threshold',
    '0',

    '-r',
    '30',

    '-c:a',
    'aac',
    '-b:a',
    '192k',
    '-ar',
    '48000',
    '-ac',
    '2',

    '-threads',
    Math.max(4, os.cpus().length - 1).toString(),

    '-f',
    'flv',
    `rtmp://localhost:${config.rtmp.port}/live/stream`
  );

  console.log('Starting FFmpeg with command:', 'ffmpeg', ffmpegParams.join(' '));

  ffmpegProcess = spawn('ffmpeg', ffmpegParams);

  ffmpegProcess.stderr.on('data', (data) => {
    const output = data.toString();
    if (
      output.includes('error') ||
      output.includes('warning') ||
      output.includes('Input #') ||
      output.includes('Output #')
    ) {
      console.log(`FFmpeg: ${output.trim()}`);
    }
  });

  ffmpegProcess.on('error', (err) => {
    console.error('Failed to start FFmpeg:', err);
    console.error('Make sure FFmpeg is installed with hardware acceleration support');

    // Fallback to software encoding if hardware fails
    if (hwConfig.encoder !== 'libx264') {
      console.log('Attempting fallback to software encoding...');
      hwConfig.encoder = 'libx264';
      hwConfig.hwaccel = 'none';
      startStream(seekPosition);
    }
  });

  ffmpegProcess.on('exit', (code) => {
    console.log(`FFmpeg process exited with code ${code}`);

    if (!isStreamPaused && code !== 0 && code !== null) {
      console.log('Unexpected exit, restarting stream in 2 seconds...');
      setTimeout(() => startStream(currentTimestamp), 2000);
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
  console.log(`\n--- High-Performance Full HD Streaming Server Started ---`);
  console.log(`Media Server running on http://${localIp}:${config.http.port}`);
  console.log(`Control panel available at http://${localIp}:${controlPort}`);
  console.log(`\nOptimized Stream URLs for Full HD (1080p):`);
  console.log(`RTMP: rtmp://${localIp}:${config.rtmp.port}/live/stream`);
  console.log(`HTTP-FLV: http://${localIp}:${config.http.port}/live/stream.flv`);
  console.log(`HLS: http://${localIp}:${config.http.port}/live/stream/index.m3u8`);
  console.log(`\nPerformance Optimizations Enabled:`);
  console.log(`- Hardware acceleration (${getHardwareAcceleration().encoder})`);
  console.log(`- Full HD bitrate: 8Mbps (suitable for localhost)`);
  console.log(`- Low latency HLS segments (1 second)`);
  console.log(`- Multi-threaded encoding (${Math.max(4, os.cpus().length - 1)} threads)`);
  console.log(`\nRecommended players: VLC, ffplay, or any HLS-compatible player`);
  console.log(`For best performance, use the HLS stream in VLC or similar players`);
});
