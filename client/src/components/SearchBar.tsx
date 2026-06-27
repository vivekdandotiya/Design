import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Clock, ArrowRight } from 'lucide-react';
import api from '../lib/api';
import type { Product } from '../types';

interface SearchBarProps {
  className?: string;
  placeholder?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function SearchBar({
  className = '',
  placeholder = 'Search laptops, brands, specs...',
  size = 'md',
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('cw-search-history');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.length < 2) {
      setResults([]);
      return;
    }
    setIsLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await api.get(`/products/search?q=${encodeURIComponent(query)}`);
        setResults(Array.isArray(res.data) ? res.data.slice(0, 6) : res.data.data?.slice(0, 6) || []);
      } catch {
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const saveToHistory = (term: string) => {
    const updated = [term, ...history.filter((h) => h !== term)].slice(0, 5);
    setHistory(updated);
    localStorage.setItem('cw-search-history', JSON.stringify(updated));
  };

  const handleSelect = (product: Product) => {
    saveToHistory(product.name);
    setIsOpen(false);
    setQuery('');
    navigate(`/products/${product._id}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      saveToHistory(query.trim());
      setIsOpen(false);
      navigate(`/products?q=${encodeURIComponent(query.trim())}`);
      setQuery('');
    }
  };

  const handleHistoryClick = (term: string) => {
    setQuery(term);
    setIsOpen(true);
    inputRef.current?.focus();
  };

  const sizeClasses = {
    sm: 'py-2 pl-9 pr-4 text-sm',
    md: 'py-3 pl-11 pr-4',
    lg: 'py-4 pl-12 pr-5 text-lg',
  };

  const iconSizes = {
    sm: 'w-4 h-4 left-3',
    md: 'w-5 h-5 left-3.5',
    lg: 'w-5 h-5 left-4',
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Search
            className={`absolute top-1/2 -translate-y-1/2 text-surface-400 ${iconSizes[size]}`}
          />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder={placeholder}
            className={`w-full rounded-xl bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-white placeholder:text-surface-400 dark:placeholder:text-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 dark:focus:border-primary-400 transition-all duration-200 ${sizeClasses[size]}`}
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setResults([]);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors"
            >
              <X className="w-4 h-4 text-surface-400" />
            </button>
          )}
        </div>
      </form>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (query.length > 0 || history.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 shadow-glass-lg overflow-hidden z-50"
          >
            {/* Search Results */}
            {results.length > 0 && (
              <div className="p-2">
                {results.map((product) => (
                  <button
                    key={product._id}
                    onClick={() => handleSelect(product)}
                    className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors text-left"
                  >
                    <div className="w-10 h-10 rounded-lg bg-surface-100 dark:bg-surface-800 flex-shrink-0 overflow-hidden">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-contain p-1"
                        />
                      ) : (
                        <div className="w-full h-full bg-surface-200 dark:bg-surface-700" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-surface-900 dark:text-white truncate">
                        {product.name}
                      </p>
                      <p className="text-xs text-surface-500">{product.brand}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-surface-400 flex-shrink-0" />
                  </button>
                ))}
              </div>
            )}

            {/* Loading */}
            {isLoading && query.length >= 2 && (
              <div className="p-4 text-center">
                <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            )}

            {/* No results */}
            {!isLoading && query.length >= 2 && results.length === 0 && (
              <div className="p-4 text-center text-sm text-surface-500">
                No products found for &ldquo;{query}&rdquo;
              </div>
            )}

            {/* History */}
            {query.length < 2 && history.length > 0 && (
              <div className="p-2">
                <p className="px-3 py-1.5 text-xs font-medium text-surface-400 uppercase tracking-wider">
                  Recent Searches
                </p>
                {history.map((term) => (
                  <button
                    key={term}
                    onClick={() => handleHistoryClick(term)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors text-left"
                  >
                    <Clock className="w-4 h-4 text-surface-400 flex-shrink-0" />
                    <span className="text-sm text-surface-600 dark:text-surface-400 truncate">
                      {term}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
