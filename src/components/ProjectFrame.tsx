import React, { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ProjectFrameProps {
  position: [number, number, number];
  rotation: [number, number, number];
  title: string;
  description: string;
  techTags: string[];
  sketchColor: string;
  colorTheme: 'ivory' | 'sky' | 'forest' | 'crimson';
}

export const ProjectFrame: React.FC<ProjectFrameProps> = ({
  position,
  rotation,
  title,
  description,
  techTags,
  sketchColor,
  colorTheme,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const shaderRef = useRef<THREE.ShaderMaterial>(null);
  const [hovered, setHovered] = useState(false);
  const progressRef = useRef(0);

  // 1. Procedural Sketch Texture
  const sketchTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.Texture();

    // Sketch background
    ctx.fillStyle = '#faf8f5';
    ctx.fillRect(0, 0, 512, 512);

    // Frame outer border
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 10;
    ctx.strokeRect(20, 20, 472, 472);

    // Sketchy double-border
    ctx.strokeStyle = sketchColor;
    ctx.lineWidth = 4;
    ctx.strokeRect(35, 35, 442, 442);

    // Drawing a crosshatch background inside the frame
    ctx.strokeStyle = 'rgba(0,0,0,0.06)';
    ctx.lineWidth = 1;
    for (let i = 40; i < 470; i += 12) {
      ctx.beginPath();
      ctx.moveTo(i, 40);
      ctx.lineTo(40, i);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(i, 470);
      ctx.lineTo(470, i);
      ctx.stroke();
    }

    // Sketchy Title
    ctx.fillStyle = '#1a1a1a';
    ctx.font = 'bold 36px "Gloria Hallelujah", cursive';
    ctx.textAlign = 'center';
    ctx.fillText(title, 256, 150);

    // Sketchy Description
    ctx.font = '28px "Caveat", cursive';
    ctx.fillText(description, 256, 220);

    // Draw a sketchy representation of a computer screen or graphic
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 3;
    // Monitor screen outline
    ctx.strokeRect(106, 270, 300, 160);
    // Screen shine sketch
    ctx.beginPath();
    ctx.moveTo(126, 290);
    ctx.lineTo(186, 290);
    ctx.moveTo(126, 310);
    ctx.lineTo(156, 310);
    ctx.stroke();

    // Stand
    ctx.beginPath();
    ctx.moveTo(256, 430);
    ctx.lineTo(256, 460);
    ctx.moveTo(226, 460);
    ctx.lineTo(286, 460);
    ctx.stroke();

    // Draw some tech tag labels
    ctx.fillStyle = sketchColor;
    ctx.font = '22px "Gloria Hallelujah", cursive';
    ctx.fillText(`[ ${techTags.join(' / ')} ]`, 256, 485);

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }, [title, description, techTags, sketchColor]);

  // 2. Procedural Color Texture
  const colorTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.Texture();

    // Determine theme gradient
    let gradStart = '#ffffff';
    let gradEnd = '#e0e0e0';
    let textColor = '#1a1a1a';
    let accentText = '#c94a4a';

    if (colorTheme === 'sky') {
      gradStart = '#4facfe';
      gradEnd = '#00f2fe';
      textColor = '#ffffff';
      accentText = '#ffff00';
    } else if (colorTheme === 'forest') {
      gradStart = '#0ba360';
      gradEnd = '#3cba92';
      textColor = '#ffffff';
      accentText = '#f9d423';
    } else if (colorTheme === 'crimson') {
      gradStart = '#f857a6';
      gradEnd = '#ff5858';
      textColor = '#ffffff';
      accentText = '#00ffff';
    } else if (colorTheme === 'ivory') {
      gradStart = '#ffffff';
      gradEnd = '#e0c3fc';
      textColor = '#333333';
      accentText = '#8e2de2';
    }

    // Base background gradient
    const grad = ctx.createLinearGradient(0, 0, 512, 512);
    grad.addColorStop(0, gradStart);
    grad.addColorStop(1, gradEnd);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    // Frame border
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 14;
    ctx.strokeRect(7, 7, 498, 498);

    // Glassmorphic overlay card
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.fillRect(40, 40, 432, 432);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.strokeRect(40, 40, 432, 432);

    // Title
    ctx.fillStyle = textColor;
    ctx.font = '800 42px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    ctx.shadowBlur = 10;
    ctx.fillText(title, 256, 120);
    ctx.shadowBlur = 0; // reset

    // Subtitle / Description
    ctx.fillStyle = textColor;
    ctx.font = '500 24px "Inter", sans-serif';
    ctx.fillText(description, 256, 180);

    // Render mockup browser frame
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(80, 230, 352, 200, 10) : ctx.rect(80, 230, 352, 200);
    ctx.fill();

    // Browser dots
    ctx.fillStyle = '#ff5f56';
    ctx.beginPath(); ctx.arc(105, 248, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffbd2e';
    ctx.beginPath(); ctx.arc(125, 248, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#27c93f';
    ctx.beginPath(); ctx.arc(145, 248, 6, 0, Math.PI * 2); ctx.fill();

    // Project graphic / mock UI dashboard line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(110, 330);
    ctx.lineTo(220, 290);
    ctx.lineTo(310, 350);
    ctx.lineTo(400, 310);
    ctx.stroke();

    // Tech Tags
    ctx.fillStyle = accentText;
    ctx.font = 'bold 22px "Inter", sans-serif';
    ctx.fillText(techTags.join(' • '), 256, 465);

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }, [title, description, techTags, colorTheme]);

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
          
          // Generate sketchy noise
          float r = rand(vUv * 64.0 + sin(uTime) * 0.01);
          
          // Noise dissolve algorithm
          float threshold = uProgress;
          float factor = smoothstep(threshold - 0.08, threshold + 0.08, r);
          
          vec4 finalColor = mix(color, sketch, factor);
          gl_FragColor = finalColor;
        }
      `
    });
  }, [sketchTexture, colorTexture]);

  // Smooth uniform progress animation with R3F render loop
  useFrame((state) => {
    if (shaderRef.current) {
      shaderRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
      
      // Calculate distance to camera to auto-reveal color
      const camZ = state.camera.position.z;
      const frameZ = position[2];
      const dist = Math.abs(camZ - frameZ);
      
      // If camera is close (within 5 units) or hovered, transition to color
      const isClose = dist < 6.0;
      const targetProgress = (hovered || isClose) ? 1.0 : 0.0;
      
      // Interpolate progress smoothly
      progressRef.current = THREE.MathUtils.lerp(progressRef.current, targetProgress, 0.08);
      shaderRef.current.uniforms.uProgress.value = progressRef.current;
    }
  });

  return (
    <group position={position} rotation={rotation}>
      {/* 3D frame board mesh */}
      <mesh
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <planeGeometry args={[3, 3]} />
        <primitive object={shaderMaterial} ref={shaderRef} attach="material" />
      </mesh>

      {/* Sketchy 3D frame shadow backing */}
      <mesh position={[0.04, -0.04, -0.02]}>
        <planeGeometry args={[3, 3]} />
        <meshBasicMaterial color="#1a1a1a" />
      </mesh>
    </group>
  );
};
