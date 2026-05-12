import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-900/90 backdrop-blur">
      <div className="container mx-auto px-4 py-5 flex flex-col md:flex-row items-center justify-between gap-3 text-sm">
        <p className="text-gray-600 dark:text-gray-300 text-center md:text-left">
          © AO AI LLC. All rights reserved 2026.
        </p>
        <div className="flex items-center gap-4 text-gray-500 dark:text-gray-400">
          <Link to="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Home</Link>
          <Link to="/company-portal" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Company Portal</Link>
          <Link to="/dashboard" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Dashboard</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
