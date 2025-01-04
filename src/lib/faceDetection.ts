import * as faceapi from 'face-api.js';

let modelsLoaded = false;
let loadingPromise: Promise<void> | null = null;

export async function loadFaceDetectionModels() {
  if (modelsLoaded) return;
  if (loadingPromise) return loadingPromise;

  loadingPromise = (async () => {
    try {
      console.log('Starting to load face detection models...');
      // Load TinyFaceDetector first as it's the primary model we need
      await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
      await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
      console.log('Face detection models loaded successfully');
      modelsLoaded = true;
    } catch (error) {
      console.error('Error loading face detection models:', error);
      modelsLoaded = false;
      loadingPromise = null;
      throw error;
    }
  })();

  return loadingPromise;
}

export async function detectFace(video: HTMLVideoElement) {
  if (!modelsLoaded) {
    try {
      console.log('Models not loaded, attempting to load...');
      await loadFaceDetectionModels();
    } catch (error) {
      console.error('Face detection initialization failed:', error);
      return undefined;
    }
  }

  try {
    console.log('Attempting face detection...');
    const detection = await faceapi.detectSingleFace(
      video,
      new faceapi.TinyFaceDetectorOptions()
    ).withFaceLandmarks();

    if (detection) {
      console.log('Face detected successfully');
    } else {
      console.log('No face detected in frame');
    }

    return detection;
  } catch (error) {
    console.error('Face detection failed:', error);
    return undefined;
  }
}

export function isFaceWellPositioned(
  detection: faceapi.WithFaceLandmarks<{ detection: faceapi.FaceDetection }> | undefined,
  videoWidth: number,
  videoHeight: number
) {
  if (!detection) return false;

  const face = detection.detection;
  const box = face.box;
  const landmarks = detection.landmarks;

  // Calculate face center point
  const centerX = box.x + box.width / 2;
  const centerY = box.y + box.height / 2;

  // Define target zones (matching the larger frame)
  const targetCenterX = videoWidth * 0.5;
  const targetCenterY = videoHeight * 0.45;
  const targetWidth = videoWidth * 0.5;  
  const targetHeight = videoHeight * 0.75;  // Increased to match new frame height

  // Calculate face size ratio relative to target
  const widthRatio = box.width / targetWidth;
  const heightRatio = box.height / targetHeight;

  // Check if face is centered within the target zone with adaptive margins
  const horizontalMargin = targetWidth * 0.25 * (1 + Math.abs(1 - widthRatio));
  const verticalMargin = targetHeight * 0.25 * (1 + Math.abs(1 - heightRatio));

  const isHorizontallyCentered = Math.abs(centerX - targetCenterX) < horizontalMargin;
  const isVerticallyCentered = Math.abs(centerY - targetCenterY) < verticalMargin;

  // Check if face is the right size
  const isRightSize = 
    widthRatio >= 0.5 &&  // Minimum ratio
    widthRatio <= 0.9 &&  // Maximum ratio
    heightRatio >= 0.5 && 
    heightRatio <= 0.9;

  // Check face rotation using landmarks with slightly relaxed thresholds
  const rotation = calculateFaceRotation(landmarks);
  const isLookingForward = 
    Math.abs(rotation.pitch) < 20 && 
    Math.abs(rotation.yaw) < 20 && 
    Math.abs(rotation.roll) < 20;

  console.log('Face position:', { 
    isHorizontallyCentered,
    isVerticallyCentered,
    isRightSize,
    isLookingForward,
    widthRatio,
    heightRatio,
    rotation
  });

  return isHorizontallyCentered && isVerticallyCentered && isRightSize && isLookingForward;
}

function calculateFaceRotation(landmarks: faceapi.FaceLandmarks68) {
  const points = landmarks.positions;

  // Get key facial landmarks
  const leftEye = points[36];
  const rightEye = points[45];
  const noseTip = points[30];
  const leftMouth = points[48];
  const rightMouth = points[54];

  // Calculate rotation angles with improved accuracy
  const eyeSlope = Math.atan2(rightEye.y - leftEye.y, rightEye.x - leftEye.x) * (180 / Math.PI);
  const mouthSlope = Math.atan2(rightMouth.y - leftMouth.y, rightMouth.x - leftMouth.x) * (180 / Math.PI);

  // Estimate head rotation with weighted calculations
  const yaw = (rightEye.x - leftEye.x) / (rightMouth.x - leftMouth.x) * 45 - 45;
  const pitch = (noseTip.y - ((leftEye.y + rightEye.y) / 2)) / 
                ((leftMouth.y + rightMouth.y) / 2 - ((leftEye.y + rightEye.y) / 2)) * 45 - 22.5;
  const roll = (eyeSlope + mouthSlope) / 2;

  return { pitch, yaw, roll };
}