import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { Filter, ChevronDown } from 'lucide-react';
import FilterSidebar from '../components/FilterSidebar';
import ProductCard from '../components/ProductCard';
import { SkeletonCard } from '../components/Skeleton';
import api from '../lib/api';
import type { Product, PaginatedResponse, FilterState } from '../types';

export const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [total, setTotal] = useState(0);
  
  const [filters, setFilters] = useState<FilterState>({
    brand: [],
    minPrice: 0,
    maxPrice: 200000,
    processor: [],
    gpu: [],
    ram: [],
    sort: 'popular',
    page: 1,
    limit: 12
  });

  const location = useLocation();


  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const searchQuery = searchParams.get('q');
    fetchProducts(searchQuery);
  }, [filters, location.search]);

  const fetchProducts = async (searchQuery: string | null) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('q', searchQuery);
      if (filters.brand.length) params.append('brand', filters.brand.join(','));
      if (filters.processor.length) params.append('processor', filters.processor.join(','));
      if (filters.gpu.length) params.append('gpu', filters.gpu.join(','));
      if (filters.ram.length) params.append('ram', filters.ram.join(','));
      params.append('minPrice', filters.minPrice.toString());
      params.append('maxPrice', filters.maxPrice.toString());
      params.append('sort', filters.sort);
      params.append('page', filters.page.toString());
      params.append('limit', filters.limit.toString());

      const res = await api.get<PaginatedResponse<Product>>(`/products?${params.toString()}`);
      setProducts(res.data.data);
      setTotal(res.data.total);
    } catch (error) {
      console.error('Failed to fetch products', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };

  return (
    <div className="section container-wide py-8 mt-16">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Mobile Filter Toggle */}
        <div className="md:hidden flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold font-display">Laptops</h1>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="btn-secondary px-4 py-2"
          >
            <Filter size={18} /> Filters
          </button>
        </div>

        {/* Sidebar */}
        <div className={`md:w-64 flex-shrink-0 ${showFilters ? 'block' : 'hidden md:block'}`}>
          <div className="sticky top-24">
            <FilterSidebar filters={filters} onFiltersChange={handleFilterChange} />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-grow">
          <div className="hidden md:flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold font-display">
              {location.search.includes('q=') ? 'Search Results' : 'Explore Laptops'}
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-surface-500 text-sm">Showing {products.length} of {total} products</span>
              <div className="relative">
                <select 
                  className="appearance-none input-field py-2 pr-10 bg-transparent border-surface-200 cursor-pointer"
                  value={filters.sort}
                  onChange={(e) => handleFilterChange({ sort: e.target.value })}
                >
                  <option value="popular">Most Popular</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="newest">Newest Arrivals</option>
                </select>
                <ChevronDown className="absolute right-3 top-3 text-surface-400 pointer-events-none" size={16} />
              </div>
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
            ) : products.length > 0 ? (
              products.map((product, index) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center">
                <h3 className="text-xl font-medium text-surface-900 dark:text-surface-100 mb-2">No products found</h3>
                <p className="text-surface-500">Try adjusting your filters or search query.</p>
                <button 
                  onClick={() => setFilters({
                    brand: [], minPrice: 0, maxPrice: 200000, processor: [], gpu: [], ram: [], sort: 'popular', page: 1, limit: 12
                  })}
                  className="btn-primary mt-6"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
          
          {/* Pagination */}
          {total > filters.limit && (
            <div className="flex justify-center mt-12 gap-2">
              <button 
                disabled={filters.page === 1}
                onClick={() => handleFilterChange({ page: filters.page - 1 })}
                className="btn-secondary px-4 py-2"
              >
                Previous
              </button>
              <button 
                disabled={filters.page * filters.limit >= total}
                onClick={() => handleFilterChange({ page: filters.page + 1 })}
                className="btn-secondary px-4 py-2"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
