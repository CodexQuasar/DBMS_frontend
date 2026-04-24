import { useState } from 'react';

export default function DecoderGif() {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="viz-panel">
      <div className="viz-header">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <rect x="1" y="1" width="12" height="9" rx="2" stroke="var(--accent2)" strokeWidth="1.2" />
          <path d="M5 5l4 2-4 2V5z" fill="var(--accent2)" opacity=".8" />
        </svg>
        <span className="viz-title">Decoder Animation</span>
      </div>
      <div className="viz-body gif-body">
        {imgError ? (
          <div className="ph gif-ph">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect x="2" y="2" width="28" height="21" rx="3" stroke="var(--text3)" strokeWidth="1.5" />
              <path d="M11 11l10 5-10 5V11z" stroke="var(--text3)" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
            <span>Place <code>decoder.gif</code> in <code>public/</code> to display animation</span>
          </div>
        ) : (
          <img
            src="/decoder.gif"
            alt="Decoder simulation animation"
            className="gif-img"
            onError={() => setImgError(true)}
          />
        )}
      </div>
    </div>
  );
}