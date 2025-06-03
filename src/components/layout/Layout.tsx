import Header from './Header';
import Footer from './Footer';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col scroll-smooth bg-white text-gray-900 dark:bg-neutral-900 dark:text-white">
      <Header />
      <main className="flex-grow max-w-7xl mx-auto px-6 sm:px-8 pt-24 pb-24">
        {children}
      </main>
      <Footer />
    </div>
  );
}
