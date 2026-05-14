import '../styles/globals.css';
import '@livekit/components-styles';
import '@livekit/components-styles/prefabs';
import type { Metadata, Viewport } from 'next';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: {
    default: 'FishMeet | Video conferencing',
    template: '%s',
  },
  description: 'FishMeet is a real-time video conferencing app for secure team meetings.',
  twitter: {
    card: 'summary_large_image',
  },
  openGraph: {
    url: 'https://fishmeet.top',
    images: [
      {
        url: 'https://fishmeet.top/images/fishmeet-open-graph.png',
        width: 2000,
        height: 1000,
        type: 'image/png',
      },
    ],
    siteName: 'FishMeet',
  },
  icons: {
    icon: {
      rel: 'icon',
      url: '/favicon.ico',
    },
    apple: [
      {
        rel: 'apple-touch-icon',
        url: '/images/fishmeet-apple-touch.png',
        sizes: '180x180',
      },
      { rel: 'mask-icon', url: '/images/fishmeet-safari-pinned-tab.svg', color: '#070707' },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: '#070707',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body data-lk-theme="default">
        <Toaster />
        {children}
      </body>
    </html>
  );
}
