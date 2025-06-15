import Header from './Header';
import Footer from './Footer';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen scroll-smooth bg-white dark:bg-neutral-900 font-sans text-gray-800 dark:text-gray-100">
      <Header />
      <main className="flex-1 w-full px-4 sm:px-6 pt-24 pb-24">
        {children}
      </main>
      <Footer />
    </div>
  );
}
