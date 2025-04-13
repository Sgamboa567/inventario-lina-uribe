import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const NavLink = ({ to, children }: { to: string; children: React.ReactNode }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link 
      to={to} 
      className={`inline-flex items-center px-4 pt-1 border-b-2 transition-colors duration-200
        ${isActive 
          ? 'border-brand-pink text-brand-pink font-medium' 
          : 'border-transparent text-gray-500 hover:text-brand-pink hover:border-brand-pink'
        }`}
    >
      {children}
    </Link>
  );
};

export const NavBar: React.FC = () => {
  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex space-x-8">
            <NavLink to="/">Dashboard</NavLink>
            <NavLink to="/products">Productos</NavLink>
            <NavLink to="/orders">Órdenes</NavLink>
          </div>
        </div>
      </div>
    </nav>
  );
};