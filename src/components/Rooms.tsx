import React, { useMemo, useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// ====================================================
// 1. GALLERY ROOM ( clothesline wire, city skyline, sways, art critic )
// ====================================================
interface GalleryRoomProps {
  onSelectProject: (project: any) => void;
  artCritic: boolean;
}

// Sub-component for individual project cards hanging on the wire
const HangingCard: React.FC<{
  project: any;
  index: number;
  artCritic: boolean;
  onSelect: () => void;
  hasDraggedRef: React.MutableRefObject<boolean>;
}> = ({ project, index, artCritic, onSelect, hasDraggedRef }) => {
  const cardRef = useRef<THREE.Group>(null);
  const shaderRef = useRef<THREE.ShaderMaterial>(null);
  const progressRef = useRef(0);
  const [hovered, setHovered] = useState(false);

  // 1. Sketch Texture (black ink, hand-drawn paper look)
  const sketchTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 680;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.Texture();

    ctx.fillStyle = '#faf8f5';
    ctx.fillRect(0, 0, 512, 680);

    // Sketchy double border
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 4;
    ctx.strokeRect(15, 15, 482, 650);
    ctx.lineWidth = 1.5;
    ctx.strokeRect(25, 25, 462, 630);

    // Crosshatch shading at the top corners
    ctx.strokeStyle = 'rgba(0,0,0,0.06)';
    ctx.lineWidth = 1;
    for (let i = 25; i < 150; i += 8) {
      ctx.beginPath(); ctx.moveTo(i, 25); ctx.lineTo(25, i); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(487 - i, 25); ctx.lineTo(487, i); ctx.stroke();
    }

    // Title
    ctx.fillStyle = '#1a1a1a';
    ctx.font = 'bold 36px "Gloria Hallelujah", cursive';
    ctx.textAlign = 'center';
    ctx.fillText(project.title, 256, 95);

    // Line under title
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(100, 120);
    ctx.lineTo(412, 120);
    ctx.stroke();

    // Sketchy Graphics depending on the project
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 3.5;
    ctx.fillStyle = '#faf8f5';

    if (project.title.includes('MoneTune')) {
      // Sleek database cylinders & browser wireframe
      ctx.strokeRect(96, 170, 320, 200); // browser frame
      // cylinders
      ctx.strokeRect(140, 210, 60, 110);
      ctx.strokeRect(310, 250, 60, 70);
      // dollar sign
      ctx.font = 'bold 44px "Gloria Hallelujah", cursive';
      ctx.fillText('$', 256, 280);
    } 
    else if (project.title.includes('TimberKitty')) {
      // Sketchy cat chopping wood
      ctx.strokeRect(96, 170, 320, 200);
      // Logs
      ctx.strokeRect(130, 290, 80, 50);
      ctx.strokeRect(290, 280, 90, 60);
      // Axe
      ctx.beginPath();
      ctx.moveTo(220, 230); ctx.lineTo(260, 280); // handle
      ctx.stroke();
      ctx.fillRect(245, 260, 30, 20); // axe head
      ctx.strokeRect(245, 260, 30, 20);
    } 
    else if (project.title.includes('Young Multi')) {
      // Music cassette tape & CD
      ctx.strokeRect(96, 170, 320, 200);
      // cassette
      ctx.strokeRect(120, 220, 130, 80);
      ctx.strokeRect(140, 240, 90, 40);
      // CD circle
      ctx.beginPath();
      ctx.arc(320, 270, 50, 0, Math.PI*2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(320, 270, 15, 0, Math.PI*2);
      ctx.stroke();
    } 
    else {
      // Bio / Face portrait
      ctx.strokeRect(96, 170, 320, 200);
      // head
      ctx.beginPath();
      ctx.arc(256, 250, 50, 0, Math.PI*2);
      ctx.fill();
      ctx.stroke();
      // glasses
      ctx.lineWidth = 2.5;
      ctx.strokeRect(220, 240, 28, 22);
      ctx.strokeRect(264, 240, 28, 22);
    }

    // Details text
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.font = '24px "Caveat", cursive';
    ctx.fillText(project.desc.substring(0, 45) + '...', 256, 440);

    // Tech badges sketched
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 2;
    ctx.font = '20px "Gloria Hallelujah", cursive';
    project.tags.forEach((tag: string, i: number) => {
      const tx = 90 + i * 160;
      ctx.strokeRect(tx, 520, 140, 55);
      ctx.fillStyle = '#1a1a1a';
      ctx.fillText(tag, tx + 70, 555);
    });

    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.font = '18px "Gloria Hallelujah", cursive';
    ctx.fillText('Click project to inspect', 256, 625);

    return new THREE.CanvasTexture(canvas);
  }, [project]);

  // 2. Color Texture (Vibrant colors, gradients)
  const colorTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 680;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.Texture();

    // Determine card gradient based on project
    let gradStart = '#ffffff';
    let gradEnd = '#e0e0e0';
    let textColor = '#1a1a1a';
    let accentText = '#c94a4a';

    if (project.title.includes('MoneTune')) {
      gradStart = '#4facfe'; gradEnd = '#00f2fe';
      textColor = '#ffffff'; accentText = '#ffff00';
    } else if (project.title.includes('TimberKitty')) {
      gradStart = '#0ba360'; gradEnd = '#3cba92';
      textColor = '#ffffff'; accentText = '#f9d423';
    } else if (project.title.includes('Young Multi')) {
      gradStart = '#f857a6'; gradEnd = '#ff5858';
      textColor = '#ffffff'; accentText = '#00ffff';
    } else {
      gradStart = '#ff9a9e'; gradEnd = '#fecfef';
      textColor = '#333333'; accentText = '#8e2de2';
    }

    const grad = ctx.createLinearGradient(0, 0, 512, 680);
    grad.addColorStop(0, gradStart);
    grad.addColorStop(1, gradEnd);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 680);

    // Frame border
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 14;
    ctx.strokeRect(7, 7, 498, 666);

    // Glassmorphic card overlay
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.fillRect(35, 35, 442, 610);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(35, 35, 442, 610);

    // Title
    ctx.fillStyle = textColor;
    ctx.font = '800 42px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(project.title, 256, 110);

    // Mock Dashboard
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(80, 180, 352, 220, 12) : ctx.rect(80, 180, 352, 220);
    ctx.fill();

    // Browser dots
    ctx.fillStyle = '#ff5f56'; ctx.beginPath(); ctx.arc(110, 205, 7, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffbd2e'; ctx.beginPath(); ctx.arc(130, 205, 7, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#27c93f'; ctx.beginPath(); ctx.arc(150, 205, 7, 0, Math.PI * 2); ctx.fill();

    // Wave / detail drawing in color
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(110, 310);
    ctx.lineTo(200, 260);
    ctx.lineTo(290, 340);
    ctx.lineTo(400, 290);
    ctx.stroke();

    // Details text
    ctx.fillStyle = textColor;
    ctx.font = '600 22px "Inter", sans-serif';
    ctx.fillText(project.desc.substring(0, 40) + '...', 256, 460);

    // Tech Tags
    ctx.fillStyle = accentText;
    ctx.font = 'bold 24px "Inter", sans-serif';
    ctx.fillText(project.tags.join(' • '), 256, 540);

    ctx.fillStyle = textColor;
    ctx.font = 'bold 20px "Inter", sans-serif';
    ctx.fillText('OPEN PROJECT', 256, 610);

    return new THREE.CanvasTexture(canvas);
  }, [project]);

  // 3. Custom shader for noise transition dissolve effect
  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTextureSketch: { value: sketchTexture },
        uTextureColor: { value: colorTexture },
        uProgress: { value: 0.0 },
        uTime: { value: 0.0 }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        uniform sampler2D uTextureSketch;
        uniform sampler2D uTextureColor;
        uniform float uProgress;
        uniform float uTime;

        // Custom pseudo-random function for noise
        float rand(vec2 co){
            return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
        }

        void main() {
          vec4 sketch = texture2D(uTextureSketch, vUv);
          vec4 color = texture2D(uTextureColor, vUv);
          
          float r = rand(vUv * 64.0 + sin(uTime) * 0.01);
          float threshold = uProgress;
          float factor = smoothstep(threshold - 0.08, threshold + 0.08, r);
          
          vec4 finalColor = mix(color, sketch, factor);
          gl_FragColor = finalColor;
        }
      `
    });
  }, [sketchTexture, colorTexture]);

  // Swaying and hover transitions
  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    if (cardRef.current) {
      // Gentle swaying in the wind
      const swayZ = Math.sin(time * 1.5 + index * 0.8) * 0.03;
      const swayY = Math.cos(time * 0.8 + index * 0.5) * 0.015;
      cardRef.current.rotation.z = swayZ;
      cardRef.current.rotation.y = swayY;

      // Hover floating offset
      const targetScale = hovered ? 1.08 : 1.0;
      cardRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, 1), 0.1);
    }

    if (shaderRef.current) {
      shaderRef.current.uniforms.uTime.value = time;
      
      // Interpolate progress smoothly depending on artCritic state
      const targetProgress = artCritic ? 1.0 : 0.0;
      progressRef.current = THREE.MathUtils.lerp(progressRef.current, targetProgress, 0.06);
      shaderRef.current.uniforms.uProgress.value = progressRef.current;
    }
  });

  return (
    <group ref={cardRef}>
      {/* 3D Clothespin clip peg */}
      <mesh position={[0, 1.35, 0.02]}>
        <boxGeometry args={[0.08, 0.3, 0.06]} />
        <meshBasicMaterial color="#d4b08c" /> {/* Wooden color */}
      </mesh>
      {/* Peg shadow backing */}
      <mesh position={[0.02, 1.32, -0.01]}>
        <boxGeometry args={[0.08, 0.3, 0.06]} />
        <meshBasicMaterial color="#1a1a1a" />
      </mesh>

      {/* Main Card Mesh */}
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          if (!hasDraggedRef.current) {
            onSelect();
          }
        }}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <planeGeometry args={[1.5, 2.0]} />
        <primitive object={shaderMaterial} ref={shaderRef} attach="material" />
      </mesh>

      {/* Sketched Frame shadow backing */}
      <mesh position={[0.05, -0.05, -0.02]}>
        <planeGeometry args={[1.5, 2.0]} />
        <meshBasicMaterial color="#1a1a1a" />
      </mesh>
    </group>
  );
};

export const GalleryRoom: React.FC<GalleryRoomProps> = ({ onSelectProject, artCritic }) => {
  const groupRef = useRef<THREE.Group>(null);
  const { gl } = useThree();
  
  // Dragging scroll state
  const dragOffset = useRef(0);
  const pointerDownX = useRef(0);
  const isDragging = useRef(false);
  const hasDragged = useRef(false);
  const dragStartOffset = useRef(0);
  const hasDraggedRef = useRef(false);

  useEffect(() => {
    const handleDown = (e: PointerEvent) => {
      isDragging.current = true;
      hasDragged.current = false;
      hasDraggedRef.current = false;
      pointerDownX.current = e.clientX;
      dragStartOffset.current = dragOffset.current;
    };

    const handleMove = (e: PointerEvent) => {
      if (!isDragging.current) return;
      const deltaX = e.clientX - pointerDownX.current;
      
      if (Math.abs(deltaX) > 8) {
        hasDragged.current = true;
        hasDraggedRef.current = true;
      }

      const scaleFactor = 0.015;
      dragOffset.current = dragStartOffset.current + deltaX * scaleFactor;

      // Clamp clothesline scroll limit (span from -7 to 7)
      dragOffset.current = Math.min(Math.max(dragOffset.current, -7), 7);
    };

    const handleUp = () => {
      isDragging.current = false;
    };

    const dom = gl.domElement;
    dom.addEventListener('pointerdown', handleDown);
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);

    return () => {
      dom.removeEventListener('pointerdown', handleDown);
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };
  }, [gl]);

  // Skyline background texture
  const skylineTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.Texture();

    ctx.fillStyle = '#faf8f5';
    ctx.fillRect(0,0,1024,512);

    // Sketchy buildings outline
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 3.5;
    ctx.fillStyle = '#faf8f5';

    const drawBuilding = (x: number, w: number, h: number) => {
      ctx.beginPath();
      ctx.rect(x, 512 - h, w, h);
      ctx.fill();
      ctx.stroke();

      // Windows sketchy lines
      ctx.strokeStyle = 'rgba(0,0,0,0.18)';
      ctx.lineWidth = 1.8;
      for (let wy = 512 - h + 20; wy < 490; wy += 35) {
        for (let wx = x + 15; wx < x + w - 15; wx += 25) {
          ctx.strokeRect(wx, wy, 12, 18);
        }
      }
      ctx.strokeStyle = '#1a1a1a';
      ctx.lineWidth = 3.5;
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

    // vertical balusters with loops
    for (let x = 20; x < 512; x += 40) {
      ctx.strokeRect(x, 22, 10, 84);
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
    { title: 'Tomasz Szmajda', desc: 'A fast, modern personal bio page serving as a central hub for all my latest projects and digital footprint.', tags: ['React', 'Next.js', 'Vercel'] },
    { title: 'MoneTune', desc: 'A fast, personal budget and finance dashboard tracking expenses and recurring subscriptions.', tags: ['React', 'Node', 'Postgres'] },
    { title: 'TimberKitty', desc: 'An addictive browser arcade game where players control a lumberjack cat to chop wood.', tags: ['JS', 'CSS Grid', 'GSAP'] },
    { title: 'MoneTune (v2)', desc: 'A personal budget and finance dashboard tracking expenses and recurring subscriptions.', tags: ['React', 'Node', 'Postgres'] },
    { title: 'TimberKitty (v2)', desc: 'An addictive browser arcade game where players control a lumberjack cat to chop wood.', tags: ['JS', 'CSS Grid', 'GSAP'] },
    { title: 'Young Multi', desc: 'A sleek, modern 3D promotional landing page mapped to custom scroll camera behaviors.', tags: ['Three.js', 'R3F', 'Blender'] },
    { title: 'Tomasz Szmajda (v2)', desc: 'A fast, modern personal bio page serving as a central hub for all my latest projects.', tags: ['React', 'Next.js', 'Vercel'] }
  ];

  // Lerp horizontal drag position
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, dragOffset.current, 0.08);
    }
  });

  return (
    <group>
      {/* City Skyline Background */}
      <mesh position={[0, 1.5, -6]}>
        <planeGeometry args={[16, 8]} />
        <meshBasicMaterial map={skylineTexture} />
      </mesh>

      {/* Fence Railing Balcony */}
      <mesh position={[0, -1.8, -2]}>
        <planeGeometry args={[10, 2.5]} />
        <meshBasicMaterial map={fenceTexture} transparent />
      </mesh>

      {/* Hanging Wire clothesline */}
      <mesh position={[0, 2, -3.1]}>
        <planeGeometry args={[30, 0.02]} />
        <meshBasicMaterial color="#1a1a1a" />
      </mesh>

      {/* Draggable group of hanging clothesline cards */}
      <group ref={groupRef}>
        {projects.map((proj, idx) => {
          // Span from -6 to 6 units
          const xPos = -6 + idx * 2.0;
          return (
            <group key={`${proj.title}-${idx}`} position={[xPos, 0.6, -3.0]}>
              <HangingCard
                project={proj}
                index={idx}
                artCritic={artCritic}
                onSelect={() => onSelectProject(proj)}
                hasDraggedRef={hasDraggedRef}
              />
            </group>
          );
        })}
      </group>
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
