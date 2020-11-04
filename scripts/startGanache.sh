#!/usr/bin/env sh

source ../.env

# echo $INFURA_HTTP_URL
echo "Starting Ganache..."

ganache-cli --fork $INFURA_HTTP_URL
