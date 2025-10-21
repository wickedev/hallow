#!/bin/bash
# Integration Tests Runner
# This script generates service stubs and runs integration tests

set -e  # Exit on error

echo "🚀 Starting integration tests..."
echo ""

# 0. Build packages
echo "Building packages..."
echo ""
yarn build

# 1. Generate service stubs
echo "📝 Step 1: Generating service stubs from proto files..."
cd packages/test-client
node generate.js
if [ $? -eq 0 ]; then
    echo "✅ Service stubs generated successfully"
else
    echo "❌ Failed to generate service stubs"
    exit 1
fi
echo ""

# 2. Check if test server is needed
echo "🔍 Step 2: Checking test server status..."
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "✅ Test server is already running on port 3000"
else
    echo "⚠️  Test server is not running on port 3000"
    echo "   Tests will auto-start the server, or you can start it manually:"
    echo "   cd packages/test-server && yarn start"
fi
echo ""

# 3. Run integration tests
echo "🧪 Step 3: Running integration tests..."
cd ../generator
yarn jest tests/integration/grpc-web-integration.test.ts --verbose

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ All integration tests passed!"
else
    echo ""
    echo "❌ Some integration tests failed"
    exit 1
fi

echo ""
echo "🎉 Integration test run complete!"
