import * as faceapi from "face-api.js";

interface PPGFeatures {
  systolicPeak: number;
  diastolicPeak: number;
  augmentationIndex: number;
  pulseWidth: number;
  pulseTransitTime: number;
}

export class BloodPressureEstimator {
  private readonly windowSize = 120; // 4 seconds at 30fps
  private readonly samplingRate = 30;
  private ppgSignal: number[] = [];
  private lastEstimate: string | null = null;
  private readonly minSystolic = 90;
  private readonly maxSystolic = 160;
  private readonly minDiastolic = 60;
  private readonly maxDiastolic = 100;
  private readonly minValidSignalQuality = 0.15;

  private async extractPPGSignal(
    videoElement: HTMLVideoElement,
    detection: faceapi.WithFaceLandmarks<{ detection: faceapi.FaceDetection }>,
  ): Promise<number> {
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

    let totalIntensity = 0;
    let totalWeight = 0;
    let pixelCount = 0;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      // Enhanced skin detection with RGB ratios
      const sum = r + g + b;
      if (sum === 0) continue;

      const rRatio = r / sum;
      const gRatio = g / sum;
      const bRatio = b / sum;

      if (
        rRatio > 0.35 && rRatio < 0.465 &&
        gRatio > 0.28 && gRatio < 0.363 &&
        bRatio > 0.18 && bRatio < 0.313
      ) {
        const brightness = sum / (3 * 255);
        const weight = gRatio * brightness;
        totalIntensity += g * weight;
        totalWeight += weight;
        pixelCount++;
      }
    }

    return pixelCount > 0 ? totalIntensity / totalWeight : 0;
  }

  private bandpassFilter(signal: number[]): number[] {
    const filtered = [];
    const lowCut = 0.8; // Hz
    const highCut = 3.0; // Hz
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
    const mean = signal.reduce((a, b) => a + b, 0) / signal.length;
    const stdDev = Math.sqrt(
      signal.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / signal.length
    );
    return signal.map(x => (x - mean) / (stdDev || 1));
  }

  private calculateSignalQuality(signal: number[]): number {
    if (signal.length < 2) return 0;

    const mean = signal.reduce((a, b) => a + b) / signal.length;
    const variance = signal.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / signal.length;
    const signalToNoise = Math.sqrt(variance) / (Math.abs(mean) || 1);

    return signalToNoise;
  }

  private findPeaksAndValleys(signal: number[]): { peaks: number[]; valleys: number[] } {
    const peaks: number[] = [];
    const valleys: number[] = [];
    const minDistance = Math.floor(this.samplingRate * 0.3); // Minimum 300ms between peaks
    const threshold = 0.5;

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
    if (signal.length < Math.floor(this.windowSize * 0.5)) return null;

    const signalQuality = this.calculateSignalQuality(signal);
    if (signalQuality < this.minValidSignalQuality) return null;

    const { peaks, valleys } = this.findPeaksAndValleys(signal);
    if (peaks.length < 2 || valleys.length < 2) return null;

    const peakValues = peaks.map(i => signal[i]);
    const valleyValues = valleys.map(i => signal[i]);

    // Calculate pulse transit time (time from valley to next peak)
    const transitTimes = [];
    for (let i = 0; i < valleys.length; i++) {
      const nextPeak = peaks.find(p => p > valleys[i]);
      if (nextPeak) {
        const tt = (nextPeak - valleys[i]) / this.samplingRate;
        if (tt >= 0.1 && tt <= 0.4) {
          transitTimes.push(tt);
        }
      }
    }

    // Calculate pulse width
    const pulseWidths = [];
    for (let i = 1; i < peaks.length; i++) {
      const width = (peaks[i] - peaks[i - 1]) / this.samplingRate;
      if (width >= 0.5 && width <= 1.2) {
        pulseWidths.push(width);
      }
    }

    return {
      systolicPeak: Math.max(...peakValues),
      diastolicPeak: Math.min(...valleyValues),
      augmentationIndex: Math.abs(Math.min(...valleyValues) / Math.max(...peakValues)),
      pulseWidth: this.median(pulseWidths) || 0.8,
      pulseTransitTime: this.median(transitTimes) || 0.2
    };
  }

  private estimateBloodPressure(features: PPGFeatures): string {
    // Base values for healthy adult
    const baseSystolic = 110;
    const baseDiastolic = 70;

    // Calculate adjustments based on PPG features
    const systolicAdjustment =
      25 * (1 - features.pulseTransitTime) + // PTT has strong inverse correlation with systolic BP
      15 * (features.systolicPeak) + // Higher peak amplitude suggests higher systolic
      10 * (1 - features.pulseWidth); // Narrower pulse width suggests higher pressure

    const diastolicAdjustment =
      15 * (1 - features.pulseTransitTime) + // PTT also affects diastolic but less strongly
      10 * (features.augmentationIndex - 0.5) + // Higher augmentation index suggests higher diastolic
      5 * (1 - features.pulseWidth); // Pulse width has weaker effect on diastolic

    let systolic = Math.round(baseSystolic + systolicAdjustment);
    let diastolic = Math.round(baseDiastolic + diastolicAdjustment);

    // Ensure physiologically valid ranges
    systolic = Math.min(Math.max(systolic, this.minSystolic), this.maxSystolic);
    diastolic = Math.min(Math.max(diastolic, this.minDiastolic), this.maxDiastolic);

    // Ensure valid systolic-diastolic relationship
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
      const ppgValue = await this.extractPPGSignal(videoElement, faceDetection);
      if (ppgValue === 0) return this.lastEstimate ?? "--";

      this.ppgSignal.push(ppgValue);
      if (this.ppgSignal.length > this.windowSize) {
        this.ppgSignal.shift();
      }

      if (this.ppgSignal.length < Math.floor(this.windowSize * 0.5)) {
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

          // Only update if changes are significant (more than 3 mmHg)
          const sysChange = Math.abs(newSys - lastSys);
          const diaChange = Math.abs(newDia - lastDia);

          if (sysChange > 3 || diaChange > 3) {
            // Calculate adaptive smoothing factors based on change magnitude
            const sysAlpha = Math.max(0.1, Math.min(0.25, sysChange / 40));
            const diaAlpha = Math.max(0.1, Math.min(0.25, diaChange / 40));

            const smoothedSys = Math.round(sysAlpha * newSys + (1 - sysAlpha) * lastSys);
            const smoothedDia = Math.round(diaAlpha * newDia + (1 - diaAlpha) * lastDia);

            this.lastEstimate = `${smoothedSys}/${smoothedDia}`;
          }
        } else {
          this.lastEstimate = newEstimate;
        }
      }

      return this.lastEstimate ?? "--";
    } catch (error) {
      console.error("Error in blood pressure estimation:", error);
      return this.lastEstimate ?? "--";
    }
  }
}