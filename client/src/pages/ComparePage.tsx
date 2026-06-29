import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Trash2, CheckCircle, Plus, ArrowLeft, Globe, TrendingUp, Award } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import Badge from '../components/Badge';
import { formatPrice, cn } from '../lib/utils';
import api from '../lib/api';
import type { CompareResult } from '../types';

export const ComparePage: React.FC = () => {
  const [queries, setQueries] = useState<string[]>(['', '']);
  const [requirements, setRequirements] = useState('');
  const [comparing, setComparing] = useState(false);
  const [result, setResult] = useState<CompareResult | null>(null);

  const isElectronics = result
    ? result.products.some(p => {
        const cat = (p as any).category?.toLowerCase() || '';
        return cat.includes('laptop') || 
               cat.includes('phone') || 
               cat.includes('tv') || 
               cat.includes('computer') || 
               cat.includes('device') || 
               cat.includes('camera') || 
               cat.includes('headphone') || 
               cat.includes('refrigerator') ||
               cat.includes('fridge') ||
               cat.includes('washing') ||
               cat.includes('appliance') ||
               cat.includes('gadget');
      })
    : false;

  const handleAddQuery = () => {
    if (queries.length < 4) {
      setQueries([...queries, '']);
    }
  };

  const handleRemoveQuery = (index: number) => {
    if (queries.length > 2) {
      setQueries(queries.filter((_, i) => i !== index));
    }
  };

  const handleQueryChange = (index: number, value: string) => {
    const updated = [...queries];
    updated[index] = value;
    setQueries(updated);
  };

  const handleCompare = async () => {
    const validQueries = queries.filter((q) => q.trim() !== '');
    if (validQueries.length < 2) return;
    setComparing(true);
    try {
      const res = await api.post('/compare', {
        productQueries: validQueries,
        requirements,
      });
      setResult(res.data.data);
    } catch (error) {
      console.error('Comparison failed', error);
    } finally {
      setComparing(false);
    }
  };

  const resetComparison = () => {
    setResult(null);
  };

  return (
    <div className="section container-wide py-8 mt-16 min-h-[80vh]">
      <AnimatePresence mode="wait">
        {!result ? (
          /* ── FORM STATE ── */
          <motion.div
            key="compare-form"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="max-w-3xl mx-auto"
          >
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-950/40 border border-primary-200 dark:border-primary-800 mb-4">
                <Globe className="w-3.5 h-3.5 text-primary-500" />
                <span className="text-xs font-semibold text-primary-700 dark:text-primary-300">
                  Live Web-Grounded Comparison
                </span>
              </div>
              <h1 className="text-4xl font-display font-bold tracking-tight">AI Web Comparison</h1>
              <p className="text-surface-500 mt-3 max-w-lg mx-auto">
                Type the names or model numbers of the laptops you wish to compare. The AI will search the web, compile specifications, and analyze the fit.
              </p>
            </div>

            <div className="glass rounded-3xl p-6 md:p-8 space-y-6">
              {/* Product Inputs */}
              <div className="space-y-4">
                <label className="block text-sm font-semibold text-surface-900 dark:text-white">
                  Laptops to Compare (2 - 4)
                </label>
                <div className="grid gap-4">
                  {queries.map((query, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          value={query}
                          onChange={(e) => handleQueryChange(index, e.target.value)}
                          placeholder={`e.g. MacBook Air M3 13" or Dell XPS 13 9340...`}
                          className="input-field pr-10"
                        />
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-surface-400 select-none">
                          #{index + 1}
                        </span>
                      </div>
                      {queries.length > 2 && (
                        <button
                          onClick={() => handleRemoveQuery(index)}
                          className="p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors"
                          title="Remove laptop"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {queries.length < 4 && (
                  <button
                    onClick={handleAddQuery}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors mt-2"
                  >
                    <Plus size={16} /> Add another laptop
                  </button>
                )}
              </div>

              {/* Requirements Textarea */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-surface-900 dark:text-white">
                  Your Requirements & Priorities (Optional)
                </label>
                <textarea
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  placeholder="e.g. I need a laptop for computer science studies, coding, and light gaming. My budget is under ₹1,00,000, and I value battery life and portability."
                  rows={4}
                  className="input-field resize-none"
                />
              </div>

              {/* Submit */}
              <button
                onClick={handleCompare}
                disabled={queries.filter((q) => q.trim() !== '').length < 2 || comparing}
                className="btn-primary w-full py-3.5 text-base shadow-glow mt-4"
              >
                {comparing ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Searching web and compiling specs...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Sparkles size={18} />
                    Run AI Web Comparison
                  </span>
                )}
              </button>
            </div>
          </motion.div>
        ) : (
          /* ── RESULTS STATE ── */
          <motion.div
            key="compare-results"
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1
                }
              }
            }}
            initial="hidden"
            animate="show"
            exit="hidden"
            className="space-y-12"
          >
            {/* Header / Nav Back */}
            <motion.div 
              variants={{
                hidden: { opacity: 0, y: 10 },
                show: { opacity: 1, y: 0 }
              }}
              className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-surface-200/20 dark:border-surface-800/40 pb-6"
            >
              <div>
                <button
                  onClick={resetComparison}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-surface-500 hover:text-primary-600 transition-colors mb-2"
                >
                  <ArrowLeft size={16} /> New Comparison
                </button>
                <h1 className="text-3xl font-display font-bold text-surface-900 dark:text-white">Comparison Results</h1>
              </div>
              <div className="text-xs text-surface-500 flex items-center gap-1.5 bg-surface-50/50 dark:bg-surface-900/50 px-3 py-1.5 rounded-full border border-surface-200/20 dark:border-surface-800/20 backdrop-blur-sm">
                <Globe size={12} className="text-primary-500" /> Search grounding completed
              </div>
            </motion.div>

            {/* Spec Table */}
            <motion.div 
              variants={{
                hidden: { opacity: 0, y: 15 },
                show: { opacity: 1, y: 0 }
              }}
              className="glass rounded-3xl overflow-hidden"
            >
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-surface-200/20 dark:divide-surface-800/20">
                  <thead>
                    <tr>
                      <th className="w-48 p-5 text-left font-semibold text-surface-900 dark:text-white bg-surface-50/30 dark:bg-surface-950/20">
                        Feature
                      </th>
                      {result.products.map((p) => (
                        <th key={p._id} className="p-5 align-top w-64 min-w-[220px]">
                          <div className="glass hover:shadow-glow hover:-translate-y-0.5 transition-all duration-300 rounded-2xl p-4 text-center border border-surface-200/20 dark:border-surface-800/20 bg-surface-50/40 dark:bg-surface-950/20 flex flex-col justify-between min-h-[140px]">
                            <div>
                              <h3 className="font-bold font-display text-base text-surface-900 dark:text-white line-clamp-2">
                                {p.name}
                              </h3>
                              <p className={cn(
                                "font-bold mt-2 text-lg transition-colors",
                                result.highlights.bestValue === p._id 
                                  ? "text-emerald-600 dark:text-emerald-400" 
                                  : "text-primary-600 dark:text-primary-400"
                              )}>
                                {p.price > 0 ? formatPrice(p.price) : 'N/A'}
                              </p>
                            </div>
                            
                            {/* Lowest rate badge */}
                            {p.lowestPriceStore && (
                              <div className="mt-3.5 inline-flex items-center justify-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 dark:bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                                Lowest: {formatPrice(p.lowestPrice || 0)} on {p.lowestPriceStore}
                              </div>
                            )}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-surface-200/20 dark:divide-surface-800/20">
                    {/* Badges Highlights */}
                    <tr>
                      <td className="p-5 font-semibold text-surface-600 bg-surface-50/20 dark:bg-surface-900/10">Highlights</td>
                      {result.products.map((p) => {
                        const hasAnyBadge = result.highlights.bestValue === p._id ||
                                           (isElectronics && (
                                             result.highlights.bestPerformance === p._id ||
                                             result.highlights.bestBattery === p._id ||
                                             result.highlights.mostPortable === p._id
                                           ));
                        return (
                          <td key={p._id} className="p-5 text-center">
                            <div className="flex flex-wrap justify-center gap-1.5">
                              {result.highlights.bestValue === p._id && <Badge variant="success">Best Value</Badge>}
                              {isElectronics && result.highlights.bestPerformance === p._id && <Badge variant="primary">Top Performance</Badge>}
                              {isElectronics && result.highlights.bestBattery === p._id && <Badge variant="warning">Best Battery</Badge>}
                              {isElectronics && result.highlights.mostPortable === p._id && <Badge variant="outline">Most Portable</Badge>}
                              {!hasAnyBadge && (
                                <span className="text-xs text-surface-400">-</span>
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>

                    {/* Store Prices / E-Commerce Comparison Row */}
                    {result.products.some(p => (p as any).storePrices && (p as any).storePrices.length > 0) && (
                      <tr className="hover:bg-surface-50/20 dark:hover:bg-surface-900/10 transition-colors">
                        <td className="p-5 font-semibold text-surface-600 bg-surface-50/20 dark:bg-surface-900/10 text-sm">
                          Lowest Prices
                        </td>
                        {result.products.map((p) => (
                          <td key={p._id} className="p-5 text-center text-sm font-medium">
                            <div className="flex flex-col gap-2 max-w-[220px] mx-auto">
                              {((p as any).storePrices || [])
                                .filter((s: any) => s.price > 0)
                                .map((storePrice: any, idx: number) => {
                                  const isLowest = p.lowestPriceStore === storePrice.store;
                                  return (
                                    <a
                                      key={idx}
                                      href={storePrice.url || '#'}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className={cn(
                                        "flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-xs font-semibold hover:scale-[1.02] active:scale-[0.98] transition-all",
                                        isLowest
                                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400 shadow-sm"
                                          : "bg-surface-50/50 dark:bg-surface-900/40 border-surface-200/50 dark:border-surface-800/40 text-surface-700 dark:text-surface-300"
                                      )}
                                    >
                                      <span>{storePrice.store}</span>
                                      <span className="flex items-center gap-1 font-bold">
                                        {formatPrice(storePrice.price)}
                                        {isLowest && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                                      </span>
                                    </a>
                                  );
                                })}
                              {(!p.storePrices || p.storePrices.filter((s: any) => s.price > 0).length === 0) && (
                                <span className="text-xs text-surface-400">-</span>
                              )}
                            </div>
                          </td>
                        ))}
                      </tr>
                    )}

                    {/* Specs Rows */}
                    {(() => {
                      const allSpecKeys = Array.from(
                        new Set(
                          result.products.flatMap((p) => Object.keys((p as any).specs || {}))
                        )
                      );
                      const specRows = allSpecKeys.length > 0
                        ? allSpecKeys.map(key => ({ key, label: key, isDynamic: true }))
                        : [
                            { key: 'processor', label: 'Processor', highlightKey: 'bestPerformance' },
                            { key: 'gpu', label: 'Graphics' },
                            { key: 'ram', label: 'RAM' },
                            { key: 'storage', label: 'Storage' },
                            { key: 'displaySize', label: 'Display' },
                            { key: 'battery', label: 'Battery', highlightKey: 'bestBattery' },
                            { key: 'weight', label: 'Weight', highlightKey: 'mostPortable' },
                            { key: 'os', label: 'Operating System' },
                          ];
                      return specRows.map((spec) => (
                        <tr key={spec.key} className="hover:bg-surface-50/20 dark:hover:bg-surface-900/10 transition-colors">
                          <td className="p-5 font-semibold text-surface-600 bg-surface-50/20 dark:bg-surface-900/10 text-sm">
                            {spec.label}
                          </td>
                          {result.products.map((p) => {
                            const isWinnerCell = (spec as any).highlightKey && (result.highlights as any)[(spec as any).highlightKey] === p._id;
                            const value = (spec as any).isDynamic 
                              ? (p as any).specs?.[spec.key] 
                              : (p as any)[spec.key];
                            return (
                              <td 
                                key={p._id} 
                                className={cn(
                                  "p-5 text-center text-sm font-medium transition-colors",
                                  isWinnerCell 
                                    ? "text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 font-bold" 
                                    : "text-surface-900 dark:text-surface-100"
                                )}
                              >
                                <div className="flex items-center justify-center gap-1.5">
                                  {value || '-'}
                                  {isWinnerCell && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" title="Category Winner" />}
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>
            </motion.div>

            {/* Visual Analytics Charts Grid */}
            <motion.div 
              variants={{
                hidden: { opacity: 0, y: 15 },
                show: { opacity: 1, y: 0 }
              }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8"
            >
              {/* Price Chart */}
              <div className="glass p-6 rounded-3xl border border-surface-200/20 dark:border-surface-800/20 shadow-glass">
                <h3 className="text-lg font-bold font-display text-surface-900 dark:text-white mb-6 flex items-center gap-2">
                  <TrendingUp className="text-primary-500" size={20} /> Price Comparison (INR)
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={
                      result.products.map(p => ({
                        name: p.name.split(' ').slice(0, 3).join(' '),
                        Price: p.price,
                      }))
                    } margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                      <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val / 1000}k`} />
                      <Tooltip 
                        contentStyle={{ 
                          background: 'rgba(11, 15, 25, 0.95)', 
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '16px',
                          color: '#fff',
                          backdropFilter: 'blur(10px)'
                        }}
                        formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Price']}
                      />
                      <Bar dataKey="Price" radius={[8, 8, 0, 0]}>
                        {result.products.map((p, index) => {
                          const isBest = result.highlights.bestValue === p._id;
                          return <Cell key={`cell-${index}`} fill={isBest ? '#10b981' : '#14b8a6'} opacity={isBest ? 1 : 0.75} />;
                        })}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Performance Chart (Electronics Only) */}
              {isElectronics && (
                <div className="glass p-6 rounded-3xl border border-surface-200/20 dark:border-surface-800/20 shadow-glass">
                  <h3 className="text-lg font-bold font-display text-surface-900 dark:text-white mb-6 flex items-center gap-2">
                    <Award className="text-primary-500" size={20} /> Performance Score
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={
                        result.products.map(p => ({
                          name: p.name.split(' ').slice(0, 3).join(' '),
                          Performance: (p as any).benchmarkScore || 5000,
                        }))
                      } margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                        <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                        <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                        <Tooltip 
                          contentStyle={{ 
                            background: 'rgba(11, 15, 25, 0.95)', 
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '16px',
                            color: '#fff',
                            backdropFilter: 'blur(10px)'
                          }}
                          formatter={(value) => [value, 'Score']}
                        />
                        <Bar dataKey="Performance" radius={[8, 8, 0, 0]}>
                          {result.products.map((p, index) => {
                            const isBest = result.highlights.bestPerformance === p._id;
                            return <Cell key={`cell-${index}`} fill={isBest ? '#8b5cf6' : '#14b8a6'} opacity={isBest ? 1 : 0.75} />;
                          })}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Rating Chart (Non-Electronics Only) */}
              {!isElectronics && (
                <div className="glass p-6 rounded-3xl border border-surface-200/20 dark:border-surface-800/20 shadow-glass">
                  <h3 className="text-lg font-bold font-display text-surface-900 dark:text-white mb-6 flex items-center gap-2">
                    <Award className="text-primary-500" size={20} /> User Rating (Stars)
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={
                        result.products.map(p => ({
                          name: p.name.split(' ').slice(0, 3).join(' '),
                          Rating: p.rating || 4.5,
                        }))
                      } margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                        <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                        <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} domain={[0, 5]} />
                        <Tooltip 
                          contentStyle={{ 
                            background: 'rgba(11, 15, 25, 0.95)', 
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '16px',
                            color: '#fff',
                            backdropFilter: 'blur(10px)'
                          }}
                          formatter={(value) => [`${value} Stars`, 'Rating']}
                        />
                        <Bar dataKey="Rating" radius={[8, 8, 0, 0]}>
                          {result.products.map((_, index) => {
                            return <Cell key={`cell-${index}`} fill="#f59e0b" opacity={0.8} />;
                          })}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </motion.div>

            {/* AI Category Analysis Cards */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 15 },
                show: { opacity: 1, y: 0 }
              }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-display font-bold flex items-center gap-2 text-surface-900 dark:text-white">
                <Sparkles className="w-5 h-5 text-primary-500 animate-pulse" />
                AI Analysis & Verdict
              </h2>
              
              <div className="glass rounded-3xl p-6 md:p-8 border border-surface-200/30 dark:border-surface-800/30 shadow-glass space-y-6">
                <div className="border-b border-surface-200/20 pb-4">
                  <h3 className="text-xl font-bold font-display text-surface-900 dark:text-white flex items-center gap-2">
                    <CheckCircle className="text-emerald-500" size={22} /> Comparison Verdict & Highlights
                  </h3>
                  <p className="text-xs text-surface-500 mt-1">Ground-truth web comparison analyzed dynamically by Gemini AI.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                  {result.analysis.map((insight, idx) => (
                    <div key={idx} className="space-y-2 border-l-2 border-primary-500/30 pl-4 hover:border-primary-500 transition-colors duration-250">
                      <h4 className="font-bold text-base text-surface-900 dark:text-white flex items-center gap-1.5">
                        {insight.category}
                      </h4>
                      <div className="text-xs font-semibold text-primary-600 dark:text-primary-400">
                        Category Winner: <span className="underline font-bold">{insight.winner}</span>
                      </div>
                      <p className="text-surface-500 text-sm leading-relaxed pt-0.5">{insight.details}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
