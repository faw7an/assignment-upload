# API Curl Examples

This document provides curl examples for all API endpoints in the Assignment Upload System.

## Authentication

### Register

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "email": "john@example.com",
    "password": "securepassword"
  }'
```

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "johndoe",
    "password": "securepassword"
  }'
```

### Request Password Reset

```bash
curl -X POST http://localhost:3000/api/auth/reset-password/request-reset \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com"
  }'
```

### Reset Password

```bash
curl -X POST http://localhost:3000/api/auth/reset-password/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "reset-token-from-email",
    "password": "newpassword"
  }'
```

## Units

### List Units

```bash
curl -X GET http://localhost:3000/api/dashboard/units \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Create Unit

```bash
curl -X POST http://localhost:3000/api/dashboard/units/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "code": "CS101",
    "name": "Introduction to Computer Science",
    "description": "Foundational concepts in computer science"
  }'
```

### Get Unit

```bash
curl -X GET http://localhost:3000/api/dashboard/units/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Update Unit

```bash
curl -X PUT http://localhost:3000/api/dashboard/units/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "code": "CS102",
    "name": "Advanced Computer Science",
    "description": "Advanced concepts in computer science"
  }'
```

### Delete Unit

```bash
curl -X DELETE http://localhost:3000/api/dashboard/units/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Assignments

### List Assignments

```bash
# All assignments
curl -X GET http://localhost:3000/api/dashboard/assignments \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Filter by unit
curl -X GET "http://localhost:3000/api/dashboard/assignments?unitId=1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Filter by title
curl -X GET "http://localhost:3000/api/dashboard/assignments?title=Programming" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Create Assignment

```bash
curl -X POST http://localhost:3000/api/dashboard/assignments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Programming Basics",
    "description": "Learn the basics of programming",
    "unitId": 1,
    "dueDate": "2023-05-15T23:59:59Z"
  }'
```

### Get Assignment

```bash
curl -X GET http://localhost:3000/api/dashboard/assignments/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Update Assignment

```bash
curl -X PUT http://localhost:3000/api/dashboard/assignments/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Advanced Programming",
    "description": "Learn advanced programming concepts",
    "unitId": 2,
    "dueDate": "2023-06-15T23:59:59Z"
  }'
```

### Delete Assignment

```bash
curl -X DELETE http://localhost:3000/api/dashboard/assignments/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Submissions

### Create Submission

```bash
curl -X POST http://localhost:3000/api/dashboard/assignments/submissions \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "assignmentId=1" \
  -F "file=@/path/to/your/assignment1.pdf"
```

### Get Submission

```bash
# Get submission details
curl -X GET http://localhost:3000/api/dashboard/submissions/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Download submission file
curl -X GET "http://localhost:3000/api/dashboard/submissions/1?download=true" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -o downloaded_assignment.pdf
```

### Add Feedback

```bash
curl -X PUT http://localhost:3000/api/dashboard/submissions/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "feedback": "Great work! Your solution is elegant and well-documented."
  }'
```

### Delete Submission

```bash
curl -X DELETE http://localhost:3000/api/dashboard/submissions/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Courses

### List Courses

```bash
curl -X GET http://localhost:3000/api/dashboard/courses \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get Course

```bash
curl -X GET http://localhost:3000/api/dashboard/courses/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Create Course

```bash
curl -X POST http://localhost:3000/api/dashboard/courses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Computer Science 2023",
    "description": "Computer Science course for 2023 academic year"
  }'
```

### Update Course

```bash
curl -X PUT http://localhost:3000/api/dashboard/courses/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Computer Science Fundamentals 2023",
    "description": "Updated description for CS course"
  }'
```

### Delete Course

```bash
curl -X DELETE http://localhost:3000/api/dashboard/courses/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Enroll in Course

```bash
curl -X POST http://localhost:3000/api/dashboard/courses/enroll \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "courseId": 1
  }'
```

### Unenroll from Course

```bash
curl -X POST http://localhost:3000/api/dashboard/courses/unenroll \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "courseId": 1
  }'
```

## User

### Get User Profile

```bash
curl -X GET http://localhost:3000/api/user/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Update User Profile

```bash
curl -X PUT http://localhost:3000/api/user/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "username": "johndoe2",
    "email": "john.doe@example.com"
  }'
```

### Change Password

```bash
curl -X POST http://localhost:3000/api/user/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "currentPassword": "oldpassword",
    "newPassword": "newpassword"
  }'
```
