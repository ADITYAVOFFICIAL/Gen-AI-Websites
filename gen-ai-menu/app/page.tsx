'use client';

import { callMenuSuggestionFlow } from '@/app/genkit';
import { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion } from 'framer-motion';

export default function Home() {
  const [menuItem, setMenu] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  async function getMenuItem(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); // Prevent default form submission
    const formData = new FormData(e.currentTarget);
    const theme = formData.get('theme')?.toString() ?? '';

    // Check if the theme is empty
    if (!theme.trim()) {
      toast.error('Please enter the theme'); // Show error toast
      return; // Exit the function if the theme is empty
    }

    toast.info('Cooking menu in the kitchen...'); // Show loading toast
    setLoading(true); // Set loading to true before generating

    try {
      const suggestion = await callMenuSuggestionFlow(theme);
      setMenu(suggestion);
      toast.success('Enjoy your menu!'); // Show success toast
    } catch {
      toast.error('Failed to generate menu. Please try again.'); // Show error toast
    } finally {
      setLoading(false); // Set loading to false after generation is complete
    }
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 to-red-500 p-8">
      <ToastContainer /> {/* Add ToastContainer for toasts */}
      <form onSubmit={getMenuItem} className='border-none bg-black'>
        <label className="text-lg mb-3 text-#82a3f6 font-semibold">
          Suggest a menu item for a restaurant with this theme:
        </label>
        <input 
          type="text" 
          name="theme" 
          className="border-none rounded-lg p-3 w-full mb-3 focus:border-black focus:outline-black bg-slate-800 font-medium" 
        />
        <button 
          type="submit" 
          disabled={loading} 
          className={`bg-#87a9ff text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300 ${loading ? 'cursor-not-allowed opacity-50' : 'hover:bg-darkhover'}`}
        >
          {loading ? 'Generating...' : 'Generate'}
        </button>
      </form>

      {/* Conditionally render spinner */}
      {loading && (
        <div className="flex flex-col items-center mt-5">
          <div className="spinner border-4 border-gray-400 border-t-4 border-blue-500 rounded-full w-16 h-16 animate-spin"></div>
          <p className="mt-2 font-bold">Generating menu suggestions...</p>
        </div>
      )}

      {/* Render the menu suggestion when it's available */}
      {menuItem && (
        <pre className='mt-5 border-none bg-black p-10 rounded-lg shadow-md'>
          {menuItem.split('\n').map((line, lineIndex) => (
            <motion.div
              key={lineIndex}
              initial={{ opacity: 0, y: 10 }} // Initial state
              animate={{ opacity: 1, y: 0 }} // Animate to this state
              transition={{ duration: 0.28, delay: lineIndex * 0.08 }} // Delay for each line
              style={{ marginBottom: '0.8rem' }} // Maintain spacing between lines
            >
              {line}
            </motion.div>
          ))}
        </pre>
      )}
    </main>
  );
}
