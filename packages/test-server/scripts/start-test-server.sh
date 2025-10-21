#!/bin/bash

# Start the test server for integration tests
# Usage: ./start-test-server.sh [--local|--docker]
# Default: --local

MODE="${1:---local}"

echo "🚀 Starting Hallow gRPC Test Server..."

# Navigate to test-server directory
cd "$(dirname "$0")/.."

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  yarn install
fi

# Update yarn.lock if needed (fixes frozen-lockfile issues)
echo "📦 Updating dependencies..."
yarn install

# Build the application
echo "🔨 Building NestJS application..."
yarn build

if [ "$MODE" = "--docker" ]; then
  echo "🐳 Running in Docker mode..."

  # Check if Docker is running
  if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    echo "💡 Tip: Run with --local flag to start without Docker"
    exit 1
  fi

  # Stop any existing containers
  echo "🛑 Stopping existing containers..."
  docker-compose down

  # Build and start containers
  echo "🐳 Starting Docker containers..."
  docker-compose up --build -d

  # Wait for services to be ready
  echo "⏳ Waiting for services to be ready..."
  sleep 5

  # Check if services are running
  if docker-compose ps | grep -q "Up"; then
    echo "✅ Test server is running in Docker!"
    echo ""
    echo "📍 Available endpoints:"
    echo "   - gRPC: localhost:50051"
    echo "   - gRPC-Web (via Envoy): http://localhost:8080"
    echo "   - HTTP/Health: http://localhost:3000"
    echo "   - Envoy Admin: http://localhost:9901"
    echo ""
    echo "To view logs: docker-compose logs -f"
    echo "To stop: docker-compose down"
  else
    echo "❌ Failed to start services. Check docker-compose logs for details."
    docker-compose logs
    exit 1
  fi
else
  echo "🖥️  Running in local mode..."

  # Kill any existing processes on the ports
  echo "🛑 Stopping any existing processes on ports 3000 and 50051..."
  lsof -ti:3000 | xargs kill -9 2>/dev/null
  lsof -ti:50051 | xargs kill -9 2>/dev/null

  # Start the server locally
  echo "🚀 Starting NestJS server locally..."
  yarn start &
  SERVER_PID=$!

  # Wait a moment for the server to start
  echo "⏳ Waiting for server to be ready..."
  sleep 3

  # Check if the server is running
  if lsof -i:50051 > /dev/null 2>&1; then
    echo "✅ Test server is running locally!"
    echo ""
    echo "📍 Available endpoints:"
    echo "   - gRPC (Native): localhost:50051"
    echo "   - HTTP/gRPC-Web: http://localhost:3000"
    echo "   - Health Check: http://localhost:3000/health"
    echo ""
    echo "🔍 gRPC Reflection API is enabled"
    echo ""
    echo "Test with grpcurl:"
    echo "   grpcurl -plaintext localhost:50051 list"
    echo "   grpcurl -plaintext localhost:50051 describe test.services.UserService"
    echo "   grpcurl -plaintext -d '{\"id\": \"123\"}' localhost:50051 test.services.UserService/GetUser"
    echo ""
    echo "Server PID: $SERVER_PID"
    echo "To stop: kill $SERVER_PID"

    # Keep the script running
    wait $SERVER_PID
  else
    echo "❌ Failed to start the server. Check the output above for errors."
    kill $SERVER_PID 2>/dev/null
    exit 1
  fi
fi