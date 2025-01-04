#!/bin/bash

# Create models directory if it doesn't exist
mkdir -p client/public/models

# Copy models from node_modules
cp -r node_modules/@vladmandic/face-api/model/* client/public/models/

# Create .gitkeep to ensure directory is tracked
touch client/public/models/.gitkeep