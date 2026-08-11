import React, { useEffect, useState } from 'react';
import styles from './CompleteConfetti.module.css';

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];
const PARTICLE_COUNT = 50;

const CompleteConfetti = ({ isActive, onComplete }) => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (!isActive) {
      setParticles([]);
      return;
    }

    const newParticles = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: -10 - Math.random() * 20,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: 6 + Math.random() * 8,
      rotation: Math.random() * 360,
      delay: Math.random() * 0.5,
      duration: 1.5 + Math.random() * 2,
      shape: Math.random() > 0.5 ? 'circle' : 'rect',
    }));

    setParticles(newParticles);

    const timer = setTimeout(() => {
      setParticles([]);
      onComplete && onComplete();
    }, 3000);

    return () => clearTimeout(timer);
  }, [isActive, onComplete]);

  if (!isActive || particles.length === 0) return null;

  return (
    <div className={styles.container}>
      {particles.map((p) => (
        <div
          key={p.id}
          className={`${styles.particle} ${p.shape === 'circle' ? styles.circle : styles.rect}`}
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.shape === 'circle' ? p.size : p.size * 0.6,
            backgroundColor: p.color,
            transform: `rotate(${p.rotation}deg)`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
      <div className={styles.text}>
        <span className={styles.checkmark}>🎉</span>
        <span className={styles.label}>Đã mua hết!</span>
      </div>
    </div>
  );
};

export default CompleteConfetti;