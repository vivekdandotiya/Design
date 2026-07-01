import { Link } from 'react-router-dom';
import { motion, useInView, useMotionValue, useTransform, useSpring } from 'framer-motion';
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
  const containerRef = useRef<HTMLDivElement>(null);
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springX = useSpring(mouseX, { stiffness: 120, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 120, damping: 20 });

  const rotateX = useTransform(springY, [-0.5, 0.5], ["12deg", "-12deg"]);
  const rotateY = useTransform(springX, [-0.5, 0.5], ["-15deg", "15deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const width = rect.width;
    const height = rect.height;
    const x = (e.clientX - rect.left) / width - 0.5;
    const y = (e.clientY - rect.top) / height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full max-w-[550px] h-[400px] mx-auto flex items-center justify-center cursor-grab active:cursor-grabbing select-none perspective-[1200px]"
    >
      <motion.div
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="relative w-full h-full flex items-center justify-center transition-all duration-300 ease-out"
      >
        {/* Glow backdrop */}
        <div className="absolute w-80 h-80 rounded-full bg-gradient-to-br from-primary-500/10 via-accent-violet/10 to-transparent blur-3xl pointer-events-none" />

        {/* ── CARD 1: LEFT CARD (Sits further back in 3D space) ── */}
        <motion.div
          style={{
            transform: "translateZ(-40px) translateX(-110px) translateY(-20px) rotateY(12deg)",
            transformStyle: "preserve-3d"
          }}
          className="absolute w-52 bg-white dark:bg-surface-900 border border-surface-200/60 dark:border-surface-800 p-5 rounded-2xl shadow-glass transition-all duration-300 hover:shadow-glass-lg"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span className="text-[11px] font-bold text-surface-400 uppercase tracking-wider">Product Alpha</span>
          </div>
          <h4 className="text-base font-bold text-surface-900 dark:text-white truncate">iPhone 15 Pro</h4>
          <p className="text-sm font-bold text-primary-600 dark:text-primary-400 mt-1">₹1,29,900</p>
          
          <div className="space-y-2.5 mt-5">
            <div>
              <div className="flex justify-between text-[10px] font-semibold text-surface-500 mb-1">
                <span>Performance</span>
                <span>88%</span>
              </div>
              <div className="w-full h-1.5 bg-surface-100 dark:bg-surface-800 rounded-full overflow-hidden">
                <div className="w-[88%] h-full bg-primary-500 rounded-full" />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[10px] font-semibold text-surface-500 mb-1">
                <span>Battery</span>
                <span>72%</span>
              </div>
              <div className="w-full h-1.5 bg-surface-100 dark:bg-surface-800 rounded-full overflow-hidden">
                <div className="w-[72%] h-full bg-primary-500 rounded-full" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── CARD 2: RIGHT CARD (Sits intermediate in 3D space) ── */}
        <motion.div
          style={{
            transform: "translateZ(30px) translateX(90px) translateY(30px) rotateY(-8deg)",
            transformStyle: "preserve-3d"
          }}
          className="absolute w-52 bg-white dark:bg-surface-900 border border-emerald-500/20 p-5 rounded-2xl shadow-glass transition-all duration-300 hover:shadow-glass-lg"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-[11px] font-bold text-surface-400 uppercase tracking-wider">Product Beta</span>
            </div>
            <span className="text-[9px] font-bold text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded">Winner</span>
          </div>
          <h4 className="text-base font-bold text-surface-900 dark:text-white truncate">Galaxy S24 Ultra</h4>
          <p className="text-sm font-bold text-emerald-600 dark:text-emerald-450 mt-1">₹1,19,900</p>
          
          <div className="space-y-2.5 mt-5">
            <div>
              <div className="flex justify-between text-[10px] font-semibold text-surface-500 mb-1">
                <span>Performance</span>
                <span>94%</span>
              </div>
              <div className="w-full h-1.5 bg-surface-100 dark:bg-surface-800 rounded-full overflow-hidden">
                <div className="w-[94%] h-full bg-emerald-500 rounded-full" />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[10px] font-semibold text-surface-500 mb-1">
                <span>Battery</span>
                <span>86%</span>
              </div>
              <div className="w-full h-1.5 bg-surface-100 dark:bg-surface-800 rounded-full overflow-hidden">
                <div className="w-[86%] h-full bg-emerald-500 rounded-full" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── THE LENS: CENTRAL CENTRAL LENS (Floats in front of everything) ── */}
        <motion.div
          style={{
            transform: "translateZ(80px) translateY(-10px)",
            transformStyle: "preserve-3d"
          }}
          className="absolute w-44 h-44 rounded-full border border-white/40 bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-md shadow-glass-lg flex items-center justify-center"
        >
          <div className="absolute inset-2.5 rounded-full border border-white/20 bg-gradient-to-tr from-primary-500/10 via-accent-violet/5 to-transparent" />
          
          <div className="relative flex flex-col items-center justify-center text-center p-4">
            <Sparkles className="w-8 h-8 text-primary-900 dark:text-primary-300 animate-pulse mb-1.5" />
            <span className="text-[10px] font-bold text-surface-900 uppercase tracking-widest leading-none">Product</span>
            <span className="text-[12px] font-extrabold text-primary-950 uppercase tracking-widest leading-none">Lens</span>
          </div>

          {/* Handle of the lens */}
          <div 
            style={{ transform: "rotate(45deg) translateY(80px)" }}
            className="absolute bottom-0 w-4 h-16 bg-gradient-to-b from-white/30 to-white/10 border border-white/20 rounded-b-xl shadow-sm"
          />
        </motion.div>
      </motion.div>
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
