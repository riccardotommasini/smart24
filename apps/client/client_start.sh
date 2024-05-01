#!/bin/bash

# Attempt to start the server
npm run dev -- --host 0.0.0.0 --port 8080

# Check if the previous command failed
if [ $? -ne 0 ]; then
    echo 'Trying to install/update dependencies in case of architecture mismatch...'
    npm ci  # Clean install node modules
    
    # Try to start the server again
    npm run dev -- --host 0.0.0.0 --port 8080
fi
