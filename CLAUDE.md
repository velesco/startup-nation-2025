# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands
- Backend: `cd backend && npm run dev` - Start backend development server
- Frontend: `cd frontend && npm run dev` - Start frontend development server
- Backend Test: `cd backend && npm test` - Run backend tests
- Frontend Test: `cd frontend && npm test` - Run frontend tests
- Backend DB Backup: `cd backend && npm run backup` - Backup database

## Code Style Guidelines
- Frontend: React functional components with hooks
- Backend: Express.js API using MVC architecture
- Naming: camelCase variables/functions, PascalCase components/classes
- Error handling: Use middleware in backend, try/catch blocks with proper error responses
- API client: Use centralized Axios service in frontend
- Authentication: JWT with refresh token pattern
- Components: Follow feature-based organization
- State management: React Context API (see AuthContext.js)
- Validation: Formik+Yup for frontend, express-validator for backend
- No specific linting tools beyond CRA defaults