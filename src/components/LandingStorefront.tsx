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

  // 1. Brick wall hand-drawn texture with detailed hatching
  const wallTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.Texture();

    // Base wall color (light grey paper tone)
    ctx.fillStyle = '#faf8f5';
    ctx.fillRect(0, 0, 1024, 512);

    // Draw brick pattern
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.42)'; // Thinner pencil style line color
    ctx.lineWidth = 1.3;
    const rows = 14;
    const cols = 16;
    const rowHeight = 512 / rows;
    const colWidth = 1024 / cols;

    // Helper to draw sketchy lines
    const drawSketchyLine = (x1: number, y1: number, x2: number, y2: number) => {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      const mx = (x1 + x2) / 2 + (Math.random() - 0.5) * 1.5;
      const my = (y1 + y2) / 2 + (Math.random() - 0.5) * 1.5;
      ctx.lineTo(mx, my);
      ctx.lineTo(x2 + (Math.random() - 0.5) * 0.5, y2 + (Math.random() - 0.5) * 0.5);
      ctx.stroke();
    };

    // Draw horizontal brick lines
    for (let r = 0; r <= rows; r++) {
      const y = r * rowHeight;
      ctx.beginPath();
      ctx.moveTo(0, y);
      for (let x = 64; x <= 1024; x += 64) {
        ctx.lineTo(x, y + (Math.random() - 0.5) * 1.5);
      }
      ctx.stroke();
    }

    // Draw vertical brick joints & add brick hatching
    for (let r = 0; r < rows; r++) {
      const y = r * rowHeight;
      const offset = (r % 2) * (colWidth / 2);
      for (let c = 0; c <= cols + 1; c++) {
        const x = c * colWidth - offset;
        drawSketchyLine(x, y, x, y + rowHeight);
        
        // Randomly hatch this brick
        if (Math.random() < 0.25) {
          const bx = x;
          const by = y;
          const bw = colWidth;
          const bh = rowHeight;
          
          ctx.save();
          ctx.beginPath();
          ctx.rect(bx + 4, by + 4, bw - 8, bh - 8);
          ctx.clip();
          
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
          ctx.lineWidth = 1;
          for (let k = -20; k < bw + bh; k += 8) {
            ctx.beginPath();
            ctx.moveTo(bx + k, by);
            ctx.lineTo(bx + k - bh, by + bh);
            ctx.stroke();
          }
          ctx.restore();
        }
      }
    }

    // Window illustration (right side)
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 5.5;
    ctx.fillStyle = '#faf8f5';
    // Clear bricks behind window
    ctx.fillRect(650, 120, 260, 220);
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

    // Plant box planter below window
    ctx.fillStyle = '#d8a773'; // warm wooden color
    ctx.fillRect(630, 340, 300, 70); // y = 340 (closes the gap!)
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 4;
    ctx.strokeRect(630, 340, 300, 70);
    
    // Draw wood grain lines on the planter
    ctx.strokeStyle = 'rgba(0,0,0,0.15)';
    ctx.lineWidth = 1.5;
    for (let py = 350; py < 410; py += 15) {
      ctx.beginPath();
      ctx.moveTo(630, py);
      ctx.lineTo(930, py + (Math.random() - 0.5) * 2);
      ctx.stroke();
    }
    
    // Draw rubber ducky in the center of planter
    ctx.save();
    ctx.translate(780, 332);
    ctx.fillStyle = '#fbe15c'; // yellow
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 2.2;
    // duck body
    ctx.beginPath();
    ctx.ellipse(0, 10, 16, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // duck head
    ctx.beginPath();
    ctx.arc(-8, -4, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // duck bill
    ctx.fillStyle = '#f67e22'; // orange
    ctx.beginPath();
    ctx.moveTo(-17, -6);
    ctx.lineTo(-24, -3);
    ctx.lineTo(-17, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // duck eye
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.arc(-10, -6, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Draw succulents on the left and right sides
    // Saguaro cactus (left side, x = 675, y = 295)
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
    drawSaguaro(675, 295);

    // Prickly pear cactus (x = 725, y = 295)
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
    drawPricklyPear(725, 295);

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
    drawRosette(845, 325, 20);
    drawRosette(890, 322, 22);

    // Wooden "PORTFOLIO" sign plank
    // Support bar
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(350, 35);
    ctx.lineTo(670, 35);
    ctx.stroke();
    
    // Support ropes/chains
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(420, 35);
    ctx.lineTo(420, 60);
    ctx.moveTo(604, 35);
    ctx.lineTo(604, 60);
    ctx.stroke();

    // Plank sign board
    ctx.fillStyle = '#d8a773'; // matching wooden color
    ctx.fillRect(362, 60, 300, 75);
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 4.5;
    ctx.strokeRect(362, 60, 300, 75);
    
    // wood grain lines
    ctx.strokeStyle = 'rgba(0,0,0,0.15)';
    ctx.lineWidth = 1.5;
    for (let sy = 70; sy < 130; sy += 15) {
      ctx.beginPath();
      ctx.moveTo(362, sy);
      ctx.quadraticCurveTo(512, sy + (Math.random() - 0.5) * 8, 662, sy);
      ctx.stroke();
    }

    // Sign text "PORTFOLIO"
    ctx.fillStyle = '#1a1a1a';
    ctx.font = 'bold 36px "Gloria Hallelujah", cursive';
    ctx.textAlign = 'center';
    ctx.fillText('PORTFOLIO', 512, 110);

    return new THREE.CanvasTexture(canvas);
  }, []);

  // 2. Left Door hand-drawn texture (with detailed warm wood grain & badges)
  const leftDoorTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.Texture();

    // Wood base gradient
    const grad = ctx.createLinearGradient(0, 0, 512, 1024);
    grad.addColorStop(0, '#d8a773');
    grad.addColorStop(1, '#b08154');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 1024);

    // Door border & panels
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 10;
    ctx.strokeRect(10, 10, 492, 1004);

    // Horizontal panels lines (two columns of panels)
    ctx.lineWidth = 6;
    ctx.strokeRect(30, 40, 210, 280);
    ctx.strokeRect(272, 40, 210, 280);
    
    ctx.strokeRect(30, 360, 210, 300);
    ctx.strokeRect(272, 360, 210, 300);

    ctx.strokeRect(30, 700, 210, 280);
    ctx.strokeRect(272, 700, 210, 280);

    // Wood grain lines
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.lineWidth = 2.5;
    for (let wx = 20; wx < 500; wx += 40) {
      ctx.beginPath();
      ctx.moveTo(wx, 10);
      ctx.bezierCurveTo(wx + (Math.random() - 0.5) * 30, 300, wx + (Math.random() - 0.5) * 30, 700, wx, 1014);
      ctx.stroke();
    }

    // Helper to setup shadow for stickers
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

    // --- HTML5 Shield Badge ---
    ctx.save();
    ctx.translate(130, 180);
    ctx.rotate(-0.08);
    setStickerShadow();
    
    // Die-cut backing
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(0, -66);
    ctx.lineTo(54, -46);
    ctx.lineTo(44, 46);
    ctx.lineTo(0, 66);
    ctx.lineTo(-44, 46);
    ctx.lineTo(-54, -46);
    ctx.closePath();
    ctx.fill();
    
    resetShadow();
    ctx.fillStyle = '#e34f26'; // HTML5 orange
    ctx.beginPath();
    ctx.moveTo(0, -60);
    ctx.lineTo(48, -42);
    ctx.lineTo(38, 40);
    ctx.lineTo(0, 60);
    ctx.lineTo(-38, 40);
    ctx.lineTo(-48, -42);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 4;
    ctx.stroke();
    
    // "5" logo
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 55px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('5', 0, 20);
    
    ctx.fillStyle = '#1a1a1a';
    ctx.font = 'bold 16px "Gloria Hallelujah", cursive';
    ctx.fillText('HTML', 0, 48);
    ctx.restore();

    // --- JS Circle Badge ---
    ctx.save();
    ctx.translate(130, 480);
    ctx.rotate(0.05);
    setStickerShadow();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, 58, 0, Math.PI * 2);
    ctx.fill();
    
    resetShadow();
    ctx.fillStyle = '#f7df1e'; // JS yellow
    ctx.beginPath();
    ctx.arc(0, 0, 52, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 4;
    ctx.stroke();
    
    ctx.fillStyle = '#1a1a1a';
    ctx.font = 'bold 44px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('JS', 0, 15);
    ctx.restore();

    // --- TS Hexagon Badge ---
    ctx.save();
    ctx.translate(140, 780);
    ctx.rotate(-0.1);
    setStickerShadow();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      ctx.lineTo(Math.cos(angle) * 62, Math.sin(angle) * 62);
    }
    ctx.closePath();
    ctx.fill();
    
    resetShadow();
    ctx.fillStyle = '#3178c6'; // TS blue
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      ctx.lineTo(Math.cos(angle) * 54, Math.sin(angle) * 54);
    }
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 4;
    ctx.stroke();
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('TS', 0, 12);
    ctx.restore();

    return new THREE.CanvasTexture(canvas);
  }, []);

  // 3. Right Door hand-drawn texture (with tech sticky notes & handles)
  const rightDoorTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.Texture();

    // Wood base gradient
    const grad = ctx.createLinearGradient(0, 0, 512, 1024);
    grad.addColorStop(0, '#d8a773');
    grad.addColorStop(1, '#b08154');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 1024);

    // Door border & panels
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 10;
    ctx.strokeRect(10, 10, 492, 1004);

    // Horizontal panels lines (two columns of panels)
    ctx.lineWidth = 6;
    ctx.strokeRect(30, 40, 210, 280);
    ctx.strokeRect(272, 40, 210, 280);
    
    ctx.strokeRect(30, 360, 210, 300);
    ctx.strokeRect(272, 360, 210, 300);

    ctx.strokeRect(30, 700, 210, 280);
    ctx.strokeRect(272, 700, 210, 280);

    // Wood grain lines
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.lineWidth = 2.5;
    for (let wx = 20; wx < 500; wx += 40) {
      ctx.beginPath();
      ctx.moveTo(wx, 10);
      ctx.bezierCurveTo(wx + (Math.random() - 0.5) * 30, 300, wx + (Math.random() - 0.5) * 30, 700, wx, 1014);
      ctx.stroke();
    }

    // Helper to setup shadow for stickers
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
    ctx.translate(360, 190);
    ctx.rotate(0.08);
    setStickerShadow();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, 56, 0, Math.PI * 2);
    ctx.fill();
    
    resetShadow();
    ctx.fillStyle = '#20232a'; // React dark theme
    ctx.beginPath();
    ctx.arc(0, 0, 50, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 4;
    ctx.stroke();
    
    ctx.strokeStyle = '#61dafb'; // React light blue
    ctx.lineWidth = 2.5;
    ctx.save();
    ctx.scale(1, 0.35);
    ctx.beginPath(); ctx.arc(0, 0, 36, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
    ctx.save();
    ctx.rotate(Math.PI / 3);
    ctx.scale(1, 0.35);
    ctx.beginPath(); ctx.arc(0, 0, 36, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
    ctx.save();
    ctx.rotate(-Math.PI / 3);
    ctx.scale(1, 0.35);
    ctx.beginPath(); ctx.arc(0, 0, 36, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
    ctx.fillStyle = '#61dafb';
    ctx.beginPath();
    ctx.arc(0, 0, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // --- Node.js Badge ---
    ctx.save();
    ctx.translate(350, 480);
    ctx.rotate(-0.06);
    setStickerShadow();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(-60, -38, 120, 76, 12) : ctx.rect(-60, -38, 120, 76);
    ctx.fill();
    
    resetShadow();
    ctx.fillStyle = '#339933'; // node green
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(-54, -32, 108, 64, 8) : ctx.rect(-54, -32, 108, 64);
    ctx.fill();
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 4;
    ctx.stroke();
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('node.js', 0, 8);
    ctx.restore();

    // --- CSS3 Shield Badge ---
    ctx.save();
    ctx.translate(350, 780);
    ctx.rotate(0.12);
    setStickerShadow();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(0, -66);
    ctx.lineTo(54, -46);
    ctx.lineTo(44, 46);
    ctx.lineTo(0, 66);
    ctx.lineTo(-44, 46);
    ctx.lineTo(-54, -46);
    ctx.closePath();
    ctx.fill();
    
    resetShadow();
    ctx.fillStyle = '#1572b6'; // CSS3 blue
    ctx.beginPath();
    ctx.moveTo(0, -60);
    ctx.lineTo(48, -42);
    ctx.lineTo(38, 40);
    ctx.lineTo(0, 60);
    ctx.lineTo(-38, 40);
    ctx.lineTo(-48, -42);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 4;
    ctx.stroke();
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 55px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('3', 0, 20);
    
    ctx.fillStyle = '#1a1a1a';
    ctx.font = 'bold 16px "Gloria Hallelujah", cursive';
    ctx.fillText('CSS', 0, 48);
    ctx.restore();

    // Brass handles at center-left edge of right door
    ctx.fillStyle = '#e4c042';
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(15, 512, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillRect(8, 512, 6, 45);
    ctx.strokeRect(8, 512, 6, 45);

    return new THREE.CanvasTexture(canvas);
  }, []);

  // 4. Cartoon Cat on the path
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

  // 5. Tree illustration with organic branches and foliage (1:1 ratio canvas, padded to prevent clipping)
  const treeTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.Texture();

    ctx.fillStyle = 'rgba(0,0,0,0)';
    ctx.fillRect(0, 0, 1024, 1024);

    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 6;
    ctx.fillStyle = '#faf8f5';

    // Trunk base at center bottom (x=512, y=1024)
    ctx.beginPath();
    ctx.moveTo(460, 1024);
    ctx.bezierCurveTo(420, 820, 490, 680, 475, 500); // left trunk edge curves organically
    ctx.lineTo(535, 500); // right trunk edge
    ctx.bezierCurveTo(550, 680, 480, 820, 520, 1024);
    ctx.fill();
    ctx.stroke();

    // Wood texture lines on trunk
    ctx.strokeStyle = 'rgba(0,0,0,0.15)';
    ctx.lineWidth = 3;
    for (let tx = 480; tx < 540; tx += 20) {
      ctx.beginPath();
      ctx.moveTo(tx, 1024);
      ctx.quadraticCurveTo(tx - 30, 750, tx - 15, 500);
      ctx.stroke();
    }
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 6;

    // Branches going out
    // Branch Left
    ctx.beginPath();
    ctx.moveTo(475, 510);
    ctx.quadraticCurveTo(340, 430, 270, 340); // branch left curves
    ctx.lineTo(315, 325);
    ctx.quadraticCurveTo(375, 390, 495, 480);
    ctx.fill();
    ctx.stroke();
    
    // Branch Right
    ctx.beginPath();
    ctx.moveTo(535, 505);
    ctx.quadraticCurveTo(680, 410, 750, 315); // branch right curves
    ctx.lineTo(710, 305);
    ctx.quadraticCurveTo(640, 380, 520, 470);
    ctx.fill();
    ctx.stroke();

    // Middle branch
    ctx.beginPath();
    ctx.moveTo(495, 495);
    ctx.quadraticCurveTo(512, 420, 500, 350);
    ctx.lineTo(525, 350);
    ctx.quadraticCurveTo(535, 420, 515, 495);
    ctx.fill();
    ctx.stroke();

    // Secondary small branch for hanging mouse
    ctx.beginPath();
    ctx.moveTo(350, 390);
    ctx.quadraticCurveTo(330, 430, 320, 460);
    ctx.stroke();

    // Detailed leaf cluster drawer
    const drawLeafCluster = (cx: number, cy: number, r: number) => {
      ctx.fillStyle = '#faf8f5';
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      
      // Draw sub-arcs on perimeter
      ctx.strokeStyle = '#1a1a1a';
      ctx.lineWidth = 5;
      const steps = 15;
      for (let i = 0; i <= steps; i++) {
        const angle = (i / steps) * Math.PI * 2;
        const arcX = cx + Math.cos(angle) * r;
        const arcY = cy + Math.sin(angle) * r;
        ctx.beginPath();
        ctx.arc(arcX, arcY, 22, angle - Math.PI/2, angle + Math.PI/2);
        ctx.stroke();
      }
      
      // Interior texture curves
      ctx.strokeStyle = 'rgba(0,0,0,0.18)';
      ctx.lineWidth = 2.5;
      for (let k = 0; k < 8; k++) {
        const ix = cx + (Math.random() - 0.5) * (r * 1.1);
        const iy = cy + (Math.random() - 0.5) * (r * 1.1);
        const ir = 20 + Math.random() * 25;
        ctx.beginPath();
        ctx.arc(ix, iy, ir, 0.4, Math.PI * 0.9);
        ctx.stroke();
      }
    };

    // Draw leafy clusters (centered and padded, no clipping!)
    drawLeafCluster(320, 310, 130);
    drawLeafCluster(700, 290, 130);
    drawLeafCluster(512, 190, 150);
    drawLeafCluster(390, 200, 120);
    drawLeafCluster(620, 200, 120);
    drawLeafCluster(512, 340, 110);

    // Hanging Mouse wire cord
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(320, 460);
    ctx.bezierCurveTo(340, 500, 280, 570, 310, 700);
    ctx.stroke();

    // Mouse body
    ctx.save();
    ctx.translate(310, 735);
    ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 5;
    
    ctx.fillStyle = '#faf8f5';
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 4.5;
    
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(-24, -34, 48, 68, 18) : ctx.rect(-24, -34, 48, 68);
    ctx.fill();
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(0, -34);
    ctx.lineTo(0, -6);
    ctx.moveTo(-24, -6);
    ctx.lineTo(24, -6);
    ctx.stroke();
    
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(-3.5, -24, 7, 12);
    ctx.restore();

    return new THREE.CanvasTexture(canvas);
  }, []);

  // 6. Cobblestone pathway ground floor texture
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

    // Grass / weed tufts
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

    for (let i = 0; i < 15; i++) {
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
      {/* 1. Main storefront wall */}
      <mesh position={[0, 0, -2]}>
        <planeGeometry args={[12, 6]} />
        <meshBasicMaterial map={wallTexture} side={THREE.DoubleSide} />
      </mesh>

      {/* 2. Interactive Doors (Left & Right Hinge Groups) */}
      {/* Left Hinge Group */}
      <group ref={leftHingeRef} position={[-1.5, -0.6, -1.95]}>
        <mesh 
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

      {/* Right Hinge Group */}
      <group ref={rightHingeRef} position={[1.5, -0.6, -1.95]}>
        <mesh 
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

      {/* 4. Left tree with hanging mouse (adjusted to 1:1 ratio 1024x1024 mesh size 5x5) */}
      <mesh position={[-3.6, 0.3, -1.9]} scale={[1.8, 1.8, 1]}>
        <planeGeometry args={[5, 5]} />
        <meshBasicMaterial map={treeTexture} transparent />
      </mesh>

      {/* 5. Pathway Ground Floor */}
      <mesh position={[0, -2.2, -1.1]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[12, 4]} />
        <meshBasicMaterial map={floorTexture} />
      </mesh>
    </group>
  );
};
