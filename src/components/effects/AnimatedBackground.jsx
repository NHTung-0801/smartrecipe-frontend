import React from 'react';
import fx from '../../styles/effects.module.css';

/**
 * AnimatedBackground — Soft floating gradient orbs + warm gradient backdrop.
 * Drop into any page for an ambient, living background.
 */
const AnimatedBackground = () => (
  <div className={fx.animatedBg}>
    <div className={fx.orb1} />
    <div className={fx.orb2} />
    <div className={fx.orb3} />
  </div>
);

export default AnimatedBackground;
