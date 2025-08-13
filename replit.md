# StudyCore - AI Study Companion

## Overview

StudyCore is a comprehensive student study companion web application that combines AI-powered document analysis with interactive educational resources. The app processes PDF documents to extract study topics, generates quiz questions, integrates YouTube videos for visual learning, and provides access to PhET simulations for hands-on practice. Built with a modern tech stack, it features a futuristic dark/light theme interface designed for optimal study experiences.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**React SPA with TypeScript**: The client is built as a single-page application using React 18+ with TypeScript for type safety. The application uses Wouter for lightweight routing instead of React Router.

**Component Structure**: Follows a modular component architecture with:
- UI components built with Radix UI primitives and shadcn/ui design system
- Custom StudyCore-branded components for consistent theming
- Separation of concerns between layout, pages, and feature-specific components

**State Management**: Uses TanStack Query (React Query) for server state management, providing caching, background updates, and optimistic updates. No global client state management library is used, keeping state local to components.

**Styling Solution**: Tailwind CSS with custom CSS variables for theme management. Supports dynamic dark/light mode switching with custom StudyCore branding (neon cyan accents, Orbitron/Poppins fonts, sharp geometric design).

### Backend Architecture

**Express.js REST API**: Node.js backend with Express.js serving RESTful endpoints. Uses TypeScript for type safety across the full stack with shared schema definitions.

**File Upload Handling**: Multer middleware for PDF file uploads with validation and size limits. Uploaded files are processed server-side for text extraction.

**Document Processing Pipeline**: 
- PDF text extraction using pdf-parse library
- AI-powered topic extraction and question generation
- Integration with YouTube API for relevant video discovery
- PhET simulation matching based on topic keywords

### Data Storage Solutions

**PostgreSQL with Drizzle ORM**: Uses PostgreSQL as the primary database with Drizzle ORM for type-safe database operations. Schema includes:
- Documents table for uploaded PDFs and processing status
- Topics table for extracted study topics with summaries
- Questions table for generated quiz questions (MCQ and short answer)
- YouTube videos and PhET simulations linked to topics
- User progress tracking and chat sessions

**Neon Database Integration**: Configured for Neon serverless PostgreSQL with connection pooling via @neondatabase/serverless.

### Authentication and Authorization

**Session-based Authentication**: Uses connect-pg-simple for PostgreSQL session storage. Sessions are managed server-side with secure cookie configuration.

**No Complex Auth System**: Currently implements basic session management without OAuth or complex user management systems, keeping the focus on study features.

### External Dependencies

**YouTube Data API v3**: Integrated for searching and embedding educational videos related to study topics. Uses API key authentication for accessing YouTube's search and video metadata.

**PhET Interactive Simulations**: Client-side integration with University of Colorado's PhET simulations. Pre-configured simulation library with keyword matching to automatically suggest relevant simulations for physics, chemistry, and math topics.

**PDF Processing**: Server-side PDF text extraction using pdf-parse library with fallback OCR capabilities mentioned for image-heavy documents.

**OpenAI Integration**: Prepared infrastructure for AI-powered features like topic extraction, question generation, and chat functionality (API integration endpoints configured but implementation varies by feature).

**Development Tools**: 
- Vite for fast development and building
- Replit-specific plugins for development environment integration
- ESBuild for production server bundling

**UI Framework Dependencies**:
- Radix UI for accessible component primitives
- Class Variance Authority for component variant management
- Tailwind CSS for utility-first styling
- Lucide React for consistent iconography