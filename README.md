# Video Streaming Server

A lightweight Node.js server that streams video files over a local network with pause/resume functionality.

## Features

- Stream video files to other devices on the same network
- Supports RTMP, HTTP-FLV, and HLS streaming protocols
- Web-based control panel for managing playback
- Pause and resume streaming from the exact timestamp
- Hardware acceleration support for improved performance
- Video scaling for better performance on low-bandwidth networks

## Requirements

- [Node.js](https://nodejs.org/) (v14 or higher)
- [FFmpeg](https://ffmpeg.org/download.html) installed and available in your system path
- Video file to stream (such as .mp4, .mkv, etc.)

## Installation

1. Clone or download this repository
2. Install dependencies:

```bash
npm install
```

3. Place your video file in the project directory or update the `videoPath` variable in `server.js` to point to your video file.

## Usage

1. Start the server:

```bash
node server.js
```

2. Open the control panel in your browser:

   - Local: http://localhost:3000
   - From another device: http://YOUR_IP_ADDRESS:3000

3. Use one of the provided streaming URLs to play the video:
   - RTMP: rtmp://YOUR_IP_ADDRESS:1935/s
   - HTTP-FLV: http://YOUR_IP_ADDRESS:8000/s.flv
   - HLS: http://YOUR_IP_ADDRESS:8000/s/index.m3u8

## Viewing the Stream

You can play the stream using:

- [VLC Media Player](https://www.videolan.org/vlc/)
- Any media player that supports RTMP, HTTP-FLV, or HLS
- Web browsers (for HLS and HTTP-FLV streams)

### Playing in VLC:

1. Open VLC
2. Go to Media > Open Network Stream
3. Enter the streaming URL
4. Click Play

## Control Panel

The control panel allows you to:

- Pause and resume the stream
- See the current playback position
- View all available streaming URLs

## Performance Tips

If your stream is lagging:

1. Lower the resolution by changing `scale=-2:720` to `scale=-2:480` or lower in `server.js`
2. Reduce the bitrate (`-b:v` parameter) in `server.js`
3. Make sure your network has sufficient bandwidth

## Troubleshooting

- **FFmpeg Error**: Make sure FFmpeg is properly installed and available in your system path
- **Stream Not Available**: Check if the server is running and if you're using the correct IP address
- **Lagging Stream**: Try reducing the resolution or bitrate as mentioned in Performance Tips

## License

This project is open-source. Use, modify, and distribute as you wish.
