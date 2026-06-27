import { create } from 'zustand';
import type { Product } from '../types';

interface CompareState {
  selectedProducts: Product[];
  addProduct: (product: Product) => void;
  removeProduct: (productId: string) => void;
  clearAll: () => void;
  isSelected: (productId: string) => boolean;
  initialize: () => void;
}

export const useCompareStore = create<CompareState>((set, get) => ({
  selectedProducts: [],

  addProduct: (product: Product) => {
    const { selectedProducts } = get();
    if (selectedProducts.length >= 4) return;
    if (selectedProducts.find((p) => p._id === product._id)) return;
    const updated = [...selectedProducts, product];
    set({ selectedProducts: updated });
    sessionStorage.setItem('cw-compare', JSON.stringify(updated));
  },

  removeProduct: (productId: string) => {
    const updated = get().selectedProducts.filter((p) => p._id !== productId);
    set({ selectedProducts: updated });
    sessionStorage.setItem('cw-compare', JSON.stringify(updated));
  },

  clearAll: () => {
    set({ selectedProducts: [] });
    sessionStorage.removeItem('cw-compare');
  },

  isSelected: (productId: string) => {
    return get().selectedProducts.some((p) => p._id === productId);
  },

  initialize: () => {
    try {
      const stored = sessionStorage.getItem('cw-compare');
      if (stored) {
        set({ selectedProducts: JSON.parse(stored) });
      }
    } catch {
      sessionStorage.removeItem('cw-compare');
    }
  },
}));
