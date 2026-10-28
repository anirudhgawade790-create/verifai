'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

type Institution = { id: string; name: string; type: string; state: string };

const STEP_LABELS = [
  'Institution Info',
  'Programme Details',
  'Document Upload',
  'Review',
  'Submit',
];

export default function NewApplication() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    institutionId: '',
    institutionName: '',
    programme: '',
    category: '',
    file: null as File | null,
  });
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [session, setSession] = useState({ id: '', role: '' });
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/institutions')
      .then((r) => r.ok ? r.json() : { institutions: [] })
      .then((d) => setInstitutions(d.institutions || []));
    fetch('/api/auth/session')
      .then((r) => r.ok ? r.json() : { id: '', role: '' })
      .then((d) => setSession({ id: d.id || d.user?.id || '', role: d.role || d.user?.role || '' }));
  }, []);

  function handleFileSelect(file: File) {
    setForm((f) => ({ ...f, file }));
    setUploading(true);
    setUploadProgress(0);
    const timer = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setUploading(false);
          return 100;
        }
        return prev + 5;
      });
    }, 50);
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          institutionName: form.institutionName,
          institutionId: form.institutionId,
          programme: form.programme,
          category: form.category,
          ownerId: session.id,
        }),
      });
      if (res.status === 201) {
        setDone(true);
      } else {
        const text = await res.text();
        setError(text);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  }

  const step1Valid = form.institutionId !== '';
  const step2Valid = form.programme.trim() !== '' && form.category.trim() !== '';
  const step3Valid = form.file !== null;

  function canAdvance() {
    if (step === 1) return step1Valid;
    if (step === 2) return step2Valid;
    if (step === 3) return step3Valid;
    return true;
  }

  if (done) {
    return (
      <>
        <div className="page-heading">
          <div>
            <div className="breadcrumb">APPLICATIONS / NEW</div>
            <h1>New Application</h1>
          </div>
        </div>
        <div className="panel" style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>✓</div>
          <h2 style={{ marginBottom: 8 }}>Application submitted successfully</h2>
          <p style={{ marginBottom: 24 }}>Your application has been created and is now under review.</p>
          <Link href="/applications" className="primary compact">Back to applications</Link>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="page-heading">
        <div>
          <div className="breadcrumb">APPLICATIONS / NEW</div>
          <h1>New Application</h1>
        </div>
      </div>

      <div className="step-nav">
        {STEP_LABELS.map((label, i) => {
          const n = i + 1;
          let cls = '';
          if (step === n) cls = 'active';
          else if (step > n) cls = 'done';
          return (
            <div className={`step ${cls}`} key={n}>
              <span className="step-num">{step > n ? '✓' : n}</span>
              {label}
            </div>
          );
        })}
      </div>

      <section className="panel" style={{ marginTop: 16 }}>
        {step === 1 && (
          <div>
            <h2 style={{ marginBottom: 16 }}>Institution Information</h2>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
              Select Institution
            </label>
            <select
              value={form.institutionId}
              onChange={(e) => {
                const inst = institutions.find((i) => i.id === e.target.value);
                setForm((f) => ({
                  ...f,
                  institutionId: e.target.value,
                  institutionName: inst?.name || '',
                }));
              }}
              className="form-field"
              style={{ marginBottom: 12 }}
            >
              <option value="">— Select an institution —</option>
              {institutions.map((i) => (
                <option key={i.id} value={i.id}>{i.name}</option>
              ))}
            </select>
            {form.institutionName && (
              <p style={{ color: '#555' }}>Selected: <strong>{form.institutionName}</strong></p>
            )}
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 style={{ marginBottom: 16 }}>Programme Details</h2>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Programme</label>
            <input
              value={form.programme}
              onChange={(e) => setForm((f) => ({ ...f, programme: e.target.value }))}
              placeholder="e.g. B.Tech Computer Science"
              className="form-field"
              style={{ marginBottom: 16 }}
              required
            />
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Category</label>
            <input
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              placeholder="e.g. Engineering"
              className="form-field"
            />
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 style={{ marginBottom: 16 }}>Document Upload</h2>
            <div
              className={`upload-area${dragOver ? ' drag-over' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                const file = e.dataTransfer.files[0];
                if (file) handleFileSelect(file);
              }}
            >
              <p>Drag &amp; drop your document here</p>
              <p style={{ margin: '8px 0' }}>or</p>
              <button
                type="button"
                className="secondary"
                onClick={() => fileInputRef.current?.click()}
              >
                Browse files
              </button>
              <input
                ref={fileInputRef}
                type="file"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelect(file);
                }}
              />
            </div>
            {(uploading || uploadProgress > 0) && (
              <div className="progress-bar" style={{ marginTop: 12 }}>
                <div className="progress-fill" style={{ width: uploadProgress + '%' }} />
              </div>
            )}
            {form.file && !uploading && (
              <p style={{ marginTop: 8, color: '#2fa17d' }}>✓ {form.file.name} uploaded</p>
            )}
          </div>
        )}

        {step === 4 && (
          <div>
            <h2 style={{ marginBottom: 16 }}>Review</h2>
            <div className="panel" style={{ background: '#f8f9fb' }}>
              <dl className="facts">
                <div><dt>Institution</dt><dd>{form.institutionName || '—'}</dd></div>
                <div><dt>Institution ID</dt><dd>{form.institutionId || '—'}</dd></div>
                <div><dt>Programme</dt><dd>{form.programme || '—'}</dd></div>
                <div><dt>Category</dt><dd>{form.category || '—'}</dd></div>
                <div><dt>Document</dt><dd>{form.file?.name || '—'}</dd></div>
              </dl>
            </div>
          </div>
        )}

        {step === 5 && (
          <div>
            <h2 style={{ marginBottom: 16 }}>Submit Application</h2>
            <p style={{ marginBottom: 20 }}>
              Ready to submit? Click Submit to send your application for review.
            </p>
            {error && <div className="notice" style={{ background: '#fef2f2', color: '#d86666', marginBottom: 12 }}>{error}</div>}
          </div>
        )}

        <div style={{ display: 'flex', gap: 12, marginTop: 24, justifyContent: 'space-between' }}>
          <div>
            {step > 1 && (
              <button className="secondary" onClick={() => setStep((s) => s - 1)}>
                ← Back
              </button>
            )}
          </div>
          <div>
            {step < 5 ? (
              <button
                className="primary compact"
                disabled={!canAdvance()}
                onClick={() => setStep((s) => s + 1)}
              >
                Next →
              </button>
            ) : (
              <button
                className="primary compact"
                disabled={submitting}
                onClick={handleSubmit}
              >
                {submitting ? 'Submitting…' : 'Submit'}
              </button>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
