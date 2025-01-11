import * as faceapi from '@vladmandic/face-api';

interface PPGFeatures {
  systolicPeak: number;
  diastolicPeak: number;
  augmentationIndex: number;
  pulseWidth: number;
  pulseTransitTime: number;
}

export class BloodPressureEstimator {
  private readonly windowSize = 90; // Reduced from 120 for more frequent updates
  private readonly samplingRate = 30;
  private ppgSignal: number[] = [];
  private lastEstimate: string | null = null;
  private readonly minSystolic = 90;
  private readonly maxSystolic = 160;
  private readonly minDiastolic = 60;
  private readonly maxDiastolic = 100;
  private readonly minValidSignalQuality = 0.1; // Reduced from 0.2 for higher sensitivity
  private lastBPUpdateRef: number = 0;
  private lastValidPPGSignal: number | null = null;

  private async extractPPGSignal(
    videoElement: HTMLVideoElement,
    detection: faceapi.WithFaceLandmarks<{ detection: faceapi.FaceDetection }>,
  ): Promise<number> {
    if (!videoElement || !detection) {
      console.error('[BloodPressure] Missing required parameters');
      return this.lastValidPPGSignal || 0;
    }

    try {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Could not get canvas context');

      const box = detection.detection.box;

      // Validate box dimensions
      if (!box || !box.width || !box.height) {
        console.error('[BloodPressure] Invalid face detection box');
        return this.lastValidPPGSignal || 0;
      }

      // Optimized region of interest with validation
      const region = {
        x: box.x + box.width * 0.2,
        y: box.y + box.height * 0.1,
        width: box.width * 0.6,
        height: box.height * 0.15
      };

      // Validate region boundaries
      if (region.x < 0 || region.y < 0 ||
          region.x + region.width > videoElement.videoWidth ||
          region.y + region.height > videoElement.videoHeight) {
        region.x = Math.max(0, Math.min(region.x, videoElement.videoWidth - region.width));
        region.y = Math.max(0, Math.min(region.y, videoElement.videoHeight - region.height));
      }

      canvas.width = region.width;
      canvas.height = region.height;

      try {
        context.drawImage(
          videoElement,
          region.x, region.y, region.width, region.height,
          0, 0, region.width, region.height
        );
      } catch (error) {
        console.error('[BloodPressure] Error drawing to canvas:', error);
        return this.lastValidPPGSignal || 0;
      }

      const imageData = context.getImageData(0, 0, region.width, region.height);
      const data = imageData.data;

      let totalIntensity = 0;
      let totalWeight = 0;
      let pixelCount = 0;

      for (let i = 0; i < data.length; i += 4) {
        try {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          const sum = r + g + b;
          if (sum === 0) continue;

          const rRatio = r / sum;
          const gRatio = g / sum;
          const bRatio = b / sum;

          // More precise skin detection thresholds with validation
          const rTarget = 0.4;
          const gTarget = 0.315;
          const bTarget = 0.25;
          const tolerance = 0.05;

          if (
            Math.abs(rRatio - rTarget) < tolerance &&
            Math.abs(gRatio - gTarget) < tolerance &&
            Math.abs(bRatio - bTarget) < tolerance
          ) {
            const weight = (
              (1 - Math.abs(rRatio - rTarget) / tolerance) *
              (1 - Math.abs(gRatio - gTarget) / tolerance) *
              (1 - Math.abs(bRatio - bTarget) / tolerance)
            );

            totalIntensity += g * weight;
            totalWeight += weight;
            pixelCount++;
          }
        } catch (error) {
          console.error('[BloodPressure] Error processing pixel:', error);
          continue;
        }
      }

      if (pixelCount === 0) {
        console.warn('[BloodPressure] No valid pixels detected');
        return this.lastValidPPGSignal || 0;
      }

      const signal = totalIntensity / totalWeight;
      this.lastValidPPGSignal = signal;
      return signal;

    } catch (error) {
      console.error('[BloodPressure] Error in PPG signal extraction:', error);
      return this.lastValidPPGSignal || 0;
    }
  }

  private bandpassFilter(signal: number[]): number[] {
    const filtered = [];
    // Optimized frequency bands for PPG signal
    const lowCut = 0.5; // Decreased from 0.7 for better low-frequency components
    const highCut = 4.0; // Increased from 3.5 for better high-frequency detail
    const lowAlpha = Math.exp(-2 * Math.PI * lowCut / this.samplingRate);
    const highAlpha = Math.exp(-2 * Math.PI * highCut / this.samplingRate);

    let lastLow = signal[0];
    let lastHigh = signal[0];

    for (let i = 0; i < signal.length; i++) {
      lastHigh = highAlpha * (lastHigh + signal[i] - signal[Math.max(0, i - 1)]);
      lastLow = signal[i] + lowAlpha * (lastLow - signal[i]);
      filtered.push(lastHigh - lastLow);
    }

    return this.normalizeSignal(filtered);
  }

  private normalizeSignal(signal: number[]): number[] {
    if (signal.length === 0) return signal;

    const mean = signal.reduce((a, b) => a + b, 0) / signal.length;
    const stdDev = Math.sqrt(
      signal.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / signal.length
    );

    // Enhanced outlier removal with adaptive thresholding
    const threshold = 2.5; // Reduced from 3 for more aggressive outlier removal
    const cleanedSignal = signal.map(x => {
      const normalized = (x - mean) / (stdDev || 1);
      return Math.abs(normalized) > threshold ? mean : x;
    });

    return cleanedSignal.map(x => (x - mean) / (stdDev || 1));
  }

  private calculateSignalQuality(signal: number[]): number {
    if (signal.length < 2) return 0;

    // Enhanced signal quality assessment with multiple metrics
    const mean = signal.reduce((a, b) => a + b) / signal.length;
    const variance = signal.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / signal.length;

    // Calculate zero crossings for frequency assessment
    let crossings = 0;
    for (let i = 1; i < signal.length; i++) {
      if (signal[i] * signal[i - 1] < 0) crossings++;
    }

    // Calculate signal periodicity with improved correlation
    const correlations = [];
    for (let lag = Math.floor(this.samplingRate * 0.5); lag < Math.floor(this.samplingRate * 1.5); lag++) {
      let correlation = 0;
      for (let i = 0; i < signal.length - lag; i++) {
        correlation += signal[i] * signal[i + lag];
      }
      correlations.push(correlation);
    }
    const periodicity = Math.max(...correlations) / (variance * signal.length);

    // Normalize and combine metrics with weighted importance
    const crossingQuality = Math.min(1, crossings / (signal.length / 15));
    const signalToNoise = Math.min(1, Math.sqrt(variance) / (Math.abs(mean) || 1));

    // Weight the metrics based on their importance
    return (
      0.4 * signalToNoise +
      0.3 * crossingQuality +
      0.3 * periodicity
    );
  }

  private findPeaksAndValleys(signal: number[]): { peaks: number[]; valleys: number[] } {
    const peaks: number[] = [];
    const valleys: number[] = [];
    const minDistance = Math.floor(this.samplingRate * 0.25); // Reduced from 0.3
    const threshold = 0.2; // Reduced from 0.4 for more sensitive detection

    for (let i = 2; i < signal.length - 2; i++) {
      const isPeak = signal[i] > threshold &&
                    signal[i] > signal[i - 1] &&
                    signal[i] > signal[i - 2] &&
                    signal[i] > signal[i + 1] &&
                    signal[i] > signal[i + 2];

      const isValley = signal[i] < -threshold &&
                      signal[i] < signal[i - 1] &&
                      signal[i] < signal[i - 2] &&
                      signal[i] < signal[i + 1] &&
                      signal[i] < signal[i + 2];

      if (isPeak && (peaks.length === 0 || i - peaks[peaks.length - 1] >= minDistance)) {
        peaks.push(i);
      } else if (isValley && (valleys.length === 0 || i - valleys[valleys.length - 1] >= minDistance)) {
        valleys.push(i);
      }
    }

    return { peaks, valleys };
  }

  private extractFeatures(signal: number[]): PPGFeatures | null {
    if (signal.length < Math.floor(this.windowSize * 0.4)) { // Reduced from 0.5
      console.log('Insufficient signal length:', signal.length);
      return null;
    }

    const signalQuality = this.calculateSignalQuality(signal);
    console.log('Signal quality:', signalQuality);

    if (signalQuality < this.minValidSignalQuality) {
      console.log('Signal quality below threshold');
      return null;
    }

    const { peaks, valleys } = this.findPeaksAndValleys(signal);
    console.log('Peaks found:', peaks.length, 'Valleys found:', valleys.length);

    if (peaks.length < 2 || valleys.length < 2) {
      console.log('Insufficient peaks or valleys');
      return null;
    }

    const peakValues = peaks.map(i => signal[i]);
    const valleyValues = valleys.map(i => signal[i]);

    // Calculate pulse transit time with improved accuracy
    const transitTimes = [];
    for (let i = 0; i < valleys.length; i++) {
      const nextPeak = peaks.find(p => p > valleys[i]);
      if (nextPeak) {
        const tt = (nextPeak - valleys[i]) / this.samplingRate;
        if (tt >= 0.08 && tt <= 0.5) { // More lenient time range
          transitTimes.push(tt);
        }
      }
    }

    // Calculate pulse width with enhanced precision
    const pulseWidths = [];
    for (let i = 1; i < peaks.length; i++) {
      const width = (peaks[i] - peaks[i - 1]) / this.samplingRate;
      if (width >= 0.4 && width <= 1.4) { // More lenient width range
        pulseWidths.push(width);
      }
    }

    if (transitTimes.length === 0 || pulseWidths.length === 0) {
      console.log('No valid transit times or pulse widths found');
      return null;
    }

    return {
      systolicPeak: Math.max(...peakValues),
      diastolicPeak: Math.min(...valleyValues),
      augmentationIndex: Math.abs(Math.min(...valleyValues) / Math.max(...peakValues)),
      pulseWidth: this.median(pulseWidths),
      pulseTransitTime: this.median(transitTimes)
    };
  }

  private estimateBloodPressure(features: PPGFeatures): string {
    // Enhanced base values with physiological correlations
    const baseSystolic = 120;
    const baseDiastolic = 80;

    // Improved adjustments based on PPG features and physiological models
    const systolicAdjustment =
      25 * (1 - features.pulseTransitTime) + // Increased PTT contribution
      15 * features.systolicPeak + // Enhanced peak amplitude contribution
      10 * (1 - features.pulseWidth); // Added pulse width influence

    const diastolicAdjustment =
      20 * (1 - features.pulseTransitTime) + // Enhanced PTT influence
      12 * features.augmentationIndex + // Increased AI contribution
      8 * (1 - features.pulseWidth); // Added pulse width factor

    let systolic = Math.round(baseSystolic + systolicAdjustment);
    let diastolic = Math.round(baseDiastolic + diastolicAdjustment);

    // Ensure physiologically valid ranges
    systolic = Math.min(Math.max(systolic, this.minSystolic), this.maxSystolic);
    diastolic = Math.min(Math.max(diastolic, this.minDiastolic), this.maxDiastolic);

    // Ensure valid systolic-diastolic relationship with adaptive margins
    const minDiff = 30;
    const maxDiff = 60;

    if (systolic - diastolic < minDiff) {
      const avg = (systolic + diastolic) / 2;
      systolic = Math.min(avg + minDiff / 2, this.maxSystolic);
      diastolic = Math.max(avg - minDiff / 2, this.minDiastolic);
    } else if (systolic - diastolic > maxDiff) {
      const avg = (systolic + diastolic) / 2;
      systolic = Math.min(avg + maxDiff / 2, this.maxSystolic);
      diastolic = Math.max(avg - maxDiff / 2, this.minDiastolic);
    }

    return `${systolic}/${diastolic}`;
  }

  private median(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    const sorted = [...numbers].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0
      ? (sorted[middle - 1] + sorted[middle]) / 2
      : sorted[middle];
  }

  public async update(
    videoElement: HTMLVideoElement,
    faceDetection: faceapi.WithFaceLandmarks<{ detection: faceapi.FaceDetection }>,
  ): Promise<string> {
    try {
      const now = performance.now();

      // Only update if sufficient time has passed (200ms)
      if (now - this.lastBPUpdateRef < 200) {
        return this.lastEstimate ?? "--";
      }

      const ppgValue = await this.extractPPGSignal(videoElement, faceDetection);

      if (ppgValue === 0) {
        console.log('No valid PPG signal extracted');
        return this.lastEstimate ?? "--";
      }

      this.ppgSignal.push(ppgValue);
      if (this.ppgSignal.length > this.windowSize) {
        this.ppgSignal.shift();
      }

      if (this.ppgSignal.length < Math.floor(this.windowSize * 0.4)) { // Reduced from 0.5
        console.log('Insufficient signal length:', this.ppgSignal.length);
        return this.lastEstimate ?? "--";
      }

      const filteredSignal = this.bandpassFilter(this.ppgSignal);
      const features = this.extractFeatures(filteredSignal);

      if (features) {
        const newEstimate = this.estimateBloodPressure(features);

        // Apply temporal smoothing with stability checks
        if (this.lastEstimate) {
          const [lastSys, lastDia] = this.lastEstimate.split('/').map(Number);
          const [newSys, newDia] = newEstimate.split('/').map(Number);

          // More lenient update threshold (2 mmHg instead of 3)
          const sysChange = Math.abs(newSys - lastSys);
          const diaChange = Math.abs(newDia - lastDia);

          if (sysChange > 2 || diaChange > 2) {
            // Faster adaptation rate for real-time updates
            const sysAlpha = Math.max(0.3, Math.min(0.5, sysChange / 20));
            const diaAlpha = Math.max(0.3, Math.min(0.5, diaChange / 20));

            const smoothedSys = Math.round(sysAlpha * newSys + (1 - sysAlpha) * lastSys);
            const smoothedDia = Math.round(diaAlpha * newDia + (1 - diaAlpha) * lastDia);

            this.lastEstimate = `${smoothedSys}/${smoothedDia}`;
          }
        } else {
          this.lastEstimate = newEstimate;
        }
      }

      this.lastBPUpdateRef = now;
      return this.lastEstimate ?? "--";
    } catch (error) {
      console.error("Error in blood pressure estimation:", error);
      return this.lastEstimate ?? "--";
    }
  }
}