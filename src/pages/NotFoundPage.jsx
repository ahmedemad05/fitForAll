import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Navbar from '../components/Navbar';

export default function NotFoundPage() {
  return (
    <>
      <Helmet>
        <title>Page Not Found – FIT FOR ALL</title>
      </Helmet>
      <Navbar />
      <main
        id="main-content"
        style={{
          minHeight: 'calc(100vh - 72px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 20px',
          textAlign: 'center',
          background: 'var(--bg)',
          color: 'var(--text-1)',
        }}
      >
        <div style={{ fontSize: '72px', marginBottom: '16px', lineHeight: 1 }}>🏋️</div>
        <h1 style={{ fontSize: '80px', fontWeight: 800, color: 'var(--primary)', lineHeight: 1 }}>
          404
        </h1>
        <h2 style={{ fontSize: '24px', fontWeight: 700, margin: '16px 0 12px' }}>
          Page not found
        </h2>
        <p style={{ color: 'var(--text-2)', maxWidth: '360px', marginBottom: '32px', lineHeight: 1.6 }}>
          The page you are looking for does not exist or has been moved.
          Let&apos;s get you back on track.
        </p>
        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '13px 28px',
            background: 'var(--primary)',
            color: '#fff',
            borderRadius: 'var(--radius)',
            fontWeight: 700,
            fontSize: '15px',
            transition: 'background 0.25s',
          }}
        >
          ← Back to Home
        </Link>
      </main>
    </>
  );
}
