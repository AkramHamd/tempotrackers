import { Metadata, Viewport } from 'next';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: 'TempoTrackers',
  description: 'Air Quality Forecasting powered by NASA TEMPO',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1.0,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}