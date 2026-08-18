# Architecture Documentation

## System Overview

XYZ AI School Assistant is a human-like AI-powered school management system designed for Indian schools. It provides conversational interfaces for students, parents, teachers, and principals to access attendance information, mark attendance, and request escalations.

## Technology Stack

### Frontend
- **Framework**: React 19 with Vite
- **Styling**: TailwindCSS 4
- **Icons**: Lucide React
- **Animations**: Motion
- **Language**: TypeScript

### Backend
- **Framework**: FastAPI
- **Database**: PostgreSQL (Render)
- **ORM**: SQLAlchemy 2.0 (async)
- **Migrations**: Alembic
- **Authentication**: JWT (python-jose)
- **Password Hashing**: bcrypt (passlib)
- **AI Integration**: OpenAI/Anthropic/Google Gemini

### Deployment
- **Frontend**: Vercel
- **Backend**: Render
- **Database**: Render PostgreSQL

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend (Vercel)                   │
│  React + TypeScript + TailwindCSS + Motion + Lucide Icons   │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                    FastAPI Backend (Render)                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  API Layer (FastAPI Routes)                           │  │
│  │  - /api/v1/auth (login, refresh, me)                  │  │
│  │  - /api/v1/chat (conversational AI)                   │  │
│  │  - /api/v1/attendance (attendance operations)         │  │
│  │  - /api/v1/escalations (escalation requests)          │  │
│  │  - /api/v1/health (health check)                      │  │
│  └──────────────────────────┬───────────────────────────┘  │
│                             │                                │
│  ┌──────────────────────────▼───────────────────────────┐  │
│  │  Business Logic Layer (Services)                       │  │
│  │  - AuthService (authentication)                        │  │
│  │  - AttendanceService (attendance logic)                │  │
│  │  - EscalationService (escalation logic)                │  │
│  │  - AuditService (audit logging)                        │  │
│  └──────────────────────────┬───────────────────────────┘  │
│                             │                                │
│  ┌──────────────────────────▼───────────────────────────┐  │
│  │  AI Layer (Orchestrator + Tools)                      │  │
│  │  - Intent Detection                                   │  │
│  │  - Entity Extraction                                   │  │
│  │  - Tool Execution (with authorization)                 │  │
│  │  - Response Generation                                 │  │
│  └──────────────────────────┬───────────────────────────┘  │
│                             │                                │
│  ┌──────────────────────────▼───────────────────────────┐  │
│  │  Data Access Layer (Repositories)                     │  │
│  │  - UserRepository                                     │  │
│  │  - StudentRepository                                  │  │
│  │  - ParentRepository                                   │  │
│  │  - TeacherRepository                                  │  │
│  │  - AttendanceRepository                               │  │
│  │  - ConversationRepository                             │  │
│  │  - EscalationRepository                               │  │
│  │  - AuditLogRepository                                  │  │
│  └──────────────────────────┬───────────────────────────┘  │
│                             │                                │
│  ┌──────────────────────────▼───────────────────────────┐  │
│  │  Security Layer                                       │  │
│  │  - JWT Authentication                                 │  │
│  │  - Role-Based Authorization                           │  │
│  │  - Resource Ownership Verification                    │  │
│  │  - Prompt Injection Protection                         │  │
│  └──────────────────────────┬───────────────────────────┘  │
└─────────────────────────────┼────────────────────────────────┘
                              │
┌─────────────────────────────▼────────────────────────────────┐
│                  PostgreSQL Database (Render)                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Tables                                               │  │
│  │  - users (authentication & profiles)                   │  │
│  │  - schools (school information)                       │  │
│  │  - students (student profiles)                        │  │
│  │  - parents (parent profiles)                           │  │
│  │  - teachers (teacher profiles)                         │  │
│  │  - student_parent_relationships (parent-child links)   │  │
│  │  - classes (class information)                         │  │
│  │  - attendance (attendance records)                     │  │
│  │  - conversations (chat sessions)                        │  │
│  │  - conversation_messages (message history)             │  │
│  │  - escalation_requests (escalation records)           │  │
│  │  - audit_logs (security audit trail)                  │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────▼────────────────────────────────┐
│                    AI Provider API                            │
│  OpenAI GPT-4o-mini / Anthropic Claude / Google Gemini       │
└─────────────────────────────────────────────────────────────┘
```

## Database Schema

### Users Table
- `id`: UUID (primary key)
- `email`: string (unique)
- `password_hash`: string
- `full_name`: string
- `role`: enum (STUDENT, PARENT, TEACHER, PRINCIPAL)
- `is_active`: boolean
- `created_at`: timestamp
- `updated_at`: timestamp

### Students Table
- `id`: UUID (primary key)
- `user_id`: UUID (foreign key → users)
- `school_id`: UUID (foreign key → schools)
- `roll_number`: string (unique)
- `date_of_birth`: date
- `enrollment_date`: date

### Parents Table
- `id`: UUID (primary key)
- `user_id`: UUID (foreign key → users)
- `phone_number`: string

### Teachers Table
- `id`: UUID (primary key)
- `user_id`: UUID (foreign key → users)
- `school_id`: UUID (foreign key → schools)
- `phone_number`: string
- `subject_specialization`: string

### StudentParentRelationships Table
- `id`: UUID (primary key)
- `student_id`: UUID (foreign key → students)
- `parent_id`: UUID (foreign key → parents)
- `relationship_type`: string (FATHER, MOTHER, GUARDIAN)

### Attendance Table
- `id`: UUID (primary key)
- `student_id`: UUID (foreign key → students)
- `class_id`: UUID (foreign key → classes)
- `date`: date
- `status`: enum (PRESENT, ABSENT, LATE, EXCUSED)
- `marked_by`: UUID (foreign key → users)
- `remarks`: string
- `created_at`: timestamp

### Conversations Table
- `id`: UUID (primary key)
- `user_id`: UUID (foreign key → users)
- `language`: string
- `created_at`: timestamp
- `updated_at`: timestamp

### ConversationMessages Table
- `id`: UUID (primary key)
- `conversation_id`: UUID (foreign key → conversations)
- `role`: enum (USER, ASSISTANT)
- `content`: text
- `intent`: string (detected intent)
- `entities`: JSON (extracted entities)
- `tool_used`: string (tool name if any)
- `created_at`: timestamp

### EscalationRequests Table
- `id`: UUID (primary key)
- `requested_by`: UUID (foreign key → users)
- `escalation_type`: enum (TEACHER, MANAGEMENT)
- `student_id`: UUID (foreign key → students, optional)
- `reason`: text
- `contact_number`: string
- `status`: enum (PENDING, IN_PROGRESS, RESOLVED, CLOSED)
- `created_at`: timestamp
- `resolved_at`: timestamp

### AuditLogs Table
- `id`: UUID (primary key)
- `user_id`: UUID (foreign key → users)
- `action`: enum (LOGIN, LOGOUT, ATTENDANCE_VIEW, ATTENDANCE_MARK, ESCALATION_CREATE, CHAT_SEND)
- `resource_type`: string
- `resource_id`: UUID
- `details`: JSON
- `ip_address`: string
- `user_agent`: string
- `created_at`: timestamp

## API Endpoints

### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Refresh access token
- `GET /api/v1/auth/me` - Get current user info

### Chat
- `POST /api/v1/chat` - Send message to AI assistant

### Attendance
- `GET /api/v1/attendance/me` - Get own attendance (student)
- `GET /api/v1/attendance/children/{student_id}` - Get child's attendance (parent)
- `GET /api/v1/attendance/students/{student_id}` - Get student's attendance (teacher/principal)
- `POST /api/v1/attendance/mark` - Mark attendance (teacher)
- `GET /api/v1/attendance/analytics` - Get school analytics (principal)

### Escalations
- `POST /api/v1/escalations/teacher` - Request teacher call (parent)
- `POST /api/v1/escalations/management` - Request management call (parent)

### Health
- `GET /api/v1/health` - Health check endpoint

## AI Tools

The AI assistant has access to controlled tools with role-based authorization:

### Student Tools
- `get_my_attendance` - Get own attendance percentage and details

### Parent Tools
- `get_linked_children` - Get list of linked children
- `get_child_attendance` - Get specific child's attendance
- `create_teacher_escalation` - Request teacher call
- `create_management_escalation` - Request management call

### Teacher Tools
- `mark_attendance` - Mark attendance for students
- `get_student_attendance` - Get student's attendance

### Principal Tools
- `get_school_analytics` - Get school-wide attendance analytics
- `get_student_attendance` - Get student's attendance

### All Roles
- `get_current_user` - Get current user information

## Security Architecture

### Authentication Flow
1. User sends credentials to `/api/v1/auth/login`
2. Server validates credentials against database
3. Server generates JWT access token
4. Client stores token and sends in Authorization header
5. Server validates token on each protected request

### Authorization Flow
1. User makes authenticated request
2. Server extracts user ID and role from JWT
3. Server checks if user has required role for endpoint
4. Server verifies resource ownership (if applicable)
5. Server checks relationship/scope (if applicable)
6. Request is processed or denied

### AI Tool Authorization
1. AI detects intent and extracts entities
2. AI selects appropriate tool
3. Tool handler performs independent authorization check
4. Tool verifies user role is allowed
5. Tool verifies resource ownership/relationship
6. Tool executes or denies

### Prompt Injection Protection
- System prompt is not exposed to AI
- Tools have fixed, controlled schemas
- No arbitrary SQL or shell execution
- No unrestricted HTTP access
- Role verification happens at tool level
- Resource ownership is always verified

## Multilingual Support

The system supports 11 Indian languages:
- English
- Hindi
- Tamil
- Telugu
- Marathi
- Bengali
- Gujarati
- Punjabi
- Kannada
- Malayalam
- Urdu

Language is detected from user selection or conversation context. The AI assistant responds in the detected language.

## Conversation Memory

Conversations are persisted in PostgreSQL:
- Each user has separate conversation sessions
- Messages include intent, entities, and tool usage
- Context is maintained within a conversation
- Previous context is referenced for follow-up questions
- No vector database required - PostgreSQL is sufficient

## Voice Integration

Voice flow:
1. User speaks (browser speech-to-text)
2. Text sent to backend API
3. AI processes and responds
4. Response sent to frontend
5. Text-to-speech plays response
6. Avatar animates based on state

Voice uses same authentication and authorization as chat.

## Avatar States

The avatar supports these states:
- **Idle**: Waiting for user input
- **Listening**: Processing speech input
- **Thinking**: AI is processing
- **Speaking**: Playing response
- **Error**: Something went wrong

## Error Handling

### Backend Errors
- Validation errors return 422 with details
- Authentication errors return 401
- Authorization errors return 403
- Not found errors return 404
- Server errors return 500 (generic in production)
- All errors include correlation ID

### Frontend Errors
- API errors are caught and displayed
- Network errors show connection message
- Timeout errors are handled gracefully
- User-friendly error messages

## Performance Considerations

### Database
- Async SQLAlchemy for non-blocking queries
- Connection pooling via asyncpg
- Indexes on frequently queried columns
- Query optimization for analytics

### API
- Async FastAPI for concurrent requests
- Rate limiting in production
- Response caching where appropriate
- Efficient JSON serialization

### Frontend
- Code splitting via Vite
- Lazy loading of components
- Optimized bundle size
- CDN for static assets (Vercel)

## Monitoring and Logging

### Backend
- Request logging with correlation IDs
- Process time tracking
- Error logging with context
- Audit trail for sensitive operations

### Frontend
- Error tracking in console
- API diagnostics panel
- Performance monitoring
- User feedback collection

## Deployment Architecture

### Production
- Frontend: Vercel (global CDN)
- Backend: Render (single region)
- Database: Render PostgreSQL (single region)
- AI Provider: External API (global)

### Development
- Frontend: Local Vite dev server
- Backend: Local uvicorn server
- Database: Local PostgreSQL or Render
- AI Provider: External API

## Scalability

### Horizontal Scaling
- Backend can be scaled horizontally on Render
- Frontend scales automatically on Vercel
- Database can be upgraded for more resources

### Vertical Scaling
- Upgrade Render plans for more CPU/RAM
- Upgrade PostgreSQL for more storage/performance
- Add read replicas for database

## Backup and Recovery

### Database
- Render automatic backups
- Manual backup capability
- Point-in-time recovery

### Code
- Git repository
- Tagged releases
- Rollback capability

## Future Enhancements

Potential future improvements:
- Redis for session caching
- Celery for background tasks
- Vector database for semantic search
- Real-time notifications (WebSocket)
- Mobile app (React Native)
- Advanced analytics dashboard
- Integration with school management systems
