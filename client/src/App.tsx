import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { useThemeStore } from './store/themeStore';
import { useCompareStore } from './store/compareStore';
import Layout from './components/Layout';
import CompareBar from './components/CompareBar';

import HomePage from './pages/HomePage';
import { ProductsPage } from './pages/ProductsPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { ComparePage } from './pages/ComparePage';
import { RecommendPage } from './pages/RecommendPage';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { NotFoundPage } from './pages/NotFoundPage';

function App() {
  const { loadUser } = useAuthStore();
  const { initialize: initTheme } = useThemeStore();
  const { initialize: initCompare, selectedProducts } = useCompareStore();

  useEffect(() => {
    initTheme();
    loadUser();
    initCompare();
  }, [initTheme, loadUser, initCompare]);

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/compare" element={<ComparePage />} />
          <Route path="/recommend" element={<RecommendPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Layout>
      {selectedProducts.length > 0 && <CompareBar />}
    </BrowserRouter>
  );
}

export default App;
