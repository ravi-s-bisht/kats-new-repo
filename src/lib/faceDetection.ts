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

  // Check if face is centered
  const centerX = box.x + box.width / 2;
  const centerY = box.y + box.height / 2;
  const isCentered = 
    centerX > videoWidth * 0.3 && 
    centerX < videoWidth * 0.7 &&
    centerY > videoHeight * 0.3 && 
    centerY < videoHeight * 0.7;

  // Check if face is large enough (at least 20% of frame height)
  const isLargeEnough = box.height > videoHeight * 0.2;

  console.log('Face position:', { 
    isCentered, 
    isLargeEnough,
    centerX,
    centerY,
    width: videoWidth,
    height: videoHeight
  });

  return isCentered && isLargeEnough;
}