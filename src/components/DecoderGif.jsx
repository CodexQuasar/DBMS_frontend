import React from 'react';
import './DecoderGif.css'; // Assuming a separate CSS file for custom styles

const DecoderGif = () => {
  const imgSrc = '/decoder.gif';
  return (
    <div className="gif-panel">
      <img src={imgSrc} alt="Decoder Simulation" onError={(e) => e.target.style.display = 'none'} />
      <div className="placeholder">
        <p>Decoder GIF loading...</p>
      </div>
    </div>
  );
};

export default DecoderGif;