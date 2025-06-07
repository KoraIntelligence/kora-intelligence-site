import { useTheme } from 'next-themes';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const toggle = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  return (
    <button
      aria-label="Toggle theme"
      onClick={toggle}
      className="p-2 rounded transition-colors duration-300 text-gray-800 dark:text-gray-200 hover:opacity-80"
    >
      {theme === 'dark' ? '🌞' : '🌙'}
    </button>
  );
}
