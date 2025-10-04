'use client';

import { Metadata } from 'next';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: 'TempoTrackers',
  description: 'Air Quality Forecasting powered by NASA TEMPO',
  viewport: 'width=device-width, initial-scale=1.0',
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
