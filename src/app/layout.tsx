import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'KORUS — The Performance Archive',
  description: 'The official centralized digital performance archive for the KORUS Music and Dance Society. Every Artist. Every Stage. Every Performance.',
  keywords: ['KORUS', 'Performance Archive', 'College Music Society', 'Dance Crew', 'Performances', 'Concerts', 'Festivals'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-zinc-950 text-zinc-100 min-h-screen flex flex-col antialiased selection:bg-purple-500/30 selection:text-purple-200">
        <Navbar />
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-8">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
