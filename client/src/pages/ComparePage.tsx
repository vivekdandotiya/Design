import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Trash2, CheckCircle, Plus, ArrowLeft, Globe } from 'lucide-react';
import Badge from '../components/Badge';
import { formatPrice, cn } from '../lib/utils';
import api from '../lib/api';
import type { CompareResult } from '../types';

export const ComparePage: React.FC = () => {
  const [queries, setQueries] = useState<string[]>(['', '']);
  const [requirements, setRequirements] = useState('');
  const [comparing, setComparing] = useState(false);
  const [result, setResult] = useState<CompareResult | null>(null);

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
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-12"
          >
            {/* Header / Nav Back */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-surface-200 dark:border-surface-800 pb-6">
              <div>
                <button
                  onClick={resetComparison}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-surface-500 hover:text-primary-600 transition-colors mb-2"
                >
                  <ArrowLeft size={16} /> New Comparison
                </button>
                <h1 className="text-3xl font-display font-bold">Comparison Results</h1>
              </div>
              <div className="text-xs text-surface-500 flex items-center gap-1.5 bg-surface-50 dark:bg-surface-900 px-3 py-1.5 rounded-full border border-surface-200 dark:border-surface-800">
                <Globe size={12} /> Search grounding completed
              </div>
            </div>

            {/* Spec Table */}
            <div className="glass rounded-3xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-surface-200 dark:divide-surface-800">
                  <thead>
                    <tr>
                      <th className="w-48 p-5 text-left font-semibold text-surface-900 dark:text-white bg-surface-50/50 dark:bg-surface-900/50">
                        Feature
                      </th>
                      {result.products.map((p) => (
                        <th key={p._id} className="p-5 align-top w-64 min-w-[220px]">
                          <div className="glass hover:shadow-glow hover:-translate-y-0.5 transition-all duration-300 rounded-2xl p-4 text-center border border-surface-200/20 dark:border-surface-800/20 bg-surface-50/40 dark:bg-surface-950/20">
                            <h3 className="font-bold font-display text-base text-surface-900 dark:text-white line-clamp-2">
                              {p.name}
                            </h3>
                            <p className={cn(
                              "font-bold mt-2.5 text-lg transition-colors",
                              result.highlights.bestValue === p._id 
                                ? "text-emerald-600 dark:text-emerald-400" 
                                : "text-primary-600 dark:text-primary-400"
                            )}>
                              {p.price > 0 ? formatPrice(p.price) : 'N/A'}
                            </p>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-surface-200 dark:divide-surface-800">
                    {/* Badges Highlights */}
                    <tr>
                      <td className="p-5 font-semibold text-surface-600 bg-surface-50/30 dark:bg-surface-900/10">Highlights</td>
                      {result.products.map((p) => (
                        <td key={p._id} className="p-5 text-center">
                          <div className="flex flex-wrap justify-center gap-1.5">
                            {result.highlights.bestValue === p._id && <Badge variant="success">Best Value</Badge>}
                            {result.highlights.bestPerformance === p._id && <Badge variant="primary">Top Performance</Badge>}
                            {result.highlights.bestBattery === p._id && <Badge variant="warning">Best Battery</Badge>}
                            {result.highlights.mostPortable === p._id && <Badge variant="outline">Most Portable</Badge>}
                            {Object.values(result.highlights).every((id) => id !== p._id) && (
                              <span className="text-xs text-surface-400">-</span>
                            )}
                          </div>
                        </td>
                      ))}
                    </tr>

                    {/* Specs Rows */}
                    {[
                      { key: 'processor', label: 'Processor', highlightKey: 'bestPerformance' },
                      { key: 'gpu', label: 'Graphics' },
                      { key: 'ram', label: 'RAM' },
                      { key: 'storage', label: 'Storage' },
                      { key: 'displaySize', label: 'Display' },
                      { key: 'battery', label: 'Battery', highlightKey: 'bestBattery' },
                      { key: 'weight', label: 'Weight', highlightKey: 'mostPortable' },
                      { key: 'os', label: 'Operating System' },
                    ].map((spec) => (
                      <tr key={spec.key} className="hover:bg-surface-50/20 dark:hover:bg-surface-900/10 transition-colors">
                        <td className="p-5 font-semibold text-surface-600 bg-surface-50/30 dark:bg-surface-900/10 text-sm">
                          {spec.label}
                        </td>
                        {result.products.map((p) => {
                          const isWinnerCell = spec.highlightKey && (result.highlights as any)[spec.highlightKey] === p._id;
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
                                {(p as any)[spec.key] || '-'}
                                {isWinnerCell && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" title="Category Winner" />}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* AI Category Analysis Cards */}
            <div>
              <h2 className="text-2xl font-display font-bold mb-6 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary-500 animate-pulse" />
                AI Analysis & Recommendation
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {result.analysis.map((insight, idx) => (
                  <div key={idx} className="glass p-6 rounded-2xl flex gap-4 border border-surface-200/50 dark:border-surface-800/30">
                    <div className="mt-1 text-primary-500">
                      <CheckCircle size={22} className="text-emerald-500" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-lg text-surface-900 dark:text-white">{insight.category}</h4>
                      <p className="text-xs font-semibold text-primary-600 dark:text-primary-400">Winner: {insight.winner}</p>
                      <p className="text-surface-500 text-sm leading-relaxed pt-1.5">{insight.details}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
