# Task ID: 13

**Title:** Implement Authentication System with NextAuth and Single-User Mode

**Status:** done

**Dependencies:** 12 ✓

**Priority:** high

**Description:** Set up NextAuth with Google OAuth provider, email/password fallback using bcrypt, JWT session management, and implement single-user mode bypass option as specified in the PRD.

**Details:**

1. Install NextAuth dependencies:
   ```bash
   npm install next-auth @next-auth/prisma-adapter
   npm install bcryptjs @types/bcryptjs
   ```

2. Create NextAuth configuration (src/app/api/auth/[...nextauth]/route.ts):
   ```typescript
   import NextAuth from 'next-auth';
   import GoogleProvider from 'next-auth/providers/google';
   import CredentialsProvider from 'next-auth/providers/credentials';
   import { PrismaAdapter } from '@next-auth/prisma-adapter';
   import { prisma } from '@/lib/prisma';
   import bcrypt from 'bcryptjs';

   export const authOptions = {
     adapter: PrismaAdapter(prisma),
     providers: [
       GoogleProvider({
         clientId: process.env.GOOGLE_CLIENT_ID!,
         clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
       }),
       CredentialsProvider({
         name: 'Credentials',
         credentials: {
           email: { label: 'Email', type: 'email' },
           password: { label: 'Password', type: 'password' }
         },
         async authorize(credentials) {
           if (!credentials?.email || !credentials?.password) return null;
           const user = await prisma.user.findUnique({
             where: { email: credentials.email }
           });
           if (!user || !user.password) return null;
           const isValid = await bcrypt.compare(credentials.password, user.password);
           return isValid ? user : null;
         }
       })
     ],
     session: {
       strategy: 'jwt',
       maxAge: 30 * 24 * 60 * 60, // 30 days
     },
     pages: {
       signIn: '/auth/signin',
     },
     callbacks: {
       async jwt({ token, user }) {
         if (user) token.id = user.id;
         return token;
       },
       async session({ session, token }) {
         if (session.user) session.user.id = token.id;
         return session;
       }
     }
   };
   ```

3. Create single-user mode middleware (src/middleware.ts):
   ```typescript
   import { NextResponse } from 'next/server';
   import type { NextRequest } from 'next/server';

   export function middleware(request: NextRequest) {
     if (process.env.SINGLE_USER_MODE === 'true') {
       // Bypass auth, inject default user
       return NextResponse.next();
     }
     // Normal auth flow
   }
   ```

4. Implement rate limiting with Redis for login attempts
5. Create auth UI components (SignIn, SignUp pages)
6. Add CSRF protection middleware
7. Set up password hashing utilities

**Test Strategy:**

1. Test Google OAuth flow in development
2. Verify email/password registration and login
3. Confirm JWT tokens are generated and validated
4. Test session persistence across page reloads
5. Validate rate limiting (5 attempts per 15 min)
6. Test single-user mode bypasses auth correctly
7. Verify CSRF protection blocks invalid requests
8. Test password hashing (bcrypt rounds = 10)
9. Confirm 30-day session expiration works

## Subtasks

### 13.1. Configure NextAuth with Google OAuth and Credentials Provider

**Status:** done  
**Dependencies:** None  

Set up NextAuth core configuration with Google OAuth integration and email/password authentication fallback

**Details:**

Install next-auth and required dependencies. Create [...nextauth]/route.ts file with GoogleProvider and CredentialsProvider. Configure environment variables for Google client ID/secret. Implement bcrypt password verification in authorize callback. Set up Prisma adapter for database connection.

### 13.2. Implement Security Features (JWT, CSRF, Rate Limiting)

**Status:** done  
**Dependencies:** 13.1  

Add security layers including JWT token management, CSRF protection, and Redis-based rate limiting for authentication endpoints

**Details:**

Configure JWT session strategy with proper expiration. Implement CSRF token generation/validation middleware. Set up Redis client for rate limiting. Create login attempt tracking with 5 attempts per 15 minutes limit. Add secure cookie settings and HTTPS enforcement in production.

### 13.3. Develop Single-User Mode Bypass Logic

**Status:** done  
**Dependencies:** 13.1  

Implement and isolate single-user authentication bypass mechanism for development and special access scenarios

**Details:**

Create middleware to detect SINGLE_USER_MODE environment variable. Implement secure user injection without authentication flow. Add safeguards to prevent accidental production deployment. Configure default user credentials securely. Ensure bypass logic is completely disabled in production environments.

### 13.4. Configure Session Management Strategy

**Status:** done  
**Dependencies:** 13.1, 13.2  

Implement robust session handling with JWT token management, session persistence, and token refresh mechanisms

**Details:**

Set up JWT callbacks for token augmentation with user ID. Configure session callback to attach user data. Implement session expiration and renewal logic. Create token refresh endpoint. Add session invalidation on password change. Configure maxAge and updateAge parameters for security.

### 13.5. Build Authentication UI Components

**Status:** done  
**Dependencies:** 13.1  

Create responsive sign-in, sign-up, and password management interfaces with proper error handling and user feedback

**Details:**

Develop /auth/signin page with Google and email/password options. Create registration form with validation. Implement password reset flow. Add error messaging for failed attempts. Design responsive layouts for all device sizes. Integrate with NextAuth client-side session management. Include loading states and accessibility features.
