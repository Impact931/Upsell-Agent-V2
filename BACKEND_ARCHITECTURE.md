# Upsell Agent - Backend Architecture Documentation

## Overview

The Upsell Agent backend is a Next.js 14 application with TypeScript that provides AI-powered sales training material generation for spa, salon, and wellness businesses. The system processes product information through file uploads, extracts data using OCR and text parsing, and generates customized training materials using OpenAI's GPT models.

## Architecture Components

### 🏗️ Core Technologies

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5.2+
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT-based auth with bcryptjs
- **AI Integration**: OpenAI GPT-4 Turbo
- **File Processing**: Tesseract.js (OCR), pdf-parse, Sharp
- **Deployment**: Docker containers

### 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── upload/        # File upload handling
│   │   ├── process/       # AI processing pipeline
│   │   ├── training/      # Training material CRUD
│   │   └── health/        # System health checks
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── lib/                   # Core services and utilities
│   ├── auth.ts           # Authentication service
│   ├── database.ts       # Database connection & utilities
│   ├── errors.ts         # Error handling classes
│   ├── fileProcessor.ts  # File processing service
│   ├── logger.ts         # Logging service
│   ├── openai.ts         # OpenAI integration
│   └── validation.ts     # Request validation
├── types/                 # TypeScript type definitions
├── config/               # Configuration management
├── middleware.ts         # Request middleware
└── components/           # Reusable UI components
```

## 🔐 Authentication & Security

### JWT Authentication
- **Token Generation**: HS256 algorithm with configurable expiration
- **Password Hashing**: bcryptjs with 12 salt rounds
- **Role-Based Access**: Manager and Staff roles
- **Security Headers**: CSRF, XSS, and content security policies

### Middleware Security Features
- **Rate Limiting**: Configurable per-IP request limits
- **CORS Handling**: Environment-specific origin allowlists
- **Request Validation**: Zod schema validation
- **Security Headers**: Comprehensive security header injection

## 📊 Database Schema

### User Management
```sql
User {
  id: String (CUID)
  email: String (unique)
  password: String (hashed)
  businessName: String
  businessType: Enum (SPA, SALON, WELLNESS)
  role: Enum (MANAGER, STAFF)
  timestamps: createdAt, updatedAt
}
```

### Product Management
```sql
Product {
  id: String (CUID)
  userId: String (FK)
  name: String
  description: String
  price: Float
  category: String
  ingredients: String[]
  benefits: String[]
  targetAudience: String?
  imageUrl: String?
  timestamps: createdAt, updatedAt
}
```

### Training Materials
```sql
TrainingMaterial {
  id: String (CUID)
  productId: String (FK)
  userId: String (FK)
  title: String
  content: String
  type: Enum (SCRIPT, GUIDE, FAQ, OBJECTION_HANDLING)
  duration: Int (minutes)
  generatedAt: DateTime
  version: Int
  status: Enum (DRAFT, PUBLISHED, ARCHIVED)
  timestamps: createdAt, updatedAt
}
```

### Upload Sessions
```sql
UploadSession {
  id: String (CUID)
  userId: String (FK)
  filename: String
  fileType: Enum (PDF, IMAGE, TEXT)
  fileSize: Int
  status: Enum (UPLOADING, PROCESSING, COMPLETED, FAILED)
  extractedData: Json?
  errorMessage: String?
  timestamps: createdAt, updatedAt
}
```

## 🤖 AI Processing Pipeline

### File Processing Flow
1. **Upload Validation**: File type, size, and format validation
2. **Content Extraction**: OCR for images, text extraction for PDFs
3. **Data Parsing**: AI-powered product information extraction
4. **Quality Validation**: Text quality and confidence scoring
5. **Database Storage**: Session tracking and data persistence

### AI Generation Process
1. **Context Building**: Product data + business type + user preferences
2. **Prompt Engineering**: Type-specific system prompts
3. **Content Generation**: OpenAI API integration with error handling
4. **Post-Processing**: Formatting and compliance disclaimer injection
5. **Material Storage**: Versioned storage with metadata

### Supported Training Material Types
- **Sales Scripts**: Conversational upselling approaches
- **Product Guides**: Comprehensive product information
- **FAQ Responses**: Common customer questions and answers
- **Objection Handling**: Professional responses to customer concerns

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User authentication

### File Processing
- `POST /api/upload` - File upload and initial processing
- `POST /api/process` - Generate training materials from upload session

### Training Materials
- `GET /api/training` - List training materials (with filtering)
- `GET /api/training/[id]` - Get specific training material
- `PUT /api/training/[id]` - Update training material
- `DELETE /api/training/[id]` - Delete training material

### System
- `GET /api/health` - Comprehensive system health check

## ⚡ Performance Features

### File Processing Optimizations
- **Image Optimization**: Sharp-based image processing for better OCR
- **Concurrent Processing**: Parallel training material generation
- **Streaming Support**: Large file handling with progress tracking
- **Fallback Mechanisms**: Manual entry when OCR fails

### Database Optimizations
- **Connection Pooling**: Prisma connection management
- **Query Optimization**: Selective field loading
- **Transaction Support**: ACID compliance for critical operations
- **Health Monitoring**: Real-time database status checks

### Caching Strategy
- **In-Memory Rate Limiting**: Request throttling without external dependencies
- **OpenAI Response Caching**: Reduce API costs (future enhancement)
- **Static Asset Caching**: CDN-ready asset delivery

## 🚀 Deployment

### Docker Configuration
- **Multi-stage Builds**: Optimized production images
- **Health Checks**: Container health monitoring
- **Volume Management**: Persistent data and file storage
- **Security**: Non-root user execution

### Environment Management
- **Development**: Docker Compose with live reload
- **Production**: Optimized builds with security hardening
- **Configuration**: Environment-based feature flags

### Monitoring & Logging
- **Structured Logging**: Winston-based logging with multiple transports
- **API Metrics**: Request/response timing and error tracking
- **Health Monitoring**: Database, AI service, and file system checks
- **Security Events**: Authentication and rate limit violation tracking

## 🔧 Configuration

### Environment Variables
```bash
# Database
DATABASE_URL="postgresql://..."

# Authentication
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"

# OpenAI
OPENAI_API_KEY="sk-..."
OPENAI_MODEL="gpt-4-turbo-preview"

# File Processing
MAX_FILE_SIZE="10485760"  # 10MB
UPLOAD_PATH="/tmp/uploads"

# Security
RATE_LIMIT_MAX="100"
RATE_LIMIT_WINDOW="900000"  # 15 minutes
```

### Feature Flags
- File upload processing
- OCR text extraction
- AI content generation
- Rate limiting
- CORS handling
- Detailed logging

## 📋 Validation & Error Handling

### Request Validation
- **Zod Schemas**: Type-safe request validation
- **File Validation**: Size, type, and format checking
- **Business Rules**: Role-based access and ownership validation

### Error Management
- **Custom Error Classes**: Structured error handling
- **HTTP Status Mapping**: Appropriate response codes
- **Error Logging**: Comprehensive error tracking
- **User-Friendly Messages**: Client-appropriate error responses

## 🧪 Testing Strategy

### Unit Testing
- Service layer testing
- Validation schema testing
- Error handling verification

### Integration Testing
- API endpoint testing
- Database operation testing
- File processing pipeline testing

### Performance Testing
- Upload handling under load
- AI generation response times
- Database query performance

## 🔄 Development Workflow

### Local Development
```bash
# Setup
npm install
cp .env.example .env
# Configure environment variables

# Database
npx prisma migrate dev
npx prisma generate

# Development
npm run dev
```

### Docker Development
```bash
# Start services
docker-compose -f docker-compose.local.yml up

# Database migrations
docker-compose exec app npx prisma migrate deploy
```

## 📈 Scalability Considerations

### Current Architecture
- Single-instance deployment
- File system storage
- In-memory rate limiting
- Direct OpenAI API calls

### Future Enhancements
- Multi-instance deployment with Redis
- S3-compatible file storage
- CDN integration
- OpenAI response caching
- Database read replicas
- Background job processing

## 🛡️ Security Measures

### Data Protection
- Password hashing with bcryptjs
- JWT token security
- Environment variable protection
- Input sanitization

### API Security
- Rate limiting
- CORS configuration
- Security headers
- Request validation
- Authentication middleware

### File Security
- File type validation
- Size limitations
- Secure upload handling
- Temporary file cleanup

## 📚 API Documentation

Comprehensive API documentation is available through:
- OpenAPI/Swagger specifications (future enhancement)
- Postman collection templates
- Integration examples for frontend development

## 🎯 Next Steps for Frontend Integration

1. **API Client Setup**: Configure HTTP client with authentication
2. **File Upload Components**: Drag-and-drop upload interface
3. **Training Material Display**: Rich text rendering and editing
4. **User Authentication**: Login/register forms with state management
5. **Dashboard Layout**: Material management and progress tracking
6. **Mobile Responsiveness**: Touch-friendly interface for staff use

---

This backend architecture provides a solid foundation for the Upsell Agent platform, meeting all MVP requirements while maintaining scalability and security best practices.