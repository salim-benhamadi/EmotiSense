import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '../contexts/AuthContext.js';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'EmotiSense AI - Emotional Awareness for Neurodivergent Minds',
  description: 'A supportive platform helping neurodivergent individuals, particularly those with alexithymia, develop greater emotional awareness and understanding.',
  keywords: 'alexithymia, neurodivergent, emotional awareness, autism, ADHD, emotion recognition',
  authors: [{ name: 'EmotiSense AI Team' }],
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full antialiased`}>
        <AuthProvider>
          <div className="min-h-full bg-neutral-50">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}