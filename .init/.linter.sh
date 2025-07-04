#!/bin/bash
cd /home/kavia/workspace/code-generation/animalsketchplayground-107341-90546c41/react_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

