#!/bin/bash

echo "TrackNet API Testing Script"
echo "=============================="
echo ""

BASE_URL="http://localhost:3000"

echo "1. Testing User Registration..."
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@tracknet.com","password":"demo123"}')
echo "$REGISTER_RESPONSE" | python3 -m json.tool
echo ""

echo "2. Testing User Login..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@tracknet.com","password":"password123"}')
echo "$LOGIN_RESPONSE" | python3 -m json.tool

TOKEN=$(echo "$LOGIN_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['token'])" 2>/dev/null)
echo ""

if [ -z "$TOKEN" ]; then
  echo "Failed to get token. Exiting."
  exit 1
fi

echo "3. Testing Get Trucks (Protected)..."
curl -s -H "Authorization: Bearer $TOKEN" "$BASE_URL/api/trucks" | python3 -m json.tool
echo ""

echo "4. Testing Location Update (Arduino Simulation)..."
curl -s -X POST "$BASE_URL/api/trucks/location" \
  -H "Content-Type: application/json" \
  -d '{"deviceId":"TRUCK005","latitude":26.8520,"longitude":89.3870}' | python3 -m json.tool
echo ""

echo "5. Testing Get Routes (Scaffolded)..."
curl -s -H "Authorization: Bearer $TOKEN" "$BASE_URL/api/routes" | python3 -m json.tool
echo ""

echo "6. Testing Create Route (Scaffolded)..."
curl -s -X POST "$BASE_URL/api/routes" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"truckId":1,"waypoints":[[26.8532,89.3850],[26.8600,89.3900]]}' | python3 -m json.tool
echo ""

echo "=============================="
echo "All API tests completed!"
