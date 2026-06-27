import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Scale, Cpu, HardDrive, Monitor, Zap, ChevronRight } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useCompareStore } from '../store/compareStore';
import StarRating from '../components/StarRating';
import Badge from '../components/Badge';
import { formatPrice } from '../lib/utils';
import api from '../lib/api';
import type { Product, Review } from '../types';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [isSaved, setIsSaved] = useState(false);

  const { isAuthenticated, user } = useAuthStore();
  const { addProduct, isSelected } = useCompareStore();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const [prodRes, revRes] = await Promise.all([
          api.get(`/products/${id}`),
          api.get(`/reviews/product/${id}`)
        ]);
        setProduct(prodRes.data);
        setReviews(revRes.data);
        if (user && user.savedProducts.includes(id as string)) {
          setIsSaved(true);
        }
      } catch (error) {
        console.error('Failed to fetch product details', error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProduct();
  }, [id, user]);

  const toggleSave = async () => {
    if (!isAuthenticated) return navigate('/auth');
    try {
      if (isSaved) {
        await api.delete(`/users/unsave-product/${id}`);
        setIsSaved(false);
      } else {
        await api.post(`/users/save-product/${id}`);
        setIsSaved(true);
      }
    } catch (error) {
      console.error('Toggle save failed', error);
    }
  };

  if (loading) return <div className="section container-wide py-12 mt-16 text-center">Loading product...</div>;
  if (!product) return <div className="section container-wide py-12 mt-16 text-center">Product not found.</div>;

  const images = [product.image, ...product.images];

  return (
    <div className="section container-wide py-8 mt-16">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-surface-500 mb-8">
        <span className="hover:text-primary-600 cursor-pointer" onClick={() => navigate('/')}>Home</span>
        <ChevronRight size={14} />
        <span className="hover:text-primary-600 cursor-pointer" onClick={() => navigate('/products')}>Laptops</span>
        <ChevronRight size={14} />
        <span className="text-surface-900 dark:text-surface-100 font-medium">{product.brand}</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-12 mb-16">
        {/* Gallery */}
        <div className="w-full lg:w-1/2">
          <div className="bg-surface-50 dark:bg-surface-900 rounded-2xl p-8 mb-4 border border-surface-200 dark:border-surface-800 flex items-center justify-center min-h-[400px]">
            <motion.img 
              key={activeImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              src={images[activeImage]} 
              alt={product.name} 
              className="max-w-full max-h-[400px] object-contain drop-shadow-xl"
            />
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {images.map((img, idx) => (
              <button 
                key={idx}
                onClick={() => setActiveImage(idx)}
                className={`w-20 h-20 rounded-xl p-2 border-2 transition-all ${activeImage === idx ? 'border-primary-500 bg-surface-50' : 'border-surface-200 dark:border-surface-700 bg-transparent opacity-60 hover:opacity-100'}`}
              >
                <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-contain" />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="w-full lg:w-1/2">
          <Badge variant="primary" className="mb-4">{product.brand}</Badge>
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-4 leading-tight">{product.name}</h1>
          
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-surface-200 dark:border-surface-800">
            <div className="flex items-center gap-2">
              <StarRating rating={product.rating} />
              <span className="font-bold">{product.rating.toFixed(1)}</span>
              <span className="text-surface-500 text-sm">({product.reviewCount} reviews)</span>
            </div>
          </div>

          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-4xl font-display font-bold text-gradient mb-1">{formatPrice(product.price)}</p>
              {product.originalPrice && <p className="text-surface-400 line-through">MRP: {formatPrice(product.originalPrice)}</p>}
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={toggleSave} 
                className={`p-3 rounded-xl border ${isSaved ? 'bg-rose-50 border-rose-200 text-rose-500' : 'bg-surface-50 border-surface-200 text-surface-400 hover:text-rose-500'}`}
              >
                <Heart size={24} fill={isSaved ? "currentColor" : "none"} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="p-4 bg-surface-50 dark:bg-surface-800/50 rounded-xl flex items-center gap-4 border border-surface-100 dark:border-surface-800">
              <div className="p-2 bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 rounded-lg"><Cpu size={20} /></div>
              <div><p className="text-xs text-surface-500">Processor</p><p className="font-bold text-sm">{product.processor}</p></div>
            </div>
            <div className="p-4 bg-surface-50 dark:bg-surface-800/50 rounded-xl flex items-center gap-4 border border-surface-100 dark:border-surface-800">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-lg"><Zap size={20} /></div>
              <div><p className="text-xs text-surface-500">RAM</p><p className="font-bold text-sm">{product.ram}</p></div>
            </div>
            <div className="p-4 bg-surface-50 dark:bg-surface-800/50 rounded-xl flex items-center gap-4 border border-surface-100 dark:border-surface-800">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 rounded-lg"><HardDrive size={20} /></div>
              <div><p className="text-xs text-surface-500">Storage</p><p className="font-bold text-sm">{product.storage}</p></div>
            </div>
            <div className="p-4 bg-surface-50 dark:bg-surface-800/50 rounded-xl flex items-center gap-4 border border-surface-100 dark:border-surface-800">
              <div className="p-2 bg-accent-blue/10 text-accent-blue rounded-lg"><Monitor size={20} /></div>
              <div><p className="text-xs text-surface-500">Display</p><p className="font-bold text-sm">{product.displaySize}</p></div>
            </div>
          </div>

          <button 
            onClick={() => {
              if (isSelected(product._id)) {
                navigate('/compare');
              } else {
                addProduct(product);
              }
            }}
            className="btn-primary w-full py-4 text-lg"
          >
            <Scale size={20} /> {isSelected(product._id) ? 'View Comparison' : 'Add to Compare'}
          </button>
        </div>
      </div>

      {/* Details Sections */}
      <div className="mt-16">
        <h2 className="text-2xl font-display font-bold mb-6">Technical Specifications</h2>
        <div className="glass rounded-2xl overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-surface-200 dark:divide-surface-800">
            <div className="p-6">
              <h3 className="font-bold mb-4 text-primary-600">Performance</h3>
              <ul className="space-y-4">
                <li className="flex justify-between"><span className="text-surface-500">Processor</span><span className="font-medium text-right">{product.processor}</span></li>
                <li className="flex justify-between"><span className="text-surface-500">Graphics</span><span className="font-medium text-right">{product.gpu}</span></li>
                <li className="flex justify-between"><span className="text-surface-500">RAM</span><span className="font-medium text-right">{product.ram}</span></li>
                <li className="flex justify-between"><span className="text-surface-500">Storage</span><span className="font-medium text-right">{product.storage}</span></li>
              </ul>
            </div>
            <div className="p-6">
              <h3 className="font-bold mb-4 text-primary-600">Display & Body</h3>
              <ul className="space-y-4">
                <li className="flex justify-between"><span className="text-surface-500">Screen Size</span><span className="font-medium text-right">{product.displaySize}</span></li>
                <li className="flex justify-between"><span className="text-surface-500">Weight</span><span className="font-medium text-right">{product.weight}</span></li>
                <li className="flex justify-between"><span className="text-surface-500">Battery</span><span className="font-medium text-right">{product.battery}</span></li>
                <li className="flex justify-between"><span className="text-surface-500">OS</span><span className="font-medium text-right">{product.os}</span></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      {/* Reviews Summary */}
      <div className="mt-16">
        <h2 className="text-2xl font-display font-bold mb-6">User Reviews</h2>
        {reviews.length === 0 ? (
          <p className="text-surface-500 bg-surface-50 p-8 rounded-xl text-center border border-surface-200">No reviews yet. Be the first to review this product!</p>
        ) : (
          <div className="space-y-6">
            {reviews.map(review => (
              <div key={review._id} className="p-6 border border-surface-200 dark:border-surface-800 rounded-xl bg-white dark:bg-surface-900 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-bold">{review.user?.name || 'Anonymous'}</h4>
                    <div className="flex gap-2 items-center mt-1">
                      <StarRating rating={review.rating} />
                      <span className="text-xs text-surface-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                {review.title && <h5 className="font-bold mb-2">{review.title}</h5>}
                <p className="text-surface-600 dark:text-surface-300 text-sm">{review.content}</p>
                {(review.pros?.length > 0 || review.cons?.length > 0) && (
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    {review.pros?.length > 0 && <div><span className="text-xs font-bold text-emerald-500 uppercase">Pros:</span> <p className="text-sm">{review.pros.join(', ')}</p></div>}
                    {review.cons?.length > 0 && <div><span className="text-xs font-bold text-rose-500 uppercase">Cons:</span> <p className="text-sm">{review.cons.join(', ')}</p></div>}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
