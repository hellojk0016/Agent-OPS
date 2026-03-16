
import React from 'react';

export default function PreviewLogos() {
  const logos = [
    '/ops-logo.png',
    '/images/ops-logo.png',
    '/logo-4.png',
    '/ca-logo.png',
    '/knightwolf-logo.png',
    '/kw-logo.png'
  ];

  return (
    <div style={{ padding: '20px', background: '#09090b', color: 'white', minHeight: '100vh' }}>
      <h1>Logo Preview</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
        {logos.map(src => (
          <div key={src} style={{ border: '1px solid #333', padding: '10px', borderRadius: '10px' }}>
            <h3>{src}</h3>
            <div style={{ background: '#111', padding: '20px', borderRadius: '5px', display: 'flex', justifyContent: 'center' }}>
              <img src={src} alt={src} style={{ maxWidth: '100px', maxHeight: '100px', objectFit: 'contain' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
