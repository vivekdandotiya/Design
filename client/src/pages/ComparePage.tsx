import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Trash2, CheckCircle, Info } from 'lucide-react';
import { useCompareStore } from '../store/compareStore';
import Badge from '../components/Badge';
import { formatPrice } from '../lib/utils';
import api from '../lib/api';
import type { CompareResult } from '../types';

export const ComparePage: React.FC = () => {
  const { selectedProducts, removeProduct, clearAll } = useCompareStore();
  const [comparing, setComparing] = useState(false);
  const [result, setResult] = useState<CompareResult | null>(null);
  const navigate = useNavigate();

  const handleCompare = async () => {
    if (selectedProducts.length < 2) return;
    setComparing(true);
    try {
      const res = await api.post('/compare', { productIds: selectedProducts.map(p => p._id) });
      setResult(res.data.data);
    } catch (error) {
      console.error('Comparison failed', error);
    } finally {
      setComparing(false);
    }
  };

  if (selectedProducts.length === 0) {
    return (
      <div className="section container-narrow text-center min-h-[60vh] flex flex-col justify-center">
        <h1 className="text-4xl font-display font-bold mb-4">Nothing to compare yet</h1>
        <p className="text-surface-500 mb-8">Add up to 4 products to see them side-by-side.</p>
        <div>
          <button onClick={() => navigate('/products')} className="btn-primary">
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="section container-wide py-8 mt-16">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold">Compare Products</h1>
          <p className="text-surface-500 mt-2">{selectedProducts.length} of 4 selected</p>
        </div>
        <div className="flex gap-4">
          <button onClick={clearAll} className="btn-ghost text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
            <Trash2 size={18} /> Clear All
          </button>
          <button 
            onClick={handleCompare}
            disabled={selectedProducts.length < 2 || comparing}
            className="btn-primary"
          >
            {comparing ? (
              <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/> Analyzing...</span>
            ) : (
              <span className="flex items-center gap-2"><Sparkles size={18} /> Compare Now</span>
            )}
          </button>
        </div>
      </div>

      <div className="overflow-x-auto pb-8">
        <div className="inline-block min-w-full align-middle">
          <table className="min-w-full divide-y divide-surface-200 dark:divide-surface-800">
            <thead>
              <tr>
                <th className="w-48 p-4 text-left font-medium text-surface-500">Feature</th>
                {selectedProducts.map((p) => (
                  <th key={p._id} className="p-4 align-top w-64 min-w-[250px]">
                    <div className="relative group">
                      <button 
                        onClick={() => removeProduct(p._id)}
                        className="absolute -top-2 -right-2 p-1 bg-white dark:bg-surface-800 rounded-full shadow border border-surface-200 opacity-0 group-hover:opacity-100 transition-opacity z-10 text-red-500 hover:bg-red-50"
                      >
                        <Trash2 size={14} />
                      </button>
                      <div className="bg-surface-50 dark:bg-surface-800/50 rounded-xl p-4 text-center cursor-pointer hover:bg-surface-100 transition-colors" onClick={() => navigate(`/products/${p._id}`)}>
                        <img src={p.image} alt={p.name} className="w-32 h-32 object-contain mx-auto mb-4" />
                        <h3 className="font-bold font-display text-sm line-clamp-2">{p.name}</h3>
                        <p className="text-primary-600 font-bold mt-2">{formatPrice(p.price)}</p>
                      </div>
                    </div>
                  </th>
                ))}
                {selectedProducts.length < 4 && (
                  <th className="p-4 align-middle w-64">
                    <button 
                      onClick={() => navigate('/products')}
                      className="w-full h-full min-h-[200px] border-2 border-dashed border-surface-200 dark:border-surface-700 rounded-xl flex flex-col items-center justify-center text-surface-400 hover:bg-surface-50 hover:border-primary-300 transition-colors"
                    >
                      <div className="text-2xl mb-2">+</div>
                      <span>Add Product</span>
                    </button>
                  </th>
                )}
              </tr>
            </thead>
            
            {result && (
              <tbody className="divide-y divide-surface-200 dark:divide-surface-800">
                {/* Badges Row */}
                <tr>
                  <td className="p-4 font-medium text-surface-600">Highlights</td>
                  {selectedProducts.map((p) => (
                    <td key={p._id} className="p-4 text-center">
                      <div className="flex flex-wrap justify-center gap-2">
                        {result.highlights.bestValue === p._id && <Badge variant="success">Best Value</Badge>}
                        {result.highlights.bestPerformance === p._id && <Badge variant="primary">Top Performance</Badge>}
                        {result.highlights.bestBattery === p._id && <Badge variant="warning">Best Battery</Badge>}
                        {result.highlights.mostPortable === p._id && <Badge variant="outline">Most Portable</Badge>}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Specs Rows */}
                {['processor', 'gpu', 'ram', 'storage', 'displaySize', 'battery', 'weight'].map((specKey) => (
                  <tr key={specKey} className="hover:bg-surface-50/50 dark:hover:bg-surface-900/50 transition-colors">
                    <td className="p-4 font-medium text-surface-600 capitalize">{specKey.replace(/([A-Z])/g, ' $1').trim()}</td>
                    {selectedProducts.map((p) => (
                      <td key={p._id} className="p-4 text-surface-900 dark:text-surface-100 text-center text-sm">
                        {(p as any)[specKey] || '-'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            )}
          </table>
        </div>
      </div>

      {result && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          {result.analysis.map((insight, i) => (
            <div key={i} className="glass p-6 rounded-2xl flex gap-4">
              <div className="mt-1 text-primary-500">
                <CheckCircle size={24} />
              </div>
              <div>
                <h4 className="font-bold text-lg">{insight.category}</h4>
                <p className="text-sm font-medium text-surface-900 dark:text-surface-100 mt-1">Winner: {insight.winner}</p>
                <p className="text-surface-500 text-sm mt-2">{insight.details}</p>
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {selectedProducts.length > 0 && !result && (
        <div className="mt-12 text-center p-8 bg-surface-50 dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800">
          <Info className="mx-auto text-surface-400 mb-4" size={32} />
          <h3 className="text-xl font-bold font-display mb-2">Ready to compare?</h3>
          <p className="text-surface-500 mb-6">Click "Compare Now" to run AI analysis on these products.</p>
          <button onClick={handleCompare} className="btn-primary" disabled={comparing || selectedProducts.length < 2}>
            {comparing ? 'Analyzing...' : 'Run Comparison'}
          </button>
        </div>
      )}
    </div>
  );
};
