import React from 'react';
import fx from '../../styles/effects.module.css';

/**
 * BlobBackground — Large slowly floating colored blobs.
 * Used for a luxurious dynamic depth effect.
 */
const BlobBackground = () => (
  <div className={fx.blobWrapper}>
    <div className={fx.blob1} />
    <div className={fx.blob2} />
    <div className={fx.blob3} />
  </div>
);

export default BlobBackground;
