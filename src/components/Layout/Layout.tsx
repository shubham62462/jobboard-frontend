import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-800 font-sans">
      <header className="bg-gray-100 p-4 shadow-md">
        <h1 className="text-xl font-semibold text-center">Job Board Platform</h1>
      </header>
      <main className="flex-1 p-4 container mx-auto">{children}</main>
      <footer className="bg-gray-100 p-4 mt-auto text-center text-sm text-gray-600">
        &copy; {new Date().getFullYear()} Your Company Name
      </footer>
    </div>
  );
};

export default Layout;