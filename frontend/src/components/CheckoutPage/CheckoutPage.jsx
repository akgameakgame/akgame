import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, CheckCircle2, AlertCircle, X } from 'lucide-react';
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
  const [notes, setNotes] = useState('');
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // حالات التحكم بالنافذة المنبثقة في منتصف الشاشة
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const wilayas = [
    '01 - أدرار', '02 - الشلف', '03 - الأغواط', '04 - أم البواقي', '05 - باتنة',
    '06 - بجاية', '07 - بسكرة', '08 - بشار', '09 - البليدة', '10 - البويرة',
    '11 - تمنراست', '12 - تبسة', '13 - تلمسان', '14 - تيارت', '15 - تيزي وزو',
    '16 - الجزائر العاصمة', '17 - الجلفة', '18 - جيجل', '19 - سطيف', '20 - سعيدة',
    '21 - سكيكدة', '22 - سيدي بلعباس', '23 - عنابة', '24 - قالمة', '25 - قسنطينة',
    '26 - المدية', '27 - مستغانم', '28 - المسيلة', '29 - معسكر', '30 - ورقلة',
    '31 - وهران', '32 - البيض', '33 - إليزي', '34 - برج بوعريريج', '35 - بومرداس',
    '36 - الطارف', '37 - تندوف', '38 - تسمسيلت', '39 - الوادي', '40 - خنشلة',
    '41 - سوق أهراس', '42 - تيبازة', '43 - ميلة', '44 - عين الدفلى', '45 - النعامة',
    '46 - عين تموشنت', '47 - غرداية', '48 - غليزان'
  ];

  const localTranslations = {
    ar: {
      title: 'تأكيد الطلب',
      orderedItems: 'المنتجات المطلوبة',
      subtotal: 'المجموع الفرعي',
      shippingMethod: 'طريقة التوصيل',
      chooseCommune: 'اختر البلدية',
      paymentMethod: 'الدفع عند الاستلام',
      total: 'المجموع',
      confirmOrder: 'تأكيد الطلب',
      agreeTerms: 'لقد قرأت الشروط العامة وأوافق عليها.',
      termsNote: 'سيتم استخدام بياناتك الشخصية لمعالجة طلبك وتحسين تجربتك على موقعنا، وفقاً لسياسة الخصوصية الخاصة بنا.',
      yourInfo: 'معلوماتك',
      firstName: 'الاسم',
      lastName: 'اللقب',
      phone: 'رقم الهاتف',
      shippingAddress: 'عنوان التوصيل',
      wilaya: 'الولاية',
      selectWilaya: 'اختر الولاية أولاً',
      communeLabel: 'البلدية',
      extraInfo: 'معلومات إضافية',
      notesPlaceholder: 'معلومات إضافية حول طلبك (اختياري)',
      currency: 'دج',
      fillRequired: 'يرجى ملء جميع الحقول المطلوبة والموافقة على الشروط.',
      orderSuccessTitle: 'تم إرسال طلبك بنجاح!',
      orderSuccessMsg: 'تم ارسال طلبك سيتم الاتصال بك في اقرب وقت',
      orderError: 'حدث خطأ أثناء إرسال الطلب، يرجى المحاولة مرة أخرى.',
      closeBtn: 'حسناً'
    },
    en: {
      title: 'Order Confirmation',
      orderedItems: 'Ordered Items',
      subtotal: 'Subtotal',
      shippingMethod: 'Shipping Method',
      chooseCommune: 'Select commune',
      paymentMethod: 'Cash on Delivery',
      total: 'Total',
      confirmOrder: 'Confirm Order',
      agreeTerms: 'I have read and agree to the general terms and conditions.',
      termsNote: 'Your personal data will be used to process your order and enhance your experience according to our privacy policy.',
      yourInfo: 'Your Information',
      firstName: 'First Name',
      lastName: 'Last Name',
      phone: 'Phone Number',
      shippingAddress: 'Shipping Address',
      wilaya: 'State / Wilaya',
      selectWilaya: 'Select Wilaya first',
      communeLabel: 'Commune',
      extraInfo: 'Additional Information',
      notesPlaceholder: 'Additional information about your order (optional)',
      currency: 'DZD',
      fillRequired: 'Please fill in all required fields and accept the terms.',
      orderSuccessTitle: 'Order Submitted!',
      orderSuccessMsg: 'Your order has been sent. We will contact you as soon as possible.',
      orderError: 'An error occurred while placing the order. Please try again.',
      closeBtn: 'OK'
    },
    fr: {
      title: 'Confirmation de la commande',
      orderedItems: 'Produits commandés',
      subtotal: 'Sous-total',
      shippingMethod: 'Mode de livraison',
      chooseCommune: 'Choisir la commune',
      paymentMethod: 'Paiement à la livraison',
      total: 'Total',
      confirmOrder: 'Confirmer la commande',
      agreeTerms: 'J\'ai lu et j\'accepte les conditions générales.',
      termsNote: 'Vos données personnelles seront utilisées pour traiter votre commande selon notre politique de confidentialité.',
      yourInfo: 'Vos informations',
      firstName: 'Prénom',
      lastName: 'Nom',
      phone: 'Numéro de téléphone',
      shippingAddress: 'Adresse de livraison',
      wilaya: 'Wilaya',
      selectWilaya: 'Sélectionnez d\'abord la wilaya',
      communeLabel: 'Commune',
      extraInfo: 'Informations supplémentaires',
      notesPlaceholder: 'Notes concernant votre commande (optionnel)',
      currency: 'DZD',
      fillRequired: 'Veuillez remplir tous les champs obligatoires et accepter les conditions.',
      orderSuccessTitle: 'Commande envoyée !',
      orderSuccessMsg: 'Votre commande a été envoyée. Nous vous contacterons dans les plus brefs délais.',
      orderError: 'Une erreur s\'est produite. Veuillez réessayer.',
      closeBtn: 'D\'accord'
    },
    es: {
      title: 'Confirmación del Pedido',
      orderedItems: 'Productos pedidos',
      subtotal: 'Subtotal',
      shippingMethod: 'Método de envío',
      chooseCommune: 'Elegir municipio',
      paymentMethod: 'Pago contra entrega',
      total: 'Total',
      confirmOrder: 'Confirmar Pedido',
      agreeTerms: 'He leído y acepto los términos y condiciones generales.',
      termsNote: 'Sus datos personales se utilizarán para procesar su pedido según nuestra política de privacidad.',
      yourInfo: 'Su Información',
      firstName: 'Nombre',
      lastName: 'Apellido',
      phone: 'Número de teléfono',
      shippingAddress: 'Dirección de envío',
      wilaya: 'Provincia / Wilaya',
      selectWilaya: 'Seleccione primero la wilaya',
      communeLabel: 'Municipio',
      extraInfo: 'Información Adicional',
      notesPlaceholder: 'Notas sobre su pedido (opcional)',
      currency: 'DZD',
      fillRequired: 'Por favor complete todos los campos requeridos y acepte los términos.',
      orderSuccessTitle: '¡Pedido enviado!',
      orderSuccessMsg: 'Su pedido ha sido enviado. Nos pondremos en contacto con usted lo antes posible.',
      orderError: 'Ocurrió un error. Por favor inténtelo de nuevo.',
      closeBtn: 'Aceptar'
    }
  };

  const t = localTranslations[currentLang] || localTranslations['ar'];

  const totalItemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingFee = wilaya ? 500 : 0;
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
        notes: notes,
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

      {/* رسالة الخطأ أو التحذير في حال نقص البيانات */}
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
        
        {/* الكرت العلوي: ملخص الطلب والمنتجات */}
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
              <span className="line-value sub">{wilaya ? `${shippingFee} ${t.currency}` : t.chooseCommune}</span>
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

        {/* الكرت السفلي: نموذج بيانات العميل والتوصيل */}
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
                  {wilayas.map((w) => (
                    <option key={w} value={w}>{w}</option>
                  ))}
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
          </div>

          <div className="form-section-block" style={{ marginTop: '30px' }}>
            <div className="section-title-badge">
              <span className="badge-num">3</span>
              <h2 className="section-title">{t.extraInfo}</h2>
            </div>

            <div className="input-group full-width">
              <textarea 
                className="checkout-textarea"
                rows="4"
                placeholder={t.notesPlaceholder}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              ></textarea>
            </div>
          </div>

        </div>

      </form>

      {/* الكرت المنبثق في منتصف الشاشة (Center Success Modal) */}
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