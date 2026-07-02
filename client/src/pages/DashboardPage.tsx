import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Heart, History, Settings, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
import { useAuthStore } from '../store/authStore';
import ProductCard from '../components/ProductCard';
import api from '../lib/api';
import type { DashboardStats } from '../types';

export const DashboardPage: React.FC = () => {
  const { user, logout, isLoading: isAuthLoading } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name);
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveMessage('');
    try {
      const res = await api.put('/users/profile', { name });
      if (res.data.success) {
        useAuthStore.setState({ user: res.data.user });
        setSaveMessage('Profile updated successfully!');
      }
    } catch (err: any) {
      setSaveMessage(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (isAuthLoading) return;

    if (!user) {
      navigate('/auth');
      return;
    }

    const fetchStats = async () => {
      try {
        const res = await api.get('/users/dashboard');
        setStats(res.data);
      } catch (error) {
        console.error('Failed to load dashboard', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [user, isAuthLoading, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const token = localStorage.getItem('cw-token');

  if (isAuthLoading || (token && !user)) {
    return (
      <div className="section container-wide py-20 text-center mt-16 text-surface-550 font-bold">
        Verifying session...
      </div>
    );
  }

  if (!user) return null;
  if (loading || !stats) return <div className="section container-wide py-20 text-center mt-16">Loading dashboard...</div>;

  return (
    <div className="container-wide py-8 mt-16 min-h-screen">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="glass rounded-2xl p-6 sticky top-24">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-accent-violet flex items-center justify-center text-white font-bold text-xl">
                {user.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold">{user.name}</h3>
                <p className="text-xs text-surface-500">{user.email}</p>
              </div>
            </div>

            <nav className="space-y-2">
              <button 
                onClick={() => setActiveTab('overview')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'overview' ? 'bg-primary-50 text-primary-600 font-medium' : 'text-surface-600 hover:bg-surface-100'}`}
              >
                <LayoutDashboard size={18} /> Overview
              </button>
              <button 
                onClick={() => setActiveTab('saved')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'saved' ? 'bg-primary-50 text-primary-600 font-medium' : 'text-surface-600 hover:bg-surface-100'}`}
              >
                <Heart size={18} /> Saved Products
              </button>
              <button 
                onClick={() => setActiveTab('history')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'history' ? 'bg-primary-50 text-primary-600 font-medium' : 'text-surface-600 hover:bg-surface-100'}`}
              >
                <History size={18} /> Compare History
              </button>
              <button 
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'settings' ? 'bg-primary-50 text-primary-600 font-medium' : 'text-surface-600 hover:bg-surface-100'}`}
              >
                <Settings size={18} /> Settings
              </button>
            </nav>

            <div className="mt-8 pt-6 border-t border-surface-200 dark:border-surface-800">
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-500 hover:bg-rose-50 transition-colors"
              >
                <LogOut size={18} /> Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-grow">
          {activeTab === 'overview' && (
            <>
              <h1 className="text-3xl font-display font-bold mb-8">Dashboard Overview</h1>
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <div className="glass p-6 rounded-2xl border-t-4 border-t-primary-500">
                  <p className="text-surface-500 text-sm mb-2">Saved Products</p>
                  <p className="text-3xl font-display font-bold">{stats.savedProducts}</p>
                </div>
                <div className="glass p-6 rounded-2xl border-t-4 border-t-accent-violet">
                  <p className="text-surface-500 text-sm mb-2">Comparisons Made</p>
                  <p className="text-3xl font-display font-bold">{stats.totalComparisons}</p>
                </div>
                <div className="glass p-6 rounded-2xl border-t-4 border-t-emerald-500">
                  <p className="text-surface-500 text-sm mb-2">AI Recommendations</p>
                  <p className="text-3xl font-display font-bold">{stats.aiRecommendations}</p>
                </div>
                <div className="glass p-6 rounded-2xl border-t-4 border-t-amber-500">
                  <p className="text-surface-500 text-sm mb-2">Recent Searches</p>
                  <p className="text-3xl font-display font-bold">{stats.recentSearches}</p>
                </div>
              </div>

              <div className="mb-12">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold font-display">Recently Saved</h2>
                  <button onClick={() => setActiveTab('saved')} className="text-primary-600 text-sm font-medium hover:underline">View All</button>
                </div>
                {stats.savedProductsList && stats.savedProductsList.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {stats.savedProductsList.slice(0, 3).map(product => (
                      <ProductCard key={product._id} product={product} />
                    ))}
                  </div>
                ) : (
                  <div className="p-8 bg-surface-50 dark:bg-surface-900 rounded-2xl text-center text-surface-500 border border-surface-200">
                    No saved products yet. Browse laptops to save them.
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === 'saved' && (
            <>
              <h1 className="text-3xl font-display font-bold mb-8">Saved Products</h1>
              {stats.savedProductsList && stats.savedProductsList.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {stats.savedProductsList.map(product => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center text-surface-500">You haven't saved any products yet.</div>
              )}
            </>
          )}

          {activeTab === 'history' && (
            <>
              <h1 className="text-3xl font-display font-bold mb-8">Comparison History</h1>
              <div className="p-12 text-center text-surface-500 bg-surface-50 dark:bg-surface-900 rounded-2xl border border-surface-200">
                Comparison history is currently empty.
              </div>
            </>
          )}

          {activeTab === 'settings' && (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="text-3xl font-display font-bold mb-8">Account Settings</h1>
              
              <div className="glass p-8 rounded-3xl max-w-xl border border-surface-200/60 dark:border-surface-800/60 bg-white dark:bg-surface-900 shadow-glass">
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-surface-600 dark:text-surface-300 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="input-field w-full px-4 py-3 rounded-xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-950 focus:ring-2 focus:ring-primary-500/20 text-surface-900 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-surface-600 dark:text-surface-300 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={user.email}
                      className="input-field w-full px-4 py-3 rounded-xl border border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-900/60 text-surface-400 cursor-not-allowed"
                      disabled
                    />
                    <p className="text-[11px] text-surface-500 mt-2">
                      Email address cannot be changed. Contact support if you need to update it.
                    </p>
                  </div>

                  {saveMessage && (
                    <p className={cn(
                      "text-sm font-semibold",
                      saveMessage.includes('successfully') ? 'text-emerald-600 dark:text-emerald-450' : 'text-rose-500'
                    )}>
                      {saveMessage}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={saving}
                    className="btn-primary w-full py-3.5 rounded-xl shadow-sm hover:shadow font-bold transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};
