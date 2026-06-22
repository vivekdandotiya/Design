import React from 'react';

interface HUDProps {
  currentScene: string;
  selectedProject: any;
  selectedTV: any;
  selectedSign: string | null;
  isAudioOn: boolean;
  onToggleAudio: () => void;
  onBack: () => void;
  onCloseOverlay: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  currentScene,
  selectedProject,
  selectedTV,
  selectedSign,
  isAudioOn,
  onToggleAudio,
  onBack,
  onCloseOverlay,
}) => {
  const isRoom = ['gallery', 'studio', 'about', 'contact'].includes(currentScene);

  return (
    <>
      {/* 1. Global Controls (Top Right: Settings, Sound, Lightbulb Theme) */}
      <div className="hud-controls-top">
        <button className="hud-icon-btn" onClick={() => alert('Settings: Custom hand-drawn settings cogs!')}>
          ⚙️
        </button>
        <button className="hud-icon-btn" onClick={onToggleAudio}>
          {isAudioOn ? '🔊' : '🔇'}
        </button>
        <button className="hud-icon-btn" onClick={() => alert('Theme: Switching drawing layers!')}>
          💡
        </button>
      </div>

      {/* 2. Circular Back Button (displays inside any Room) */}
      {isRoom && !selectedProject && !selectedTV && !selectedSign && (
        <div className="hud-back-btn">
          <button className="hud-circle-btn" onClick={onBack}>
            ←
          </button>
        </div>
      )}

      {/* 3. Explorer bottom sign on Landing Storefront */}
      {currentScene === 'landing' && (
        <div className="storefront-bottom-sign">
          <div className="bottom-sign-title">EXPLORER</div>
          <div className="bottom-sign-desc">
            Click a door to enter. Audio is currently: <strong>{isAudioOn ? 'on ♫' : 'off'}</strong>
          </div>
        </div>
      )}

      {/* 4. Gallery Detail Card overlay */}
      {selectedProject && (
        <div className="details-box-overlay">
          <div className="details-card">
            <button 
              className="hud-btn" 
              style={{ position: 'absolute', top: '10px', right: '10px', padding: '0.2rem 0.5rem', fontSize: '0.8rem' }}
              onClick={onCloseOverlay}
            >
              X
            </button>
            <h2>{selectedProject.title}</h2>
            <p>{selectedProject.desc}</p>
            <div className="details-tech-row">
              {selectedProject.tags.map((tag: string) => (
                <span key={tag} className="tech-icon-badge">
                  {tag}
                </span>
              ))}
            </div>
            <button className="hud-btn" onClick={() => alert(`Launching ${selectedProject.title}...`)}>
              OPEN PROJECT
            </button>
          </div>
        </div>
      )}

      {/* 5. Studio CRT TV Notepad overlay */}
      {selectedTV && (
        <div className="details-box-overlay">
          <div className="details-card">
            <button 
              className="hud-btn" 
              style={{ position: 'absolute', top: '10px', right: '10px', padding: '0.2rem 0.5rem', fontSize: '0.8rem' }}
              onClick={onCloseOverlay}
            >
              X
            </button>
            <h2>{selectedTV.title}</h2>
            <div style={{ fontFamily: 'var(--font-hand)', fontSize: '1.2rem', color: 'var(--accent-color)', marginBottom: '0.8rem' }}>
              Written: {selectedTV.date}
            </div>
            <p style={{ fontStyle: 'italic', marginBottom: '1.5rem' }}>"{selectedTV.note}"</p>
            <button className="hud-btn" onClick={() => alert(`Redirecting to tutorial: ${selectedTV.title}`)}>
              OPEN LINK ↗
            </button>
          </div>
        </div>
      )}

      {/* 6. Contact Sign Message Form overlay */}
      {selectedSign === 'MESSAGE' && (
        <div className="room-overlay-form">
          <button 
            className="hud-btn" 
            style={{ position: 'absolute', top: '10px', right: '10px', padding: '0.2rem 0.5rem', fontSize: '0.8rem' }}
            onClick={onCloseOverlay}
          >
            X
          </button>
          <h2>Write to ITom</h2>
          <form onSubmit={(e) => {
            e.preventDefault();
            alert('Message Sent! Drawing draft responses...');
            onCloseOverlay();
          }}>
            <div className="room-form-group">
              <label htmlFor="hud-name">NAME</label>
              <input type="text" id="hud-name" className="room-form-input" placeholder="Your name" required />
            </div>
            <div className="room-form-group">
              <label htmlFor="hud-email">EMAIL</label>
              <input type="email" id="hud-email" className="room-form-input" placeholder="Your email" required />
            </div>
            <div className="room-form-group">
              <label htmlFor="hud-msg">MESSAGE</label>
              <textarea id="hud-msg" className="room-form-input" rows={3} placeholder="Write something..." required></textarea>
            </div>
            <button type="submit" className="room-form-submit">Send Message</button>
          </form>
        </div>
      )}

      {/* 7. Help indicators for Corridor navigation */}
      {currentScene === 'corridor' && (
        <div className="corridor-hud-help">
          Scroll to Glide • Click Doors to Enter
        </div>
      )}
    </>
  );
};
