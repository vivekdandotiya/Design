import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Trash2 } from 'lucide-react';
import { useCompareStore } from '../store/compareStore';

export default function CompareBar() {
  const { selectedProducts, removeProduct, clearAll } = useCompareStore();
  const navigate = useNavigate();
  const show = selectedProducts.length >= 1;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4"
        >
          <div className="container-wide">
            <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-700 shadow-glass-lg p-4">
              <div className="flex items-center gap-4 flex-wrap">
                {/* Products */}
                <div className="flex items-center gap-3 flex-1 min-w-0 overflow-x-auto">
                  {selectedProducts.map((product) => (
                    <motion.div
                      key={product._id}
                      layout
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 flex-shrink-0"
                    >
                      <div className="w-8 h-8 rounded-lg bg-white dark:bg-surface-700 overflow-hidden flex-shrink-0">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-contain p-0.5"
                          />
                        ) : (
                          <div className="w-full h-full bg-surface-200 dark:bg-surface-600" />
                        )}
                      </div>
                      <span className="text-sm font-medium text-surface-700 dark:text-surface-300 max-w-[120px] truncate">
                        {product.name}
                      </span>
                      <button
                        onClick={() => removeProduct(product._id)}
                        className="p-1 rounded-md hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors"
                      >
                        <X className="w-3.5 h-3.5 text-surface-400" />
                      </button>
                    </motion.div>
                  ))}
                  {selectedProducts.length < 4 && (
                    <div className="w-[140px] h-[48px] rounded-xl border-2 border-dashed border-surface-300 dark:border-surface-600 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs text-surface-400">
                        + Add product
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={clearAll}
                    className="p-2.5 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-400 hover:text-rose-500 transition-colors"
                    title="Clear all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => navigate('/compare')}
                    disabled={selectedProducts.length < 2}
                    className="btn-primary text-sm !px-5 !py-2.5 disabled:opacity-50"
                  >
                    Compare Now
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Counter */}
              <div className="mt-2 text-xs text-surface-500 text-center">
                {selectedProducts.length} of 4 products selected
                {selectedProducts.length < 2 && ' — add at least 2 to compare'}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
