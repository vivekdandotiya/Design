
import Navbar from './Navbar';
import Footer from './Footer';
import CompareBar from './CompareBar';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-transparent dark:bg-surface-950 transition-colors duration-300">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <CompareBar />
    </div>
  );
}
