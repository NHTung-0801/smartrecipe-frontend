import React, { useState, useEffect, useCallback } from 'react';
import fx from '../../styles/effects.module.css';

const VARIANTS = [fx.particleWarm, fx.particleGold, fx.particleSoft];

/**
 * FloatingParticles — Multi-color particles rising gently across the viewport.
 * Drop into any page for a subtle, living ambient effect.
 *
 * @param {number} [interval=450] — ms between spawns
 * @param {number} [maxCount=25]  — max concurrent particles
 */
const FloatingParticles = ({ interval = 450, maxCount = 25 }) => {
  const [particles, setParticles] = useState([]);

  const spawnParticle = useCallback(() => {
    const id = Date.now() + Math.random();
    const size = Math.random() * 5 + 2;
    const left = Math.random() * 100;
    const top = 20 + Math.random() * 80;
    const duration = Math.random() * 4 + 3;
    const drift = Math.random() * 80 - 40;
    const spin = Math.random() * 360;
    const variant = VARIANTS[Math.floor(Math.random() * VARIANTS.length)];

    setParticles((prev) => [
      ...prev.slice(-maxCount),
      { id, size, left, top, duration, drift, spin, variant },
    ]);

    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => p.id !== id));
    }, duration * 1000);
  }, [maxCount]);

  useEffect(() => {
    const timer = setInterval(spawnParticle, interval);
    return () => clearInterval(timer);
  }, [spawnParticle, interval]);

  return (
    <div className={fx.particleCanvas}>
      {particles.map((p) => (
        <div
          key={p.id}
          className={p.variant}
          style={{
            width: p.size,
            height: p.size,
            left: `${p.left}%`,
            top: `${p.top}%`,
            animationDuration: `${p.duration}s`,
            '--drift': `${p.drift}px`,
            '--spin': `${p.spin}deg`,
          }}
        />
      ))}
    </div>
  );
};

export default FloatingParticles;
