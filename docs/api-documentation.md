# API Documentation

This document describes the Assignment Upload System API endpoints, their parameters, and response formats.

## Table of Contents

- [Authentication](#authentication)
  - [Register](#register)
  - [Login](#login)
  - [Request Password Reset](#request-password-reset)
  - [Reset Password](#reset-password)
- [Units](#units)
  - [List Units](#list-units)
  - [Create Unit](#create-unit)
  - [Get Unit](#get-unit)
  - [Update Unit](#update-unit)
  - [Delete Unit](#delete-unit)
- [Assignments](#assignments)
  - [List Assignments](#list-assignments)
  - [Create Assignment](#create-assignment)
  - [Get Assignment](#get-assignment)
  - [Update Assignment](#update-assignment)
  - [Delete Assignment](#delete-assignment)
- [Submissions](#submissions)
  - [Create Submission](#create-submission)
  - [Get Submission](#get-submission)
  - [Add Feedback](#add-feedback)
  - [Delete Submission](#delete-submission)
- [Courses](#courses)
  - [List Courses](#list-courses)
  - [Get Course](#get-course)
  - [Create Course](#create-course)
  - [Update Course](#update-course)
  - [Delete Course](#delete-course)
  - [Enroll in Course](#enroll-in-course)
  - [Unenroll from Course](#unenroll-from-course)
- [User](#user)
  - [Get User Profile](#get-user-profile)
  - [Update User Profile](#update-user-profile)
  - [Change Password](#change-password)

## Authentication

All dashboard endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

### Register

Register a new user account.

- **URL**: `/api/auth/register`
- **Method**: `POST`
- **Authentication**: Not required

**Request Body**:
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepassword"
}
```

**Response**:
```json
{
  "message": "User created successfully."
}
```

**Status Codes**:
- `201 Created`: Registration successful
- `400 Bad Request`: Missing required fields
- `409 Conflict`: User already exists
- `500 Internal Server Error`: Server error

### Login

Authenticate a user and receive a JWT token.

- **URL**: `/api/auth/login`
- **Method**: `POST`
- **Authentication**: Not required

**Request Body**:
```json
{
  "identifier": "johndoe", // can be username or email
  "password": "securepassword"
}
```

**Response**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Status Codes**:
- `200 OK`: Login successful
- `400 Bad Request`: Missing identifier or password
- `401 Unauthorized`: Invalid credentials
- `500 Internal Server Error`: Server error

### Request Password Reset

Request a password reset email.

- **URL**: `/api/auth/reset-password/request-reset`
- **Method**: `POST`
- **Authentication**: Not required

**Request Body**:
```json
{
  "email": "john@example.com"
}
```

**Response**:
```json
{
  "message": "If an account with that email exists, a password reset link has been sent."
}
```

**Status Codes**:
- `200 OK`: Request processed
- `400 Bad Request`: Missing email
- `500 Internal Server Error`: Server error

### Reset Password

Reset password using a valid token.

- **URL**: `/api/auth/reset-password/reset-password`
- **Method**: `POST`
- **Authentication**: Not required

**Request Body**:
```json
{
  "token": "reset-token-from-email",
  "password": "newpassword"
}
```

**Response**:
```json
{
  "message": "Password has been reset successfully."
}
```

**Status Codes**:
- `200 OK`: Password reset successful
- `400 Bad Request`: Missing token or password
- `401 Unauthorized`: Invalid or expired token
- `500 Internal Server Error`: Server error

## Units

### List Units

Get a list of all units.

- **URL**: `/api/dashboard/units`
- **Method**: `GET`
- **Authentication**: Required

**Response**:
```json
{
  "units": [
    {
      "id": 1,
      "code": "CS101",
      "name": "Introduction to Computer Science",
      "description": "Foundational concepts in computer science",
      "createdAt": "2023-04-10T12:00:00Z",
      "updatedAt": "2023-04-10T12:00:00Z"
    },
    ...
  ]
}
```

**Status Codes**:
- `200 OK`: Units retrieved successfully
- `401 Unauthorized`: Authentication required
- `500 Internal Server Error`: Server error

### Create Unit

Create a new unit (admin only).

- **URL**: `/api/dashboard/units/create`
- **Method**: `POST`
- **Authentication**: Required (Admin)

**Request Body**:
```json
{
  "code": "CS101",
  "name": "Introduction to Computer Science",
  "description": "Foundational concepts in computer science"
}
```

**Response**:
```json
{
  "message": "Unit created successfully",
  "unit": {
    "id": 1,
    "code": "CS101",
    "name": "Introduction to Computer Science",
    "description": "Foundational concepts in computer science",
    "createdAt": "2023-04-10T12:00:00Z",
    "updatedAt": "2023-04-10T12:00:00Z"
  }
}
```

**Status Codes**:
- `201 Created`: Unit created successfully
- `400 Bad Request`: Missing required fields
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Access denied (not admin)
- `409 Conflict`: Unit with this code already exists
- `500 Internal Server Error`: Server error

### Get Unit

Get details of a specific unit.

- **URL**: `/api/dashboard/units/{id}`
- **Method**: `GET`
- **Authentication**: Required

**Path Parameters**:
- `id` - Unit ID

**Response**:
```json
{
  "unit": {
    "id": 1,
    "code": "CS101",
    "name": "Introduction to Computer Science",
    "description": "Foundational concepts in computer science",
    "createdAt": "2023-04-10T12:00:00Z",
    "updatedAt": "2023-04-10T12:00:00Z"
  }
}
```

**Status Codes**:
- `200 OK`: Unit retrieved successfully
- `401 Unauthorized`: Authentication required
- `404 Not Found`: Unit not found
- `500 Internal Server Error`: Server error

### Update Unit

Update an existing unit (admin only).

- **URL**: `/api/dashboard/units/{id}`
- **Method**: `PUT`
- **Authentication**: Required (Admin)

**Path Parameters**:
- `id` - Unit ID

**Request Body**:
```json
{
  "code": "CS102",
  "name": "Advanced Computer Science",
  "description": "Advanced concepts in computer science"
}
```

**Response**:
```json
{
  "message": "Unit updated successfully",
  "unit": {
    "id": 1,
    "code": "CS102",
    "name": "Advanced Computer Science",
    "description": "Advanced concepts in computer science",
    "createdAt": "2023-04-10T12:00:00Z",
    "updatedAt": "2023-04-10T13:00:00Z"
  }
}
```

**Status Codes**:
- `200 OK`: Unit updated successfully
- `400 Bad Request`: Missing required fields
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Access denied (not admin)
- `404 Not Found`: Unit not found
- `409 Conflict`: Another unit with this code already exists
- `500 Internal Server Error`: Server error

### Delete Unit

Delete a unit (admin only).

- **URL**: `/api/dashboard/units/{id}`
- **Method**: `DELETE`
- **Authentication**: Required (Admin)

**Path Parameters**:
- `id` - Unit ID

**Response**:
```json
{
  "message": "Unit deleted successfully"
}
```

**Status Codes**:
- `200 OK`: Unit deleted successfully
- `400 Bad Request`: Cannot delete unit with existing assignments
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Access denied (not admin)
- `404 Not Found`: Unit not found
- `500 Internal Server Error`: Server error

## Assignments

### List Assignments

Get a list of all assignments with optional filtering.

- **URL**: `/api/dashboard/assignments`
- **Method**: `GET`
- **Authentication**: Required

**Query Parameters**:
- `unitId` (optional) - Filter assignments by unit ID
- `title` (optional) - Filter assignments by title (contains)
- `courseId` (optional) - Filter assignments by course ID

**Response**:
```json
{
  "assignments": [
    {
      "id": 1,
      "title": "Programming Basics",
      "description": "Learn the basics of programming",
      "dueDate": "2023-05-15T23:59:59Z",
      "createdAt": "2023-04-10T12:00:00Z",
      "updatedAt": "2023-04-10T12:00:00Z",
      "unitId": 1,
      "unit": {
        "id": 1,
        "code": "CS101",
        "name": "Introduction to Computer Science",
        "course": {
          "id": "course-uuid",
          "name": "Computer Science 2023",
          "code": "CS2023"
        }
      },
      "_count": {
        "submissions": 5
      }
    },
    ...
  ]
}
```

**Status Codes**:
- `200 OK`: Assignments retrieved successfully
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: You do not have access to this course/unit
- `500 Internal Server Error`: Server error

### Create Assignment

Create a new assignment (system admin or course admin only).

- **URL**: `/api/dashboard/assignments`
- **Method**: `POST`
- **Authentication**: Required (Admin or Course Admin)

**Request Body**:
```json
{
  "title": "Programming Basics",
  "description": "Learn the basics of programming",
  "unitId": 1,
  "dueDate": "2023-05-15T23:59:59Z"
}
```

**Response**:
```json
{
  "message": "Assignment created successfully",
  "assignment": {
    "id": 1,
    "title": "Programming Basics",
    "description": "Learn the basics of programming",
    "dueDate": "2023-05-15T23:59:59Z",
    "createdAt": "2023-04-10T12:00:00Z",
    "updatedAt": "2023-04-10T12:00:00Z",
    "unitId": 1
  }
}
```

**Status Codes**:
- `201 Created`: Assignment created successfully
- `400 Bad Request`: Missing required fields
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Access denied (not system admin or course admin)
- `404 Not Found`: Unit not found
- `500 Internal Server Error`: Server error

### Get Assignment

Get details of a specific assignment.

- **URL**: `/api/dashboard/assignments/{id}`
- **Method**: `GET`
- **Authentication**: Required

**Path Parameters**:
- `id` - Assignment ID

**Response**:
```json
{
  "assignment": {
    "id": 1,
    "title": "Programming Basics",
    "description": "Learn the basics of programming",
    "dueDate": "2023-05-15T23:59:59Z",
    "createdAt": "2023-04-10T12:00:00Z",
    "updatedAt": "2023-04-10T12:00:00Z",
    "unitId": 1,
    "unit": {
      "id": 1,
      "code": "CS101",
      "name": "Introduction to Computer Science"
    },
    "submissions": [
      {
        "id": 1,
        "submittedAt": "2023-04-15T14:30:00Z",
        "fileName": "assignment1.pdf",
        "filePath": "uploads/assignment1.pdf",
        "feedback": "Great work!"
      }
    ]
  }
}
```

**Status Codes**:
- `200 OK`: Assignment retrieved successfully
- `401 Unauthorized`: Authentication required
- `404 Not Found`: Assignment not found
- `500 Internal Server Error`: Server error

### Update Assignment

Update an existing assignment (system admin or course admin only).

- **URL**: `/api/dashboard/assignments/{id}`
- **Method**: `PUT`
- **Authentication**: Required (Admin or Course Admin)

**Path Parameters**:
- `id` - Assignment ID

**Request Body**:
```json
{
  "title": "Advanced Programming",
  "description": "Learn advanced programming concepts",
  "unitId": 2,
  "dueDate": "2023-06-15T23:59:59Z"
}
```

**Response**:
```json
{
  "message": "Assignment updated successfully",
  "assignment": {
    "id": 1,
    "title": "Advanced Programming",
    "description": "Learn advanced programming concepts",
    "dueDate": "2023-06-15T23:59:59Z",
    "createdAt": "2023-04-10T12:00:00Z",
    "updatedAt": "2023-04-10T13:00:00Z",
    "unitId": 2
  }
}
```

**Status Codes**:
- `200 OK`: Assignment updated successfully
- `400 Bad Request`: Missing required fields
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Access denied (not system admin or course admin)
- `404 Not Found`: Assignment not found or Unit not found
- `500 Internal Server Error`: Server error

### Delete Assignment

Delete an assignment (system admin or course admin only).

- **URL**: `/api/dashboard/assignments/{id}`
- **Method**: `DELETE`
- **Authentication**: Required (Admin or Course Admin)

**Path Parameters**:
- `id` - Assignment ID

**Response**:
```json
{
  "message": "Assignment deleted successfully"
}
```

**Status Codes**:
- `200 OK`: Assignment deleted successfully
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Access denied (not system admin or course admin)
- `404 Not Found`: Assignment not found
- `500 Internal Server Error`: Server error

## Submissions

### Create Submission

Submit an assignment (file upload).

- **URL**: `/api/dashboard/assignments/submissions`
- **Method**: `POST`
- **Authentication**: Required
- **Content-Type**: `multipart/form-data`

**Form Data**:
- `assignmentId`: Assignment ID (required)
- `file`: File to upload (required)

**Response**:
```json
{
  "message": "Assignment submitted successfully",
  "submission": {
    "id": 1,
    "fileName": "assignment1.pdf",
    "submittedAt": "2023-04-15T14:30:00Z"
  }
}
```

**Status Codes**:
- `201 Created`: Submission created successfully
- `400 Bad Request`: Missing assignment ID, no file uploaded, or submission deadline passed
- `401 Unauthorized`: Authentication required
- `404 Not Found`: Assignment not found
- `500 Internal Server Error`: Server error

### Get Submission

Get details of a specific submission or download the submitted file.

- **URL**: `/api/dashboard/submissions/{id}`
- **Method**: `GET`
- **Authentication**: Required (Owner or Admin)

**Path Parameters**:
- `id` - Submission ID

**Query Parameters**:
- `download` - Set to `true` to download the file

**Response** (without download):
```json
{
  "submission": {
    "id": 1,
    "submittedAt": "2023-04-15T14:30:00Z",
    "fileName": "assignment1.pdf",
    "filePath": "uploads/assignment1.pdf",
    "fileType": "application/pdf",
    "feedback": "Great work!",
    "student": {
      "id": "abc123",
      "username": "johndoe",
      "email": "john@example.com"
    },
    "assignment": {
      "id": 1,
      "title": "Programming Basics",
      "unit": {
        "id": 1,
        "code": "CS101",
        "name": "Introduction to Computer Science"
      }
    }
  }
}
```

**Response** (with download):
- File download

**Status Codes**:
- `200 OK`: Submission retrieved successfully or file download
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Access denied (not owner or admin)
- `404 Not Found`: Submission not found or file not found
- `500 Internal Server Error`: Server error

### Add Feedback

Add feedback to a submission (admin only).

- **URL**: `/api/dashboard/submissions/{id}`
- **Method**: `PUT`
- **Authentication**: Required (Admin)

**Path Parameters**:
- `id` - Submission ID

**Request Body**:
```json
{
  "feedback": "Great work! Your solution is elegant and well-documented."
}
```

**Response**:
```json
{
  "message": "Feedback provided successfully",
  "submission": {
    "id": 1,
    "feedback": "Great work! Your solution is elegant and well-documented.",
    "submittedAt": "2023-04-15T14:30:00Z",
    "updatedAt": "2023-04-16T10:00:00Z"
  }
}
```

**Status Codes**:
- `200 OK`: Feedback added successfully
- `400 Bad Request`: Missing feedback
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Access denied (not admin)
- `404 Not Found`: Submission not found
- `500 Internal Server Error`: Server error

### Delete Submission

Delete a submission (admin or owner).

- **URL**: `/api/dashboard/submissions/{id}`
- **Method**: `DELETE`
- **Authentication**: Required (Owner or Admin)

**Path Parameters**:
- `id` - Submission ID

**Response**:
```json
{
  "message": "Submission deleted successfully"
}
```

**Status Codes**:
- `200 OK`: Submission deleted successfully
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Access denied (not owner or admin)
- `404 Not Found`: Submission not found
- `500 Internal Server Error`: Server error

## Courses

### List Courses

Get a list of all courses.

- **URL**: `/api/dashboard/courses`
- **Method**: `GET`
- **Authentication**: Required

**Response**:
```json
{
  "courses": [
    {
      "id": "course-uuid",
      "name": "Computer Science 2023",
      "code": "CS2023",
      "description": "Computer Science course for 2023 academic year",
      "createdAt": "2023-04-10T12:00:00Z",
      "updatedAt": "2023-04-10T12:00:00Z",
      "courseAdmin": {
        "id": "admin-user-id",
        "username": "professorsmith"
      },
      "_count": {
        "students": 25,
        "units": 5
      }
    },
    ...
  ]
}
```

**Status Codes**:
- `200 OK`: Courses retrieved successfully
- `401 Unauthorized`: Authentication required
- `500 Internal Server Error`: Server error

### Get Course

Get details of a specific course.

- **URL**: `/api/dashboard/courses/{id}`
- **Method**: `GET`
- **Authentication**: Required

**Path Parameters**:
- `id` - Course ID

**Response**:
```json
{
  "course": {
    "id": "course-uuid",
    "name": "Computer Science 2023",
    "code": "CS2023",
    "description": "Computer Science course for 2023 academic year",
    "createdAt": "2023-04-10T12:00:00Z",
    "updatedAt": "2023-04-10T12:00:00Z",
    "courseAdmin": {
      "id": "admin-user-id",
      "username": "professorsmith"
    },
    "units": [
      {
        "id": 1,
        "code": "CS101",
        "name": "Introduction to Computer Science"
      },
      ...
    ],
    "students": [
      {
        "id": "user-uuid",
        "username": "johndoe",
        "email": "john@example.com"
      },
      ...
    ]
  }
}
```

**Status Codes**:
- `200 OK`: Course retrieved successfully
- `401 Unauthorized`: Authentication required
- `404 Not Found`: Course not found
- `500 Internal Server Error`: Server error

### Create Course

Create a new course (system admin only).

- **URL**: `/api/dashboard/courses/create`
- **Method**: `POST`
- **Authentication**: Required (Admin)

**Request Body**:
```json
{
  "name": "Computer Science 2023",
  "code": "CS2023",
  "description": "Computer Science course for 2023 academic year",
  "courseAdminId": "admin-user-id"
}
```

**Response**:
```json
{
  "message": "Course created successfully",
  "course": {
    "id": "course-uuid",
    "name": "Computer Science 2023",
    "code": "CS2023",
    "description": "Computer Science course for 2023 academic year",
    "courseAdminId": "admin-user-id",
    "createdAt": "2023-04-10T12:00:00Z",
    "updatedAt": "2023-04-10T12:00:00Z"
  }
}
```

**Status Codes**:
- `201 Created`: Course created successfully
- `400 Bad Request`: Missing required fields or invalid course admin
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Access denied (not system admin)
- `500 Internal Server Error`: Server error

### Update Course

Update an existing course (system admin or course admin only).

- **URL**: `/api/dashboard/courses/{id}`
- **Method**: `PUT`
- **Authentication**: Required (Admin or Course Admin)

**Path Parameters**:
- `id` - Course ID

**Request Body**:
```json
{
  "name": "Computer Science Fundamentals 2023",
  "code": "CSF2023",
  "description": "Updated description for CS course",
  "courseAdminId": "new-admin-user-id"
}
```

**Response**:
```json
{
  "message": "Course updated successfully",
  "course": {
    "id": "course-uuid",
    "name": "Computer Science Fundamentals 2023",
    "code": "CSF2023",
    "description": "Updated description for CS course",
    "courseAdminId": "new-admin-user-id",
    "createdAt": "2023-04-10T12:00:00Z",
    "updatedAt": "2023-04-10T13:00:00Z"
  }
}
```

**Status Codes**:
- `200 OK`: Course updated successfully
- `400 Bad Request`: Missing required fields or invalid course admin
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Access denied (not system admin or course admin)
- `404 Not Found`: Course not found
- `500 Internal Server Error`: Server error

### Delete Course

Delete a course (system admin only).

- **URL**: `/api/dashboard/courses/{id}`
- **Method**: `DELETE`
- **Authentication**: Required (Admin)

**Path Parameters**:
- `id` - Course ID

**Response**:
```json
{
  "message": "Course deleted successfully"
}
```

**Status Codes**:
- `200 OK`: Course deleted successfully
- `400 Bad Request`: Cannot delete course with enrolled students or units
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Access denied (not system admin)
- `404 Not Found`: Course not found
- `500 Internal Server Error`: Server error

### Enroll in Course

Enroll a student in a course.

- **URL**: `/api/dashboard/courses/enroll`
- **Method**: `POST`
- **Authentication**: Required

**Request Body**:
```json
{
  "courseId": 1
}
```

**Response**:
```json
{
  "message": "Successfully enrolled in the course"
}
```

**Status Codes**:
- `200 OK`: Enrollment successful
- `400 Bad Request`: Missing course ID or already enrolled
- `401 Unauthorized`: Authentication required
- `404 Not Found`: Course not found
- `500 Internal Server Error`: Server error

### Unenroll from Course

Unenroll a student from a course.

- **URL**: `/api/dashboard/courses/unenroll`
- **Method**: `POST`
- **Authentication**: Required

**Request Body**:
```json
{
  "courseId": 1
}
```

**Response**:
```json
{
  "message": "Successfully unenrolled from the course"
}
```

**Status Codes**:
- `200 OK`: Unenrollment successful
- `400 Bad Request`: Missing course ID or not enrolled
- `401 Unauthorized`: Authentication required
- `404 Not Found`: Course not found
- `500 Internal Server Error`: Server error

## User

### Get User Profile

Get the profile information of the authenticated user.

- **URL**: `/api/user/profile`
- **Method**: `GET`
- **Authentication**: Required

**Response**:
```json
{
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "createdAt": "2023-04-10T12:00:00Z",
    "updatedAt": "2023-04-10T12:00:00Z",
    "courses": [
      {
        "id": 1,
        "name": "Computer Science 2023"
      },
      ...
    ]
  }
}
```

**Status Codes**:
- `200 OK`: Profile retrieved successfully
- `401 Unauthorized`: Authentication required
- `500 Internal Server Error`: Server error

### Update User Profile

Update the profile information of the authenticated user.

- **URL**: `/api/user/profile`
- **Method**: `PUT`
- **Authentication**: Required

**Request Body**:
```json
{
  "username": "johndoe2",
  "email": "john.doe@example.com"
}
```

**Response**:
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": 1,
    "username": "johndoe2",
    "email": "john.doe@example.com",
    "updatedAt": "2023-04-10T13:00:00Z"
  }
}
```

**Status Codes**:
- `200 OK`: Profile updated successfully
- `400 Bad Request`: Invalid input or email/username already in use
- `401 Unauthorized`: Authentication required
- `500 Internal Server Error`: Server error

### Change Password

Change the password of the authenticated user.

- **URL**: `/api/user/change-password`
- **Method**: `POST`
- **Authentication**: Required

**Request Body**:
```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword"
}
```

**Response**:
```json
{
  "message": "Password changed successfully"
}
```

**Status Codes**:
- `200 OK`: Password changed successfully
- `400 Bad Request`: Missing fields or new password doesn't meet requirements
- `401 Unauthorized`: Authentication required or current password is incorrect
- `500 Internal Server Error`: Server error
