import React from 'react';
import fx from '../../styles/effects.module.css';

/**
 * AuroraBackground — Premium animated aurora background
 * Replaces the basic orb background for a more luxurious feel.
 */
const AuroraBackground = () => (
  <div className={fx.auroraWrapper}>
    <div className={fx.auroraBg} />
    <div className={fx.auroraGlow1} />
    <div className={fx.auroraGlow2} />
    <div className={fx.auroraGlow3} />
  </div>
);

export default AuroraBackground;
