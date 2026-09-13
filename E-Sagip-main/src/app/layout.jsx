import './globals.css';

export const metadata = {
  title: 'E-Sagip | Mobile Emergency App',
  description: 'Unified emergency dispatch console for Fire, Medical, and Police responders.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
