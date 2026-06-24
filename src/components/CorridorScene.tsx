import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { LandingStorefront } from './LandingStorefront';
import { Corridor } from './Corridor';
import { GalleryRoom, StudioRoom, AboutRoom, ContactRoom } from './Rooms';

interface CameraRigProps {
  currentScene: string;
  scrollProgress: number;
}

const CameraRig: React.FC<CameraRigProps> = ({ currentScene, scrollProgress }) => {
  const { camera } = useThree();
  const targetPos = useRef(new THREE.Vector3(0, 0, 4));
  const targetLookAt = useRef(new THREE.Vector3(0, 0, -5));

  // Door position coordinates in the corridor
  const doorPositions = useMemo(() => ({
    gallery: { doorZ: -10, flyTo: new THREE.Vector3(-3.5, -0.2, -10), look: new THREE.Vector3(-10, -0.2, -10) },
    studio: { doorZ: -18, flyTo: new THREE.Vector3(3.5, -0.2, -18), look: new THREE.Vector3(10, -0.2, -18) },
    about: { doorZ: -26, flyTo: new THREE.Vector3(-3.5, -0.2, -26), look: new THREE.Vector3(-10, -0.2, -26) },
    contact: { doorZ: -34, flyTo: new THREE.Vector3(3.5, -0.2, -34), look: new THREE.Vector3(10, -0.2, -34) },
  }), []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // 1. Scene positioning states
    if (currentScene === 'landing') {
      // Positioned in front of the brick storefront
      targetPos.current.set(0, 0, 4);
      targetLookAt.current.set(0, 0, -5);
    } 
    else if (currentScene === 'corridor') {
      // Map scroll progress to Z depth in corridor (2 to -38)
      const maxZDepth = -38;
      const startZ = 2;
      const zVal = startZ + scrollProgress * (maxZDepth - startZ);
      
      // Look forward along Z
      targetPos.current.set(0, -0.2, zVal);
      targetLookAt.current.set(0, -0.2, zVal - 5);

      // Check if camera is close to any door to trigger zoom auto-entry if clicked
      // We also handle door entry checks via direct user click
    } 
    else if (currentScene === 'gallery') {
      targetPos.current.copy(doorPositions.gallery.flyTo);
      targetLookAt.current.copy(doorPositions.gallery.look);
    } 
    else if (currentScene === 'studio') {
      targetPos.current.copy(doorPositions.studio.flyTo);
      targetLookAt.current.copy(doorPositions.studio.look);
    } 
    else if (currentScene === 'about') {
      targetPos.current.copy(doorPositions.about.flyTo);
      targetLookAt.current.copy(doorPositions.about.look);
    } 
    else if (currentScene === 'contact') {
      targetPos.current.copy(doorPositions.contact.flyTo);
      targetLookAt.current.copy(doorPositions.contact.look);
    }

    // 2. Add subtle camera sway (breathing)
    const swayX = Math.sin(time * 1.5) * 0.02;
    const swayY = Math.cos(time * 1.2) * 0.02;
    
    const finalPos = targetPos.current.clone().add(new THREE.Vector3(swayX, swayY, 0));

    // 3. Smooth Lerping
    camera.position.lerp(finalPos, 0.06);

    // Smooth LookAt lerping
    const currentLookAt = new THREE.Vector3(0, 0, -5);
    // Find current camera forward vector
    const dir = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    currentLookAt.copy(camera.position).add(dir.multiplyScalar(5));
    
    currentLookAt.lerp(targetLookAt.current, 0.08);
    camera.lookAt(currentLookAt);
  });

  return null;
};

interface CorridorSceneProps {
  currentScene: string;
  scrollProgress: number;
  artCritic: boolean;
  onEnterCorridor: () => void;
  onEnterRoom: (room: string) => void;
  onSelectProject: (project: any) => void;
  onSelectTV: (tv: any) => void;
  onSelectSign: (sign: string) => void;
}

export const CorridorScene: React.FC<CorridorSceneProps> = ({
  currentScene,
  scrollProgress,
  artCritic,
  onEnterCorridor,
  onEnterRoom,
  onSelectProject,
  onSelectTV,
  onSelectSign,
}) => {
  const pixelRatio = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 2) : 1;

  return (
    <div id="canvas-container">
      <Canvas
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        dpr={pixelRatio}
        camera={{ position: [0, 0, 4], fov: 60, near: 0.1, far: 100 }}
      >
        <color attach="background" args={['#faf8f5']} />
        
        {/* Atmosphere fog */}
        {currentScene !== 'landing' && <fog attach="fog" args={['#faf8f5', 5, 20]} />}

        <ambientLight intensity={1.5} />
        <directionalLight position={[5, 10, 5]} intensity={0.5} />

        {/* 1. LANDING STOREFRONT SCENE */}
        {currentScene === 'landing' && (
          <LandingStorefront onEnterCorridor={onEnterCorridor} />
        )}

        {/* 2. CORRIDOR SCENE */}
        {currentScene === 'corridor' && (
          <Corridor onOpenDoor={onEnterRoom} />
        )}

        {/* 3. INDIVIDUAL 3D ROOMS */}
        {currentScene === 'gallery' && (
          <GalleryRoom onSelectProject={onSelectProject} artCritic={artCritic} />
        )}
        {currentScene === 'studio' && (
          <StudioRoom onSelectTV={onSelectTV} />
        )}
        {currentScene === 'about' && (
          <AboutRoom />
        )}
        {currentScene === 'contact' && (
          <ContactRoom onSelectSign={onSelectSign} />
        )}

        {/* Camera rig controller */}
        <CameraRig 
          currentScene={currentScene} 
          scrollProgress={scrollProgress} 
        />
      </Canvas>
    </div>
  );
};
