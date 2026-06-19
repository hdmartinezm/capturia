/**
 * Virtual Camera Module
 *
 * Handles communication between Electron app and the native virtual camera driver.
 *
 * Architecture:
 * - macOS: Uses shared memory + Mach ports to communicate with CMIOExtension
 * - Windows: Uses named pipes to communicate with DirectShow filter
 * - Linux: Writes to V4L2 loopback device
 */

const { execFileSync } = require('child_process');
const path = require('path');
const os = require('os');
const fs = require('fs');

class VirtualCamera {
  constructor(options = {}) {
    this.width = options.width || 1920;
    this.height = options.height || 1080;
    this.fps = options.fps || 30;
    this.running = false;
    this.platform = os.platform();

    // Frame buffer (BGRA format - 4 bytes per pixel)
    this.frameSize = this.width * this.height * 4;
    this.frameBuffer = Buffer.alloc(this.frameSize);

    // IPC mechanism depends on platform
    this.ipcPath = this.getIPCPath();
  }

  getIPCPath() {
    switch (this.platform) {
      case 'darwin':
        // macOS: Use a file in /tmp that the CMIOExtension will read
        return '/tmp/capturia-camera-frame';
      case 'win32':
        // Windows: Named pipe
        return '\\\\.\\pipe\\capturia-camera';
      case 'linux':
        // Linux: V4L2 loopback device
        return '/dev/video10'; // Assumes v4l2loopback is set up
      default:
        throw new Error(`Unsupported platform: ${this.platform}`);
    }
  }

  async start() {
    console.log(`[VirtualCamera] Starting on ${this.platform}...`);
    console.log(`[VirtualCamera] Resolution: ${this.width}x${this.height} @ ${this.fps}fps`);
    console.log(`[VirtualCamera] IPC Path: ${this.ipcPath}`);

    // Create metadata file for the camera extension
    const metadata = {
      width: this.width,
      height: this.height,
      fps: this.fps,
      format: 'BGRA',
      bytesPerPixel: 4,
      frameSize: this.frameSize,
      timestamp: Date.now()
    };

    fs.writeFileSync(
      `${this.ipcPath}.meta`,
      JSON.stringify(metadata),
      'utf8'
    );

    // Initialize frame file with black frame
    this.fillBlack();
    this.writeFrameToFile();

    this.running = true;
    console.log('[VirtualCamera] Started successfully');

    return true;
  }

  async stop() {
    console.log('[VirtualCamera] Stopping...');
    this.running = false;

    // Clean up IPC files
    try {
      fs.unlinkSync(this.ipcPath);
      fs.unlinkSync(`${this.ipcPath}.meta`);
    } catch (e) {
      // Ignore cleanup errors
    }

    console.log('[VirtualCamera] Stopped');
  }

  /**
   * Send a frame to the virtual camera
   * @param {Object} frameData - Frame data from canvas
   * @param {Uint8ClampedArray} frameData.data - RGBA pixel data
   * @param {number} frameData.width - Frame width
   * @param {number} frameData.height - Frame height
   */
  async sendFrame(frameData) {
    if (!this.running) {
      throw new Error('Virtual camera not running');
    }

    const { data, width, height } = frameData;

    // Convert RGBA to BGRA (swap R and B channels)
    if (width === this.width && height === this.height) {
      // Direct copy with channel swap
      for (let i = 0; i < data.length; i += 4) {
        this.frameBuffer[i] = data[i + 2];     // B <- R
        this.frameBuffer[i + 1] = data[i + 1]; // G <- G
        this.frameBuffer[i + 2] = data[i];     // R <- B
        this.frameBuffer[i + 3] = data[i + 3]; // A <- A
      }
    } else {
      console.warn(`[VirtualCamera] Frame size mismatch: ${width}x${height} vs ${this.width}x${this.height}`);
      this.fillBlack();
    }

    // Write frame to IPC
    this.writeFrameToFile();
  }

  writeFrameToFile() {
    // Write frame buffer to file atomically
    const tempPath = `${this.ipcPath}.tmp`;
    fs.writeFileSync(tempPath, this.frameBuffer);
    fs.renameSync(tempPath, this.ipcPath);
  }

  fillBlack() {
    // Fill with black (BGRA: 0,0,0,255)
    for (let i = 0; i < this.frameSize; i += 4) {
      this.frameBuffer[i] = 0;     // B
      this.frameBuffer[i + 1] = 0; // G
      this.frameBuffer[i + 2] = 0; // R
      this.frameBuffer[i + 3] = 255; // A
    }
  }

  /**
   * Generate a test pattern for debugging
   */
  generateTestPattern() {
    const now = Date.now();

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const i = (y * this.width + x) * 4;

        // Animated gradient with moving bar
        const barPosition = ((now / 10) % this.width);
        const isBar = Math.abs(x - barPosition) < 20;

        if (isBar) {
          // White bar
          this.frameBuffer[i] = 255;     // B
          this.frameBuffer[i + 1] = 255; // G
          this.frameBuffer[i + 2] = 255; // R
        } else {
          // Color gradient
          this.frameBuffer[i] = Math.floor((x / this.width) * 255);     // B
          this.frameBuffer[i + 1] = Math.floor((y / this.height) * 255); // G
          this.frameBuffer[i + 2] = 128; // R
        }
        this.frameBuffer[i + 3] = 255; // A
      }
    }

    this.writeFrameToFile();
  }
}

// Check if virtual camera driver is installed
function isDriverInstalled() {
  const platform = os.platform();

  switch (platform) {
    case 'darwin':
      // Check if CMIOExtension is installed
      try {
        // Using execFileSync with no user input - safe
        const extensions = execFileSync('systemextensionsctl', ['list'], { encoding: 'utf8' });
        return extensions.includes('com.capturia.camera');
      } catch {
        return false;
      }

    case 'win32':
      // TODO: Check registry for DirectShow filter
      return false;

    case 'linux':
      // Check if v4l2loopback module is loaded
      try {
        const modules = execFileSync('lsmod', [], { encoding: 'utf8' });
        return modules.includes('v4l2loopback');
      } catch {
        return false;
      }

    default:
      return false;
  }
}

module.exports = { VirtualCamera, isDriverInstalled };
