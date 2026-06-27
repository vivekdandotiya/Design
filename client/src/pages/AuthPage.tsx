import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Shield, Sparkles, Mail, Lock, User } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const { login, signup, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(name, email, password);
      }
      navigate('/dashboard');
    } catch (err) {
      // Error handled by store
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    clearError();
  };

  return (
    <div className="min-h-screen flex items-stretch">
      {/* Left Panel */}
      <div className="hidden lg:flex w-1/2 bg-surface-950 text-white p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/50 via-surface-950 to-accent-violet/30" />
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary-500/20 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-16 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-8 h-8 rounded bg-gradient-to-br from-primary-500 to-accent-violet flex items-center justify-center shadow-glow">
              <Sparkles size={18} className="text-white" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight text-white">CompareWise<span className="text-primary-400">.ai</span></span>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-5xl font-display font-bold leading-tight mb-6 text-balance">
              Stop Guessing.<br/>Start Choosing <span className="text-gradient bg-gradient-to-r from-primary-400 to-accent-violet">Smarter.</span>
            </h1>
            <p className="text-xl text-surface-400 max-w-md">
              Join thousands of users making informed decisions with our AI-powered product comparison platform.
            </p>
          </motion.div>
        </div>
        
        <div className="relative z-10 grid grid-cols-2 gap-8 text-surface-400 text-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-surface-900 rounded-lg text-primary-400"><Shield size={20} /></div>
            <span>Secure Authentication</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-surface-900 rounded-lg text-primary-400"><Sparkles size={20} /></div>
            <span>AI Recommendations</span>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-surface-50 dark:bg-surface-950">
        <div className="max-w-md w-full bg-white dark:bg-surface-900 p-8 sm:p-10 rounded-3xl shadow-glass border border-surface-200 dark:border-surface-800">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-display font-bold mb-2">
              {isLogin ? 'Welcome back' : 'Create an account'}
            </h2>
            <p className="text-surface-500">
              {isLogin ? 'Enter your details to access your account.' : 'Sign up to save comparisons and get personalized recommendations.'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium mb-1.5 text-surface-700 dark:text-surface-300">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-surface-400">
                    <User size={18} />
                  </div>
                  <input 
                    type="text" 
                    required 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input-field pl-10" 
                    placeholder="John Doe"
                  />
                </div>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium mb-1.5 text-surface-700 dark:text-surface-300">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-surface-400">
                  <Mail size={18} />
                </div>
                <input 
                  type="email" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-10" 
                  placeholder="name@example.com"
                />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Password</label>
                {isLogin && <a href="#" className="text-xs font-medium text-primary-600 hover:text-primary-700">Forgot password?</a>}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-surface-400">
                  <Lock size={18} />
                </div>
                <input 
                  type="password" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-10" 
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary w-full py-3.5 mt-2">
              {isLoading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-surface-200 dark:border-surface-800 text-center">
            <p className="text-surface-500">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button 
                onClick={toggleMode}
                className="font-semibold text-primary-600 hover:text-primary-700 transition-colors"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
