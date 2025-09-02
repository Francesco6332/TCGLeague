import React from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col" style={{background: 'linear-gradient(135deg, #0f172a 0%, #581c87 50%, #0f172a 100%)'}}>
      <Navbar />
      <main 
        id="main-content"
        className="flex-1 container mx-auto px-4 py-8" 
        role="main"
        aria-label="Main content"
      >
        {children}
      </main>
      <Footer />
    </div>
  );
}
