# XYZ AI — Backend API Contract Specification

This document details the complete REST API contract for connecting the **XYZ AI Frontend** to a Python backend (FastAPI / Flask) deployed on Render, Railway, or local development servers.

---

## 1. Global Architecture & Protocols

- **Base URL Configuration**: Configurable via `VITE_API_BASE_URL` environment variable (defaults to relative `/api`).
- **Transport**: HTTPS / JSON (or `multipart/form-data` for audio).
- **Authentication**: JWT Bearer Token (`Authorization: Bearer <token>`).
- **Standard Success Response**:
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional operational note"
}
```
- **Standard Error Response**:
```json
{
  "success": false,
  "error": "Human-readable error description",
  "code": "ERROR_CODE_STRING",
  "details": { ... }
}
```

---

## 2. API Endpoints Specification

### 2.1 Authentication & Profile

#### `POST /api/auth/login`
Authenticate user with school credentials.
- **Request Body**:
```json
{
  "identifier": "STU2026042",
  "password": "user_password",
  "roleHint": "student"
}
```
- **Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "usr_99182",
      "name": "Rahul Sharma",
      "email": "rahul@school.edu",
      "role": "student",
      "identifier": "STU2026042",
      "schoolName": "Greenwood International School"
    },
    "expiresIn": 86400
  }
}
```

#### `GET /api/auth/me`
Retrieve authenticated user profile based on bearer token.
- **Headers**: `Authorization: Bearer <token>`
- **Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "id": "usr_99182",
    "name": "Rahul Sharma",
    "role": "student",
    "identifier": "STU2026042",
    "schoolName": "Greenwood International School"
  }
}
```

---

### 2.2 Conversations & AI Agent Chat

#### `POST /api/chat`
Send user prompt to AI orchestration layer.
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
```json
{
  "message": "What is my attendance?",
  "conversation_id": "conv_4812a",
  "language": "en",
  "role_hint": "student",
  "client_timestamp": "2026-08-18T03:45:00Z"
}
```
- **Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "conversation_id": "conv_4812a",
    "message": "Your overall attendance for the current term is 91.2% (155 present out of 170 working days).",
    "action_required": null,
    "escalation_offered": null,
    "suggested_follow_ups": [
      "Show my monthly breakdown",
      "Show recent absences"
    ]
  }
}
```

- **Response with Teacher Action Card**:
```json
{
  "success": true,
  "data": {
    "conversation_id": "conv_4812a",
    "message": "I have prepared the attendance update for Rahul Sharma.",
    "action_required": {
      "actionType": "mark_attendance",
      "title": "Confirm Student Absence",
      "description": "Please confirm marking Rahul Sharma as absent for today.",
      "payload": {
        "studentId": "STU2026042",
        "studentName": "Rahul Sharma",
        "classId": "10A",
        "date": "2026-08-18",
        "status": "absent"
      },
      "confirmLabel": "Confirm Absent",
      "cancelLabel": "Cancel"
    }
  }
}
```

- **Response with Parent Escalation Card**:
```json
{
  "success": true,
  "data": {
    "conversation_id": "conv_4812a",
    "message": "Would you like to schedule a callback with Rahul's class teacher?",
    "escalation_offered": {
      "targetRole": "teacher",
      "teacherName": "Mrs. Anjali Rao",
      "teacherId": "TCH8801",
      "studentName": "Rahul Sharma",
      "reason": "Attendance inquiry"
    }
  }
}
```

#### `GET /api/conversations`
List previous conversations.
- **Response (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "id": "conv_4812a",
      "title": "Term Attendance Inquiry",
      "lastMessage": "Your overall attendance is 91.2%",
      "updatedAt": "2026-08-18T03:45:00Z",
      "messageCount": 4
    }
  ]
}
```

#### `GET /api/conversations/{conversation_id}`
Get message transcript for a specific conversation.

#### `DELETE /api/conversations/{conversation_id}`
Delete a conversation thread.

---

### 2.3 Attendance Operations

#### `GET /api/attendance/me` (Student)
- **Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "studentId": "STU2026042",
    "studentName": "Rahul Sharma",
    "attendancePercentage": 91.2,
    "presentDays": 155,
    "absentDays": 15,
    "workingDays": 170,
    "periodStart": "2026-01-05",
    "periodEnd": "2026-08-17",
    "recentLogs": [
      { "date": "2026-08-17", "status": "present" },
      { "date": "2026-08-14", "status": "absent", "remarks": "Medical leave" }
    ]
  }
}
```

#### `GET /api/attendance/child/{child_id}` (Parent)
- **Response (200 OK)**: Same schema as `/api/attendance/me`.

#### `POST /api/attendance/mark` (Teacher)
Execute attendance mutation.
- **Request Body**:
```json
{
  "studentId": "STU2026042",
  "studentName": "Rahul Sharma",
  "classId": "10A",
  "date": "2026-08-18",
  "status": "absent",
  "remarks": "Marked via AI Assistant"
}
```
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Attendance record updated successfully.",
  "transactionId": "txn_88192"
}
```

#### `GET /api/attendance/analytics` (Principal / Management)
- **Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "overallPercentage": 94.6,
    "totalEnrolled": 1240,
    "todayPresent": 1173,
    "todayAbsent": 67,
    "date": "2026-08-18",
    "classBreakdown": [
      {
        "classId": "10A",
        "className": "Grade 10-A",
        "totalStudents": 40,
        "presentCount": 38,
        "absentCount": 2,
        "attendancePercentage": 95.0
      }
    ]
  }
}
```

---

### 2.4 Human Escalation

#### `POST /api/support/call-request`
- **Request Body**:
```json
{
  "teacherId": "TCH8801",
  "studentId": "STU2026042",
  "reason": "Discuss attendance history",
  "contactNumber": "+91 98765 43210"
}
```
- **Response (200 OK)**:
```json
{
  "success": true,
  "requestId": "req_call_9918",
  "status": "submitted",
  "message": "Teacher callback request registered."
}
```

---

### 2.5 Voice Processing

#### `POST /api/voice/transcribe`
- **Content-Type**: `multipart/form-data`
- **Form Field**: `audio` (webm/mp3 blob)
- **Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "text": "What is my attendance?",
    "detectedLanguage": "en",
    "confidence": 0.98
  }
}
```

#### `POST /api/voice/synthesize`
- **Request Body**:
```json
{
  "text": "Rahul has 91.2% attendance.",
  "language": "en",
  "voiceGender": "female"
}
```
- **Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "audioUrl": "https://cdn.xyzai.school/audio/stream_8819.mp3",
    "durationSeconds": 3.2
  }
}
```

---

### 2.6 Health Check

#### `GET /api/health`
- **Response (200 OK)**:
```json
{
  "status": "healthy",
  "timestamp": "2026-08-18T03:45:00Z",
  "version": "1.0.0",
  "database": "connected"
}
```
