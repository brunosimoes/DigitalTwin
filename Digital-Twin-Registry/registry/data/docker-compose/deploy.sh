#!/bin/bash

# Ensure the script exits if any command fails
set -e

# Function to check if the container is ready and healthy
check_container_health() {
  local container_name="$1"
  local max_attempts=30
  local current_attempt=1

  while [ $current_attempt -le $max_attempts ]; do
    if docker inspect --format "{{json .State.Health.Status }}" "$container_name" | grep -q "healthy"; then
      echo "Container $container_name is healthy!"
      return 0
    else
      echo "Waiting for container $container_name to be healthy (Attempt $current_attempt)..."
      sleep 5
      current_attempt=$((current_attempt + 1))
    fi
  done

  echo "Container $container_name did not become healthy within the specified time."
  return 1
}
