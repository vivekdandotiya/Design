export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'user' | 'admin';
  savedProducts: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  _id: string;
  name: string;
  brand: string;
  model: string;
  price: number;
  originalPrice?: number;
  image: string;
  images: string[];
  category: string;
  processor: string;
  processorBrand: string;
  gpu: string;
  ram: string;
  ramType: string;
  storage: string;
  storageType: string;
  displaySize: string;
  displayResolution: string;
  displayType: string;
  refreshRate: string;
  battery: string;
  batteryLife: string;
  weight: string;
  os: string;
  ports: string[];
  wireless: string[];
  color: string;
  releaseYear: number;
  rating: number;
  reviewCount: number;
  scores: {
    overall: number;
    performance: number;
    battery: number;
    display: number;
    portability: number;
    value: number;
    gaming: number;
  };
  tags: string[];
  inStock: boolean;
  specs?: Record<string, string>;
  storePrices?: { store: string; price: number; url: string }[];
  lowestPriceStore?: string;
  lowestPrice?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  _id: string;
  user: {
    _id: string;
    name: string;
    avatar?: string;
  };
  product: string;
  rating: number;
  title: string;
  content: string;
  pros: string[];
  cons: string[];
  helpful: number;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Comparison {
  _id: string;
  products: Product[];
  comparedAt: string;
}

export interface CompareResult {
  products: Product[];
  highlights: {
    bestValue: string;
    bestPerformance: string;
    bestBattery: string;
    mostPortable: string;
  };
  analysis: {
    category: string;
    winner: string;
    details: string;
  }[];
}

export interface RecommendationRequest {
  budget: number;
  purpose: string;
  gaming: number;
  batteryImportance: number;
  portability: number;
  category?: string;
}

export interface RecommendationResult {
  product: Product;
  aiSummary: string;
  scores: {
    performance: number;
    battery: number;
    portability: number;
    gaming: number;
    value: number;
  };
  strengths: string[];
  weaknesses: string[];
  alternatives: Product[];
}

export interface DashboardStats {
  totalComparisons: number;
  savedProducts: number;
  recentSearches: number;
  aiRecommendations: number;
  savedProductsList: Product[];
  recentComparisons: Comparison[];
  searchHistory: string[];
}

export interface FilterState {
  brand: string[];
  minPrice: number;
  maxPrice: number;
  processor: string[];
  gpu: string[];
  ram: string[];
  sort: string;
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pages: number;
}

export interface AuthResponse {
  token: string;
  user: User;
}
