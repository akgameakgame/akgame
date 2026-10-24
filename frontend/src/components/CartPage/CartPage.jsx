import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Minus, ArrowLeft, ArrowRight, ShieldCheck, Truck, Headphones, CheckCircle2 } from 'lucide-react';
import './CartPage.css';

export default function CartPage({ currentLang, cartItems, onUpdateQuantity, onRemoveItem }) {
  const navigate = useNavigate();
  const isRtl = currentLang === 'ar';

  // كائن الترجمات للأربعة لغات
  const localTranslations = {
    ar: {
      cartTitle: 'سلة التسوق',
      subtotal: 'المجموع الفرعي',
      shipping: 'طريقة التوصيل',
      shippingNextStep: 'في الخطوة التالية',
      total: 'المجموع',
      checkout: 'إتمام الطلب',
      continueShopping: 'متابعة التسوق',
      customerService: 'خدمة عملاء متميزة',
      certifiedProducts: 'منتجات أصلية معتمدة',
      akgameWarranty: 'ضمان akgame',
      fastShipping: 'توصيل سريع',
      emptyCart: 'سلة التسوق فارغة حالياً',
      backToStore: 'العودة للمتجر',
      currency: 'دج'
    },
    en: {
      cartTitle: 'Shopping Cart',
      subtotal: 'Subtotal',
      shipping: 'Shipping Method',
      shippingNextStep: 'In next step',
      total: 'Total',
      checkout: 'Checkout',
      continueShopping: 'Continue Shopping',
      customerService: 'Premium Customer Service',
      certifiedProducts: 'Certified Authentic Products',
      akgameWarranty: 'AKGAME Warranty',
      fastShipping: 'Fast Shipping',
      emptyCart: 'Your cart is currently empty',
      backToStore: 'Back to Store',
      currency: 'DZD'
    },
    fr: {
      cartTitle: 'Panier d\'achat',
      subtotal: 'Sous-total',
      shipping: 'Mode de livraison',
      shippingNextStep: 'À l\'étape suivante',
      total: 'Total',
      checkout: 'Commander',
      continueShopping: 'Continuer les achats',
      customerService: 'Service client premium',
      certifiedProducts: 'Produits authentiques certifiés',
      akgameWarranty: 'Garantie AKGAME',
      fastShipping: 'Livraison rapide',
      emptyCart: 'Votre panier est actuellement vide',
      backToStore: 'Retour à la boutique',
      currency: 'DZD'
    },
    es: {
      cartTitle: 'Carrito de Compras',
      subtotal: 'Subtotal',
      shipping: 'Método de envío',
      shippingNextStep: 'En el siguiente paso',
      total: 'Total',
      checkout: 'Finalizar Compra',
      continueShopping: 'Continuar Comprando',
      customerService: 'Servicio al Cliente Premium',
      certifiedProducts: 'Productos Auténticos Certificados',
      akgameWarranty: 'Garantía AKGAME',
      fastShipping: 'Envío Rápido',
      emptyCart: 'Su carrito está vacío actualmente',
      backToStore: 'Volver a la Tienda',
      currency: 'DZD'
    }
  };

  const t = localTranslations[currentLang] || localTranslations['ar'];

  // حساب إجمالي السعر وإجمالي القطع
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="cart-page-container" dir={isRtl ? 'rtl' : 'ltr'}>
      <h1 className="cart-page-title">{t.cartTitle}</h1>

      {cartItems.length === 0 ? (
        <div className="empty-cart-state">
          <p>{t.emptyCart}</p>
          <button className="continue-shopping-btn" onClick={() => navigate('/products')}>
            {t.backToStore}
          </button>
        </div>
      ) : (
        <div className="cart-main-grid">
          
          {/* الجانب الأيمن: قائمة كروت المنتجات */}
          <div className="cart-items-section">
            {cartItems.map((item) => (
              <div key={item.id} className="cart-item-card">
                
                {/* معلومات المنتج والاسم */}
                <div className="cart-item-info">
                  <h3 className="cart-item-title">{item.title}</h3>
                  <div className="cart-item-price-row">
                    <span className="cart-item-price">{item.price * item.quantity} {t.currency}</span>
                  </div>
                </div>

                {/* عداد الكمية وصورة المنتج */}
                <div className="cart-item-controls-and-img">
                  <div className="quantity-selector">
                    <button className="qty-btn" onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}>
                      <Plus size={16} />
                    </button>
                    <span className="qty-value">{item.quantity}</span>
                    <button className="qty-btn" onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}>
                      <Minus size={16} />
                    </button>
                  </div>

                  <div className="cart-item-img-box">
                    {item.image ? (
                      <img src={item.image} alt={item.title} className="cart-item-img" />
                    ) : (
                      <div className="img-placeholder">photo</div>
                    )}
                  </div>
                </div>

              </div>
            ))}
          </div>

          {/* الجانب الأيسر: ملخص الطلب والزر */}
          <div className="cart-summary-card">
            
            <div className="summary-details-row">
              <div className="summary-col">
                <span className="summary-label">{t.subtotal} ({totalItems})</span>
                <span className="summary-val">{totalPrice} {t.currency}</span>
              </div>

              <div className="summary-col">
                <span className="summary-label">{t.shipping}</span>
                <span className="summary-val sub-text">{t.shippingNextStep}</span>
              </div>
            </div>

            <div className="summary-total-row">
              <span className="total-label">{t.total}</span>
              <span className="total-price">{totalPrice} {t.currency}</span>
            </div>

            {/* أزرار التنفيذ */}
            <div className="cart-actions-group">
              <button className="checkout-btn" onClick={() => navigate('/checkout')}>
                <span>{t.checkout}</span>
                {isRtl ? <ArrowLeft size={18} /> : <ArrowRight size={18} />}
              </button>

              <button className="continue-shopping-btn" onClick={() => navigate('/products')}>
                {t.continueShopping}
              </button>
            </div>

            {/* مميزات ورسائل الضمان */}
            <div className="cart-trust-badges">
              <div className="trust-item"><Headphones size={16} /> <span>{t.customerService}</span></div>
              <div className="trust-item"><CheckCircle2 size={16} /> <span>{t.certifiedProducts}</span></div>
              <div className="trust-item"><ShieldCheck size={16} /> <span>{t.akgameWarranty}</span></div>
              <div className="trust-item"><Truck size={16} /> <span>{t.fastShipping}</span></div>
            </div>

          </div>

        </div>
      )}
    </div>
  );
}