#!/bin/bash

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "==========================================="
echo "Testing Employee Management System REST API"
echo "==========================================="

BASE_URL="http://localhost:8080"

# 1. Register a user
echo -e "\n1. Registering user 'testadmin'..."
REG_RESP=$(curl -s -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"username":"testadmin", "password":"password123", "role":"ADMIN"}')

echo "Registration Response:"
echo "$REG_RESP"

# 2. Login to get JWT
echo -e "\n2. Logging in..."
LOGIN_RESP=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"testadmin", "password":"password123"}')

echo "Login Response:"
echo "$LOGIN_RESP"

# Extract token using grep/sed since jq might not be installed
TOKEN=$(echo "$LOGIN_RESP" | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo -e "${RED}Failed to extract JWT Token!${NC}"
  exit 1
else
  echo -e "${GREEN}JWT Token obtained successfully.${NC}"
fi

# 3. Test accessing /api/employees without token (Should be 403 Forbidden)
echo -e "\n3. Testing /api/employees without token..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/employees")
if [ "$HTTP_STATUS" -eq 403 ]; then
  echo -e "${GREEN}SUCCESS: Access denied without token (HTTP $HTTP_STATUS)${NC}"
else
  echo -e "${RED}FAILURE: Expected HTTP 403, got $HTTP_STATUS${NC}"
fi

# 4. Add an employee (Should be 201 Created)
echo -e "\n4. Adding employee..."
ADD_RESP=$(curl -s -X POST "$BASE_URL/api/employees" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe", "email":"john.doe@example.com", "phone":"1234567890", "department":"Engineering", "salary":75000.0, "joinDate":"2026-06-04"}')

echo "Add Employee Response:"
echo "$ADD_RESP"
EMP_ID=$(echo "$ADD_RESP" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)

if [ -n "$EMP_ID" ]; then
  echo -e "${GREEN}SUCCESS: Employee added with ID $EMP_ID${NC}"
else
  echo -e "${RED}FAILURE: Could not create employee${NC}"
fi

# 5. Get all employees (Should be 200 OK)
echo -e "\n5. Getting all employees..."
GET_ALL_RESP=$(curl -s -X GET "$BASE_URL/api/employees" \
  -H "Authorization: Bearer $TOKEN")
echo "All Employees:"
echo "$GET_ALL_RESP"

# 6. Get employee by ID (Should be 200 OK)
echo -e "\n6. Getting employee by ID $EMP_ID..."
GET_ID_RESP=$(curl -s -X GET "$BASE_URL/api/employees/$EMP_ID" \
  -H "Authorization: Bearer $TOKEN")
echo "Employee By ID:"
echo "$GET_ID_RESP"

# 7. Update employee (Should be 200 OK)
echo -e "\n7. Updating employee $EMP_ID..."
UPDATE_RESP=$(curl -s -X PUT "$BASE_URL/api/employees/$EMP_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"John Doe Updated\", \"email\":\"john.doe@example.com\", \"phone\":\"9876543210\", \"department\":\"Engineering\", \"salary\":85000.0, \"joinDate\":\"2026-06-04\"}")
echo "Update Response:"
echo "$UPDATE_RESP"

# 8. Test invalid inputs validation (Should be 400 Bad Request)
echo -e "\n8. Testing input validation (invalid email & short name)..."
VALIDATION_RESP=$(curl -s -X POST "$BASE_URL/api/employees" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"J", "email":"invalidemail", "phone":"123", "department":"Engineering", "salary":-1000.0, "joinDate":"2026-06-04"}')
echo "Validation Error Response:"
echo "$VALIDATION_RESP"

# 9. Delete employee (Should be 200 OK)
echo -e "\n9. Deleting employee $EMP_ID..."
DELETE_RESP=$(curl -s -X DELETE "$BASE_URL/api/employees/$EMP_ID" \
  -H "Authorization: Bearer $TOKEN")
echo "Delete Response:"
echo "$DELETE_RESP"

# 10. Get deleted employee (Should be 404 Not Found)
echo -e "\n10. Getting deleted employee $EMP_ID (should be 404)..."
GET_DELETED_RESP=$(curl -s -X GET "$BASE_URL/api/employees/$EMP_ID" \
  -H "Authorization: Bearer $TOKEN")
echo "Get Deleted Response:"
echo "$GET_DELETED_RESP"

echo -e "\nAPI Testing completed successfully."
