import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, CheckCircle2, AlertCircle, X, Home, Building2 } from 'lucide-react';
import { supabase } from '../../supabaseClient';
import './CheckoutPage.css';

export default function CheckoutPage({ currentLang, cartItems, onClearCart }) {
  const navigate = useNavigate();
  const isRtl = currentLang === 'ar';

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [wilaya, setWilaya] = useState('');
  const [commune, setCommune] = useState('');
  const [shippingType, setShippingType] = useState('home'); // 'home' للمنزل أو 'desk' للمكتب
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // جدول أسعار التوصيل لـ 58 ولاية (المنزل والمكتب) بناءً على الجدول المعتمد[cite: 13]
  const wilayaRates = {
    '01 - أدرار': { home: 1850, desk: 1750 },
    '02 - الشلف': { home: 900, desk: 850 },
    '03 - الأغواط': { home: 1050, desk: 1000 },
    '04 - أم البواقي': { home: 900, desk: 850 },
    '05 - باتنة': { home: 900, desk: 850 },
    '06 - بجاية': { home: 900, desk: 850 },
    '07 - بسكرة': { home: 1050, desk: 1000 },
    '08 - بشار': { home: 1850, desk: 1750 },
    '09 - البليدة': { home: 700, desk: 650 },
    '10 - البويرة': { home: 900, desk: 850 },
    '11 - تمنراست': { home: 1850, desk: 1750 },
    '12 - تبسة': { home: 1050, desk: 1000 },
    '13 - تلمسان': { home: 900, desk: 850 },
    '14 - تيارت': { home: 900, desk: 850 },
    '15 - تيزي وزو': { home: 900, desk: 850 },
    '16 - الجزائر العاصمة': { home: 600, desk: 550 },
    '17 - الجلفة': { home: 1050, desk: 1000 },
    '18 - جيجل': { home: 900, desk: 850 },
    '19 - سطيف': { home: 900, desk: 850 },
    '20 - سعيدة': { home: 900, desk: 850 },
    '21 - سكيكدة': { home: 900, desk: 850 },
    '22 - سيدي بلعباس': { home: 900, desk: 850 },
    '23 - عنابة': { home: 900, desk: 850 },
    '24 - قالمة': { home: 900, desk: 850 },
    '25 - قسنطينة': { home: 900, desk: 850 },
    '26 - المدية': { home: 900, desk: 850 },
    '27 - مستغانم': { home: 900, desk: 850 },
    '28 - المسيلة': { home: 900, desk: 850 },
    '29 - معسكر': { home: 900, desk: 850 },
    '30 - ورقلة': { home: 1050, desk: 1000 },
    '31 - وهران': { home: 900, desk: 850 },
    '32 - البيض': { home: 1850, desk: 1750 },
    '33 - إليزي': { home: 1850, desk: 1750 },
    '34 - برج بوعريريج': { home: 900, desk: 850 },
    '35 - بومرداس': { home: 700, desk: 650 },
    '36 - الطارف': { home: 900, desk: 850 },
    '37 - تندوف': { home: 1850, desk: 1750 },
    '38 - تسمسيلت': { home: 900, desk: 850 },
    '39 - الوادي': { home: 1050, desk: 1000 },
    '40 - خنشلة': { home: 900, desk: 850 },
    '41 - سوق أهراس': { home: 900, desk: 850 },
    '42 - تيبازة': { home: 700, desk: 650 },
    '43 - ميلة': { home: 900, desk: 850 },
    '44 - عين الدفلى': { home: 900, desk: 850 },
    '45 - النعامة': { home: 1850, desk: 1750 },
    '46 - عين تموشنت': { home: 900, desk: 850 },
    '47 - غرداية': { home: 1050, desk: 1000 },
    '48 - غليزان': { home: 900, desk: 850 },
    '49 - أوقروت': { home: 1850, desk: 1750 },
    '50 - برج باجي مختار': { home: 1850, desk: 1750 },
    '51 - بني عباس': { home: 1850, desk: 1750 },
    '52 - تيميمون': { home: 1850, desk: 1750 },
    '53 - تقرت': { home: 1050, desk: 1000 },
    '54 - جانت': { home: 1850, desk: 1750 },
    '55 - المغير': { home: 1050, desk: 1000 },
    '56 - المنيعة': { home: 1050, desk: 1000 },
    '57 - أولاد جلال': { home: 1050, desk: 1000 },
    '58 - عين قزام': { home: 1850, desk: 1750 }
  };

  const localTranslations = {
    ar: {
      title: 'تأكيد الطلب',
      orderedItems: 'المنتجات المطلوبة',
      subtotal: 'المجموع الفرعي',
      shippingMethod: 'طريقة التوصيل',
      homeDelivery: 'توصيل للمنزل',
      deskDelivery: 'توصيل للمكتب (Stop-Desk)',
      chooseWilayaFirst: 'اختر الولاية أولاً',
      paymentMethod: 'الدفع عند الاستلام (يد بيد)',
      total: 'المجموع',
      confirmOrder: 'تأكيد الطلب',
      agreeTerms: 'لقد قرأت الشروط العامة وأوافق عليها.',
      termsNote: 'سيتم استخدام بياناتك الشخصية لمعالجة طلبك وتوصيله.',
      yourInfo: 'معلوماتك الشخصية',
      firstName: 'الاسم',
      lastName: 'اللقب',
      phone: 'رقم الهاتف',
      shippingAddress: 'عنوان التوصيل',
      wilaya: 'اختر الولاية',
      communeLabel: 'البلدية',
      currency: 'دج',
      fillRequired: 'يرجى ملء جميع الحقول المطلوبة والموافقة على الشروط.',
      orderSuccessTitle: 'تم إرسال طلبك بنجاح!',
      orderSuccessMsg: 'تم ارسال طلبك بنجاح، سيتم الاتصال بك في اقرب وقت لتأكيد الشحن.',
      orderError: 'حدث خطأ أثناء إرسال الطلب، يرجى المحاولة مرة أخرى.',
      closeBtn: 'حسناً'
    }
  };

  const t = localTranslations[currentLang] || localTranslations['ar'];

  const totalItemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  const shippingFee = wilaya && wilayaRates[wilaya] ? wilayaRates[wilaya][shippingType] : 0;
  const totalPrice = subtotalPrice + shippingFee;

  const handleConfirmOrder = async (e) => {
    e.preventDefault();

    if (!firstName || !lastName || !phone || !wilaya || !agreedTerms) {
      setErrorMessage(t.fillRequired);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const orderPayload = {
        customer_name: `${firstName} ${lastName}`,
        phone: phone,
        wilaya: wilaya,
        commune: commune || 'غير محدد',
        shipping_type: shippingType === 'home' ? 'توصيل للمنزل' : 'توصيل للمكتب',
        shipping_fee: shippingFee,
        notes: '',
        total_amount: totalPrice,
        items: cartItems.map(item => ({
          id: item.id,
          title: item.title,
          price: item.price,
          quantity: item.quantity
        })),
        status: 'pending',
        created_at: new Date().toISOString()
      };

      const { error } = await supabase.from('orders').insert([orderPayload]);

      if (error) {
        console.error('Supabase error:', error.message);
        setErrorMessage(t.orderError);
      } else {
        setShowSuccessModal(true);
        if (onClearCart) onClearCart();
      }
    } catch (err) {
      console.error('Unexpected Error:', err);
      setErrorMessage(t.orderError);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    navigate('/');
  };

  return (
    <div className="checkout-page-container" dir={isRtl ? 'rtl' : 'ltr'}>
      <h1 className="checkout-page-title">{t.title}</h1>

      {errorMessage && (
        <div className="checkout-error-banner">
          <AlertCircle size={18} />
          <span>{errorMessage}</span>
          <button type="button" onClick={() => setErrorMessage('')} className="error-close-btn">
            <X size={16} />
          </button>
        </div>
      )}

      <form onSubmit={handleConfirmOrder} className="checkout-form-wrapper">
        
        <div className="checkout-details-card">
          
          <div className="form-section-block">
            <div className="section-title-badge">
              <span className="badge-num">1</span>
              <h2 className="section-title">{t.yourInfo}</h2>
            </div>

            <div className="inputs-grid-2">
              <div className="input-group">
                <input 
                  type="text" 
                  className="checkout-input" 
                  placeholder={t.firstName}
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <input 
                  type="text" 
                  className="checkout-input" 
                  placeholder={t.lastName}
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="input-group full-width" style={{ marginTop: '16px' }}>
              <input 
                type="tel" 
                className="checkout-input" 
                placeholder={t.phone}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-section-block" style={{ marginTop: '30px' }}>
            <div className="section-title-badge">
              <span className="badge-num">2</span>
              <h2 className="section-title">{t.shippingAddress}</h2>
            </div>

            <div className="inputs-grid-2">
              <div className="input-group">
                <select 
                  className="checkout-select"
                  value={wilaya}
                  onChange={(e) => setWilaya(e.target.value)}
                  required
                >
                  <option value="">{t.wilaya}</option>
                  {Object.keys(wilayaRates).map((w) => {
                    const rate = wilayaRates[w];
                    return (
                      <option key={w} value={w}>
                        {w} — (منزل: {rate.home} دج | مكتب: {rate.desk} دج)
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="input-group">
                <input 
                  type="text" 
                  className="checkout-input" 
                  placeholder={t.communeLabel}
                  value={commune}
                  onChange={(e) => setCommune(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* أزرار اختيار نوع التوصيل */}
            <div className="shipping-type-selector-wrapper" style={{ marginTop: '20px' }}>
              <label className="shipping-selector-label" style={{ display: 'block', marginBottom: '10px', fontSize: '14px', fontWeight: '700', color: '#cbd5e1' }}>
                {t.shippingMethod}
              </label>
              <div className="shipping-options-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                
                <div 
                  className={`shipping-option-card ${shippingType === 'home' ? 'active' : ''}`}
                  onClick={() => setShippingType('home')}
                  style={{
                    padding: '14px',
                    borderRadius: '16px',
                    border: shippingType === 'home' ? '2px solid #ffffff' : '1px solid rgba(255, 255, 255, 0.2)',
                    background: shippingType === 'home' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Home size={20} color={shippingType === 'home' ? '#ffffff' : '#94a3b8'} />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '13.5px', fontWeight: '700', color: '#ffffff' }}>{t.homeDelivery}</span>
                    <span style={{ fontSize: '11.5px', color: '#94a3b8' }}>
                      {wilaya ? `${wilayaRates[wilaya]?.home} ${t.currency}` : ''}
                    </span>
                  </div>
                </div>

                <div 
                  className={`shipping-option-card ${shippingType === 'desk' ? 'active' : ''}`}
                  onClick={() => setShippingType('desk')}
                  style={{
                    padding: '14px',
                    borderRadius: '16px',
                    border: shippingType === 'desk' ? '2px solid #ffffff' : '1px solid rgba(255, 255, 255, 0.2)',
                    background: shippingType === 'desk' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Building2 size={20} color={shippingType === 'desk' ? '#ffffff' : '#94a3b8'} />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '13.5px', fontWeight: '700', color: '#ffffff' }}>{t.deskDelivery}</span>
                    <span style={{ fontSize: '11.5px', color: '#94a3b8' }}>
                      {wilaya ? `${wilayaRates[wilaya]?.desk} ${t.currency}` : ''}
                    </span>
                  </div>
                </div>

              </div>
            </div>

          </div>

        </div>

        <div className="checkout-summary-card">
          <div className="summary-info-block">
            
            {cartItems && cartItems.length > 0 && (
              <div className="checkout-items-preview">
                <h3 className="preview-title">{t.orderedItems} ({totalItemsCount})</h3>
                <div className="preview-items-list">
                  {cartItems.map((item) => (
                    <div key={item.id} className="preview-item-row">
                      <div className="preview-item-info">
                        <div className="preview-item-img-box">
                          <img 
                            src={item.image || item.image_url || '/logo.jpg'} 
                            alt={item.title} 
                            className="preview-item-img" 
                          />
                        </div>
                        <div className="preview-item-details-col">
                          <span className="preview-item-name">{item.title}</span>
                          <span className="preview-item-qty">x{item.quantity}</span>
                        </div>
                      </div>
                      <span className="preview-item-price">{item.price * item.quantity} {t.currency}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="summary-line">
              <span className="line-label">{t.subtotal} ({totalItemsCount})</span>
              <span className="line-value">{subtotalPrice} {t.currency}</span>
            </div>

            <div className="summary-line">
              <span className="line-label">{t.shippingMethod}</span>
              <span className="line-value sub">
                {wilaya ? `${shippingFee} ${t.currency} (${shippingType === 'home' ? t.homeDelivery : t.deskDelivery})` : t.chooseWilayaFirst}
              </span>
            </div>

            <div className="summary-line">
              <span className="line-label">{t.paymentMethod}</span>
            </div>

            <div className="summary-total-box">
              <span className="total-title">{t.total}</span>
              <span className="total-amount">{totalPrice} {t.currency}</span>
            </div>

            <button 
              type="submit" 
              className="confirm-order-btn"
              disabled={isSubmitting}
            >
              <span>{isSubmitting ? 'جاري إرسال الطلب...' : t.confirmOrder}</span>
              <span className="btn-price-tag">{totalPrice} {t.currency}</span>
            </button>

            <div className="terms-checkbox-wrapper" onClick={() => setAgreedTerms(!agreedTerms)}>
              <div className={`custom-checkbox ${agreedTerms ? 'checked' : ''}`}>
                {agreedTerms && <Check size={14} />}
              </div>
              <span className="terms-text">{t.agreeTerms}</span>
            </div>

            <p className="terms-disclaimer-note">
              {t.termsNote}
            </p>
          </div>
        </div>

      </form>

      {showSuccessModal && (
        <div className="center-modal-overlay">
          <div className="center-modal-card">
            
            <div className="modal-icon-badge success">
              <CheckCircle2 size={36} color="#22c55e" />
            </div>

            <h2 className="modal-title">{t.orderSuccessTitle}</h2>
            <p className="modal-message">{t.orderSuccessMsg}</p>

            <button className="modal-confirm-btn" onClick={handleCloseSuccessModal}>
              {t.closeBtn}
            </button>

          </div>
        </div>
      )}

    </div>
  );
}