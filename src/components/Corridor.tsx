import React, { useMemo } from 'react';
import * as THREE from 'three';

interface CorridorProps {
  onOpenDoor: (room: string) => void;
}

export const Corridor: React.FC<CorridorProps> = ({ onOpenDoor }) => {
  // Procedurally generate a hand-drawn paper wall texture
  const paperTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.Texture();

    ctx.fillStyle = '#faf8f5';
    ctx.fillRect(0, 0, 512, 512);

    // Subtle noise/grain
    ctx.fillStyle = 'rgba(0, 0, 0, 0.03)';
    for (let i = 0; i < 4000; i++) {
      ctx.fillRect(Math.random() * 512, Math.random() * 512, 1.5, 1.5);
    }

    // Graph paper guidelines
    ctx.strokeStyle = 'rgba(26, 26, 26, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 512; i += 32) {
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(512, i); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 512); ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 10);
    return texture;
  }, []);

  // Floor boards hand-drawn texture
  const floorTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.Texture();

    ctx.fillStyle = '#f4eff2';
    ctx.fillRect(0, 0, 512, 512);

    // Wood floor planks
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 2.5;
    for (let x = 0; x <= 512; x += 64) {
      ctx.beginPath();
      let cy = 0;
      let cx = x;
      ctx.moveTo(cx, cy);
      while (cy < 512) {
        cy += 16;
        cx += (Math.random() - 0.5) * 1.5;
        ctx.lineTo(cx, cy);
      }
      ctx.stroke();
    }

    return new THREE.CanvasTexture(canvas);
  }, []);

  // Door sign textures
  const makeDoorSignTexture = (title: string, subtitle?: string) => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.Texture();

    ctx.fillStyle = '#faf8f5';
    ctx.fillRect(0,0,256,128);

    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 4;
    ctx.strokeRect(10, 10, 236, 108);

    ctx.fillStyle = '#1a1a1a';
    ctx.font = 'bold 22px "Gloria Hallelujah", cursive';
    ctx.textAlign = 'center';
    ctx.fillText(title, 128, 55);

    if (subtitle) {
      ctx.font = '16px "Caveat", cursive';
      ctx.fillText(subtitle, 128, 90);
    }

    return new THREE.CanvasTexture(canvas);
  };

  // 3D Wooden Door texture
  const doorTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.Texture();

    ctx.fillStyle = '#faf8f5';
    ctx.fillRect(0, 0, 256, 512);

    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 5;
    ctx.strokeRect(10, 10, 236, 492);
    ctx.strokeRect(25, 25, 206, 220);
    ctx.strokeRect(25, 265, 206, 220);

    // Knob
    ctx.beginPath();
    ctx.arc(40, 256, 12, 0, Math.PI * 2);
    ctx.fillStyle = '#c94a4a';
    ctx.fill();
    ctx.stroke();

    return new THREE.CanvasTexture(canvas);
  }, []);

  // Avatar text greeting card at corridor start (z = -4)
  const avatarCardTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.Texture();

    ctx.fillStyle = 'rgba(0,0,0,0)';
    ctx.fillRect(0, 0, 512, 512);

    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 4;
    ctx.fillStyle = '#faf8f5';

    // cartoon avatar drawing waving
    ctx.beginPath();
    ctx.arc(256, 200, 70, 0, Math.PI * 2); // Head
    ctx.fill();
    ctx.stroke();

    // glasses
    ctx.lineWidth = 3;
    ctx.strokeRect(210, 185, 36, 30);
    ctx.strokeRect(266, 185, 36, 30);
    ctx.beginPath(); ctx.moveTo(246, 200); ctx.lineTo(266, 200); ctx.stroke();

    // hair
    ctx.font = '36px "Inter", sans-serif';
    ctx.fillStyle = '#1a1a1a';
    ctx.fillText('ITOM', 256, 350);
    
    ctx.font = '28px "Gloria Hallelujah", cursive';
    ctx.fillText('creative developer', 256, 410);

    return new THREE.CanvasTexture(canvas);
  }, []);

  // Corridor decorations (z = -40 drawings)
  const backWallTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.Texture();

    ctx.fillStyle = '#faf8f5';
    ctx.fillRect(0,0,512,512);

    // Drawings
    ctx.fillStyle = '#1a1a1a';
    ctx.font = '28px "Gloria Hallelujah", cursive';
    ctx.fillText('while(true) {', 50, 120);
    ctx.fillText('  explore();', 50, 170);
    ctx.fillText('}', 50, 220);

    // Coffee cup
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 4;
    ctx.strokeRect(360, 200, 60, 70);
    // Handle
    ctx.beginPath();
    ctx.arc(420, 235, 15, -Math.PI/2, Math.PI/2);
    ctx.stroke();
    // Smoke
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(375, 185); ctx.bezierCurveTo(370,165, 385,155, 380,140);
    ctx.moveTo(395, 185); ctx.bezierCurveTo(390,165, 405,155, 400,140);
    ctx.stroke();

    return new THREE.CanvasTexture(canvas);
  }, []);

  return (
    <group>
      {/* 1. Hallway base structures */}
      {/* Left Wall */}
      <mesh position={[-3, 0, -20]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[40, 6]} />
        <meshBasicMaterial map={paperTexture} side={THREE.DoubleSide} />
      </mesh>

      {/* Right Wall */}
      <mesh position={[3, 0, -20]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[40, 6]} />
        <meshBasicMaterial map={paperTexture} side={THREE.DoubleSide} />
      </mesh>

      {/* Floor */}
      <mesh position={[0, -3, -20]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[6, 40]} />
        <meshBasicMaterial map={floorTexture} side={THREE.DoubleSide} />
      </mesh>

      {/* Ceiling */}
      <mesh position={[0, 3, -20]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[6, 40]} />
        <meshBasicMaterial map={paperTexture} side={THREE.DoubleSide} />
      </mesh>

      {/* 2. End Back Wall with Drawings (at z = -40) */}
      <mesh position={[0, 0, -40]}>
        <planeGeometry args={[6, 6]} />
        <meshBasicMaterial map={backWallTexture} />
      </mesh>

      {/* 3. Welcome Avatar Billboard at Corridor Start (z = -4) */}
      <mesh position={[0, 0.4, -4]} scale={[1.8, 1.8, 1]}>
        <planeGeometry args={[2, 2]} />
        <meshBasicMaterial map={avatarCardTexture} transparent />
      </mesh>

      {/* 4. Interactive Doors */}
      {/* DOOR 1: THE GALLERY (Left wall at z = -10) */}
      <group position={[-2.95, -0.6, -10]} rotation={[0, Math.PI / 2, 0]}>
        <mesh 
          onClick={(e) => {
            e.stopPropagation();
            onOpenDoor('gallery');
          }}
        >
          <planeGeometry args={[1.5, 3.2]} />
          <meshBasicMaterial map={doorTexture} />
        </mesh>
        <mesh position={[0, 1.25, 0.01]} scale={[0.8, 0.4, 1]}>
          <planeGeometry args={[1.5, 1.0]} />
          <meshBasicMaterial map={makeDoorSignTexture('THE GALLERY', 'Interactive Projects')} />
        </mesh>
      </group>

      {/* DOOR 2: THE STUDIO (Right wall at z = -18) */}
      <group position={[2.95, -0.6, -18]} rotation={[0, -Math.PI / 2, 0]}>
        <mesh 
          onClick={(e) => {
            e.stopPropagation();
            onOpenDoor('studio');
          }}
        >
          <planeGeometry args={[1.5, 3.2]} />
          <meshBasicMaterial map={doorTexture} />
        </mesh>
        <mesh position={[0, 1.25, 0.01]} scale={[0.8, 0.4, 1]}>
          <planeGeometry args={[1.5, 1.0]} />
          <meshBasicMaterial map={makeDoorSignTexture('THE STUDIO', 'Tutorials & Notes')} />
        </mesh>
      </group>

      {/* DOOR 3: ABOUT (Left wall at z = -26) */}
      <group position={[-2.95, -0.6, -26]} rotation={[0, Math.PI / 2, 0]}>
        <mesh 
          onClick={(e) => {
            e.stopPropagation();
            onOpenDoor('about');
          }}
        >
          <planeGeometry args={[1.5, 3.2]} />
          <meshBasicMaterial map={doorTexture} />
        </mesh>
        <mesh position={[0, 1.25, 0.01]} scale={[0.8, 0.4, 1]}>
          <planeGeometry args={[1.5, 1.0]} />
          <meshBasicMaterial map={makeDoorSignTexture('ABOUT ME', 'Awards & Journey')} />
        </mesh>
      </group>

      {/* DOOR 4: CONTACT (Right wall at z = -34) */}
      <group position={[2.95, -0.6, -34]} rotation={[0, -Math.PI / 2, 0]}>
        <mesh 
          onClick={(e) => {
            e.stopPropagation();
            onOpenDoor('contact');
          }}
        >
          <planeGeometry args={[1.5, 3.2]} />
          <meshBasicMaterial map={doorTexture} />
        </mesh>
        <mesh position={[0, 1.25, 0.01]} scale={[0.8, 0.4, 1]}>
          <planeGeometry args={[1.5, 1.0]} />
          <meshBasicMaterial map={makeDoorSignTexture('CONTACT', 'Hire & Socials')} />
        </mesh>
      </group>
    </group>
  );
};
