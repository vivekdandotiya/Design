import React, { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface LandingStorefrontProps {
  onEnterCorridor: () => void;
}

export const LandingStorefront: React.FC<LandingStorefrontProps> = ({ onEnterCorridor }) => {
  const leftDoorRef = useRef<THREE.Mesh>(null);
  const rightDoorRef = useRef<THREE.Mesh>(null);
  
  const [isOpen, setIsOpen] = useState(false);
  const openProgress = useRef(0);
  const transitionTriggered = useRef(false);

  // 1. Brick wall hand-drawn texture
  const wallTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.Texture();

    // Base wall color (light grey paper tone)
    ctx.fillStyle = '#faf8f5';
    ctx.fillRect(0, 0, 1024, 512);

    // Draw hand-drawn brick lines
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 3;
    const rows = 16;
    const cols = 20;
    const rowHeight = 512 / rows;
    const colWidth = 1024 / cols;

    for (let r = 0; r <= rows; r++) {
      const y = r * rowHeight;
      // Add slight hand jitter to the horizontal line
      ctx.beginPath();
      ctx.moveTo(0, y);
      for (let x = 32; x <= 1024; x += 32) {
        ctx.lineTo(x, y + (Math.random() - 0.5) * 1.5);
      }
      ctx.stroke();

      if (r < rows) {
        // Vertical offset for brick pattern
        const offset = (r % 2) * (colWidth / 2);
        for (let c = 0; c <= cols + 1; c++) {
          const x = c * colWidth - offset;
          ctx.beginPath();
          ctx.moveTo(x + (Math.random() - 0.5) * 2, y);
          ctx.lineTo(x + (Math.random() - 0.5) * 2, y + rowHeight);
          ctx.stroke();
        }
      }
    }

    // Window illustration (right side)
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 6;
    // Window outer frame
    ctx.strokeRect(650, 120, 260, 220);
    // Window panes
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(780, 120);
    ctx.lineTo(780, 340);
    ctx.moveTo(650, 230);
    ctx.lineTo(910, 230);
    ctx.stroke();

    // Plant box below window
    ctx.lineWidth = 5;
    ctx.strokeRect(630, 350, 300, 70);
    // Sketchy flowers
    ctx.font = '28px "Caveat", cursive';
    ctx.fillStyle = '#1a1a1a';
    ctx.fillText('✿ ✿ ❀ ✿ ❀ ✿', 700, 390);

    // "PORTFOLIO" sign board
    ctx.fillStyle = '#faf8f5';
    ctx.fillRect(362, 50, 300, 80);
    ctx.lineWidth = 6;
    ctx.strokeRect(362, 50, 300, 80);
    // Sign text
    ctx.fillStyle = '#1a1a1a';
    ctx.font = 'bold 36px "Gloria Hallelujah", cursive';
    ctx.textAlign = 'center';
    ctx.fillText('PORTFOLIO', 512, 105);

    return new THREE.CanvasTexture(canvas);
  }, []);

  // 2. Door hand-drawn texture (with tech sticky notes)
  const leftDoorTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.Texture();

    ctx.fillStyle = '#faf8f5';
    ctx.fillRect(0, 0, 256, 512);

    // Door frame
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 6;
    ctx.strokeRect(5, 5, 246, 502);

    // Wood texture lines
    ctx.strokeStyle = 'rgba(0,0,0,0.1)';
    ctx.lineWidth = 2;
    for (let x = 20; x < 240; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 5);
      ctx.lineTo(x + (Math.random() - 0.5) * 5, 507);
      ctx.stroke();
    }

    // Tech badges (JS, React, HTML)
    // JS sticky
    ctx.fillStyle = '#f7df1e';
    ctx.fillRect(40, 100, 80, 80);
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 3;
    ctx.strokeRect(40, 100, 80, 80);
    ctx.fillStyle = '#1a1a1a';
    ctx.font = 'bold 24px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('JS', 80, 150);

    // React badge
    ctx.fillStyle = '#61dafb';
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(140, 190, 80, 80, 8) : ctx.rect(140, 190, 80, 80);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#1a1a1a';
    ctx.font = 'bold 18px "Inter", sans-serif';
    ctx.fillText('React', 180, 238);

    // HTML badge
    ctx.fillStyle = '#e34f26';
    ctx.fillRect(35, 300, 90, 80);
    ctx.strokeRect(35, 300, 90, 80);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px "Inter", sans-serif';
    ctx.fillText('HTML', 80, 348);

    return new THREE.CanvasTexture(canvas);
  }, []);

  const rightDoorTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.Texture();

    ctx.fillStyle = '#faf8f5';
    ctx.fillRect(0, 0, 256, 512);

    // Door frame
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 6;
    ctx.strokeRect(5, 5, 246, 502);

    // Wood lines
    ctx.strokeStyle = 'rgba(0,0,0,0.1)';
    ctx.lineWidth = 2;
    for (let x = 20; x < 240; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 5);
      ctx.lineTo(x + (Math.random() - 0.5) * 5, 507);
      ctx.stroke();
    }

    // Tech badges (TS, Node, CSS)
    // TS badge
    ctx.fillStyle = '#3178c6';
    ctx.fillRect(130, 90, 80, 80);
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 3;
    ctx.strokeRect(130, 90, 80, 80);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('TS', 170, 140);

    // Node badge
    ctx.fillStyle = '#339933';
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(30, 200, 85, 75, 6) : ctx.rect(30, 200, 85, 75);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px "Inter", sans-serif';
    ctx.fillText('Node', 72, 244);

    // CSS badge
    ctx.fillStyle = '#1572b6';
    ctx.fillRect(135, 310, 80, 80);
    ctx.strokeRect(135, 310, 80, 80);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px "Inter", sans-serif';
    ctx.fillText('CSS', 175, 358);

    return new THREE.CanvasTexture(canvas);
  }, []);

  // Cat path illustration
  const catTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.Texture();

    ctx.fillStyle = 'rgba(0,0,0,0)';
    ctx.fillRect(0,0,128,128);

    // Draw sketchy cartoon cat
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 3;
    ctx.fillStyle = '#faf8f5';

    // Body
    ctx.beginPath();
    ctx.ellipse(64, 80, 30, 40, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Head
    ctx.beginPath();
    ctx.arc(64, 40, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Ears
    ctx.beginPath();
    ctx.moveTo(48, 30); ctx.lineTo(44, 10); ctx.lineTo(58, 24);
    ctx.moveTo(80, 30); ctx.lineTo(84, 10); ctx.lineTo(70, 24);
    ctx.stroke();

    // Eyes
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.arc(58, 38, 2.5, 0, Math.PI * 2);
    ctx.arc(70, 38, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Whiskers
    ctx.beginPath();
    ctx.moveTo(40, 42); ctx.lineTo(25, 40);
    ctx.moveTo(40, 46); ctx.lineTo(22, 47);
    ctx.moveTo(88, 42); ctx.lineTo(103, 40);
    ctx.moveTo(88, 46); ctx.lineTo(106, 47);
    ctx.stroke();

    // Tail
    ctx.beginPath();
    ctx.moveTo(80, 100);
    ctx.quadraticCurveTo(110, 80, 100, 50);
    ctx.stroke();

    return new THREE.CanvasTexture(canvas);
  }, []);

  // Tree illustration
  const treeTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.Texture();

    ctx.fillStyle = 'rgba(0,0,0,0)';
    ctx.fillRect(0,0,256,512);

    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 4;
    ctx.fillStyle = '#faf8f5';

    // Trunk
    ctx.beginPath();
    ctx.moveTo(110, 512);
    ctx.quadraticCurveTo(100, 300, 120, 250);
    ctx.lineTo(136, 250);
    ctx.quadraticCurveTo(156, 300, 146, 512);
    ctx.fill();
    ctx.stroke();

    // Branches
    ctx.beginPath();
    ctx.moveTo(120, 270); ctx.quadraticCurveTo(60, 220, 50, 180);
    ctx.moveTo(136, 260); ctx.quadraticCurveTo(200, 210, 210, 170);
    ctx.stroke();

    // Foliage (sketchy clouds)
    ctx.beginPath();
    ctx.arc(128, 140, 80, 0, Math.PI * 2);
    ctx.arc(80, 150, 60, 0, Math.PI * 2);
    ctx.arc(180, 150, 60, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Hanging Mouse illustration
    ctx.beginPath();
    ctx.moveTo(70, 190);
    ctx.lineTo(70, 280); // wire
    ctx.stroke();

    // Mouse body
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(70, 295, 12, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Mouse ears
    ctx.beginPath();
    ctx.arc(62, 282, 5, 0, Math.PI * 2);
    ctx.arc(78, 282, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    return new THREE.CanvasTexture(canvas);
  }, []);

  // Smooth door opening in useFrame
  useFrame(() => {
    const targetProgress = isOpen ? 1.0 : 0.0;
    openProgress.current = THREE.MathUtils.lerp(openProgress.current, targetProgress, 0.06);

    if (leftDoorRef.current && rightDoorRef.current) {
      // Rotate doors outwards around their side hinges
      // Since doors are positioned at x = -0.75 and x = 0.75, let's hinge them by offset rotation
      leftDoorRef.current.rotation.y = openProgress.current * (Math.PI * 0.6);
      rightDoorRef.current.rotation.y = openProgress.current * -(Math.PI * 0.6);
    }

    // Trigger transition when doors are mostly open
    if (isOpen && openProgress.current > 0.9 && !transitionTriggered.current) {
      transitionTriggered.current = true;
      onEnterCorridor();
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* 1. Main storefront storefront wall */}
      <mesh position={[0, 0, -2]}>
        <planeGeometry args={[12, 6]} />
        <meshBasicMaterial map={wallTexture} side={THREE.DoubleSide} />
      </mesh>

      {/* 2. Interactive Doors (Left & Right) */}
      {/* Left Door hinge group */}
      <group position={[-1.5, -0.6, -1.95]}>
        <mesh 
          ref={leftDoorRef} 
          position={[0.75, 0, 0]} 
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(true);
          }}
        >
          <planeGeometry args={[1.5, 3.2]} />
          <meshBasicMaterial map={leftDoorTexture} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* Right Door hinge group */}
      <group position={[1.5, -0.6, -1.95]}>
        <mesh 
          ref={rightDoorRef} 
          position={[-0.75, 0, 0]}
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(true);
          }}
        >
          <planeGeometry args={[1.5, 3.2]} />
          <meshBasicMaterial map={rightDoorTexture} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* 3. Cartoon Cat on the path */}
      <mesh position={[1.8, -1.2, -1.9]} scale={[0.8, 0.8, 1]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial map={catTexture} transparent />
      </mesh>

      {/* 4. Left tree with hanging mouse */}
      <mesh position={[-3.6, 0.3, -1.9]} scale={[1.8, 1.8, 1]}>
        <planeGeometry args={[2, 3]} />
        <meshBasicMaterial map={treeTexture} transparent />
      </mesh>

      {/* Simple Floor ground path */}
      <mesh position={[0, -2.2, -1]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[12, 4]} />
        <meshBasicMaterial color="#faf8f5" />
      </mesh>
    </group>
  );
};
