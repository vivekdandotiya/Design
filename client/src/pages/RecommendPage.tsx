import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { Sparkles, ArrowRight, ArrowLeft, Briefcase, Gamepad2, Video, GraduationCap, Monitor, Target, Smartphone } from 'lucide-react';
import api from '../lib/api';
import ProductCard from '../components/ProductCard';
import ScoreGauge from '../components/ScoreGauge';
import Badge from '../components/Badge';
import type { RecommendationRequest, RecommendationResult } from '../types';
import { cn } from '../lib/utils';

const laptopPurposes = [
  { id: 'development', label: 'Development', icon: Monitor, desc: 'Coding, VMs, Docker' },
  { id: 'gaming', label: 'Gaming', icon: Gamepad2, desc: 'High FPS, AAA titles' },
  { id: 'creation', label: 'Content Creation', icon: Video, desc: 'Video editing, 3D' },
  { id: 'business', label: 'Business', icon: Briefcase, desc: 'Office, emails, calls' },
  { id: 'student', label: 'Student', icon: GraduationCap, desc: 'Notes, browsing, light work' },
  { id: 'general', label: 'General Use', icon: Target, desc: 'Media, web browsing' }
];

const phonePurposes = [
  { id: 'photography', label: 'Photography', icon: Video, desc: 'Clear photos, 4K videos' },
  { id: 'gaming', label: 'Mobile Gaming', icon: Gamepad2, desc: 'High FPS, heavy games' },
  { id: 'creation', label: 'Content Creation', icon: Sparkles, desc: 'Social media, vlogging' },
  { id: 'business', label: 'Business', icon: Briefcase, desc: 'Work apps, calls, emails' },
  { id: 'student', label: 'Student / Daily', icon: GraduationCap, desc: 'Chatting, notes, browsing' },
  { id: 'general', label: 'General Use', icon: Target, desc: 'Calls, streaming, browsing' }
];

export const RecommendPage: React.FC = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RecommendationResult | null>(null);
  const [formData, setFormData] = useState<RecommendationRequest>({
    category: 'laptop',
    budget: 70000,
    purpose: '',
    gaming: 50,
    batteryImportance: 50,
    portability: 50
  });

  const handleNext = () => setStep(s => s + 1);
  const handlePrev = () => setStep(s => s - 1);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await api.post('/recommend', formData);
      setResult(res.data.data);
      setStep(5); // Results step
    } catch (error) {
      console.error('Recommendation failed', error);
    } finally {
      setLoading(false);
    }
  };

  const isPhone = formData.category === 'phone';
  const minBudget = isPhone ? 10000 : 20000;
  const maxBudget = isPhone ? 150000 : 250000;
  const budgetStep = isPhone ? 2000 : 5000;

  const renderStepCategory = () => (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
      <h2 className="text-3xl font-display font-bold mb-2 text-surface-900 dark:text-white">What are you looking for?</h2>
      <p className="text-surface-500 mb-8">Select the category you want AI to recommend.</p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8 max-w-2xl mx-auto">
        <button
          onClick={() => {
            setFormData({ ...formData, category: 'laptop', budget: 70000, purpose: '' });
            handleNext();
          }}
          className={cn(
            "p-8 rounded-3xl border text-center transition-all duration-300 hover:-translate-y-1 shadow-sm hover:shadow-lg flex flex-col items-center justify-center gap-4 bg-white dark:bg-surface-900/40",
            formData.category === 'laptop'
              ? 'border-primary-900 dark:border-primary-400 bg-white dark:bg-surface-900 ring-2 ring-primary-500/20'
              : 'border-surface-200/60 dark:border-surface-800 hover:border-primary-300'
          )}
        >
          <div className="w-16 h-16 rounded-2xl bg-primary-500/10 flex items-center justify-center text-primary-900 dark:text-primary-400">
            <Monitor size={36} />
          </div>
          <div>
            <h3 className="font-extrabold text-xl mb-1 text-surface-900 dark:text-white">Laptop</h3>
            <p className="text-sm text-surface-500 font-medium">Coding, gaming, business, or studies</p>
          </div>
        </button>

        <button
          onClick={() => {
            setFormData({ ...formData, category: 'phone', budget: 45000, purpose: '' });
            handleNext();
          }}
          className={cn(
            "p-8 rounded-3xl border text-center transition-all duration-300 hover:-translate-y-1 shadow-sm hover:shadow-lg flex flex-col items-center justify-center gap-4 bg-white dark:bg-surface-900/40",
            formData.category === 'phone'
              ? 'border-primary-900 dark:border-primary-400 bg-white dark:bg-surface-900 ring-2 ring-primary-500/20'
              : 'border-surface-200/60 dark:border-surface-800 hover:border-primary-300'
          )}
        >
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-450">
            <Smartphone size={36} />
          </div>
          <div>
            <h3 className="font-extrabold text-xl mb-1 text-surface-900 dark:text-white">Smartphone</h3>
            <p className="text-sm text-surface-500 font-medium">Photography, daily driver, mobile gaming</p>
          </div>
        </button>
      </div>
    </motion.div>
  );

  const renderStep1 = () => (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
      <h2 className="text-3xl font-display font-bold mb-2 text-surface-900 dark:text-white">What's your budget?</h2>
      <p className="text-surface-500 mb-12">Let's start with how much you're willing to spend.</p>
      
      <div className="mb-16 px-4">
        <input 
          type="range" 
          min={minBudget}
          max={maxBudget}
          step={budgetStep}
          value={formData.budget}
          onChange={(e) => setFormData({...formData, budget: parseInt(e.target.value)})}
          className="w-full h-2 bg-surface-200 dark:bg-surface-800 rounded-lg appearance-none cursor-pointer accent-primary-900 dark:accent-primary-400"
        />
        <div className="text-center mt-8">
          <span className="text-5xl font-display font-bold text-gradient">
            ₹{formData.budget.toLocaleString()}
          </span>
        </div>
      </div>
      
      <div className="flex justify-between">
        <button onClick={handlePrev} className="btn-ghost"><ArrowLeft size={18} /> Back</button>
        <button onClick={handleNext} className="btn-primary shadow-sm hover:shadow">Next <ArrowRight size={18} /></button>
      </div>
    </motion.div>
  );

  const renderStep2 = () => {
    const currentPurposes = formData.category === 'phone' ? phonePurposes : laptopPurposes;
    return (
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
        <h2 className="text-3xl font-display font-bold mb-2 text-surface-900 dark:text-white">Primary Purpose</h2>
        <p className="text-surface-500 mb-8">What will you use this product for mostly?</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {currentPurposes.map(p => {
            const Icon = p.icon;
            const isSelected = formData.purpose === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setFormData({...formData, purpose: p.id})}
                className={cn(
                  "p-6 rounded-2xl border text-left transition-all duration-300 hover:-translate-y-0.5 shadow-sm hover:shadow bg-white dark:bg-surface-900/40",
                  isSelected 
                    ? 'border-primary-900 dark:border-primary-400 bg-white dark:bg-surface-900 ring-2 ring-primary-500/20' 
                    : 'border-surface-200/60 dark:border-surface-800 bg-white dark:bg-surface-900/40 hover:border-primary-300'
                )}
              >
                <Icon className={`mb-4 ${isSelected ? 'text-primary-900 dark:text-primary-400' : 'text-surface-400'}`} size={32} />
                <h3 className="font-bold text-lg mb-1 text-surface-900 dark:text-white">{p.label}</h3>
                <p className="text-sm text-surface-500">{p.desc}</p>
              </button>
            );
          })}
        </div>
        
        <div className="flex justify-between">
          <button onClick={handlePrev} className="btn-ghost"><ArrowLeft size={18} /> Back</button>
          <button onClick={handleNext} disabled={!formData.purpose} className="btn-primary shadow-sm hover:shadow">Next <ArrowRight size={18} /></button>
        </div>
      </motion.div>
    );
  };

  const renderStep3 = () => (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
      <h2 className="text-3xl font-display font-bold mb-2">Set Priorities</h2>
      <p className="text-surface-500 mb-8">Tell us what matters most to you.</p>
      
      <div className="space-y-8 mb-12">
        <div>
          <div className="flex justify-between mb-2">
            <label className="font-medium text-surface-700 dark:text-surface-300">Battery Life Importance</label>
            <span className="text-primary-900 dark:text-primary-300 font-bold">{formData.batteryImportance}%</span>
          </div>
          <input type="range" min="0" max="100" value={formData.batteryImportance} onChange={e => setFormData({...formData, batteryImportance: parseInt(e.target.value)})} className="w-full h-2 bg-surface-200 dark:bg-surface-800 rounded-lg appearance-none cursor-pointer accent-primary-900 dark:accent-primary-400" />
        </div>
        <div>
          <div className="flex justify-between mb-2">
            <label className="font-medium text-surface-700 dark:text-surface-300">Portability (Weight & Size)</label>
            <span className="text-primary-900 dark:text-primary-300 font-bold">{formData.portability}%</span>
          </div>
          <input type="range" min="0" max="100" value={formData.portability} onChange={e => setFormData({...formData, portability: parseInt(e.target.value)})} className="w-full h-2 bg-surface-200 dark:bg-surface-800 rounded-lg appearance-none cursor-pointer accent-primary-900 dark:accent-primary-400" />
        </div>
        <div>
          <div className="flex justify-between mb-2">
            <label className="font-medium text-surface-700 dark:text-surface-300">
              {formData.category === 'phone' ? 'Camera & Gaming Performance' : 'Gaming Capability'}
            </label>
            <span className="text-primary-900 dark:text-primary-300 font-bold">{formData.gaming}%</span>
          </div>
          <input type="range" min="0" max="100" value={formData.gaming} onChange={e => setFormData({...formData, gaming: parseInt(e.target.value)})} className="w-full h-2 bg-surface-200 dark:bg-surface-800 rounded-lg appearance-none cursor-pointer accent-primary-900 dark:accent-primary-400" />
        </div>
      </div>
      
      <div className="flex justify-between">
        <button onClick={handlePrev} className="btn-ghost"><ArrowLeft size={18} /> Back</button>
        <button onClick={handleSubmit} disabled={loading} className="btn-primary shadow-sm hover:shadow">
          {loading ? 'Analyzing...' : <><Sparkles size={18} /> Get Recommendation</>}
        </button>
      </div>
    </motion.div>
  );

  const renderResults = () => {
    if (!result) return null;
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
        <div className="text-center">
          <Badge variant="primary" className="mb-4">AI Top Pick</Badge>
          <h2 className="text-4xl font-display font-bold mb-4">We found your perfect match</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-start">
          <div className="glass p-8 rounded-3xl relative overflow-hidden border border-surface-200/60 dark:border-surface-800/60 shadow-glass">
            <h3 className="text-xl font-bold font-display mb-4 flex items-center gap-2 text-surface-900 dark:text-white">
              <Sparkles className="text-primary-900 dark:text-primary-300" size={20} /> AI Recommendation Summary
            </h3>
            <p className="text-lg leading-relaxed text-surface-850 dark:text-surface-200 relative z-10 italic">
              "{result.aiSummary}"
            </p>
            
            <div className="grid grid-cols-2 gap-4 mt-8">
              <div>
                <h4 className="font-bold text-emerald-500 mb-2">Strengths</h4>
                <ul className="space-y-2">
                  {result.strengths.map((s, i) => <li key={i} className="text-sm flex items-start gap-2"><div className="mt-1 w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0"/>{s}</li>)}
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-rose-500 mb-2">Trade-offs</h4>
                <ul className="space-y-2">
                  {result.weaknesses.map((w, i) => <li key={i} className="text-sm flex items-start gap-2"><div className="mt-1 w-1.5 h-1.5 rounded-full bg-rose-500 flex-shrink-0"/>{w}</li>)}
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <ProductCard product={result.product} />
            
            <div className="glass p-6 rounded-2xl">
              <h4 className="font-bold mb-6">Performance Scores</h4>
              <div className="flex flex-wrap gap-6 justify-center">
                <div className="text-center"><ScoreGauge score={result.scores.performance} size={80} /><div className="mt-2 text-xs font-medium text-surface-500 uppercase">Performance</div></div>
                <div className="text-center"><ScoreGauge score={result.scores.battery} size={80} /><div className="mt-2 text-xs font-medium text-surface-500 uppercase">Battery</div></div>
                <div className="text-center"><ScoreGauge score={result.scores.portability} size={80} /><div className="mt-2 text-xs font-medium text-surface-500 uppercase">Portability</div></div>
                <div className="text-center"><ScoreGauge score={result.scores.value} size={80} /><div className="mt-2 text-xs font-medium text-surface-500 uppercase">Value</div></div>
              </div>
            </div>
          </div>
        </div>

        {result.alternatives && result.alternatives.length > 0 && (
          <div>
            <h3 className="text-2xl font-display font-bold mb-6">Alternative Options</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {result.alternatives.map(alt => (
                <ProductCard key={alt._id} product={alt} />
              ))}
            </div>
          </div>
        )}
        
        <div className="text-center pb-8">
          <button onClick={() => { setResult(null); setStep(1); }} className="btn-secondary">Start Over</button>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="section container-narrow py-12 mt-16 min-h-[80vh]">
      {step < 5 && (
        <div className="mb-12">
          <div className="flex justify-between text-sm font-bold text-surface-400 mb-4 px-2">
            <span className={step >= 1 ? 'text-primary-600 dark:text-primary-400' : ''}>Category</span>
            <span className={step >= 2 ? 'text-primary-600 dark:text-primary-400' : ''}>Budget</span>
            <span className={step >= 3 ? 'text-primary-600 dark:text-primary-400' : ''}>Purpose</span>
            <span className={step >= 4 ? 'text-primary-600 dark:text-primary-400' : ''}>Priorities</span>
          </div>
          <div className="h-2 bg-surface-250 dark:bg-surface-800 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-primary-500 to-accent-violet shadow-glow"
              initial={{ width: '25%' }}
              animate={{ width: `${(step / 4) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      )}

      <div className="glass rounded-3xl p-8 md:p-12 relative overflow-hidden">
        {loading && step === 4 && (
          <div className="absolute inset-0 bg-white/70 dark:bg-surface-900/70 backdrop-blur-md z-10 flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-3 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-4" />
            <h3 className="text-xl font-bold font-display text-gradient">AI is searching and analyzing options...</h3>
          </div>
        )}
        
        <AnimatePresence mode="wait">
          {step === 1 && <motion.div key="category">{renderStepCategory()}</motion.div>}
          {step === 2 && <motion.div key="budget">{renderStep1()}</motion.div>}
          {step === 3 && <motion.div key="purpose">{renderStep2()}</motion.div>}
          {step === 4 && <motion.div key="priorities">{renderStep3()}</motion.div>}
          {step === 5 && <motion.div key="results">{renderResults()}</motion.div>}
        </AnimatePresence>
      </div>
    </div>
  );
};
