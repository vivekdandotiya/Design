import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ----------------------------------------------------
// 1. GALLERY ROOM
// ----------------------------------------------------
interface GalleryRoomProps {
  onSelectProject: (project: any) => void;
}

export const GalleryRoom: React.FC<GalleryRoomProps> = ({ onSelectProject }) => {
  const groupRef = useRef<THREE.Group>(null);

  // Skyline background texture
  const skylineTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.Texture();

    ctx.fillStyle = '#faf8f5';
    ctx.fillRect(0,0,1024,512);

    // Sketchy buildings
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 3;
    ctx.fillStyle = '#f4eedb';

    const drawBuilding = (x: number, w: number, h: number) => {
      ctx.beginPath();
      ctx.rect(x, 512 - h, w, h);
      ctx.fill();
      ctx.stroke();

      // Windows
      ctx.strokeStyle = 'rgba(0,0,0,0.15)';
      ctx.lineWidth = 1.5;
      for (let wy = 512 - h + 20; wy < 490; wy += 30) {
        for (let wx = x + 15; wx < x + w - 10; wx += 25) {
          ctx.strokeRect(wx, wy, 12, 18);
        }
      }
      ctx.strokeStyle = '#1a1a1a';
      ctx.lineWidth = 3;
    };

    drawBuilding(50, 120, 280);
    drawBuilding(200, 160, 380);
    drawBuilding(420, 100, 240);
    drawBuilding(550, 180, 420);
    drawBuilding(780, 150, 310);

    return new THREE.CanvasTexture(canvas);
  }, []);

  // Fence Railing texture
  const fenceTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.Texture();

    ctx.fillStyle = 'rgba(0,0,0,0)';
    ctx.fillRect(0,0,512,128);

    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 4;
    ctx.fillStyle = '#faf8f5';

    // Top & bottom rails
    ctx.strokeRect(0, 10, 512, 12);
    ctx.strokeRect(0, 106, 512, 12);

    // vertical balusters with sketchy loops
    for (let x = 20; x < 512; x += 40) {
      ctx.strokeRect(x, 22, 10, 84);
      // loops
      ctx.beginPath();
      ctx.arc(x + 5, 64, 12, 0, Math.PI * 2);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.repeat.set(3, 1);
    return texture;
  }, []);

  const projects = [
    { title: 'MoneTune', desc: 'A fast, modern personal budget and finance dashboard tracking subscriptions and expenses.', tags: ['React', 'Node', 'Postgres'] },
    { title: 'TimberKitty', desc: 'An addictive browser arcade game where players control a lumberjack cat to chop wood and save birds.', tags: ['JS', 'CSS Grid', 'GSAP'] },
    { title: 'Young Multi', desc: 'A sleek, modern 3D promotional landing page mapped to custom scroll camera behaviors.', tags: ['Three.js', 'R3F', 'Blender'] },
    { title: 'Bio Portfolio', desc: 'A personal identity landing serving as a central hub for all my latest projects.', tags: ['HTML5', 'Sass', 'Webpack'] }
  ];

  return (
    <group ref={groupRef}>
      {/* City Skyline Background */}
      <mesh position={[0, 1.5, -6]}>
        <planeGeometry args={[16, 8]} />
        <meshBasicMaterial map={skylineTexture} />
      </mesh>

      {/* Fence Railing */}
      <mesh position={[0, -1.8, -2]}>
        <planeGeometry args={[10, 2.5]} />
        <meshBasicMaterial map={fenceTexture} transparent />
      </mesh>

      {/* Hanging Wire */}
      <mesh position={[0, 2, -3]}>
        <planeGeometry args={[8, 0.05]} />
        <meshBasicMaterial color="#1a1a1a" />
      </mesh>

      {/* Hanging Project Cards */}
      {projects.map((proj, idx) => {
        const xPos = -3 + idx * 2.0;
        return (
          <group 
            key={proj.title} 
            position={[xPos, 0.6, -2.8]}
            onClick={(e) => {
              e.stopPropagation();
              onSelectProject(proj);
            }}
          >
            {/* Hanging clip */}
            <mesh position={[0, 1.25, 0]}>
              <boxGeometry args={[0.08, 0.3, 0.05]} />
              <meshBasicMaterial color="#c94a4a" />
            </mesh>

            {/* Main Card Sheet */}
            <mesh>
              <planeGeometry args={[1.5, 2.0]} />
              <meshBasicMaterial color="#faf8f5" side={THREE.DoubleSide} />
            </mesh>

            {/* Sketched Frame Board border */}
            <mesh position={[0, 0, -0.01]}>
              <planeGeometry args={[1.56, 2.06]} />
              <meshBasicMaterial color="#1a1a1a" />
            </mesh>

            {/* Project Title Text labels inside card */}
            <group position={[0, 0, 0.01]}>
              <mesh>
                <planeGeometry args={[1.3, 1.8]} />
                <meshBasicMaterial 
                  transparent 
                  map={useMemo(() => {
                    const canvas = document.createElement('canvas');
                    canvas.width = 128;
                    canvas.height = 128;
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                      ctx.fillStyle = '#faf8f5';
                      ctx.fillRect(0,0,128,128);
                      ctx.strokeStyle = '#1a1a1a';
                      ctx.lineWidth = 2;
                      ctx.strokeRect(5,5,118,118);
                      ctx.fillStyle = '#1a1a1a';
                      ctx.font = 'bold 18px "Gloria Hallelujah", cursive';
                      ctx.textAlign = 'center';
                      ctx.fillText(proj.title, 64, 40);
                      ctx.font = '14px "Caveat", cursive';
                      ctx.fillText('Click to Inspect', 64, 85);
                    }
                    return new THREE.CanvasTexture(canvas);
                  }, [proj.title])} 
                />
              </mesh>
            </group>
          </group>
        );
      })}
    </group>
  );
};


// ----------------------------------------------------
// 2. STUDIO ROOM (FALLING MONITORS)
// ----------------------------------------------------
interface StudioRoomProps {
  onSelectTV: (tv: any) => void;
}

export const StudioRoom: React.FC<StudioRoomProps> = ({ onSelectTV }) => {
  const tvs = [
    { title: 'Accessibility in 3D Web', date: '2026-05-20', note: 'Making immersive WebGL experiences accessible to everyone via screen-reader DOM tree fallback indexing.' },
    { title: 'Procedural Textures Tutorial', date: '2026-04-18', note: 'Creating high-performance pencil-sketch textures with raw HTML5 canvas rendering in real-time.' },
    { title: 'GSAP Animation Masterclass', date: '2026-03-05', note: 'Choreographing camera moves and custom scroll boundaries for 60fps mobile interfaces.' }
  ];

  // Procedural CRT TV Texture
  const tvTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.Texture();

    ctx.fillStyle = '#faf8f5';
    ctx.fillRect(0,0,256,256);

    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 6;
    // Outer cabinet
    ctx.strokeRect(10, 10, 236, 236);
    // Inner CRT tube screen
    ctx.strokeRect(25, 25, 160, 206);
    // Dials/Knobs
    ctx.beginPath();
    ctx.arc(215, 60, 15, 0, Math.PI * 2);
    ctx.arc(215, 120, 15, 0, Math.PI * 2);
    ctx.stroke();

    // Speaker grills
    ctx.lineWidth = 3;
    for (let y = 170; y < 220; y += 8) {
      ctx.beginPath();
      ctx.moveTo(200, y);
      ctx.lineTo(230, y);
      ctx.stroke();
    }

    return new THREE.CanvasTexture(canvas);
  }, []);

  return (
    <group>
      {tvs.map((tv, idx) => {
        const xPos = -2.2 + idx * 2.2;
        const yPos = Math.sin(idx * 2) * 0.5;
        const zPos = -3 + idx * 0.2;
        return (
          <group 
            key={tv.title} 
            position={[xPos, yPos, zPos]}
            onClick={(e) => {
              e.stopPropagation();
              onSelectTV(tv);
            }}
          >
            {/* TV Box Mesh */}
            <mesh>
              <boxGeometry args={[1.6, 1.6, 1.2]} />
              <meshBasicMaterial map={tvTexture} />
            </mesh>

            {/* Sketched outline shadow */}
            <mesh position={[0.06, -0.06, -0.03]}>
              <boxGeometry args={[1.6, 1.6, 1.2]} />
              <meshBasicMaterial color="#1a1a1a" />
            </mesh>
            
            {/* Screen Inner detail */}
            <mesh position={[-0.15, 0, 0.61]}>
              <planeGeometry args={[0.9, 1.2]} />
              <meshBasicMaterial 
                transparent 
                map={useMemo(() => {
                  const canvas = document.createElement('canvas');
                  canvas.width = 128;
                  canvas.height = 128;
                  const ctx = canvas.getContext('2d');
                  if (ctx) {
                    ctx.fillStyle = '#1a1a1a';
                    ctx.fillRect(0,0,128,128);
                    ctx.fillStyle = '#faf8f5';
                    ctx.font = '13px "Gloria Hallelujah", cursive';
                    ctx.fillText('TUTORIAL', 10, 40);
                    ctx.font = '11px "Inter", sans-serif';
                    ctx.fillText('Click to read', 10, 80);
                  }
                  return new THREE.CanvasTexture(canvas);
                }, [])}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};


// ----------------------------------------------------
// 3. ABOUT ROOM (FLOATING CLOUDS)
// ----------------------------------------------------
export const AboutRoom: React.FC = () => {
  // Cloud drawing function
  const cloudTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.Texture();

    ctx.fillStyle = 'rgba(0,0,0,0)';
    ctx.fillRect(0,0,256,128);

    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 3;
    ctx.fillStyle = '#faf8f5';

    // Draw cloud shapes
    ctx.beginPath();
    ctx.arc(64, 70, 36, 0, Math.PI * 2);
    ctx.arc(120, 60, 46, 0, Math.PI * 2);
    ctx.arc(180, 70, 36, 0, Math.PI * 2);
    ctx.rect(64, 60, 116, 46);
    ctx.fill();
    ctx.stroke();

    return new THREE.CanvasTexture(canvas);
  }, []);

  // Avatar drawing
  const avatarTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.Texture();

    ctx.fillStyle = 'rgba(0,0,0,0)';
    ctx.fillRect(0,0,256,256);

    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 4;
    ctx.fillStyle = '#faf8f5';

    // Sketchy avatar drawing sleeping on cloud
    ctx.beginPath();
    ctx.arc(128, 128, 40, 0, Math.PI * 2); // head
    ctx.fill();
    ctx.stroke();

    // glasses
    ctx.lineWidth = 2.5;
    ctx.strokeRect(102, 118, 22, 18);
    ctx.strokeRect(132, 118, 22, 18);
    ctx.beginPath(); ctx.moveTo(124, 127); ctx.lineTo(132, 127); ctx.stroke();

    // smiling closed eyes
    ctx.beginPath();
    ctx.arc(113, 127, 4, Math.PI, 0);
    ctx.arc(143, 127, 4, Math.PI, 0);
    ctx.stroke();

    return new THREE.CanvasTexture(canvas);
  }, []);

  return (
    <group>
      {/* Central Cloud with sleeping Avatar */}
      <group position={[0, 0.4, -3.5]}>
        <mesh position={[0, -0.6, 0]} scale={[3, 2, 1]}>
          <planeGeometry args={[2, 1]} />
          <meshBasicMaterial map={cloudTexture} transparent />
        </mesh>
        <mesh position={[0, 0.4, 0.05]} scale={[1.3, 1.3, 1]}>
          <planeGeometry args={[2, 2]} />
          <meshBasicMaterial map={avatarTexture} transparent />
        </mesh>
      </group>

      {/* Floating side clouds */}
      <mesh position={[-2.8, 1.2, -4.5]} scale={[2.2, 1.5, 1]}>
        <planeGeometry args={[2, 1]} />
        <meshBasicMaterial map={cloudTexture} transparent />
      </mesh>
      <mesh position={[2.8, -1.0, -4.5]} scale={[2.5, 1.6, 1]}>
        <planeGeometry args={[2, 1]} />
        <meshBasicMaterial map={cloudTexture} transparent />
      </mesh>
    </group>
  );
};


// ----------------------------------------------------
// 4. CONTACT ROOM (PIER & WAVES)
// ----------------------------------------------------
interface ContactRoomProps {
  onSelectSign: (sign: string) => void;
}

export const ContactRoom: React.FC<ContactRoomProps> = ({ onSelectSign }) => {
  const wavesRef = useRef<THREE.Mesh>(null);

  // Pier planks texture
  const pierTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.Texture();

    ctx.fillStyle = '#f4eff2';
    ctx.fillRect(0,0,256,512);

    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 3;

    // Horizontal board divides
    for (let y = 0; y <= 512; y += 42) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(256, y + (Math.random() - 0.5) * 1.5);
      ctx.stroke();
    }

    return new THREE.CanvasTexture(canvas);
  }, []);

  // Wooden signboards texture helper
  const makeSignTexture = (text: string) => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.Texture();

    ctx.fillStyle = '#faf8f5';
    ctx.fillRect(0,0,256,128);

    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 5;
    ctx.strokeRect(10, 10, 236, 108);

    ctx.fillStyle = '#1a1a1a';
    ctx.font = 'bold 24px "Gloria Hallelujah", cursive';
    ctx.textAlign = 'center';
    ctx.fillText(text, 128, 70);

    return new THREE.CanvasTexture(canvas);
  };

  const signs = ['GITHUB', 'LINKEDIN', 'MESSAGE', 'INSTAGRAM'];

  // Animate sketched waves in render loop
  useFrame((state) => {
    if (wavesRef.current) {
      // Wave motion translation
      wavesRef.current.position.y = -1.8 + Math.sin(state.clock.getElapsedTime() * 1.5) * 0.05;
    }
  });

  return (
    <group>
      {/* 1. The Wooden Pier Deck */}
      <mesh position={[0, -1.6, -3]} rotation={[-Math.PI / 2.2, 0, 0]}>
        <planeGeometry args={[2.5, 6]} />
        <meshBasicMaterial map={pierTexture} side={THREE.DoubleSide} />
      </mesh>

      {/* 2. Interactive Signboards in the water */}
      {signs.map((sign, idx) => {
        const xPos = -2.2 + idx * 1.5;
        const zPos = -4.5 + (idx % 2) * 0.4;
        const yRot = (idx % 2 === 0 ? 0.2 : -0.2);
        return (
          <group 
            key={sign} 
            position={[xPos, -0.6, zPos]} 
            rotation={[0, yRot, 0]}
            onClick={(e) => {
              e.stopPropagation();
              onSelectSign(sign);
            }}
          >
            {/* Post */}
            <mesh position={[0, -0.6, 0]}>
              <boxGeometry args={[0.08, 1.2, 0.08]} />
              <meshBasicMaterial color="#1a1a1a" />
            </mesh>

            {/* Board */}
            <mesh>
              <planeGeometry args={[1.3, 0.6]} />
              <meshBasicMaterial map={makeSignTexture(sign)} side={THREE.DoubleSide} />
            </mesh>

            <mesh position={[0.04, -0.04, -0.01]}>
              <planeGeometry args={[1.3, 0.6]} />
              <meshBasicMaterial color="#1a1a1a" />
            </mesh>
          </group>
        );
      })}

      {/* 3. Ocean Waves Plane */}
      <mesh ref={wavesRef} position={[0, -1.8, -5]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[16, 8]} />
        <meshBasicMaterial 
          transparent 
          map={useMemo(() => {
            const canvas = document.createElement('canvas');
            canvas.width = 512;
            canvas.height = 256;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.fillStyle = '#e2ecf5';
              ctx.fillRect(0,0,512,256);
              ctx.strokeStyle = '#1a1a1a';
              ctx.lineWidth = 3;
              // Draw wave stroke rows
              for (let y = 15; y < 256; y += 30) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                for (let x = 10; x <= 512; x += 20) {
                  ctx.quadraticCurveTo(x - 10, y - 8, x, y);
                }
                ctx.stroke();
              }
            }
            return new THREE.CanvasTexture(canvas);
          }, [])} 
        />
      </mesh>
    </group>
  );
};
