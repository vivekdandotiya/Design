import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import {
  ArrowRight,
  Search,
  BarChart3,
  CheckCircle,
  Sparkles,
  Quote,
  Monitor,
} from 'lucide-react';
import api from '../lib/api';
import type { Product } from '../types';
import { formatPrice } from '../lib/utils';

/* ─────────── Animated Section Wrapper ─────────── */
function FadeInSection({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─────────── Hero Floating Laptop SVG ─────────── */
/* ─────────── Interactive 3D Canvas Illustration ─────────── */
function HeroIllustration3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    const width = 600;
    const height = 450;
    
    // Set high DPI canvas resolution
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left - width / 2;
      const y = e.clientY - rect.top - height / 2;
      mouseRef.current.targetX = (x / (width / 2)) * 0.45;
      mouseRef.current.targetY = (y / (height / 2)) * 0.45;
    };

    const handleMouseLeave = () => {
      mouseRef.current.targetX = 0;
      mouseRef.current.targetY = 0;
    };

    window.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    let angleX = 0.2;
    let angleY = 0.6;
    let time = 0;

    // 3D Projection Helper
    const project = (x: number, y: number, z: number) => {
      const cosY = Math.cos(angleY);
      const sinY = Math.sin(angleY);
      const x1 = x * cosY - z * sinY;
      const z1 = x * sinY + z * cosY;

      const cosX = Math.cos(angleX);
      const sinX = Math.sin(angleX);
      const y2 = y * cosX - z1 * sinX;
      const z2 = y * sinX + z1 * cosX;

      const fov = 500;
      const scale = fov / (fov + z2);
      return {
        x: width / 2 + x1 * scale,
        y: height / 2 + y2 * scale,
        z: z2,
        scale: scale
      };
    };

    // Draw Rounded projected Polygon
    const drawProjectedCard = (
      cx: number, cy: number, cz: number,
      w: number, h: number,
      bgColor: string, borderColor: string,
      title: string, price: string,
      barHeights: number[],
      winner: boolean
    ) => {
      const halfW = w / 2;
      const halfH = h / 2;
      const corners = [
        { x: cx - halfW, y: cy - halfH, z: cz },
        { x: cx + halfW, y: cy - halfH, z: cz },
        { x: cx + halfW, y: cy + halfH, z: cz },
        { x: cx - halfW, y: cy + halfH, z: cz }
      ];

      const projected = corners.map(c => project(c.x, c.y, c.z));

      // Draw shadow
      ctx.beginPath();
      projected.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p.x, p.y + 20);
        else ctx.lineTo(p.x, p.y + 20);
      });
      ctx.closePath();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
      ctx.filter = 'blur(16px)';
      ctx.fill();
      ctx.filter = 'none';

      // Draw card body
      ctx.beginPath();
      projected.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.closePath();
      ctx.fillStyle = bgColor;
      ctx.fill();

      // Card border
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      const scale = projected[0].scale;
      const origin = projected[0];
      
      const dxX = (projected[1].x - projected[0].x) / w;
      const dxY = (projected[1].y - projected[0].y) / w;
      const dyX = (projected[3].x - projected[0].x) / h;
      const dyY = (projected[3].y - projected[0].y) / h;

      const drawText3D = (text: string, localX: number, localY: number, font: string, color: string) => {
        const px = origin.x + localX * dxX + localY * dyX;
        const py = origin.y + localX * dxY + localY * dyY;
        
        ctx.save();
        ctx.translate(px, py);
        
        const skewAngleX = Math.atan2(dxY, dxX);
        const skewAngleY = Math.atan2(dyX, dyY);
        ctx.transform(1, skewAngleX, skewAngleY, 1, 0, 0);

        ctx.fillStyle = color;
        ctx.font = font;
        ctx.fillText(text, 0, 0);
        ctx.restore();
      };

      drawText3D(title, 20, 30, `bold ${Math.round(14 * scale)}px Inter, sans-serif`, '#0f172a');
      drawText3D(price, 20, 52, `bold ${Math.round(16 * scale)}px Inter, sans-serif`, winner ? '#10b981' : '#6366f1');

      // Draw stats lines
      const lineY = [70, 85, 100];
      lineY.forEach(ly => {
        ctx.beginPath();
        const start = { x: origin.x + 20 * dxX + ly * dyX, y: origin.y + 20 * dxY + ly * dyY };
        const end = { x: origin.x + (w - 20) * dxX + ly * dyX, y: origin.y + (w - 20) * dxY + ly * dyY };
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.strokeStyle = 'rgba(15, 23, 42, 0.06)';
        ctx.lineWidth = 3 * scale;
        ctx.stroke();
      });

      // Bar charts
      barHeights.forEach((bh, idx) => {
        const bx = 20 + idx * 25;
        const by = h - 20;
        const start = { x: origin.x + bx * dxX + by * dyX, y: origin.y + bx * dxY + by * dyY };
        const end = { x: origin.x + bx * dxX + (by - bh) * dyX, y: origin.y + bx * dxY + (by - bh) * dyY };
        
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.strokeStyle = winner ? 'rgba(16, 185, 129, 0.8)' : 'rgba(99, 102, 241, 0.6)';
        ctx.lineWidth = 12 * scale;
        ctx.lineCap = 'round';
        ctx.stroke();
      });
    };

    // Draw central Octahedron Glass Lens
    const drawGlassLens = (cx: number, cy: number, cz: number, r: number) => {
      const vertices = [
        { x: cx, y: cy - r, z: cz },
        { x: cx - r, y: cy, z: cz - r },
        { x: cx + r, y: cy, z: cz - r },
        { x: cx + r, y: cy, z: cz + r },
        { x: cx - r, y: cy, z: cz + r },
        { x: cx, y: cy + r, z: cz }
      ];

      const projected = vertices.map(v => project(v.x, v.y, v.z));

      const faces = [
        [0, 1, 2], [0, 2, 3], [0, 3, 4], [0, 4, 1],
        [5, 2, 1], [5, 3, 2], [5, 4, 3], [5, 1, 4]
      ];

      const sortedFaces = faces.map(f => {
        const z = (projected[f[0]].z + projected[f[1]].z + projected[f[2]].z) / 3;
        return { indices: f, z };
      }).sort((a, b) => b.z - a.z);

      sortedFaces.forEach(face => {
        const p1 = projected[face.indices[0]];
        const p2 = projected[face.indices[1]];
        const p3 = projected[face.indices[2]];

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.lineTo(p3.x, p3.y);
        ctx.closePath();

        const grad = ctx.createLinearGradient(p1.x, p1.y, p3.x, p3.y);
        grad.addColorStop(0, 'rgba(139, 92, 246, 0.28)');
        grad.addColorStop(1, 'rgba(6, 182, 212, 0.28)');

        ctx.fillStyle = grad;
        ctx.fill();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.lineWidth = 1;
        ctx.stroke();
      });
    };

    const loop = () => {
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.1;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.1;

      angleY = time * 0.3 + mouseRef.current.x;
      angleX = 0.2 + Math.sin(time * 0.15) * 0.08 + mouseRef.current.y;

      ctx.clearRect(0, 0, width, height);

      // Draw background glow base
      const glowGrad = ctx.createRadialGradient(width/2, height/2, 20, width/2, height/2, 240);
      glowGrad.addColorStop(0, 'rgba(139, 92, 246, 0.06)');
      glowGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, width, height);

      const items = [
        {
          type: 'card',
          z: Math.sin(angleY) * 160,
          draw: () => drawProjectedCard(
            -110, Math.sin(time * 1.5) * 10, Math.cos(angleY) * 160,
            160, 190,
            'rgba(255, 255, 255, 0.95)', 'rgba(15, 23, 42, 0.08)',
            'Brand Alpha', '₹64,990',
            [30, 45, 55],
            false
          )
        },
        {
          type: 'card',
          z: Math.sin(angleY + Math.PI) * 160,
          draw: () => drawProjectedCard(
            110, Math.sin(time * 1.5 + Math.PI) * 10, Math.cos(angleY + Math.PI) * 160,
            160, 190,
            'rgba(255, 255, 255, 0.98)', 'rgba(16, 185, 129, 0.15)',
            'Brand Beta', '₹58,990',
            [50, 65, 80],
            true
          )
        },
        {
          type: 'lens',
          z: 0,
          draw: () => drawGlassLens(0, Math.cos(time * 1.5) * 6, 0, 60)
        }
      ];

      items.sort((a, b) => b.z - a.z);
      items.forEach(item => item.draw());

      time += 0.02;
      animationId = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="relative w-full max-w-[600px] h-[450px] mx-auto filter drop-shadow-[0_20px_40px_rgba(0,0,0,0.06)] rounded-3xl overflow-hidden bg-transparent">
      <canvas ref={canvasRef} className="w-full h-full block cursor-grab active:cursor-grabbing" />
    </div>
  );
}

/* ─────────── Home Page ─────────── */
export default function HomePage() {
  const [featured, setFeatured] = useState<Product[]>([]);

  useEffect(() => {
    api
      .get('/products?limit=4&sort=-rating')
      .then((res) => {
        const items = Array.isArray(res.data) ? res.data : res.data.data || [];
        setFeatured(items.slice(0, 4));
      })
      .catch(() => {});
  }, []);

  return (
    <div className="overflow-hidden">
      {/* ── HERO ── */}
      <section className="relative section overflow-hidden">
        {/* Background gradients */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary-400/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-accent-violet/5 rounded-full blur-[90px]" />
        </div>

        <div className="container-wide relative flex flex-col items-center">
          {/* Centered content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="space-y-8 max-w-3xl mx-auto flex flex-col items-center text-center"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-surface-900 border border-surface-200/80 dark:border-surface-800 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />
              <span className="text-xs font-semibold text-surface-700 dark:text-surface-300">
                AI-Powered Grounding Comparison
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-medium font-display leading-[1.15] tracking-tight text-surface-900 dark:text-white text-balance text-center">
              Stop guessing.<br />
              Start choosing <span className="italic text-primary-600 dark:text-primary-400">smarter.</span>
            </h1>

            <p className="text-lg text-surface-500 dark:text-surface-400 max-w-xl leading-relaxed text-center">
              Compare products side-by-side with live web-grounded specs and real-time e-commerce store prices.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/compare" className="btn-primary text-base !px-8 !py-3.5 shadow-glass">
                Start Comparing
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/recommend" className="btn-secondary text-base !px-8 !py-3.5 shadow-glass">
                Get AI Advice
              </Link>
            </div>
          </motion.div>

          {/* Centered illustration below */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="w-full flex justify-center mt-12 max-w-2xl"
          >
            <HeroIllustration3D />
          </motion.div>
        </div>
      </section>



      {/* ── HOW IT WORKS ── */}
      <section className="section">
        <div className="container-wide">
          <FadeInSection className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-display text-surface-900 dark:text-white mb-4">
              How It Works
            </h2>
            <p className="text-surface-500 dark:text-surface-400 max-w-2xl mx-auto">
              Three simple steps to find your perfect product. No more endless scrolling through spec sheets.
            </p>
          </FadeInSection>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {[
              {
                icon: Search,
                title: 'Search & Discover',
                description:
                  'Browse our extensive catalog of products. Filter by brand, specs, price, and more to find exactly what you need.',
                color: 'from-primary-500 to-accent-blue',
                step: '01',
              },
              {
                icon: BarChart3,
                title: 'Compare Side-by-Side',
                description:
                  'Select up to 4 products and compare every spec in a detailed, color-coded table. See which one wins in each category.',
                color: 'from-accent-violet to-accent-rose',
                step: '02',
              },
              {
                icon: CheckCircle,
                title: 'Decide with Confidence',
                description:
                  'Get AI-powered recommendations tailored to your budget and priorities. Make your choice backed by data, not guesswork.',
                color: 'from-accent-emerald to-accent-cyan',
                step: '03',
              },
            ].map((step) => (
              <FadeInSection key={step.title}>
                <motion.div
                  whileHover={{ y: -4 }}
                  className="relative card p-8 text-center group"
                >
                  <div className="absolute top-4 right-4 text-5xl font-bold font-display text-surface-100 dark:text-surface-800 select-none">
                    {step.step}
                  </div>
                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mx-auto mb-6 shadow-lg`}
                  >
                    <step.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold font-display text-surface-900 dark:text-white mb-3">
                    {step.title}
                  </h3>
                  <p className="text-surface-500 dark:text-surface-400 leading-relaxed">
                    {step.description}
                  </p>
                </motion.div>
              </FadeInSection>
            ))}
          </div>

          {/* Illustrative mock of how it works */}
          <FadeInSection className="mt-16 text-center">
            <div className="glass rounded-3xl p-4 max-w-4xl mx-auto shadow-glass overflow-hidden border border-surface-200/20 dark:border-surface-800/20 hover:shadow-glass-lg transition-all duration-300">
              <img 
                src="/src/assets/how_it_works.png" 
                alt="How ProductLens works illustration" 
                className="w-full h-auto rounded-2xl object-cover hover:scale-[1.01] transition-transform duration-500"
              />
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ── */}
      {featured.length > 0 && (
        <section className="section bg-surface-50/50 dark:bg-surface-900/30">
          <div className="container-wide">
            <FadeInSection className="flex items-end justify-between mb-12">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold font-display text-surface-900 dark:text-white mb-3">
                  Top Rated Products
                </h2>
                <p className="text-surface-500 dark:text-surface-400">
                  Highest rated products chosen by our community
                </p>
              </div>
              <Link
                to="/products"
                className="hidden sm:inline-flex btn-ghost text-primary-600 dark:text-primary-400 gap-1"
              >
                View All
                <ArrowRight className="w-4 h-4" />
              </Link>
            </FadeInSection>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featured.map((product) => (
                <FadeInSection key={product._id}>
                  <Link to={`/products/${product._id}`} className="block group">
                    <motion.div
                      whileHover={{ y: -4 }}
                      className="card overflow-hidden"
                    >
                      <div className="aspect-[4/3] bg-surface-50 dark:bg-surface-800 overflow-hidden">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Monitor className="w-12 h-12 text-surface-300 dark:text-surface-600" />
                          </div>
                        )}
                      </div>
                      <div className="p-5 space-y-2">
                        <p className="text-xs font-medium text-primary-600 dark:text-primary-400">
                          {product.brand}
                        </p>
                        <h3 className="font-semibold font-display text-surface-900 dark:text-white line-clamp-2 text-sm group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                          {product.name}
                        </h3>
                        <p className="text-lg font-bold font-display text-surface-900 dark:text-white">
                          {formatPrice(product.price)}
                        </p>
                      </div>
                    </motion.div>
                  </Link>
                </FadeInSection>
              ))}
            </div>

            <div className="mt-8 text-center sm:hidden">
              <Link to="/products" className="btn-secondary">
                View All Products
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── TESTIMONIALS ── */}
      <section className="section">
        <div className="container-wide">
          <FadeInSection className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-display text-surface-900 dark:text-white mb-4">
              Loved by Thousands
            </h2>
            <p className="text-surface-500 dark:text-surface-400 max-w-2xl mx-auto">
              See what users say about how ProductLens helped them make better decisions.
            </p>
          </FadeInSection>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                quote:
                  'I saved over ₹15,000 by finding a better-specced product at a lower price. The comparison tool is incredibly detailed.',
                name: 'Priya Sharma',
                role: 'Software Engineer',
              },
              {
                quote:
                  'The AI recommendation nailed it. I described what I needed, and it picked the exact product I ended up buying.',
                name: 'Rohit Mehta',
                role: 'Content Creator',
              },
              {
                quote:
                  'Finally, a comparison tool that actually shows meaningful differences, not just a raw spec dump. Love the score gauges.',
                name: 'Ananya Patel',
                role: 'Design Student',
              },
            ].map((testimonial) => (
              <FadeInSection key={testimonial.name}>
                <motion.div
                  whileHover={{ y: -4 }}
                  className="card p-8 relative"
                >
                  <Quote className="w-8 h-8 text-primary-200 dark:text-primary-900/40 mb-4" />
                  <p className="text-surface-600 dark:text-surface-400 leading-relaxed mb-6">
                    &ldquo;{testimonial.quote}&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-violet flex items-center justify-center text-white text-sm font-bold">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-surface-900 dark:text-white">
                        {testimonial.name}
                      </p>
                      <p className="text-xs text-surface-500">{testimonial.role}</p>
                    </div>
                  </div>
                </motion.div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="section">
        <div className="container-narrow">
          <FadeInSection>
            <div className="relative rounded-3xl overflow-hidden">
              {/* Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-accent-violet to-accent-blue" />
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-60" />

              <div className="relative px-8 py-16 md:py-20 text-center space-y-6">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-display text-white">
                  Ready to Find Your Perfect Product?
                </h2>
                <p className="text-lg text-white/80 max-w-xl mx-auto">
                  Join thousands of smart shoppers who use ProductLens to make data-driven purchasing decisions.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                  <Link
                    to="/recommend"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-primary-700 font-semibold rounded-xl hover:bg-white/90 transition-all shadow-lg"
                  >
                    <Sparkles className="w-5 h-5" />
                    Get AI Recommendation
                  </Link>
                  <Link
                    to="/products"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-all"
                  >
                    Browse Products
                  </Link>
                </div>
              </div>
            </div>
          </FadeInSection>
        </div>
      </section>
    </div>
  );
}
