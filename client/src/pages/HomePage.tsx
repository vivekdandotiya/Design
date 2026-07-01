import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import {
  ArrowRight,
  Search,
  BarChart3,
  CheckCircle,
  Sparkles,
  Star,
  Quote,
  Monitor,
} from 'lucide-react';
import AnimatedCounter from '../components/AnimatedCounter';
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
function FloatingLaptop() {
  return (
    <motion.div
      animate={{ y: [0, -16, 0] }}
      transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      className="relative"
    >
      <div className="relative w-72 h-48 md:w-96 md:h-64">
        {/* Glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 via-accent-violet/20 to-accent-blue/20 rounded-3xl blur-3xl" />

        {/* Laptop body */}
        <svg viewBox="0 0 400 280" className="relative w-full h-full" fill="none">
          {/* Screen */}
          <rect x="60" y="20" width="280" height="175" rx="12" className="fill-surface-800 dark:fill-surface-700" />
          <rect x="70" y="30" width="260" height="155" rx="6" className="fill-surface-900 dark:fill-surface-800" />

          {/* Screen content lines */}
          <rect x="90" y="55" width="100" height="6" rx="3" className="fill-primary-500/60" />
          <rect x="90" y="70" width="160" height="4" rx="2" className="fill-surface-600" />
          <rect x="90" y="82" width="140" height="4" rx="2" className="fill-surface-600" />
          <rect x="90" y="94" width="120" height="4" rx="2" className="fill-surface-600" />

          {/* Chart bars */}
          <rect x="90" y="130" width="30" height="40" rx="4" className="fill-accent-emerald/50" />
          <rect x="130" y="115" width="30" height="55" rx="4" className="fill-primary-500/50" />
          <rect x="170" y="125" width="30" height="45" rx="4" className="fill-accent-violet/50" />
          <rect x="210" y="105" width="30" height="65" rx="4" className="fill-accent-blue/50" />
          <rect x="250" y="120" width="30" height="50" rx="4" className="fill-accent-amber/50" />

          {/* Camera dot */}
          <circle cx="200" cy="26" r="2" className="fill-surface-600" />

          {/* Base */}
          <path d="M30 195 L60 195 L60 195 Q60 200 65 205 L335 205 Q340 200 340 195 L370 195 L380 210 Q385 220 375 220 L25 220 Q15 220 20 210 Z" className="fill-surface-700 dark:fill-surface-600" />
          <ellipse cx="200" cy="210" rx="60" ry="3" className="fill-surface-600 dark:fill-surface-500" />
        </svg>

        {/* Floating elements */}
        <motion.div
          animate={{ y: [0, -8, 0], x: [0, 4, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
          className="absolute -top-4 -right-4 w-12 h-12 rounded-xl bg-gradient-to-br from-accent-emerald to-accent-cyan flex items-center justify-center shadow-lg"
        >
          <CheckCircle className="w-6 h-6 text-white" />
        </motion.div>
        <motion.div
          animate={{ y: [0, 8, 0], x: [0, -4, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute -bottom-2 -left-6 w-10 h-10 rounded-lg bg-gradient-to-br from-accent-amber to-accent-rose flex items-center justify-center shadow-lg"
        >
          <Star className="w-5 h-5 text-white" />
        </motion.div>
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
          className="absolute top-8 -left-8 w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-violet flex items-center justify-center shadow-lg"
        >
          <Sparkles className="w-4 h-4 text-white" />
        </motion.div>
      </div>
    </motion.div>
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

        <div className="container-wide relative">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              className="space-y-8"
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-surface-900 border border-surface-200/80 dark:border-surface-800 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />
                <span className="text-xs font-semibold text-surface-700 dark:text-surface-300">
                  AI-Powered Grounding Comparison
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-medium font-display leading-[1.15] tracking-tight text-surface-900 dark:text-white text-balance">
                Stop guessing.<br />
                Start choosing <span className="italic text-primary-600 dark:text-primary-400">smarter.</span>
              </h1>

              <p className="text-lg text-surface-500 dark:text-surface-400 max-w-lg leading-relaxed">
                Compare products side-by-side with live web-grounded specs and real-time e-commerce store prices.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/compare" className="btn-primary text-base !px-8 !py-3.5 shadow-glass">
                  Start Comparing
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link to="/recommend" className="btn-secondary text-base !px-8 !py-3.5 shadow-glass">
                  Get AI Advice
                </Link>
              </div>
            </motion.div>

            {/* Right illustration */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="flex justify-center lg:justify-end"
            >
              <FloatingLaptop />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="py-16 border-y border-surface-200 dark:border-surface-800 bg-surface-50/50 dark:bg-surface-900/50">
        <div className="container-wide">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: 500, suffix: '+', label: 'Products Cataloged' },
              { value: 10000, suffix: '+', label: 'Comparisons Made' },
              { value: 98, suffix: '%', label: 'Accuracy Rate' },
              { value: 5000, suffix: '+', label: 'Happy Users' },
            ].map((stat) => (
              <div key={stat.label} className="text-center space-y-2">
                <AnimatedCounter
                  target={stat.value}
                  suffix={stat.suffix}
                  className="text-3xl md:text-4xl font-bold font-display text-gradient"
                />
                <p className="text-sm text-surface-500 dark:text-surface-400">{stat.label}</p>
              </div>
            ))}
          </div>
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
