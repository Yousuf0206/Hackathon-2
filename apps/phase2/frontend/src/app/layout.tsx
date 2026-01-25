/**
 * Root layout with Better Auth provider and global styles.
 * T023: Root layout with Better Auth provider as constitutionally required.
 */
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from './auth-provider';

export const metadata: Metadata = {
  title: 'TaskFlow - Organize Your Tasks, Amplify Your Productivity',
  description: 'A modern, secure todo application built with FastAPI and Next.js. Organize your tasks efficiently with JWT authentication and a beautiful interface.',
};

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
