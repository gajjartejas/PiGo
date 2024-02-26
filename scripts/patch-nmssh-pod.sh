#!/bin/bash

# Define the URLs
SOURCE_DIR="scripts/NMSSH"
DEST_DIR="ios/Pods/NMSSH"

echo "Removing $DEST_DIR..."
# Check if source directory exists, then remove it
if [ -d "$DEST_DIR" ]; then
    echo "Removing existing source directory: $DEST_DIR"
    rm -rf "$DEST_DIR"
fi

# Check if source directory exists
if [ ! -d "$DEST_DIR" ]; then
    echo "Creating source directory: $DEST_DIR"
    mkdir -p "$DEST_DIR"
fi


echo "Copying '$SOURCE_DIR' to '$DEST_DIR'..."
cp -r "$SOURCE_DIR/" "$DEST_DIR/"

echo "Copy completed successfully."
exit 0
