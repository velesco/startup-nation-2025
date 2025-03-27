#!/bin/bash

# Install required nodejs packages
echo "Installing required Node.js packages..."
npm install --save mkdirp@latest uuid

# Install LibreOffice if not already installed
if ! command -v soffice &> /dev/null
then
    echo "LibreOffice not found. Installing..."
    sudo apt update
    sudo apt install -y libreoffice-core libreoffice-common
else
    echo "LibreOffice already installed."
fi

# Ensure uploads directories exist
echo "Creating directories for uploads..."
mkdir -p uploads/contracts

# Set correct permissions
echo "Setting permissions..."
chmod -R 777 /tmp
chmod -R 755 uploads

# Restart the application
echo "Restarting the application..."
pm2 restart all

echo "Setup complete!"
