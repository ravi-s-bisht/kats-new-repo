import * as faceapi from 'face-api.js';

interface RGB {
  r: number;
  g: number;
  b: number;
}

interface SignalQuality {
  snr: number;
  stability: number;
  clarity: number;
}

export class HeartRateDetector {
  private readonly windowSize = 120; // 4 seconds at 30fps
  private readonly samplingRate = 30;
  private rgbHistory: RGB[] = [];
  private lastHeartRate: number | null = null;
  private lastHRV: number | null = null;
  private readonly minValidHeartRate = 45;
  private readonly maxValidHeartRate = 140;
  private lastSignalQuality: SignalQuality | null = null;
  private adaptiveThreshold: number = 0.1;
  private signalQualityHistory: number[] = [];

  // Configurable sensitivity parameters
  private sensitivity = {
    baseThreshold: 0.1,
    minPeakHeight: 0.05,
    adaptiveRate: 0.2,
    qualityThreshold: 0.15,
    noiseFloor: 0.02
  };

  private getRGBFromImageData(
    videoElement: HTMLVideoElement,
    detection: faceapi.WithFaceLandmarks<{ detection: faceapi.FaceDetection }>
  ): RGB {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Could not get canvas context');

    const box = detection.detection.box;

    // Focus on forehead region for stable measurements
    const region = {
      x: box.x + box.width * 0.2,
      y: box.y,
      width: box.width * 0.6,
      height: box.height * 0.15
    };

    canvas.width = region.width;
    canvas.height = region.height;

    context.drawImage(
      videoElement,
      region.x, region.y, region.width, region.height,
      0, 0, region.width, region.height
    );

    const imageData = context.getImageData(0, 0, region.width, region.height);
    const data = imageData.data;

    let totalR = 0;
    let totalG = 0;
    let totalB = 0;
    let totalWeight = 0;
    let pixelCount = 0;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      // Enhanced adaptive skin detection
      const sum = r + g + b;
      if (sum === 0) continue;

      const rRatio = r / sum;
      const gRatio = g / sum;
      const bRatio = b / sum;

      // Dynamic thresholds based on overall image brightness
      const brightness = sum / (3 * 255);
      const rThresholdRange = brightness > 0.5 ? [0.25, 0.55] : [0.2, 0.6];
      const gThresholdRange = brightness > 0.5 ? [0.2, 0.45] : [0.15, 0.5];
      const bThresholdRange = brightness > 0.5 ? [0.1, 0.4] : [0.05, 0.45];

      if (
        rRatio > rThresholdRange[0] && rRatio < rThresholdRange[1] &&
        gRatio > gThresholdRange[0] && gRatio < gThresholdRange[1] &&
        bRatio > bThresholdRange[0] && bRatio < bThresholdRange[1]
      ) {
        const weight = gRatio * brightness;
        totalR += r * weight;
        totalG += g * weight;
        totalB += b * weight;
        totalWeight += weight;
        pixelCount++;
      }
    }

    if (pixelCount === 0) {
      console.log('No valid skin pixels detected');
      return { r: 0, g: 0, b: 0 };
    }

    const rgb = {
      r: totalR / totalWeight,
      g: totalG / totalWeight,
      b: totalB / totalWeight
    };

    console.log('RGB values:', rgb);
    return rgb;
  }

  private assessSignalQuality(signal: number[]): SignalQuality {
    if (signal.length < 2) {
      return { snr: 0, stability: 0, clarity: 0 };
    }

    // Calculate Signal-to-Noise Ratio (SNR)
    const mean = signal.reduce((a, b) => a + b, 0) / signal.length;
    const variance = signal.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / signal.length;
    const noise = Math.sqrt(variance);
    const snr = noise === 0 ? 0 : Math.abs(mean) / noise;

    // Calculate signal stability
    let stabilityScore = 0;
    for (let i = 1; i < signal.length; i++) {
      const diff = Math.abs(signal[i] - signal[i - 1]);
      stabilityScore += diff;
    }
    const stability = Math.max(0, 1 - stabilityScore / signal.length);

    // Calculate signal clarity (frequency domain analysis)
    const clarity = this.calculateSignalClarity(signal);

    const quality = { snr, stability, clarity };
    console.log('Signal quality metrics:', quality);

    return quality;
  }

  private calculateSignalClarity(signal: number[]): number {
    // Simple frequency domain analysis using zero crossings
    let crossings = 0;
    for (let i = 1; i < signal.length; i++) {
      if (signal[i] * signal[i - 1] < 0) {
        crossings++;
      }
    }

    // Normalize crossings to 0-1 range
    const expectedCrossings = signal.length * (this.minValidHeartRate / 60) / this.samplingRate;
    const maxExpectedCrossings = signal.length * (this.maxValidHeartRate / 60) / this.samplingRate;

    if (crossings < expectedCrossings || crossings > maxExpectedCrossings) {
      return 0;
    }

    return Math.min(1, crossings / maxExpectedCrossings);
  }

  private adaptiveFilter(signal: number[]): number[] {
    if (signal.length < 2) return signal;

    const filtered = [];
    const lowCut = 0.7; // Hz (42 BPM)
    const highCut = 3.0; // Hz (180 BPM)

    // Adaptive filter parameters based on signal quality
    const quality = this.assessSignalQuality(signal);
    const adaptiveLowAlpha = Math.exp(-2 * Math.PI * (lowCut * (1 + quality.stability)) / this.samplingRate);
    const adaptiveHighAlpha = Math.exp(-2 * Math.PI * (highCut * (1 + quality.clarity)) / this.samplingRate);

    let lastLow = signal[0];
    let lastHigh = signal[0];

    for (let i = 0; i < signal.length; i++) {
      // Adaptive high-pass filter
      lastHigh = adaptiveHighAlpha * (lastHigh + signal[i] - signal[Math.max(0, i - 1)]);

      // Adaptive low-pass filter
      lastLow = signal[i] + adaptiveLowAlpha * (lastLow - signal[i]);

      filtered.push(lastHigh - lastLow);
    }

    return this.normalizeSignal(filtered);
  }

  private normalizeSignal(signal: number[]): number[] {
    if (signal.length === 0) return signal;

    // Adaptive window size based on signal length
    const windowSize = Math.min(5, Math.max(3, Math.floor(signal.length * 0.05)));
    const smoothed = [];

    // Moving average with adaptive window
    for (let i = 0; i < signal.length; i++) {
      let sum = 0;
      let count = 0;
      for (let j = Math.max(0, i - windowSize); j <= Math.min(signal.length - 1, i + windowSize); j++) {
        sum += signal[j];
        count++;
      }
      smoothed.push(sum / count);
    }

    const mean = smoothed.reduce((a, b) => a + b, 0) / smoothed.length;
    const stdDev = Math.sqrt(
      smoothed.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / smoothed.length
    );

    return smoothed.map(x => stdDev === 0 ? 0 : (x - mean) / stdDev);
  }

  private findPeaksAdaptive(signal: number[]): number[] {
    const peaks: number[] = [];
    const quality = this.assessSignalQuality(signal);
    console.log('Current signal quality:', quality);

    // Update adaptive threshold based on signal quality
    this.adaptiveThreshold = this.sensitivity.baseThreshold * 
      (1 + (1 - quality.snr) * this.sensitivity.adaptiveRate);

    // Adaptive window size based on signal quality
    const windowSize = Math.floor(this.samplingRate * 
      (0.15 + (1 - quality.stability) * 0.1));

    // Adaptive minimum peak height
    const minHeight = this.sensitivity.minPeakHeight * 
      (1 + (1 - quality.clarity) * 0.5);

    // Adaptive minimum peak distance based on maximum heart rate
    const minDistance = Math.floor(this.samplingRate * 0.4 * 
      (1 + quality.stability * 0.2));

    for (let i = windowSize; i < signal.length - windowSize; i++) {
      if (signal[i] < minHeight) continue;

      let isPeak = true;
      // Dynamic peak detection window
      for (let j = 1; j <= windowSize; j++) {
        if (signal[i] <= signal[i - j] || signal[i] <= signal[i + j]) {
          isPeak = false;
          break;
        }
      }

      if (isPeak && (peaks.length === 0 || i - peaks[peaks.length - 1] >= minDistance)) {
        // Additional validation using local noise level
        const localSegment = signal.slice(
          Math.max(0, i - windowSize),
          Math.min(signal.length, i + windowSize)
        );
        const localNoise = Math.sqrt(
          localSegment.reduce((a, b) => a + Math.pow(b - signal[i], 2), 0) / localSegment.length
        );

        if (signal[i] > localNoise * this.sensitivity.noiseFloor) {
          peaks.push(i);
        }
      }
    }

    console.log('Adaptive peak detection found peaks:', peaks.length);
    return peaks;
  }

  private calculateHeartRate(peaks: number[]): number {
    if (peaks.length < 2) {
      console.log('Not enough peaks for heart rate calculation');
      return this.lastHeartRate ?? 0;
    }

    const intervals = [];
    for (let i = 1; i < peaks.length; i++) {
      const interval = peaks[i] - peaks[i - 1];
      const bpm = (60 * this.samplingRate) / interval;
      if (bpm >= this.minValidHeartRate && bpm <= this.maxValidHeartRate) {
        intervals.push(interval);
      }
    }

    if (intervals.length === 0) {
      console.log('No valid intervals found');
      return this.lastHeartRate ?? 0;
    }

    const medianInterval = this.median(intervals);
    const heartRate = Math.round((60 * this.samplingRate) / medianInterval);
    console.log('Calculated heart rate:', heartRate);

    // Adaptive smoothing based on signal quality
    if (this.lastHeartRate === null) {
      this.lastHeartRate = heartRate;
    } else {
      const change = Math.abs(heartRate - this.lastHeartRate);
      if (change > 2) {
        const alpha = Math.max(0.2, Math.min(0.4, change / 30));
        this.lastHeartRate = Math.round(alpha * heartRate + (1 - alpha) * this.lastHeartRate);
      }
    }

    return this.lastHeartRate;
  }

  private calculateHRV(peaks: number[]): number {
    if (peaks.length < 2) {
      console.log('Not enough peaks for HRV calculation');
      return this.lastHRV ?? 0;
    }

    const intervals = [];
    for (let i = 1; i < peaks.length; i++) {
      const interval = (peaks[i] - peaks[i - 1]) * (1000 / this.samplingRate);
      // Dynamic interval validation based on signal quality
      const quality = this.lastSignalQuality?.stability ?? 0.5;
      const minInterval = 350 * (1 - quality * 0.2);
      const maxInterval = 1500 * (1 + quality * 0.2);

      if (interval >= minInterval && interval <= maxInterval) {
        intervals.push(interval);
      }
    }

    if (intervals.length < 2) {
      console.log('Not enough valid RR intervals for HRV');
      return this.lastHRV ?? 0;
    }

    const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const sdnn = Math.sqrt(
      intervals.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / intervals.length
    );

    if (this.lastHRV === null) {
      this.lastHRV = Math.round(sdnn);
    } else {
      const alpha = 0.3;
      this.lastHRV = Math.round(alpha * sdnn + (1 - alpha) * this.lastHRV);
    }

    console.log('Calculated HRV (SDNN):', this.lastHRV);
    return this.lastHRV;
  }

  private median(numbers: number[]): number {
    const sorted = [...numbers].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0
      ? (sorted[middle - 1] + sorted[middle]) / 2
      : sorted[middle];
  }

  public async update(
    videoElement: HTMLVideoElement,
    faceDetection: faceapi.WithFaceLandmarks<{ detection: faceapi.FaceDetection }>
  ): Promise<{ heartRate: number; hrv: number }> {
    try {
      const rgb = this.getRGBFromImageData(videoElement, faceDetection);
      if (rgb.g === 0) {
        console.log('No valid RGB data obtained');
        return { heartRate: this.lastHeartRate ?? 0, hrv: this.lastHRV ?? 0 };
      }

      this.rgbHistory.push(rgb);
      if (this.rgbHistory.length > this.windowSize) {
        this.rgbHistory.shift();
      }

      if (this.rgbHistory.length < Math.floor(this.windowSize * 0.3)) {
        console.log('Insufficient data points:', this.rgbHistory.length);
        return { heartRate: this.lastHeartRate ?? 0, hrv: this.lastHRV ?? 0 };
      }

      const greenSignal = this.rgbHistory.map(rgb => rgb.g);
      console.log('Green signal length:', greenSignal.length);

      // Assess signal quality and apply adaptive filtering
      this.lastSignalQuality = this.assessSignalQuality(greenSignal);
      const filteredSignal = this.adaptiveFilter(greenSignal);

      // Use adaptive peak detection
      const peaks = this.findPeaksAdaptive(filteredSignal);

      const heartRate = this.calculateHeartRate(peaks);
      const hrv = this.calculateHRV(peaks);

      console.log('Final measurements - Heart Rate:', heartRate, 'HRV:', hrv);
      return { heartRate, hrv };
    } catch (error) {
      console.error('Error in heart rate detection:', error);
      return {
        heartRate: this.lastHeartRate ?? 0,
        hrv: this.lastHRV ?? 0
      };
    }
  }
}