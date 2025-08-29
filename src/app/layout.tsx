import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'Upsell Agent - AI Sales Training Platform',
  description: 'AI-powered sales training platform for spa and salon businesses. Generate customized training materials in minutes.',
  keywords: 'spa, salon, wellness, sales training, ai, upselling',
  authors: [{ name: 'Impact931 Team' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'noindex, nofollow', // Remove in production
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <AuthProvider>
          <div className="min-h-screen">
            <main>{children}</main>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'var(--white)',
                  color: 'var(--neutral-800)',
                  border: '1px solid var(--neutral-200)',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-lg)',
                },
                success: {
                  style: {
                    borderLeft: '4px solid var(--success)',
                  },
                },
                error: {
                  style: {
                    borderLeft: '4px solid var(--error)',
                  },
                },
              }}
            />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}