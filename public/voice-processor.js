// public/voice-processor.js

class VoiceProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    // Buffer size matches backend requirement (usually 4096 or 8192 for 16kHz)
    this.bufferSize = 4096;
    this.buffer = new Float32Array(this.bufferSize);
    this.byteCount = 0;
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    // Check if input exists and has data
    if (!input || input.length === 0) return true;

    // Take the first channel (Mono)
    const channelData = input[0];
    if (!channelData) return true;

    for (let i = 0; i < channelData.length; i++) {
      this.buffer[this.byteCount] = channelData[i];
      this.byteCount++;

      // When buffer is full, flush to main thread
      if (this.byteCount >= this.bufferSize) {
        this.flush();
      }
    }

    return true; // Keep processor alive
  }

  flush() {
    if (this.byteCount === 0) return;

    // Send a copy of the buffer
    const tempBuffer = this.buffer.slice(0, this.byteCount);

    // Calculate RMS (Volume) directly in Audio Thread
    let sum = 0;
    for (let i = 0; i < this.byteCount; i++) {
      sum += tempBuffer[i] * tempBuffer[i];
    }
    const rms = Math.sqrt(sum / this.byteCount);

    // Send data to React (Main Thread)
    this.port.postMessage({
      type: "audio_data",
      buffer: tempBuffer,
      rms: rms,
    });

    this.byteCount = 0; // Reset buffer
  }
}

registerProcessor("voice-processor", VoiceProcessor);
