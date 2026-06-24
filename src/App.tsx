import { useEffect, useState } from 'react';
import { Preloader } from './components/Preloader';
import { CorridorScene } from './components/CorridorScene';
import { HUD } from './components/HUD';

function App() {
  const [loading, setLoading] = useState(true);
  const [currentScene, setCurrentScene] = useState('landing'); // 'landing' | 'corridor' | 'gallery' | 'studio' | 'about' | 'contact'
  const [scrollProgress, setScrollProgress] = useState(0);
  
  // Audio state
  const [isAudioOn, setIsAudioOn] = useState(false);

  // Overlays details selection states
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [selectedTV, setSelectedTV] = useState<any>(null);
  const [selectedSign, setSelectedSign] = useState<string | null>(null);

  // Art Critic state for Gallery scene
  const [artCritic, setArtCritic] = useState(false);

  // Programmatic Scroll Wheel & Touch drag listener for Corridor navigation
  useEffect(() => {
    if (currentScene !== 'corridor') return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      setScrollProgress((prev) => {
        // Smoothly step the scroll value based on wheel direction
        const sensitivity = 0.0006;
        const next = prev + e.deltaY * sensitivity;
        return Math.min(Math.max(next, 0), 1);
      });
    };

    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const touchY = e.touches[0].clientY;
      const deltaY = touchStartY - touchY;
      touchStartY = touchY;
      setScrollProgress((prev) => {
        const sensitivity = 0.0015;
        const next = prev + deltaY * sensitivity;
        return Math.min(Math.max(next, 0), 1);
      });
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [currentScene]);

  // Transition: Click door on Landing storefront -> fly into corridor
  const handleEnterCorridor = () => {
    setCurrentScene('corridor');
    setScrollProgress(0);
  };

  // Transition: Click side door -> zoom into Room
  const handleEnterRoom = (roomName: string) => {
    setCurrentScene(roomName);
  };

  // Transition: Room back button -> return to corridor
  const handleBackToCorridor = () => {
    setCurrentScene('corridor');
    setSelectedProject(null);
    setSelectedTV(null);
    setSelectedSign(null);
  };

  // Social Sign clicked inside Contact room
  const handleSelectSign = (sign: string) => {
    if (sign === 'MESSAGE') {
      setSelectedSign('MESSAGE');
    } else if (sign === 'GITHUB') {
      window.open('https://github.com/ITomPoland', '_blank');
    } else if (sign === 'LINKEDIN') {
      window.open('https://www.linkedin.com/in/tomasz-szmajda-259337305/', '_blank');
    } else if (sign === 'INSTAGRAM') {
      window.open('https://www.instagram.com/itom.dev/', '_blank');
    } else if (sign === 'FACEBOOK') {
      window.open('https://facebook.com', '_blank');
    }
  };

  // Custom Cursor state logic
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [cursorHovering, setCursorHovering] = useState(false);
  const [cursorClicking, setCursorClicking] = useState(false);

  useEffect(() => {
    const move = (e: MouseEvent) => setCursorPos({ x: e.clientX, y: e.clientY });
    const hover = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'BUTTON' || 
        target.tagName === 'A' || 
        target.tagName === 'INPUT' || 
        target.tagName === 'TEXTAREA' || 
        target.closest('canvas') ||
        target.closest('form')
      ) {
        setCursorHovering(true);
      } else {
        setCursorHovering(false);
      }
    };
    const down = () => setCursorClicking(true);
    const up = () => setCursorClicking(false);

    window.addEventListener('mousemove', move);
    window.addEventListener('mouseover', hover);
    window.addEventListener('mousedown', down);
    window.addEventListener('mouseup', up);

    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseover', hover);
      window.removeEventListener('mousedown', down);
      window.removeEventListener('mouseup', up);
    };
  }, []);

  return (
    <>
      {/* 1. Paper Tearing Preloader */}
      {loading && <Preloader onComplete={() => setLoading(false)} />}

      {/* 2. Custom Pencil Cursor */}
      <div 
        id="custom-cursor" 
        className={`${cursorHovering ? 'hovering' : ''} ${cursorClicking ? 'clicking' : ''}`}
        style={{ left: cursorPos.x, top: cursorPos.y }}
      />

      {/* 3. 3D WebGL Canvas Scene */}
      {!loading && (
        <CorridorScene
          currentScene={currentScene}
          scrollProgress={scrollProgress}
          artCritic={artCritic}
          onEnterCorridor={handleEnterCorridor}
          onEnterRoom={handleEnterRoom}
          onSelectProject={setSelectedProject}
          onSelectTV={setSelectedTV}
          onSelectSign={handleSelectSign}
        />
      )}

      {/* 4. Active HUD 2D Overlays */}
      {!loading && (
        <HUD
          currentScene={currentScene}
          selectedProject={selectedProject}
          selectedTV={selectedTV}
          selectedSign={selectedSign}
          isAudioOn={isAudioOn}
          artCritic={artCritic}
          onToggleAudio={() => setIsAudioOn(!isAudioOn)}
          onToggleArtCritic={() => setArtCritic(!artCritic)}
          onBack={handleBackToCorridor}
          onCloseOverlay={() => {
            setSelectedProject(null);
            setSelectedTV(null);
            setSelectedSign(null);
          }}
        />
      )}
    </>
  );
}

export default App;
