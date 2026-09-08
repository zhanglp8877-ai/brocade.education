#!/bin/zsh
cd "$(dirname "$0")"
export PATH="$PWD/.node/bin:$PATH"
npm start
