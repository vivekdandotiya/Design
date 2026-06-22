import React from 'react';
// Inline SVGs used to avoid external package version dependency issues

interface OverlaysProps {
  currentSection: string;
  scrollProgress: number; // 0 to 1 representing the total scroll progress
  onNavigate: (section: string) => void;
}

export const Overlays: React.FC<OverlaysProps> = ({ currentSection, scrollProgress, onNavigate }) => {
  const sections = ['home', 'about', 'projects', 'contact'];

  return (
    <>
      {/* Navigation Menu */}
      <nav className="sketch-nav">
        {sections.map((sec) => (
          <button
            key={sec}
            className={`nav-btn ${currentSection === sec ? 'active' : ''}`}
            onClick={() => onNavigate(sec)}
          >
            {sec.toUpperCase()}
          </button>
        ))}
      </nav>

      {/* Progress Bar (Dashed indicator along the top) */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: '4px',
          backgroundColor: 'var(--accent-color)',
          width: `${scrollProgress * 100}%`,
          zIndex: 101,
          transition: 'width 0.1s ease-out'
        }}
      />

      {/* SECTION 1: HOME */}
      <section className={`overlay-section ${currentSection === 'home' ? 'active' : ''}`}>
        <div className="sketch-card">
          <h1>Tomasz Szmajda</h1>
          <h2>Creative 3D Web Developer</h2>
          <p>
            Welcome to my interactive 3D universe. This site is a custom hand-drawn 
            corridor built entirely with WebGL, React Three Fiber, and GSAP. 
            Scroll down or use the navigation above to walk through my studio.
          </p>
          <div className="scroll-indicator">
            <span>Scroll to Walk</span>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>
          </div>
        </div>
      </section>

      {/* SECTION 2: ABOUT */}
      <section className={`overlay-section ${currentSection === 'about' ? 'active' : ''}`}>
        <div className="sketch-card">
          <h1>About Me</h1>
          <h2>Frontend Developer & 3D Artist</h2>
          <p>
            I specialize in bridging the gap between logic and aesthetics. My target is 
            making the web feel responsive, alive, and immersive.
          </p>
          <h3>My Tech Canvas:</h3>
          <div className="skills-grid">
            <div className="skill-card">React</div>
            <div className="skill-card">Three.js</div>
            <div className="skill-card">GSAP</div>
            <div className="skill-card">TypeScript</div>
            <div className="skill-card">Next.js</div>
            <div className="skill-card">Blender</div>
            <div className="skill-card">Node.js</div>
            <div className="skill-card">Supabase</div>
          </div>
        </div>
      </section>

      {/* SECTION 3: PROJECTS */}
      <section className={`overlay-section ${currentSection === 'projects' ? 'active' : ''}`}>
        <div className="sketch-card" style={{ maxWidth: '650px' }}>
          <h1>Selected Works</h1>
          <h2>Hover over the frames to color them!</h2>
          <p style={{ marginBottom: '1.2rem' }}>
            Look at the picture frames on the corridor walls. As you walk past them, 
            they shift from sketchy drafts to full-color rendering.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left' }}>
            <div>
              <strong style={{ color: 'var(--accent-color)' }}>1. MoneTune</strong> — Full-Stack Finance
              <div className="project-details" style={{ marginTop: '0.2rem' }}>
                <span className="project-tag">React</span>
                <span className="project-tag">Node</span>
                <span className="project-tag">Postgres</span>
              </div>
            </div>
            <div>
              <strong style={{ color: 'var(--accent-color)' }}>2. TimberKitty</strong> — Game & Micro-animations
              <div className="project-details" style={{ marginTop: '0.2rem' }}>
                <span className="project-tag">CSS Grid</span>
                <span className="project-tag">GSAP</span>
                <span className="project-tag">React Hooks</span>
              </div>
            </div>
            <div>
              <strong style={{ color: 'var(--accent-color)' }}>3. Young Multi Concept</strong> — 3D Scroll Storytelling
              <div className="project-details" style={{ marginTop: '0.2rem' }}>
                <span className="project-tag">Three.js</span>
                <span className="project-tag">R3F</span>
                <span className="project-tag">Shaders</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: CONTACT */}
      <section className={`overlay-section ${currentSection === 'contact' ? 'active' : ''}`}>
        <div className="sketch-card">
          <h1>Let's Connect</h1>
          <h2>Let's build something extraordinary</h2>
          
          <form onSubmit={(e) => e.preventDefault()} style={{ margin: '1rem 0 1.5rem 0' }}>
            <div className="form-group">
              <label htmlFor="name">NAME</label>
              <input type="text" id="name" className="form-input" placeholder="Your name" required />
            </div>
            <div className="form-group">
              <label htmlFor="email">EMAIL</label>
              <input type="email" id="email" className="form-input" placeholder="Your email" required />
            </div>
            <div className="form-group">
              <label htmlFor="message">MESSAGE</label>
              <textarea id="message" className="form-input" rows={3} placeholder="Your thoughts..." required></textarea>
            </div>
            <button type="submit" className="submit-btn">Send Message</button>
          </form>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem' }}>
            <a href="https://github.com/ITomPoland" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--ink-color)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
            </a>
            <a href="https://www.linkedin.com/in/tomasz-szmajda-259337305/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--ink-color)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
            </a>
            <a href="https://www.instagram.com/itom.dev/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--ink-color)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
            </a>
          </div>
        </div>
      </section>
    </>
  );
};

// Custom Cursor component
export const CustomCursor: React.FC = () => {
  const [position, setPosition] = React.useState({ x: 0, y: 0 });
  const [hovering, setHovering] = React.useState(false);
  const [clicking, setClicking] = React.useState(false);

  React.useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.closest('.sketch-card') ||
        target.closest('form')
      ) {
        setHovering(true);
      } else {
        setHovering(false);
      }
    };

    const handleMouseDown = () => setClicking(true);
    const handleMouseUp = () => setClicking(false);

    window.addEventListener('mousemove', moveCursor);
    window.addEventListener('mouseover', handleMouseOver);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mouseover', handleMouseOver);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <div
      id="custom-cursor"
      className={`${hovering ? 'hovering' : ''} ${clicking ? 'clicking' : ''}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`
      }}
    />
  );
};
