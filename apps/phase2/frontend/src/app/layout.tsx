/**
 * Root layout with global styles and Inter font.
 * Provides consistent typography across the application.
 */
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

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
      <body>{children}</body>
    </html>
  );
}
