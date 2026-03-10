import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Shell from '@/components/Shell';
import InteractiveBackground from '@/components/InteractiveBackground';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'GuidedBarakah Dashboard',
  description: 'A local-first GuidedBarakah workspace for today, growth, funnel visibility, and operations.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => {
              try {
                const saved = localStorage.getItem('gb-theme');
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                const mode = saved === 'light' || saved === 'dark' ? saved : (prefersDark ? 'dark' : 'light');
                document.documentElement.setAttribute('data-theme', mode);
              } catch {
                document.documentElement.setAttribute('data-theme', 'light');
              }
            })();`,
          }}
        />
        <InteractiveBackground />
        <div className="relative z-10">
          <Shell>{children}</Shell>
        </div>
      </body>
    </html>
  );
}
