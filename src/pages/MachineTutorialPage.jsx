import React, { useState, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../css/style.css';
import '../css/machine-tutorial.css';

/**
 * MachineTutorialPage — Interface only.
 *
 * This page builds the complete UI for the planned AI-powered 3D gym machine
 * tutorial feature. No AI calls are made; no images are uploaded anywhere.
 * All processing is client-side preview only.
 *
 * Service interface stub: see services/machineTutorialService.js
 * Viewer placeholder: see components/MachineViewer3D.jsx
 */

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE_MB = 10;

const HOW_IT_WILL_WORK = [
  { step: '01', icon: '📷', title: 'Photograph the Machine', text: 'Take a photo or upload an image of any gym machine from any angle.' },
  { step: '02', icon: '🤖', title: 'AI Identifies the Machine', text: 'Our AI analyses the image and identifies the machine type, model, and key controls.' },
  { step: '03', icon: '🖥️', title: '3D Model Generated', text: 'A detailed 3D model of the machine is loaded or generated for interactive inspection.' },
  { step: '04', icon: '🎓', title: 'Step-by-Step Tutorial', text: 'Get a personalised tutorial: seat setup, grip, weight selection, range of motion, muscles targeted, and common mistakes.' },
];

export default function MachineTutorialPage() {
  const [preview, setPreview]     = useState(null);  // { url, name, size }
  const [fileError, setFileError] = useState('');
  const [notifyEnabled, setNotifyEnabled] = useState(() => {
    try { return localStorage.getItem('fit_notify_machine') === 'true'; } catch { return false; }
  });

  const fileInputRef   = useRef(null);
  const cameraInputRef = useRef(null);
  const dropZoneRef    = useRef(null);

  const validateAndPreview = (file) => {
    setFileError('');
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setFileError('Invalid file type. Please upload a JPEG, PNG, or WebP image.');
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setFileError(`File is too large. Maximum size is ${MAX_SIZE_MB} MB.`);
      return;
    }

    const url = URL.createObjectURL(file);
    setPreview({ url, name: file.name, size: (file.size / 1024).toFixed(1) });
  };

  const handleFileChange = (e) => {
    validateAndPreview(e.target.files?.[0]);
    e.target.value = ''; // reset so the same file can be re-selected
  };

  const handleRemove = () => {
    if (preview) URL.revokeObjectURL(preview.url);
    setPreview(null);
    setFileError('');
  };

  // Drag-and-drop
  const handleDragOver = (e) => {
    e.preventDefault();
    dropZoneRef.current?.classList.add('drag-over');
  };
  const handleDragLeave = () => {
    dropZoneRef.current?.classList.remove('drag-over');
  };
  const handleDrop = (e) => {
    e.preventDefault();
    dropZoneRef.current?.classList.remove('drag-over');
    validateAndPreview(e.dataTransfer.files?.[0]);
  };

  const toggleNotify = () => {
    const next = !notifyEnabled;
    setNotifyEnabled(next);
    try { localStorage.setItem('fit_notify_machine', String(next)); } catch {}
  };

  return (
    <>
      <Helmet>
        <title>3D Machine Tutorial – FIT FOR ALL</title>
        <meta name="description" content="AI-powered 3D gym machine tutorials — coming soon. Upload a photo of any gym machine and get a personalised step-by-step guide." />
      </Helmet>

      <Navbar />

      <main id="main-content" className="machine-tutorial-page">
        {/* Header */}
        <section className="mt-header">
          <div className="mt-header-inner">
            <span className="mt-eyebrow">COMING SOON</span>
            <h1>
              AI-Powered 3D<br />
              <span>Gym Machine Tutorials</span>
            </h1>
            <p>
              Photograph any gym machine — AI will identify it, generate a
              3D model, and walk you through setup, safe operation, and common mistakes.
            </p>
            <div className="mt-coming-badge">
              🚧 This feature is planned for a future release. The interface below is a preview.
            </div>
          </div>
        </section>

        {/* Upload section */}
        <section className="mt-upload-section" aria-labelledby="upload-heading">
          <div className="mt-card">
            <h2 id="upload-heading">Try the interface (preview only)</h2>
            <p className="mt-card-desc">
              Select or drag an image of a gym machine. Your image stays in your browser —
              it is not uploaded anywhere until the AI feature launches.
            </p>

            {!preview ? (
              <div
                ref={dropZoneRef}
                className="mt-dropzone"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                role="button"
                tabIndex={0}
                aria-label="Drop zone: drag and drop an image here or click to upload"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click();
                }}
              >
                <div className="mt-dropzone-icon">🏋️</div>
                <p>Drag & drop a machine photo here, or</p>
                <div className="mt-upload-btns">
                  <button
                    className="mt-btn-primary"
                    onClick={() => fileInputRef.current?.click()}
                    type="button"
                  >
                    ↑ Upload Image
                  </button>
                  <button
                    className="mt-btn-secondary"
                    onClick={() => cameraInputRef.current?.click()}
                    type="button"
                  >
                    📷 Take Photo
                  </button>
                </div>
                <p className="mt-file-hint">JPEG, PNG, or WebP — max {MAX_SIZE_MB} MB</p>
              </div>
            ) : (
              <div className="mt-preview-area">
                <div className="mt-preview-image-wrap">
                  <img
                    src={preview.url}
                    alt={`Preview of ${preview.name}`}
                    className="mt-preview-image"
                  />
                </div>
                <div className="mt-preview-info">
                  <p><strong>{preview.name}</strong> ({preview.size} KB)</p>
                  <div className="mt-preview-actions">
                    <button
                      className="mt-btn-secondary"
                      onClick={() => fileInputRef.current?.click()}
                      type="button"
                    >
                      Replace Image
                    </button>
                    <button
                      className="mt-btn-danger"
                      onClick={handleRemove}
                      type="button"
                    >
                      Remove
                    </button>
                  </div>
                </div>

                {/* Placeholder viewer */}
                <MachineViewer3DPlaceholder />

                <div className="mt-coming-note">
                  <strong>🚧 AI analysis is not yet available.</strong><br />
                  When launched, our AI will identify this machine and generate an interactive
                  3D tutorial in seconds.
                </div>
              </div>
            )}

            {fileError && (
              <div className="mt-file-error" role="alert">{fileError}</div>
            )}

            {/* Hidden file inputs */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              hidden
              onChange={handleFileChange}
              aria-hidden="true"
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              hidden
              onChange={handleFileChange}
              aria-hidden="true"
            />
          </div>
        </section>

        {/* How it will work */}
        <section className="mt-how-section" aria-labelledby="how-heading">
          <div className="mt-section-header">
            <span className="mt-eyebrow">HOW IT WILL WORK</span>
            <h2 id="how-heading">Four steps to safer, smarter training</h2>
          </div>
          <div className="mt-steps-grid">
            {HOW_IT_WILL_WORK.map((step) => (
              <div key={step.step} className="mt-step-card">
                <div className="mt-step-number">{step.step}</div>
                <div className="mt-step-icon">{step.icon}</div>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Notify me */}
        <section className="mt-notify-section" aria-labelledby="notify-heading">
          <div className="mt-notify-card">
            <h2 id="notify-heading">Get notified when it launches</h2>
            <p>Save your interest and we will remind you when the 3D tutorial feature goes live.</p>
            <div className="mt-notify-toggle">
              <button
                onClick={toggleNotify}
                className={`mt-toggle-btn ${notifyEnabled ? 'active' : ''}`}
                aria-pressed={notifyEnabled}
                aria-label={notifyEnabled ? 'Turn off notifications' : 'Turn on notifications'}
              >
                <span className="mt-toggle-track">
                  <span className="mt-toggle-thumb" />
                </span>
                {notifyEnabled ? 'Notifications on 🔔' : 'Notify me when available'}
              </button>
              {notifyEnabled && (
                <p className="mt-notify-saved">
                  ✓ Your preference is saved locally. We will use it to notify you when the feature launches.
                </p>
              )}
            </div>
          </div>
        </section>

        <div style={{ textAlign: 'center', padding: '20px 0 40px' }}>
          <Link to="/profile" className="primary-btn">← Back to Dashboard</Link>
        </div>
      </main>

      <Footer />
    </>
  );
}

/**
 * MachineViewer3D — Placeholder component.
 *
 * When the real AI service is ready, replace this with:
 *   import MachineViewer3D from '../components/MachineViewer3D';
 *
 * The service interface contract is documented in:
 *   src/services/machineTutorialService.js
 */
function MachineViewer3DPlaceholder() {
  return (
    <div className="mt-viewer-placeholder" aria-label="3D viewer placeholder (not yet available)">
      <div className="mt-viewer-inner">
        <div className="mt-viewer-icon">🖥️</div>
        <p><strong>Interactive 3D Viewer</strong></p>
        <p>The 3D model will appear here once the AI has identified your machine.</p>
        <span className="mt-viewer-badge">Coming Soon</span>
      </div>
    </div>
  );
}
