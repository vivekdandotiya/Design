import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, RotateCcw, SlidersHorizontal, X } from 'lucide-react';
import type { FilterState } from '../types';
import { cn, formatPrice } from '../lib/utils';

interface FilterSidebarProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

const brands = ['Apple', 'Dell', 'HP', 'Lenovo', 'ASUS', 'Acer', 'MSI', 'Samsung'];
const processors = ['Intel Core i5', 'Intel Core i7', 'Intel Core i9', 'AMD Ryzen 5', 'AMD Ryzen 7', 'AMD Ryzen 9', 'Apple M2', 'Apple M3'];
const gpus = ['NVIDIA RTX 4050', 'NVIDIA RTX 4060', 'NVIDIA RTX 4070', 'NVIDIA RTX 4080', 'AMD Radeon', 'Intel Iris Xe', 'Integrated'];
const rams = ['8 GB', '16 GB', '32 GB', '64 GB'];

interface FilterSectionProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

function FilterSection({ title, defaultOpen = true, children }: FilterSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-surface-200 dark:border-surface-700 pb-4">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-2 text-sm font-semibold text-surface-900 dark:text-white"
      >
        {title}
        <ChevronDown
          className={cn(
            'w-4 h-4 text-surface-400 transition-transform duration-200',
            open && 'rotate-180'
          )}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-2 space-y-2">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FilterSidebar({
  filters,
  onFiltersChange,
  className,
  isOpen,
  onClose,
}: FilterSidebarProps) {
  const update = (partial: Partial<FilterState>) => {
    onFiltersChange({ ...filters, ...partial, page: 1 });
  };

  const toggleArrayFilter = (key: keyof Pick<FilterState, 'brand' | 'processor' | 'gpu' | 'ram'>, value: string) => {
    const current = filters[key] as string[];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    update({ [key]: updated });
  };

  const resetFilters = () => {
    onFiltersChange({
      brand: [],
      minPrice: 0,
      maxPrice: 500000,
      processor: [],
      gpu: [],
      ram: [],
      sort: '',
      page: 1,
      limit: 12,
    });
  };

  const hasFilters =
    filters.brand.length > 0 ||
    filters.processor.length > 0 ||
    filters.gpu.length > 0 ||
    filters.ram.length > 0 ||
    filters.minPrice > 0 ||
    filters.maxPrice < 500000;

  const content = (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-surface-500" />
          <h3 className="font-semibold font-display text-surface-900 dark:text-white">
            Filters
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {hasFilters && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 text-xs text-surface-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded-md hover:bg-surface-200 dark:hover:bg-surface-700 md:hidden"
            >
              <X className="w-4 h-4 text-surface-500" />
            </button>
          )}
        </div>
      </div>

      {/* Price Range */}
      <FilterSection title="Price Range">
        <div className="space-y-3">
          <input
            type="range"
            min={0}
            max={500000}
            step={5000}
            value={filters.maxPrice}
            onChange={(e) => update({ maxPrice: Number(e.target.value) })}
            className="w-full accent-primary-600"
          />
          <div className="flex items-center justify-between text-xs text-surface-500">
            <span>{formatPrice(filters.minPrice)}</span>
            <span>{formatPrice(filters.maxPrice)}</span>
          </div>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Min"
              value={filters.minPrice || ''}
              onChange={(e) => update({ minPrice: Number(e.target.value) || 0 })}
              className="w-1/2 px-3 py-1.5 rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-sm text-surface-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
            <input
              type="number"
              placeholder="Max"
              value={filters.maxPrice === 500000 ? '' : filters.maxPrice}
              onChange={(e) => update({ maxPrice: Number(e.target.value) || 500000 })}
              className="w-1/2 px-3 py-1.5 rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-sm text-surface-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
        </div>
      </FilterSection>

      {/* Brand */}
      <FilterSection title="Brand">
        {brands.map((brand) => (
          <label
            key={brand}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <input
              type="checkbox"
              checked={filters.brand.includes(brand)}
              onChange={() => toggleArrayFilter('brand', brand)}
              className="w-4 h-4 rounded border-surface-300 dark:border-surface-600 text-primary-600 focus:ring-primary-500 focus:ring-offset-0"
            />
            <span className="text-sm text-surface-600 dark:text-surface-400 group-hover:text-surface-900 dark:group-hover:text-white transition-colors">
              {brand}
            </span>
          </label>
        ))}
      </FilterSection>

      {/* Processor */}
      <FilterSection title="Processor" defaultOpen={false}>
        {processors.map((proc) => (
          <label
            key={proc}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <input
              type="checkbox"
              checked={filters.processor.includes(proc)}
              onChange={() => toggleArrayFilter('processor', proc)}
              className="w-4 h-4 rounded border-surface-300 dark:border-surface-600 text-primary-600 focus:ring-primary-500 focus:ring-offset-0"
            />
            <span className="text-sm text-surface-600 dark:text-surface-400 group-hover:text-surface-900 dark:group-hover:text-white transition-colors">
              {proc}
            </span>
          </label>
        ))}
      </FilterSection>

      {/* GPU */}
      <FilterSection title="Graphics Card" defaultOpen={false}>
        {gpus.map((gpu) => (
          <label
            key={gpu}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <input
              type="checkbox"
              checked={filters.gpu.includes(gpu)}
              onChange={() => toggleArrayFilter('gpu', gpu)}
              className="w-4 h-4 rounded border-surface-300 dark:border-surface-600 text-primary-600 focus:ring-primary-500 focus:ring-offset-0"
            />
            <span className="text-sm text-surface-600 dark:text-surface-400 group-hover:text-surface-900 dark:group-hover:text-white transition-colors">
              {gpu}
            </span>
          </label>
        ))}
      </FilterSection>

      {/* RAM */}
      <FilterSection title="RAM">
        {rams.map((ram) => (
          <label
            key={ram}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <input
              type="checkbox"
              checked={filters.ram.includes(ram)}
              onChange={() => toggleArrayFilter('ram', ram)}
              className="w-4 h-4 rounded border-surface-300 dark:border-surface-600 text-primary-600 focus:ring-primary-500 focus:ring-offset-0"
            />
            <span className="text-sm text-surface-600 dark:text-surface-400 group-hover:text-surface-900 dark:group-hover:text-white transition-colors">
              {ram}
            </span>
          </label>
        ))}
      </FilterSection>
    </div>
  );

  // Mobile overlay
  if (typeof isOpen !== 'undefined') {
    return (
      <>
        <div className="hidden md:block">{content}</div>
        <AnimatePresence>
          {isOpen && (
            <>
              <motion.div
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
              />
              <motion.div
                className="fixed inset-y-0 left-0 w-80 max-w-full bg-white dark:bg-surface-900 z-50 md:hidden overflow-y-auto p-5"
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              >
                {content}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </>
    );
  }

  return content;
}
