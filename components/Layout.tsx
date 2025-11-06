import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <h1 className="text-2xl font-bold text-brand-primary">محلل القضايا - nonprofit</h1>
          </div>
          <div className="text-sm text-gray-500">
            مدعوم بواسطة Gemini
          </div>
        </div>
      </div>
    </header>
  );
};

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white">
      <div className="container mx-auto py-4 px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm text-gray-500">
          © {new Date().getFullYear()} nonprofit par Mehdi Ait Aissa. هذه الأداة للاستخدام الإعلامي فقط.
        </p>
      </div>
    </footer>
  );
};