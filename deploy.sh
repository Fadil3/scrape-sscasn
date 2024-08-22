#!/bin/bash

# Pull the latest code from GitHub
git pull origin master

# Install dependencies
npm install

# Restart the application
pm2 restart formasi-api
