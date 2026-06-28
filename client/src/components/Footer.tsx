import { Link } from 'react-router-dom';
import { Zap, Globe, Mail } from 'lucide-react';

const footerLinks = [
  { label: 'Compare', to: '/compare' },
  { label: 'Recommend', to: '/recommend' },
  { label: 'About', to: '/' },
];

export default function Footer() {
  return (
    <footer className="relative bg-surface-50 dark:bg-surface-950/60 border-t border-surface-200 dark:border-surface-800/40 backdrop-blur-md">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-surface-100/50 dark:to-black/30 pointer-events-none" />
      <div className="container-wide relative py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-violet flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold font-display text-surface-900 dark:text-white">
                Compare<span className="text-gradient">Wise</span>
              </span>
            </Link>
            <p className="text-sm text-surface-500 dark:text-surface-400 max-w-sm leading-relaxed">
              AI-powered product comparison that helps you make smarter purchasing decisions. Compare specs, read reviews, and get personalized recommendations.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-semibold text-surface-900 dark:text-white mb-4">
              Navigate
            </h4>
            <ul className="space-y-3">
              {footerLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm text-surface-500 hover:text-primary-600 dark:text-surface-400 dark:hover:text-primary-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-sm font-semibold text-surface-900 dark:text-white mb-4">
              Connect
            </h4>
            <div className="flex items-center gap-3">
              <a
                href="#"
                className="w-9 h-9 rounded-lg bg-surface-100 dark:bg-surface-800 flex items-center justify-center text-surface-500 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-surface-200 dark:hover:bg-surface-700 transition-all"
              >
                <Mail className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-lg bg-surface-100 dark:bg-surface-800 flex items-center justify-center text-surface-500 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-surface-200 dark:hover:bg-surface-700 transition-all"
              >
                <Globe className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-surface-200 dark:border-surface-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-surface-400 dark:text-surface-500">
            © {new Date().getFullYear()} CompareWise AI. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-xs text-surface-400 dark:text-surface-500">
            <a href="#" className="hover:text-surface-600 dark:hover:text-surface-300 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-surface-600 dark:hover:text-surface-300 transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
