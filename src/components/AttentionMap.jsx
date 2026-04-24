import { useState } from 'react';

export default function AttentionMap({ example, schema }) {
    const [imgError, setImgError] = useState(false);

    return (
        <div className="viz-panel">
            <div className="viz-header">
                <span className="viz-title">Attention Map</span>
            </div>
            <div className="viz-body gif-body">
                {imgError ? (
                    <div className="ph gif-ph">
                        <span>Place <code>attention.png</code> in <code>public/</code> to display attention map</span>
                    </div>
                ) : (
                    <img
                        src="/attention.png"
                        alt="Attention map visualization"
                        className="gif-img"
                        onError={() => setImgError(true)}
                    />
                )}
            </div>
        </div>
    );
}
