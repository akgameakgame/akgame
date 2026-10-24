import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import Hero from './components/Hero/Hero';
import FeaturesMarquee from './components/FeaturesMarquee/FeaturesMarquee';
import MainContent from './components/MainContent/MainContent';
import ProductsPage from './components/ProductsPage/ProductsPage';
import ProductDetails from './components/ProductDetails/ProductDetails';
import CartPage from './components/CartPage/CartPage';
import CheckoutPage from './components/CheckoutPage/CheckoutPage';
import AdminDashboard from './components/AdminDashboard/AdminDashboard';
import CartDrawer from './components/CartDrawer/CartDrawer';
import WhatsAppButton from './components/WhatsAppButton/WhatsAppButton';
import LoginPage from './components/LoginPage/LoginPage'; // استيراد صفحة الدخول

function AppContent() {
  const location = useLocation();
  const [currentLang, setCurrentLang] = useState('ar');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);

  // حالة التحقق من تسجيل دخول الآدمن
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(
    () => sessionStorage.getItem('isAdminAuthenticated') === 'true'
  );

  const isAdminRoute = location.pathname.startsWith('/admin');

  const handleAddToCart = (product) => {
    const effectivePrice = (product.discount_price && Number(product.discount_price) > 0)
      ? Number(product.discount_price)
      : Number(product.price);

    setCartItems((prevItems) => {
      const existingIndex = prevItems.findIndex((item) => item.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prevItems];
        updated[existingIndex].price = effectivePrice;
        updated[existingIndex].quantity += (product.quantity || 1);
        return updated;
      }
      return [
        ...prevItems,
        {
          id: product.id,
          title: product.title,
          price: effectivePrice,
          discount_price: product.discount_price,
          quantity: product.quantity || 1,
          image: product.image_url || product.image || '/logo.jpg'
        }
      ];
    });
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (id, newQty) => {
    if (newQty <= 0) {
      handleRemoveItem(id);
    } else {
      setCartItems((prevItems) =>
        prevItems.map((item) => (item.id === id ? { ...item, quantity: newQty } : item))
      );
    }
  };

  const handleRemoveItem = (id) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const handleLogoutAdmin = () => {
    sessionStorage.removeItem('isAdminAuthenticated');
    setIsAdminAuthenticated(false);
  };

  const totalItemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="app-container">
      
      {!isAdminRoute && (
        <Navbar 
          currentLang={currentLang} 
          setLang={setCurrentLang} 
          onOpenCart={() => setIsCartOpen(true)}
          cartCount={totalItemsCount}
        />
      )}

      <Routes>
        <Route path="/" element={
          <>
            <Hero currentLang={currentLang} />
            <FeaturesMarquee currentLang={currentLang} />
            <MainContent currentLang={currentLang} onAddToCart={handleAddToCart} />
          </>
        } />
        
        <Route 
          path="/products" 
          element={<ProductsPage currentLang={currentLang} onAddToCart={handleAddToCart} />} 
        />
        
        <Route 
          path="/product/:id" 
          element={<ProductDetails currentLang={currentLang} onAddToCart={handleAddToCart} />} 
        />

        <Route 
          path="/cart" 
          element={
            <CartPage 
              currentLang={currentLang} 
              cartItems={cartItems} 
              onUpdateQuantity={handleUpdateQuantity} 
              onRemoveItem={handleRemoveItem} 
            />
          } 
        />

        <Route 
          path="/checkout" 
          element={
            <CheckoutPage 
              currentLang={currentLang} 
              cartItems={cartItems} 
              onClearCart={handleClearCart} 
            />
          } 
        />

        {/* حماية مسار لوحة التحكم بنفس حماية الجلسة */}
        <Route 
          path="/admin" 
          element={
            isAdminAuthenticated ? (
              <AdminDashboard onLogout={handleLogoutAdmin} />
            ) : (
              <LoginPage onLoginSuccess={() => setIsAdminAuthenticated(true)} />
            )
          } 
        />
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      
      {!isAdminRoute && <Footer currentLang={currentLang} />}

      {!isAdminRoute && (
        <CartDrawer 
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          cartItems={cartItems}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          currentLang={currentLang}
        />
      )}

      {!isAdminRoute && <WhatsAppButton />}

    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}