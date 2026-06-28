import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  X,
  ChevronDown,
  User,
  LayoutDashboard,
  LogOut,
  Zap,
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { useAuthStore } from '../store/authStore';
import { cn } from '../lib/utils';

const navLinks = [
  { to: '/compare', label: 'Compare' },
  { to: '/recommend', label: 'Recommend' },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-surface-200/25 dark:border-surface-800/25 bg-white/30 dark:bg-surface-950/30 backdrop-blur-3xl">
      <div className="container-wide">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-violet flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold font-display text-surface-900 dark:text-white">
              Compare<span className="text-gradient">Wise</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                  location.pathname === link.to
                    ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/40'
                    : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white hover:bg-surface-100 dark:hover:bg-surface-800'
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-2">
            <ThemeToggle />

            {isAuthenticated && user ? (
              <div className="relative hidden md:block">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-violet flex items-center justify-center text-white text-sm font-semibold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-surface-700 dark:text-surface-300 max-w-[100px] truncate">
                    {user.name}
                  </span>
                  <ChevronDown className="w-4 h-4 text-surface-400" />
                </button>

                <AnimatePresence>
                  {profileOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-56 rounded-xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 shadow-glass-lg overflow-hidden z-50"
                      >
                        <div className="p-3 border-b border-surface-200 dark:border-surface-700">
                          <p className="text-sm font-semibold text-surface-900 dark:text-white truncate">
                            {user.name}
                          </p>
                          <p className="text-xs text-surface-500 truncate">{user.email}</p>
                        </div>
                        <div className="p-1.5">
                          <Link
                            to="/dashboard"
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                          >
                            <LayoutDashboard className="w-4 h-4" />
                            Dashboard
                          </Link>
                          <Link
                            to="/dashboard"
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                          >
                            <User className="w-4 h-4" />
                            Profile
                          </Link>
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/auth" className="btn-ghost text-sm">
                  Sign In
                </Link>
                <Link to="/auth" className="btn-primary text-sm !px-4 !py-2">
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-lg md:hidden hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
            >
              {mobileOpen ? (
                <X className="w-5 h-5 text-surface-600 dark:text-surface-400" />
              ) : (
                <Menu className="w-5 h-5 text-surface-600 dark:text-surface-400" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="md:hidden overflow-hidden border-t border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-950"
          >
            <div className="container-wide py-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'block px-4 py-3 rounded-xl text-sm font-medium transition-colors',
                    location.pathname === link.to
                      ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/40'
                      : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800'
                  )}
                >
                  {link.label}
                </Link>
              ))}
              {isAuthenticated ? (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="block px-4 py-3 rounded-xl text-sm font-medium text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="pt-3 border-t border-surface-200 dark:border-surface-700 flex gap-2 px-4">
                  <Link
                    to="/auth"
                    onClick={() => setMobileOpen(false)}
                    className="btn-secondary text-sm flex-1 text-center"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/auth"
                    onClick={() => setMobileOpen(false)}
                    className="btn-primary text-sm flex-1 text-center"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
