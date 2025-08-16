# Full HD Video Streaming Server

A high-performance Node.js streaming server optimized for Full HD video streaming on localhost networks. Features a modern web-based control panel with real-time status monitoring and seamless pause/resume functionality.

## ✨ Features

### 🚀 **High-Performance Streaming**

- **Full HD (1080p) streaming** with hardware acceleration support
- **Multiple protocols**: RTMP, HTTP-FLV, and HLS streaming
- **Optimized encoding** with configurable bitrates and presets
- **Zero-latency localhost streaming** for smooth playback
- **Hardware acceleration** detection and automatic optimization

### 🎛️ **Modern Control Panel**

- **Real-time status monitoring** with visual indicators
- **Precise timestamp tracking** down to the second
- **One-click pause/resume** with exact position restoration
- **Click-to-copy URLs** for easy sharing
- **Responsive design** that works on all devices
- **Dark theme** with professional shadcn-style UI

### ⚡ **Performance Optimizations**

- **Adaptive quality scaling** based on network conditions
- **Efficient buffer management** for smooth playback
- **CPU usage optimization** with smart encoding settings
- **Memory-efficient streaming** for extended sessions

## 🛠️ Requirements

- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- [FFmpeg](https://ffmpeg.org/download.html) with hardware acceleration support
- Video file in common format (.mp4, .mkv, .avi, etc.)
- Local network (optimized for localhost/LAN streaming)

## 📦 Installation

1. **Clone the repository**:

```bash
git clone <repository-url>
cd streamer
```

2. **Install dependencies**:

```bash
npm install
```

3. **Configure your video**:
   - Place your video file in the project directory, or
   - Update the `videoPath` in `server.js` to point to your file

## 🚀 Usage

### **Starting the Server**

```bash
npm start
# or
node server.js
```

### **Access the Control Panel**

- **Local**: http://localhost:3000
- **Network**: http://YOUR_IP_ADDRESS:3000

### **Stream URLs** (automatically displayed in control panel)

- **HLS (Recommended)**: `http://YOUR_IP:8000/live/stream/index.m3u8`
- **HTTP-FLV**: `http://YOUR_IP:8000/live/stream.flv`
- **RTMP**: `rtmp://YOUR_IP:1935/live/stream`

## 📺 Playing the Stream

### **Recommended Players**

- **[VLC Media Player](https://www.videolan.org/vlc/)** - Best overall compatibility
- **[MPV Player](https://mpv.io/)** - Lightweight with excellent performance
- **Web Browsers** - For HLS streams (Chrome, Firefox, Safari)
- **[OBS Studio](https://obsproject.com/)** - For streaming/recording
- **Mobile Apps** - VLC Mobile, Infuse, etc.

### **VLC Setup**

1. Open VLC Media Player
2. Go to **Media > Open Network Stream** (Ctrl+N)
3. Enter any of the stream URLs from the control panel
4. Click **Play**

### **Web Browser Playback**

- HLS streams work directly in most modern browsers
- Use the HLS URL in video players or HTML5 video elements

## 🎮 Control Panel Features

### **Real-Time Monitoring**

- **Live status indicator** with color-coded states
- **Precision timestamp** showing exact playback position
- **Automatic status refresh** every 2 seconds

### **Interactive Controls**

- **Pause/Resume** buttons with instant response
- **Refresh Status** for manual updates
- **Click-to-copy URLs** for easy sharing

### **Modern UI**

- **Professional dark theme** inspired by modern design systems
- **Responsive layout** that adapts to any screen size
- **Smooth animations** and hover effects
- **Clean typography** for excellent readability

## ⚙️ Configuration & Optimization

### **Video Quality Settings** (in `server.js`)

```javascript
// Full HD optimization
scale: '-2:1080'; // 1080p resolution
videoBitrate: '8000k'; // High quality bitrate
preset: 'fast'; // Encoding speed
crf: '18'; // Quality factor (lower = better)
```

### **Performance Tuning**

- **Hardware Acceleration**: Automatically detected and enabled
- **Buffer Size**: Optimized for smooth localhost streaming
- **Segment Duration**: Balanced for quality and latency
- **Thread Count**: Matches your CPU cores

### **Network Optimization**

- **Localhost streaming**: Zero network latency
- **LAN streaming**: Optimized for gigabit networks
- **Adaptive quality**: Automatically adjusts based on performance

## 🔧 Troubleshooting

### **Common Issues**

**❌ FFmpeg not found**

```bash
# Install FFmpeg
# macOS: brew install ffmpeg
# Ubuntu: sudo apt install ffmpeg
# Windows: Download from https://ffmpeg.org/
```

**❌ Stream won't load**

- Check if server is running on port 3000
- Verify your IP address in the URLs
- Ensure video file path is correct
- Check firewall settings

**❌ Poor streaming quality**

- Reduce bitrate in `advanced-config.json`
- Lower resolution from 1080p to 720p
- Check CPU usage during streaming
- Ensure sufficient RAM (4GB+ recommended)

**❌ Control panel not responsive**

- Clear browser cache and cookies
- Try a different browser
- Check browser console for errors
- Ensure JavaScript is enabled

### **Performance Optimization**

1. **Use hardware acceleration** (automatically enabled if available)
2. **Close unnecessary applications** to free up CPU/RAM
3. **Use wired ethernet** instead of WiFi for best performance
4. **Keep video files on fast storage** (SSD recommended)

## 📊 System Requirements

### **Minimum**

- **CPU**: Dual-core 2.0GHz
- **RAM**: 4GB
- **Storage**: 100MB free space
- **Network**: 100Mbps ethernet

### **Recommended for Full HD**

- **CPU**: Quad-core 3.0GHz or better
- **RAM**: 8GB or more
- **Storage**: SSD with 500MB+ free space
- **Network**: Gigabit ethernet
- **GPU**: Hardware acceleration support

## 📄 License

This project is open-source and available under the MIT License. Feel free to use, modify, and distribute as needed.
