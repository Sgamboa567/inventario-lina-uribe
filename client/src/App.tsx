import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import Dashboard from './components/Dashboard';
import Products from './components/Products';
import Orders from './components/Orders';
import { NavBar } from './components/NavBar';
import 'react-toastify/dist/ReactToastify.css';

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
        <NavBar />
        <main className="pb-12">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/orders" element={<Orders />} />
          </Routes>
        </main>

        <ToastContainer 
          position="bottom-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />
      </div>
    </Router>
  );
};

export default App;