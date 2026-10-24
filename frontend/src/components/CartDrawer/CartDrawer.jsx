import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ShoppingCart, Plus, Minus, Truck, ArrowLeft, ArrowRight } from 'lucide-react';
import './CartDrawer.css';

export default function CartDrawer({ isOpen, onClose, cartItems, onUpdateQuantity, onRemoveItem, currentLang }) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const isRtl = currentLang === 'ar';

  const cartTranslations = {
    ar: {
      title: 'سلتي',
      subtotal: 'المجموع الفرعي',
      shippingNote: 'تُحسب رسوم التوصيل في الخطوة التالية',
      checkout: 'إتمام الطلب',
      viewCart: 'عرض سلتي',
      emptyCart: 'سلتك فارغة حالياً',
      currency: 'دج'
    },
    en: {
      title: 'My Cart',
      subtotal: 'Subtotal',
      shippingNote: 'Shipping calculated at next step',
      checkout: 'Checkout',
      viewCart: 'View Cart',
      emptyCart: 'Your cart is currently empty',
      currency: 'DZD'
    },
    fr: {
      title: 'Mon Panier',
      subtotal: 'Sous-total',
      shippingNote: 'Frais de livraison calculés à l\'étape suivante',
      checkout: 'Commander',
      viewCart: 'Voir le panier',
      emptyCart: 'Votre panier me vide',
      currency: 'DZD'
    },
    es: {
      title: 'Mi Carrito',
      subtotal: 'Subtotal',
      shippingNote: 'Gastos de envío calculados en el siguiente paso',
      checkout: 'Finalizar Compra',
      viewCart: 'Ver Carrito',
      emptyCart: 'Tu carrito está vacío',
      currency: 'DZD'
    }
  };

  const t = cartTranslations[currentLang] || cartTranslations['ar'];

  // دالة للحصول على السعر الفعلي (سعر التخفيض إذا وُجد)
  const getItemPrice = (item) => {
    if (item.discount_price && Number(item.discount_price) > 0) {
      return Number(item.discount_price);
    }
    return Number(item.price || 0);
  };

  // حساب المجموع الإجمالي بالسعر الصحيح
  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + (getItemPrice(item) * item.quantity), 0);
  };

  const totalItemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleGoToCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  const handleGoToCartPage = () => {
    onClose();
    navigate('/cart');
  };

  return (
    <div className="cart-drawer-overlay" onClick={onClose}>
      <div 
        className={`cart-drawer-content ${isOpen ? 'open' : ''}`} 
        onClick={(e) => e.stopPropagation()}
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        
        {/* هيدر السلة */}
        <div className="cart-drawer-header">
          <button className="cart-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
          <div className="cart-header-title">
            <span className="cart-title-text">{t.title}</span>
            <span className="cart-count-badge">{totalItemsCount}</span>
            <ShoppingCart size={22} className="cart-header-icon" />
          </div>
        </div>

        {/* قائمة المنتجات في السلة */}
        <div className="cart-drawer-body">
          {cartItems.length > 0 ? (
            cartItems.map((item) => {
              const itemPrice = getItemPrice(item);

              return (
                <div key={item.id} className="cart-item-card">
                  
                  {/* زر الحذف */}
                  <button className="remove-item-btn" onClick={() => onRemoveItem(item.id)}>
                    <X size={16} />
                  </button>

                  {/* صورة المنتج */}
                  <div className="cart-item-img-wrapper">
                    <img src={item.image_url || item.image || '/logo.jpg'} alt={item.title} className="cart-item-img" />
                  </div>

                  {/* تفاصيل المنتج والتحكم بالكمية */}
                  <div className="cart-item-details">
                    <h4 className="cart-item-title">{item.title}</h4>
                    
                    <div className="cart-item-bottom">
                      <span className="cart-item-price">
                        {itemPrice * item.quantity} {t.currency}
                      </span>

                      {/* عداد الكمية */}
                      <div className="quantity-controls">
                        <button 
                          className="qty-btn" 
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus size={14} />
                        </button>
                        <span className="qty-number">{item.quantity}</span>
                        <button 
                          className="qty-btn" 
                          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus size={14} />
                        </button>
                      </div>
                    </div>
                  </div>

                </div>
              );
            })
          ) : (
            <div className="empty-cart-message">
              <ShoppingCart size={48} />
              <p>{t.emptyCart}</p>
            </div>
          )}
        </div>

        {/* فوتر السلة */}
        {cartItems.length > 0 && (
          <div className="cart-drawer-footer">
            <div className="cart-subtotal-row">
              <span className="subtotal-label">{t.subtotal}</span>
              <span className="subtotal-amount">{calculateSubtotal()} {t.currency}</span>
            </div>

            <div className="shipping-note">
              <span>{t.shippingNote}</span>
              <Truck size={18} />
            </div>

            <button className="checkout-btn" onClick={handleGoToCheckout}>
              <span>{t.checkout}</span>
              {isRtl ? <ArrowLeft size={18} /> : <ArrowRight size={18} />}
            </button>

            <button className="view-cart-btn" onClick={handleGoToCartPage}>
              {t.viewCart}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}