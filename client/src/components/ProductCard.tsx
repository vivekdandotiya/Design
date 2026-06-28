import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Check, Cpu, MemoryStick, Monitor } from 'lucide-react';
import type { Product } from '../types';
import { formatPrice, cn } from '../lib/utils';
import StarRating from './StarRating';
import Badge from './Badge';
import { useCompareStore } from '../store/compareStore';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { addProduct, removeProduct, isSelected, selectedProducts } = useCompareStore();
  const selected = isSelected(product._id);
  const isFull = selectedProducts.length >= 4;

  const handleCompareToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (selected) {
      removeProduct(product._id);
    } else if (!isFull) {
      addProduct(product);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Link to={`/products/${product._id}`} className="block group">
        <div
          className={cn(
            'glass glass-hover overflow-hidden transition-all duration-300',
            selected && 'ring-2 ring-primary-500 dark:ring-primary-400'
          )}
        >
          {/* Image */}
          <div className="relative aspect-[4/3] bg-surface-100/30 dark:bg-surface-900/30 border-b border-surface-200/20 dark:border-surface-800/20 overflow-hidden">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Monitor className="w-16 h-16 text-surface-300 dark:text-surface-600" />
              </div>
            )}
            {product.originalPrice && product.originalPrice > product.price && (
              <div className="absolute top-3 left-3">
                <Badge variant="success">
                  {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                </Badge>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline">{product.brand}</Badge>
            </div>

            <h3 className="font-semibold font-display text-surface-900 dark:text-white line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
              {product.name}
            </h3>

            {/* Specs */}
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-surface-500 dark:text-surface-400">
              <span className="flex items-center gap-1">
                <Cpu className="w-3 h-3" />
                {product.processor}
              </span>
              <span className="flex items-center gap-1">
                <MemoryStick className="w-3 h-3" />
                {product.ram}
              </span>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <StarRating rating={product.rating} size="sm" />
              <span className="text-xs text-surface-500 dark:text-surface-400">
                ({product.reviewCount})
              </span>
            </div>

            {/* Price + Compare */}
            <div className="flex items-end justify-between pt-2 border-t border-surface-100 dark:border-surface-800">
              <div>
                <span className="text-xl font-bold font-display text-surface-900 dark:text-white">
                  {formatPrice(product.price)}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="ml-2 text-sm text-surface-400 line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
              </div>

              <button
                onClick={handleCompareToggle}
                disabled={!selected && isFull}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200',
                  selected
                    ? 'bg-primary-600 text-white hover:bg-primary-700'
                    : 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-primary-950/40 dark:hover:text-primary-400',
                  !selected && isFull && 'opacity-50 cursor-not-allowed'
                )}
              >
                {selected ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    Added
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    Compare
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
