#!/usr/bin/env bash
set -e

sudo apt-get update
sudo apt-get install -y wget apt-transport-https software-properties-common

if ! command -v dotnet >/dev/null 2>&1; then
  wget https://packages.microsoft.com/config/debian/12/packages-microsoft-prod.deb -O /tmp/packages-microsoft-prod.deb
  sudo dpkg -i /tmp/packages-microsoft-prod.deb
  rm /tmp/packages-microsoft-prod.deb
  sudo apt-get update
  sudo apt-get install -y dotnet-sdk-8.0
fi

npm install -g npm@latest