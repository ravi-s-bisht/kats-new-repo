#!/bin/bash

# Create models directory if it doesn't exist
mkdir -p public/models

# Define the required model files
declare -a MODEL_FILES=(
    "tiny_face_detector_model-weights_manifest.json"
    "tiny_face_detector_model.bin"
    "face_landmark_68_model-weights_manifest.json"
    "face_landmark_68_model.bin"
)

# Copy models from node_modules
echo "Copying face detection models..."
cp -r node_modules/@vladmandic/face-api/model/* public/models/

# Verify all required files are present
for file in "${MODEL_FILES[@]}"; do
    if [ -f "public/models/$file" ]; then
        echo "✓ Found $file"
    else
        echo "✗ Missing $file"
        exit 1
    fi
done

# Create .gitkeep to ensure directory is tracked
touch public/models/.gitkeep

echo "Model setup completed successfully"