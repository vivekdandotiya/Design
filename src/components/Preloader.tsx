import React, { useEffect, useState, useMemo } from 'react';

interface PreloaderProps {
  onComplete: () => void;
}

export const Preloader: React.FC<PreloaderProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [isTorn, setIsTorn] = useState(false);

  // Generate a dynamic zig-zag SVG path based on window height
  const zigzagPath = useMemo(() => {
    const height = typeof window !== 'undefined' ? window.innerHeight : 800;
    const step = 40; // spacing between vertices
    let path = 'M 50 0 ';
    let count = 0;
    for (let y = step; y <= height + step; y += step) {
      const x = count % 2 === 0 ? 35 : 65;
      path += `L ${x} ${y} `;
      count++;
    }
    return path;
  }, []);

  useEffect(() => {
    // Simulated loading sequence
    const duration = 2.0; // 2 seconds
    const intervalTime = 50; // Update every 50ms
    const step = 100 / ((duration * 1000) / intervalTime);

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + step;
        if (next >= 100) {
          clearInterval(timer);
          // Wait 300ms before tearing
          setTimeout(() => {
            setIsTorn(true);
            // Wait 1.5s for tearing animation to complete
            setTimeout(onComplete, 1500);
          }, 300);
          return 100;
        }
        return next;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div id="preloader" className={isTorn ? 'torn' : ''}>
      {/* Top half paper flap */}
      <div className="preloader-half preloader-top" />

      {/* Vertical Zig-zag line in the middle */}
      {!isTorn && (
        <svg className="zigzag-tear-svg" preserveAspectRatio="none" viewBox="0 0 100 1000">
          <path className="zigzag-line" d={zigzagPath} />
        </svg>
      )}

      {/* Central Loading Info */}
      <div className="preloader-center-ui">
        <div className="loader-circle-wrap">
          <div className="loader-circle" />
          <span className="loader-percentage">{Math.round(progress)}%</span>
        </div>
        <div className="loader-text">ITom Dev</div>
        <div style={{ fontFamily: 'var(--font-hand)', fontSize: '1.4rem', marginTop: '0.5rem', color: 'rgba(0,0,0,0.5)' }}>
          Preparing paper & pencils...
        </div>
      </div>

      {/* Bottom half paper flap */}
      <div className="preloader-half preloader-bottom" />
    </div>
  );
};
