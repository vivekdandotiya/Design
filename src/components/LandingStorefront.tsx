import React, { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface LandingStorefrontProps {
  onEnterCorridor: () => void;
}

export const LandingStorefront: React.FC<LandingStorefrontProps> = ({ onEnterCorridor }) => {
  const leftHingeRef = useRef<THREE.Group>(null);
  const rightHingeRef = useRef<THREE.Group>(null);
  
  const [isOpen, setIsOpen] = useState(false);
  const openProgress = useRef(0);
  const transitionTriggered = useRef(false);

  // 1. Repeating Brick Wall Texture (512x256, seamless running bond)
  const brickTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.Texture();

    // Base wall color (light grey paper tone)
    ctx.fillStyle = '#faf8f5';
    ctx.fillRect(0, 0, 512, 256);

    ctx.strokeStyle = 'rgba(0, 0, 0, 0.45)'; // sketchy charcoal line color
    ctx.lineWidth = 1.3;

    // Draw horizontal brick lines (align at borders for seamless wrap)
    for (let y = 0; y <= 256; y += 64) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      for (let x = 16; x <= 512; x += 16) {
        ctx.lineTo(x, y + (Math.random() - 0.5) * 1.0);
      }
      ctx.stroke();
    }

    // Draw vertical brick joints (offset per row for running bond)
    for (let r = 0; r < 4; r++) {
      const yStart = r * 64;
      const yEnd = yStart + 64;
      const isOffset = r % 2 === 1;
      
      for (let c = 0; c < 4; c++) {
        const x = c * 128 + (isOffset ? 64 : 0);
        ctx.beginPath();
        ctx.moveTo(x, yStart);
        ctx.lineTo(x + (Math.random() - 0.5) * 1.0, yEnd);
        ctx.stroke();
        
        // Random brick hatching
        if (Math.random() < 0.22) {
          ctx.save();
          ctx.beginPath();
          ctx.rect(x + 4, yStart + 4, 120, 56);
          ctx.clip();
          
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
          ctx.lineWidth = 0.8;
          for (let k = -20; k < 180; k += 8) {
            ctx.beginPath();
            ctx.moveTo(x + k, yStart);
            ctx.lineTo(x + k - 64, yEnd);
            ctx.stroke();
          }
          ctx.restore();
        }
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(8, 2.5); // covers the wide wall seamlessly
    return texture;
  }, []);

  // 2. PORTFOLIO Wooden Sign Texture (512x128)
  const signTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.Texture();

    ctx.fillStyle = 'rgba(0,0,0,0)';
    ctx.fillRect(0, 0, 512, 128);

    // Support bar
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(40, 20);
    ctx.lineTo(472, 20);
    ctx.stroke();
    
    // Support ropes/chains
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(120, 20);
    ctx.lineTo(120, 50);
    ctx.moveTo(392, 20);
    ctx.lineTo(392, 50);
    ctx.stroke();

    // Plank sign board
    ctx.fillStyle = '#d8a773'; // wooden color
    ctx.fillRect(80, 50, 352, 68);
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 4.5;
    ctx.strokeRect(80, 50, 352, 68);
    
    // Wood grain lines
    ctx.strokeStyle = 'rgba(0,0,0,0.15)';
    ctx.lineWidth = 1.5;
    for (let sy = 60; sy < 110; sy += 12) {
      ctx.beginPath();
      ctx.moveTo(80, sy);
      ctx.quadraticCurveTo(256, sy + (Math.random() - 0.5) * 6, 432, sy);
      ctx.stroke();
    }

    // Sign text "PORTFOLIO"
    ctx.fillStyle = '#1a1a1a';
    ctx.font = 'bold 32px "Gloria Hallelujah", cursive';
    ctx.textAlign = 'center';
    ctx.fillText('PORTFOLIO', 256, 95);

    return new THREE.CanvasTexture(canvas);
  }, []);

  // 3. Window & Succulents Planter Texture (512x512)
  const windowTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.Texture();

    ctx.fillStyle = 'rgba(0,0,0,0)';
    ctx.fillRect(0, 0, 512, 512);

    // Window frame
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 5.5;
    ctx.fillStyle = '#faf8f5';
    ctx.fillRect(100, 40, 312, 260);
    ctx.strokeRect(100, 40, 312, 260);
    
    // Window panes
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(256, 40);
    ctx.lineTo(256, 300);
    ctx.moveTo(100, 170);
    ctx.lineTo(412, 170);
    ctx.stroke();

    // Plant box planter box
    ctx.fillStyle = '#d8a773'; // matching wooden color
    ctx.fillRect(70, 300, 372, 80); // directly aligns with window bottom (no gap!)
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 4;
    ctx.strokeRect(70, 300, 372, 80);
    
    // Wood grain lines
    ctx.strokeStyle = 'rgba(0,0,0,0.15)';
    ctx.lineWidth = 1.5;
    for (let py = 315; py < 370; py += 15) {
      ctx.beginPath();
      ctx.moveTo(70, py);
      ctx.lineTo(442, py + (Math.random() - 0.5) * 2);
      ctx.stroke();
    }
    
    // Rubber Ducky (x = 256, y = 295)
    ctx.save();
    ctx.translate(256, 290);
    ctx.fillStyle = '#fbe15c'; // yellow
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.ellipse(0, 10, 16, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(-8, -4, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#f67e22'; // orange beak
    ctx.beginPath();
    ctx.moveTo(-17, -6);
    ctx.lineTo(-24, -3);
    ctx.lineTo(-17, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#1a1a1a'; // eye
    ctx.beginPath();
    ctx.arc(-10, -6, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Cacti / Succulents
    // Saguaro cactus (left side, x = 125, y = 250)
    const drawSaguaro = (x: number, y: number) => {
      ctx.strokeStyle = '#1a1a1a';
      ctx.fillStyle = '#faf8f5';
      ctx.lineWidth = 2.2;
      
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(x - 6, y, 12, 50, 6) : ctx.rect(x - 6, y, 12, 50);
      ctx.fill();
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(x - 6, y + 25);
      ctx.quadraticCurveTo(x - 18, y + 25, x - 18, y + 10);
      ctx.lineTo(x - 12, y + 10);
      ctx.quadraticCurveTo(x - 12, y + 20, x - 6, y + 20);
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(x + 6, y + 18);
      ctx.quadraticCurveTo(x + 18, y + 18, x + 18, y + 3);
      ctx.lineTo(x + 12, y + 3);
      ctx.quadraticCurveTo(x + 12, y + 13, x + 6, y + 13);
      ctx.fill();
      ctx.stroke();
      
      ctx.fillStyle = '#1a1a1a';
      for (let sy = y + 5; sy < y + 45; sy += 8) {
        ctx.fillRect(x - 9, sy, 2, 2);
        ctx.fillRect(x + 7, sy, 2, 2);
      }
    };
    drawSaguaro(135, 250);

    // Prickly pear cactus (x = 190, y = 250)
    const drawPricklyPear = (x: number, y: number) => {
      ctx.strokeStyle = '#1a1a1a';
      ctx.fillStyle = '#faf8f5';
      ctx.lineWidth = 2.2;
      
      ctx.beginPath();
      ctx.ellipse(x, y + 30, 16, 20, 0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      
      ctx.beginPath();
      ctx.ellipse(x - 12, y + 10, 12, 16, -0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      
      ctx.beginPath();
      ctx.ellipse(x + 10, y + 12, 10, 14, 0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    };
    drawPricklyPear(195, 250);

    // Rosette Succulents (right side)
    const drawRosette = (x: number, y: number, r: number) => {
      ctx.strokeStyle = '#1a1a1a';
      ctx.fillStyle = '#faf8f5';
      ctx.lineWidth = 1.8;
      ctx.save();
      ctx.translate(x, y);
      
      for (let layer = r; layer > 4; layer -= 6) {
        const petals = 6 + Math.floor(layer / 3);
        ctx.beginPath();
        for (let i = 0; i < petals; i++) {
          const angle = (i / petals) * Math.PI * 2 + (layer * 0.1);
          const px = Math.cos(angle) * layer;
          const py = Math.sin(angle) * layer;
          ctx.arc(px, py, layer * 0.35, 0, Math.PI * 2);
        }
        ctx.fill();
        ctx.stroke();
      }
      ctx.restore();
    };
    drawRosette(335, 285, 20);
    drawRosette(380, 282, 22);

    return new THREE.CanvasTexture(canvas);
  }, []);

  // 4. Left Door Texture (512x1280 - perfect 1:2.5 ratio, Wood Grain + Badges)
  const leftDoorTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 1280;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.Texture();

    // Wood base gradient
    const grad = ctx.createLinearGradient(0, 0, 512, 1280);
    grad.addColorStop(0, '#d8a773');
    grad.addColorStop(1, '#b08154');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 1280);

    // Door border & panels
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 10;
    ctx.strokeRect(10, 10, 492, 1260);

    // Beveled panels lines
    ctx.lineWidth = 6;
    ctx.strokeRect(30, 40, 210, 360);
    ctx.strokeRect(272, 40, 210, 360);
    
    ctx.strokeRect(30, 460, 210, 380);
    ctx.strokeRect(272, 460, 210, 380);

    ctx.strokeRect(30, 880, 210, 360);
    ctx.strokeRect(272, 880, 210, 360);

    // Wood grain lines
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.lineWidth = 2.5;
    for (let wx = 20; wx < 500; wx += 40) {
      ctx.beginPath();
      ctx.moveTo(wx, 10);
      ctx.bezierCurveTo(wx + (Math.random() - 0.5) * 30, 400, wx + (Math.random() - 0.5) * 30, 900, wx, 1270);
      ctx.stroke();
    }

    const setStickerShadow = () => {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetX = 3;
      ctx.shadowOffsetY = 4;
    };
    
    const resetShadow = () => {
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    };

    // --- HTML5 Badge ---
    ctx.save();
    ctx.translate(130, 220);
    ctx.rotate(-0.08);
    setStickerShadow();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(0, -66); ctx.lineTo(54, -46); ctx.lineTo(44, 46); ctx.lineTo(0, 66); ctx.lineTo(-44, 46); ctx.lineTo(-54, -46); ctx.closePath();
    ctx.fill();
    resetShadow();
    ctx.fillStyle = '#e34f26';
    ctx.beginPath();
    ctx.moveTo(0, -60); ctx.lineTo(48, -42); ctx.lineTo(38, 40); ctx.lineTo(0, 60); ctx.lineTo(-38, 40); ctx.lineTo(-48, -42); ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#1a1a1a'; ctx.lineWidth = 4; ctx.stroke();
    ctx.fillStyle = '#ffffff'; ctx.font = 'bold 55px "Inter", sans-serif'; ctx.textAlign = 'center'; ctx.fillText('5', 0, 20);
    ctx.fillStyle = '#1a1a1a'; ctx.font = 'bold 16px "Gloria Hallelujah", cursive'; ctx.fillText('HTML', 0, 48);
    ctx.restore();

    // --- JS Badge ---
    ctx.save();
    ctx.translate(130, 620);
    ctx.rotate(0.05);
    setStickerShadow();
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(0, 0, 58, 0, Math.PI * 2); ctx.fill();
    resetShadow();
    ctx.fillStyle = '#f7df1e'; ctx.beginPath(); ctx.arc(0, 0, 52, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#1a1a1a'; ctx.lineWidth = 4; ctx.stroke();
    ctx.fillStyle = '#1a1a1a'; ctx.font = 'bold 44px "Inter", sans-serif'; ctx.textAlign = 'center'; ctx.fillText('JS', 0, 15);
    ctx.restore();

    // --- TS Hex Badge ---
    ctx.save();
    ctx.translate(140, 1020);
    ctx.rotate(-0.1);
    setStickerShadow();
    ctx.fillStyle = '#ffffff'; ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      ctx.lineTo(Math.cos(angle) * 62, Math.sin(angle) * 62);
    }
    ctx.closePath(); ctx.fill();
    resetShadow();
    ctx.fillStyle = '#3178c6'; ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      ctx.lineTo(Math.cos(angle) * 54, Math.sin(angle) * 54);
    }
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#1a1a1a'; ctx.lineWidth = 4; ctx.stroke();
    ctx.fillStyle = '#ffffff'; ctx.font = 'bold 36px "Inter", sans-serif'; ctx.textAlign = 'center'; ctx.fillText('TS', 0, 12);
    ctx.restore();

    return new THREE.CanvasTexture(canvas);
  }, []);

  // 5. Right Door Texture (512x1280 - perfect 1:2.5 ratio, Wood Grain + Badges + Handles)
  const rightDoorTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 1280;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.Texture();

    // Wood base gradient
    const grad = ctx.createLinearGradient(0, 0, 512, 1280);
    grad.addColorStop(0, '#d8a773');
    grad.addColorStop(1, '#b08154');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 1280);

    // Door border & panels
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 10;
    ctx.strokeRect(10, 10, 492, 1260);

    // Beveled panels lines
    ctx.lineWidth = 6;
    ctx.strokeRect(30, 40, 210, 360);
    ctx.strokeRect(272, 40, 210, 360);
    
    ctx.strokeRect(30, 460, 210, 380);
    ctx.strokeRect(272, 460, 210, 380);

    ctx.strokeRect(30, 880, 210, 360);
    ctx.strokeRect(272, 880, 210, 360);

    // Wood grain lines
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.lineWidth = 2.5;
    for (let wx = 20; wx < 500; wx += 40) {
      ctx.beginPath();
      ctx.moveTo(wx, 10);
      ctx.bezierCurveTo(wx + (Math.random() - 0.5) * 30, 400, wx + (Math.random() - 0.5) * 30, 900, wx, 1270);
      ctx.stroke();
    }

    const setStickerShadow = () => {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetX = -3;
      ctx.shadowOffsetY = 4;
    };
    
    const resetShadow = () => {
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    };

    // --- React Badge ---
    ctx.save();
    ctx.translate(360, 220);
    ctx.rotate(0.08);
    setStickerShadow();
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(0, 0, 56, 0, Math.PI * 2); ctx.fill();
    resetShadow();
    ctx.fillStyle = '#20232a'; ctx.beginPath(); ctx.arc(0, 0, 50, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#1a1a1a'; ctx.lineWidth = 4; ctx.stroke();
    ctx.strokeStyle = '#61dafb'; ctx.lineWidth = 2.5;
    ctx.save(); ctx.scale(1, 0.35); ctx.beginPath(); ctx.arc(0, 0, 36, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
    ctx.save(); ctx.rotate(Math.PI / 3); ctx.scale(1, 0.35); ctx.beginPath(); ctx.arc(0, 0, 36, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
    ctx.save(); ctx.rotate(-Math.PI / 3); ctx.scale(1, 0.35); ctx.beginPath(); ctx.arc(0, 0, 36, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
    ctx.fillStyle = '#61dafb'; ctx.beginPath(); ctx.arc(0, 0, 6, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    // --- Node.js Badge ---
    ctx.save();
    ctx.translate(350, 620);
    ctx.rotate(-0.06);
    setStickerShadow();
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(-60, -38, 120, 76, 12) : ctx.rect(-60, -38, 120, 76); ctx.fill();
    resetShadow();
    ctx.fillStyle = '#339933'; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(-54, -32, 108, 64, 8) : ctx.rect(-54, -32, 108, 64); ctx.fill();
    ctx.strokeStyle = '#1a1a1a'; ctx.lineWidth = 4; ctx.stroke();
    ctx.fillStyle = '#ffffff'; ctx.font = 'bold 22px "Inter", sans-serif'; ctx.textAlign = 'center'; ctx.fillText('node.js', 0, 8);
    ctx.restore();

    // --- CSS3 Badge ---
    ctx.save();
    ctx.translate(350, 1020);
    ctx.rotate(0.12);
    setStickerShadow();
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.moveTo(0, -66); ctx.lineTo(54, -46); ctx.lineTo(44, 46); ctx.lineTo(0, 66); ctx.lineTo(-44, 46); ctx.lineTo(-54, -46); ctx.closePath(); ctx.fill();
    resetShadow();
    ctx.fillStyle = '#1572b6'; ctx.beginPath(); ctx.moveTo(0, -60); ctx.lineTo(48, -42); ctx.lineTo(38, 40); ctx.lineTo(0, 60); ctx.lineTo(-38, 40); ctx.lineTo(-48, -42); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#1a1a1a'; ctx.lineWidth = 4; ctx.stroke();
    ctx.fillStyle = '#ffffff'; ctx.font = 'bold 55px "Inter", sans-serif'; ctx.textAlign = 'center'; ctx.fillText('3', 0, 20);
    ctx.fillStyle = '#1a1a1a'; ctx.font = 'bold 16px "Gloria Hallelujah", cursive'; ctx.fillText('CSS', 0, 48);
    ctx.restore();

    // Brass handles
    ctx.fillStyle = '#e4c042';
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(15, 640, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillRect(8, 640, 6, 45);
    ctx.strokeRect(8, 640, 6, 45);

    return new THREE.CanvasTexture(canvas);
  }, []);

  // 6. Cartoon Cat on the path (256x256)
  const catTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.Texture();

    ctx.fillStyle = 'rgba(0,0,0,0)';
    ctx.fillRect(0,0,256,256);

    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 3.5;
    ctx.fillStyle = '#faf8f5';

    // Body (sitting cat posture)
    ctx.beginPath();
    ctx.ellipse(128, 170, 48, 64, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Chest fur lines
    ctx.strokeStyle = 'rgba(0,0,0,0.15)';
    ctx.lineWidth = 2;
    for (let c = 0; c < 4; c++) {
      ctx.beginPath();
      ctx.moveTo(110 + c * 10, 150);
      ctx.quadraticCurveTo(128, 175, 146 - c * 10, 150);
      ctx.stroke();
    }
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 3.5;

    // Head
    ctx.beginPath();
    ctx.arc(128, 90, 36, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Ears
    ctx.beginPath();
    ctx.moveTo(98, 74); ctx.lineTo(84, 34); ctx.lineTo(112, 60);
    ctx.moveTo(158, 74); ctx.lineTo(172, 34); ctx.lineTo(144, 60);
    ctx.fill();
    ctx.stroke();

    // Eyes
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.arc(114, 85, 3.5, 0, Math.PI * 2);
    ctx.arc(142, 85, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Nose/Mouth
    ctx.beginPath();
    ctx.moveTo(128, 92);
    ctx.lineTo(125, 96);
    ctx.lineTo(131, 96);
    ctx.closePath();
    ctx.fill();
    
    ctx.beginPath();
    ctx.moveTo(128, 96);
    ctx.quadraticCurveTo(122, 102, 118, 98);
    ctx.moveTo(128, 96);
    ctx.quadraticCurveTo(134, 102, 138, 98);
    ctx.stroke();

    // Whiskers
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(95, 95); ctx.lineTo(60, 92);
    ctx.moveTo(95, 100); ctx.lineTo(56, 103);
    ctx.moveTo(161, 95); ctx.lineTo(196, 92);
    ctx.moveTo(161, 100); ctx.lineTo(200, 103);
    ctx.stroke();

    // Tail
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(165, 200);
    ctx.quadraticCurveTo(180, 220, 150, 228);
    ctx.quadraticCurveTo(100, 230, 90, 215);
    ctx.stroke();

    // Paw lines
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.strokeRect(110, 215, 15, 15);
    ctx.strokeRect(133, 215, 15, 15);

    return new THREE.CanvasTexture(canvas);
  }, []);

  // 7. Tree & Hanging Mouse Texture (1024x1024 - high-fidelity hand-drawn)
  const treeTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.Texture();

    ctx.fillStyle = 'rgba(0,0,0,0)';
    ctx.fillRect(0, 0, 1024, 1024);

    const INK = '#1a1a1a';

    // ── Helper: draw a sketchy line with slight jitter ──
    const sketchLine = (x1: number, y1: number, x2: number, y2: number, lw: number = 2.5) => {
      ctx.strokeStyle = INK;
      ctx.lineWidth = lw;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      const segs = 5;
      for (let i = 1; i <= segs; i++) {
        const t = i / segs;
        ctx.lineTo(
          x1 + (x2 - x1) * t + (Math.random() - 0.5) * 2,
          y1 + (y2 - y1) * t + (Math.random() - 0.5) * 2
        );
      }
      ctx.stroke();
    };

    // ── Helper: draw a cloud-like scalloped foliage shape ──
    // Instead of smooth circles, we trace bumpy outlines with many small arcs
    const drawCloudFoliage = (cx: number, cy: number, rx: number, ry: number, bumpCount: number = 18, bumpR: number = 28) => {
      ctx.fillStyle = '#f5f3f0';
      ctx.strokeStyle = INK;
      ctx.lineWidth = 3.5;

      // Build the scalloped path
      ctx.beginPath();
      for (let i = 0; i < bumpCount; i++) {
        const angle = (i / bumpCount) * Math.PI * 2;
        const nextAngle = ((i + 1) / bumpCount) * Math.PI * 2;
        const midAngle = (angle + nextAngle) / 2;

        const edgeX = cx + Math.cos(angle) * rx;
        const edgeY = cy + Math.sin(angle) * ry;
        const nextEdgeX = cx + Math.cos(nextAngle) * rx;
        const nextEdgeY = cy + Math.sin(nextAngle) * ry;

        // Control point pushed outward for the bump
        const cpX = cx + Math.cos(midAngle) * (rx + bumpR + (Math.random() - 0.5) * 8);
        const cpY = cy + Math.sin(midAngle) * (ry + bumpR + (Math.random() - 0.5) * 8);

        if (i === 0) {
          ctx.moveTo(edgeX, edgeY);
        }
        ctx.quadraticCurveTo(cpX, cpY, nextEdgeX, nextEdgeY);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Interior scallop detail arcs (depth suggestion)
      ctx.strokeStyle = 'rgba(0,0,0,0.10)';
      ctx.lineWidth = 2;
      for (let i = 0; i < bumpCount; i++) {
        const angle = (i / bumpCount) * Math.PI * 2;
        const ax = cx + Math.cos(angle) * (rx * 0.7);
        const ay = cy + Math.sin(angle) * (ry * 0.7);
        ctx.beginPath();
        ctx.arc(ax, ay, bumpR * 0.6, angle - 0.8, angle + 0.8);
        ctx.stroke();
      }

      // Interior sketch hatching curves for shading depth
      ctx.strokeStyle = 'rgba(0,0,0,0.07)';
      ctx.lineWidth = 1.5;
      for (let k = 0; k < 10; k++) {
        const ix = cx + (Math.random() - 0.5) * rx * 1.2;
        const iy = cy + (Math.random() - 0.5) * ry * 1.2;
        const ir = 15 + Math.random() * 20;
        ctx.beginPath();
        ctx.arc(ix, iy, ir, Math.random(), Math.PI * (0.5 + Math.random() * 0.6));
        ctx.stroke();
      }
    };

    // ═══════════════════════════════════════════
    // TRUNK – thick, organically curved, with bark
    // ═══════════════════════════════════════════
    ctx.fillStyle = '#faf8f5';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;

    // Main trunk: wide base tapering to fork point
    ctx.beginPath();
    // Left edge of trunk (bottom to fork)
    ctx.moveTo(430, 1024);
    ctx.bezierCurveTo(415, 900, 410, 780, 430, 650);
    ctx.bezierCurveTo(440, 580, 445, 530, 450, 480);
    // Top of trunk at fork
    ctx.lineTo(470, 440);
    // Right edge back down
    ctx.lineTo(550, 440);
    ctx.bezierCurveTo(545, 530, 540, 580, 545, 650);
    ctx.bezierCurveTo(560, 780, 555, 900, 560, 1024);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Bark texture grain lines (vertical with organic wobble)
    ctx.strokeStyle = 'rgba(0,0,0,0.12)';
    ctx.lineWidth = 1.8;
    for (let tx = 440; tx < 555; tx += 14) {
      ctx.beginPath();
      ctx.moveTo(tx + (Math.random() - 0.5) * 4, 1024);
      ctx.bezierCurveTo(
        tx - 8 + Math.random() * 6, 850,
        tx + 5 + Math.random() * 6, 700,
        tx - 3 + Math.random() * 6, 480
      );
      ctx.stroke();
    }
    // Horizontal bark cracks
    ctx.strokeStyle = 'rgba(0,0,0,0.08)';
    ctx.lineWidth = 1.2;
    for (let by = 520; by < 1000; by += 35 + Math.random() * 25) {
      const bx1 = 435 + Math.random() * 15;
      const bx2 = 545 - Math.random() * 15;
      ctx.beginPath();
      ctx.moveTo(bx1, by);
      ctx.lineTo(bx2, by + (Math.random() - 0.5) * 6);
      ctx.stroke();
    }

    // ═══════════════════════════════════════════
    // MAJOR BRANCHES from the fork
    // ═══════════════════════════════════════════
    ctx.fillStyle = '#faf8f5';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;

    // LEFT MAIN BRANCH – thick limb curving left and upward
    ctx.beginPath();
    ctx.moveTo(450, 480);
    ctx.bezierCurveTo(400, 440, 340, 400, 270, 340);
    ctx.bezierCurveTo(240, 315, 210, 280, 190, 260);
    // return edge (thinner at tip)
    ctx.lineTo(210, 250);
    ctx.bezierCurveTo(230, 270, 260, 300, 300, 325);
    ctx.bezierCurveTo(370, 375, 430, 420, 470, 455);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Sub-branch from left main (goes further left-up, bare tip)
    ctx.beginPath();
    ctx.moveTo(300, 340);
    ctx.bezierCurveTo(260, 300, 220, 250, 170, 200);
    ctx.lineTo(185, 192);
    ctx.bezierCurveTo(230, 240, 275, 290, 320, 330);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Sub-branch going downward-left for mouse hang point
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(340, 380);
    ctx.bezierCurveTo(320, 410, 310, 440, 305, 470);
    ctx.lineTo(315, 472);
    ctx.bezierCurveTo(325, 445, 335, 415, 355, 385);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // RIGHT MAIN BRANCH – thick limb curving right and upward
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(550, 440);
    ctx.bezierCurveTo(600, 400, 660, 360, 730, 310);
    ctx.bezierCurveTo(760, 290, 790, 260, 810, 240);
    // return edge
    ctx.lineTo(795, 232);
    ctx.bezierCurveTo(770, 255, 740, 280, 710, 300);
    ctx.bezierCurveTo(640, 345, 580, 385, 535, 420);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Sub-branch from right main (bare tip extending up-right)
    ctx.beginPath();
    ctx.moveTo(710, 310);
    ctx.bezierCurveTo(740, 270, 770, 230, 800, 180);
    ctx.lineTo(810, 188);
    ctx.bezierCurveTo(780, 235, 750, 275, 725, 315);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // MIDDLE/UP BRANCH – goes straight up
    ctx.beginPath();
    ctx.moveTo(480, 450);
    ctx.bezierCurveTo(485, 400, 490, 350, 488, 290);
    ctx.lineTo(510, 290);
    ctx.bezierCurveTo(512, 350, 508, 400, 515, 450);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Upper fork from middle branch
    ctx.beginPath();
    ctx.moveTo(490, 310);
    ctx.bezierCurveTo(470, 260, 440, 210, 410, 160);
    ctx.lineTo(425, 155);
    ctx.bezierCurveTo(450, 200, 480, 250, 498, 300);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(508, 310);
    ctx.bezierCurveTo(530, 260, 560, 210, 590, 160);
    ctx.lineTo(580, 152);
    ctx.bezierCurveTo(550, 200, 525, 250, 503, 295);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // ═══════════════════════════════════════════
    // BARE BRANCH TIPS (extend beyond foliage)
    // Thin sketchy lines that poke out above foliage canopy
    // ═══════════════════════════════════════════
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.5;

    // Top-left bare twigs
    sketchLine(170, 200, 140, 145, 2.5);
    sketchLine(140, 145, 115, 100, 2);
    sketchLine(140, 145, 160, 105, 1.8);
    sketchLine(190, 260, 155, 225, 2);
    sketchLine(155, 225, 120, 190, 1.5);

    // Top-center bare twigs
    sketchLine(410, 160, 385, 105, 2.5);
    sketchLine(385, 105, 365, 55, 2);
    sketchLine(385, 105, 405, 65, 1.8);
    sketchLine(590, 160, 615, 100, 2.5);
    sketchLine(615, 100, 640, 50, 2);
    sketchLine(615, 100, 595, 60, 1.8);

    // Top-right bare twigs
    sketchLine(800, 180, 830, 130, 2.5);
    sketchLine(830, 130, 855, 85, 2);
    sketchLine(830, 130, 810, 90, 1.8);
    sketchLine(810, 240, 845, 195, 2);
    sketchLine(845, 195, 870, 155, 1.5);

    // Small forking twigs from branches
    sketchLine(250, 320, 225, 280, 1.8);
    sketchLine(225, 280, 200, 255, 1.5);
    sketchLine(740, 290, 770, 250, 1.8);
    sketchLine(770, 250, 790, 220, 1.5);

    // ═══════════════════════════════════════════
    // FOLIAGE – cloud-shaped scalloped masses
    // Drawn AFTER branches so they overlap properly
    // ═══════════════════════════════════════════

    // Large left foliage mass
    drawCloudFoliage(280, 260, 130, 110, 22, 26);
    // Large right foliage mass
    drawCloudFoliage(720, 250, 120, 100, 20, 25);
    // Central top foliage (biggest)
    drawCloudFoliage(500, 180, 155, 120, 24, 28);
    // Upper-left overlap
    drawCloudFoliage(380, 190, 110, 95, 18, 24);
    // Upper-right overlap
    drawCloudFoliage(620, 190, 110, 95, 18, 24);
    // Lower-center bridge (connects the masses visually)
    drawCloudFoliage(500, 310, 100, 80, 16, 22);

    // ═══════════════════════════════════════════
    // HANGING MOUSE – cord loops from branch, mouse dangles
    // ═══════════════════════════════════════════
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3;

    // Cord wrapping around branch then hanging down
    ctx.beginPath();
    ctx.moveTo(310, 470);
    // Small loop around the branch tip
    ctx.bezierCurveTo(305, 485, 315, 495, 310, 510);
    // Long hanging cord with natural swing curve
    ctx.bezierCurveTo(320, 560, 290, 620, 310, 700);
    ctx.stroke();

    // Mouse body
    ctx.save();
    ctx.translate(310, 740);
    ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 5;

    ctx.fillStyle = '#faf8f5';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;

    // Mouse oval body
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(-26, -38, 52, 76, 20) : ctx.rect(-26, -38, 52, 76);
    ctx.fill();
    ctx.stroke();

    // Top separation line (scroll wheel area)
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, -38);
    ctx.lineTo(0, -8);
    ctx.stroke();

    // Middle click line
    ctx.beginPath();
    ctx.moveTo(-26, -8);
    ctx.lineTo(26, -8);
    ctx.stroke();

    // Scroll wheel
    ctx.fillStyle = INK;
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(-4, -28, 8, 14, 3) : ctx.fillRect(-4, -28, 8, 14);
    ctx.fill();

    // Left/Right button labels (subtle lines)
    ctx.strokeStyle = 'rgba(0,0,0,0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-14, -32); ctx.lineTo(-14, -12);
    ctx.moveTo(14, -32); ctx.lineTo(14, -12);
    ctx.stroke();

    ctx.restore();

    return new THREE.CanvasTexture(canvas);
  }, []);

  // 8. Ground Cobblestone Texture (1024x512)
  const floorTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.Texture();

    ctx.fillStyle = '#faf8f5';
    ctx.fillRect(0, 0, 1024, 512);

    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 3.5;
    ctx.fillStyle = '#faf8f5';

    const pathLeft = 380;
    const pathWidth = 264;
    
    for (let sy = 0; sy < 512; sy += 45) {
      let sx = pathLeft;
      while (sx < pathLeft + pathWidth) {
        const stoneW = 50 + Math.random() * 40;
        const stoneH = 35 + Math.random() * 15;
        
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(sx, sy, stoneW - 8, stoneH - 6, 12) : ctx.rect(sx, sy, stoneW - 8, stoneH - 6);
        ctx.fill();
        ctx.stroke();

        if (Math.random() < 0.3) {
          ctx.strokeStyle = 'rgba(0,0,0,0.12)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(sx + 10, sy + 10);
          ctx.lineTo(sx + stoneW - 20, sy + stoneH - 15);
          ctx.stroke();
          ctx.strokeStyle = '#1a1a1a';
          ctx.lineWidth = 3.5;
        }
        sx += stoneW;
      }
    }

    // Grass weed tufts
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.lineWidth = 2;
    const drawTuft = (tx: number, ty: number) => {
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(tx - 6, ty - 15);
      ctx.moveTo(tx, ty);
      ctx.lineTo(tx, ty - 18);
      ctx.moveTo(tx, ty);
      ctx.lineTo(tx + 7, ty - 14);
      ctx.stroke();
    };

    for (let i = 0; i < 20; i++) {
      const lx = 50 + Math.random() * 280;
      const ly = 20 + Math.random() * 470;
      drawTuft(lx, ly);
      
      const rx = 690 + Math.random() * 280;
      const ry = 20 + Math.random() * 470;
      drawTuft(rx, ry);
    }

    return new THREE.CanvasTexture(canvas);
  }, []);

  // Smooth door opening in useFrame
  useFrame(() => {
    const targetProgress = isOpen ? 1.0 : 0.0;
    openProgress.current = THREE.MathUtils.lerp(openProgress.current, targetProgress, 0.06);

    if (leftHingeRef.current && rightHingeRef.current) {
      // Swing doors outwards around hinges
      leftHingeRef.current.rotation.y = openProgress.current * (Math.PI * 0.65);
      rightHingeRef.current.rotation.y = openProgress.current * -(Math.PI * 0.65);
    }

    if (isOpen && openProgress.current > 0.9 && !transitionTriggered.current) {
      transitionTriggered.current = true;
      onEnterCorridor();
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* 1. Seamless repeating brick wall in the background */}
      <mesh position={[0, 1.0, -2.2]}>
        <planeGeometry args={[30, 8]} />
        <meshBasicMaterial map={brickTexture} side={THREE.DoubleSide} />
      </mesh>

      {/* 2. Interactive double doors (Slender and exactly centered) */}
      {/* Left Hinge Group */}
      <group ref={leftHingeRef} position={[-1.2, -0.6, -2.0]}>
        <mesh 
          position={[0.6, 0, 0]} 
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(true);
          }}
        >
          <planeGeometry args={[1.2, 3.0]} />
          <meshBasicMaterial map={leftDoorTexture} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* Right Hinge Group */}
      <group ref={rightHingeRef} position={[1.2, -0.6, -2.0]}>
        <mesh 
          position={[-0.6, 0, 0]}
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(true);
          }}
        >
          <planeGeometry args={[1.2, 3.0]} />
          <meshBasicMaterial map={rightDoorTexture} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* 3. PORTFOLIO sign board above the doors */}
      <mesh position={[0, 1.4, -1.98]}>
        <planeGeometry args={[2.8, 0.75]} />
        <meshBasicMaterial map={signTexture} transparent />
      </mesh>

      {/* 4. Window & succulent planter box on the right */}
      <mesh position={[2.4, -0.5, -1.98]}>
        <planeGeometry args={[2.4, 2.8]} />
        <meshBasicMaterial map={windowTexture} transparent />
      </mesh>

      {/* 5. Cartoon Cat next to the door on the left */}
      <mesh position={[-1.6, -1.4, -1.9]} scale={[0.8, 0.8, 1]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial map={catTexture} transparent />
      </mesh>

      {/* 6. Curvy tree with hanging mouse on the left (wide square mesh, no clipping) */}
      <mesh position={[-3.3, 0.4, -1.9]} scale={[1.8, 1.8, 1]}>
        <planeGeometry args={[4.2, 5.0]} />
        <meshBasicMaterial map={treeTexture} transparent />
      </mesh>

      {/* 7. Cobblestone pathway ground floor (extends wide) */}
      <mesh position={[0, -2.1, 0.5]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[30, 6]} />
        <meshBasicMaterial map={floorTexture} />
      </mesh>
    </group>
  );
};
