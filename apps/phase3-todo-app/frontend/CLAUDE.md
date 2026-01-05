# Frontend Implementation Guidance

## Technology Stack
- **Framework**: Next.js 15+ with App Router
- **Authentication**: Better Auth 1.0+
- **Language**: TypeScript 5+
- **React**: 18+

## Constitutional Requirements

### Next.js App Router
1. **Server Components**: Use Server Components as default
2. **Client Components**: Only use 'use client' when needed (forms, interactivity, hooks)
3. **File-based Routing**: Use app/ directory structure
4. **Middleware**: Protect routes with middleware.ts

### Authentication
1. **Better Auth**: Use Better Auth for JWT management
2. **Centralized API Client**: All API calls go through /lib/api.ts
3. **Automatic JWT Attachment**: API client auto-attaches JWT from Better Auth session
4. **401 Handling**: Redirect to /login on token expiration

### Security
- Never trust client-side user IDs
- Never bypass backend authorization
- All API calls must include JWT automatically
- Handle token expiration gracefully
- Redirect unauthenticated users to /login

## Project Structure
```
frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx       # Root layout with Better Auth provider
│   │   ├── page.tsx         # Landing page
│   │   ├── login/
│   │   │   └── page.tsx     # Login page
│   │   ├── register/
│   │   │   └── page.tsx     # Register page
│   │   └── todos/
│   │       └── page.tsx     # Todo dashboard (protected)
│   ├── components/
│   │   ├── TodoList.tsx
│   │   ├── TodoItem.tsx
│   │   ├── TodoForm.tsx
│   │   ├── TodoEditForm.tsx
│   │   └── Navbar.tsx
│   ├── lib/
│   │   ├── api.ts           # Centralized API client
│   │   ├── auth.ts          # Better Auth config
│   │   └── types.ts         # TypeScript types
│   └── middleware.ts        # Route protection
```

## Key Patterns

### Centralized API Client
```typescript
// lib/api.ts
import { getSession } from './auth';

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const session = await getSession();
  const token = session?.token;

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (response.status === 401) {
    // Token expired, redirect to login
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  return response;
}
```

### Protected Route Pattern
```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token');

  if (!token && request.nextUrl.pathname.startsWith('/todos')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/todos/:path*',
};
```

### Client Component Pattern
```typescript
'use client';

import { useState } from 'react';
import { apiRequest } from '@/lib/api';

export function TodoForm() {
  const [title, setTitle] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await apiRequest('/api/todos', {
      method: 'POST',
      body: JSON.stringify({ title }),
    });
    // Handle response...
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

## Running the Frontend
```bash
# Install dependencies
npm install

# Create .env.local from .env.example
cp .env.example .env.local

# Start development server
npm run dev
```

## Common Issues
- **JWT not attached**: Ensure using centralized API client from lib/api.ts
- **401 errors**: Check BETTER_AUTH_SECRET matches backend
- **CORS errors**: Verify backend CORS configuration includes http://localhost:3000
- **Protected routes accessible**: Check middleware.ts configuration
- **Build errors**: Ensure 'use client' directive on components using hooks
