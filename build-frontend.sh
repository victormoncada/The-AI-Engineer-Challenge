#!/bin/bash
cd frontend
npm ci
./node_modules/.bin/react-scripts build
