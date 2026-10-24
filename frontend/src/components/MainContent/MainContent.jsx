import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { translations } from '../../locales/translations';
import { supabase } from '../../supabaseClient';
import { MapPin, Phone, Clock, Navigation } from 'lucide-react';
import './MainContent.css';

export default function MainContent({ currentLang, onAddToCart }) {
  const isRtl = currentLang === 'ar';
  const t = translations[currentLang]?.home || translations['ar'].home;
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // حالة كلمة البحث
  const [searchQuery, setSearchQuery] = useState('');

  // قاموس ترجمات الشارات (Badge Translations)
  const badgeTranslations = {
    'تخفيض': { ar: 'تخفيض', en: 'Sale', fr: 'Promo', es: 'Oferta' },
    'Sale': { ar: 'تخفيض', en: 'Sale', fr: 'Promo', es: 'Oferta' },
    'جديد': { ar: 'جديد', en: 'New', fr: 'Nouveau', es: 'Nuevo' },
    'New': { ar: 'جديد', en: 'New', fr: 'Nouveau', es: 'Nuevo' },
    'الأكثر مبيعا': { ar: 'الأكثر مبيعة', en: 'Best Seller', fr: 'Meilleure vente', es: 'Más vendido' },
    'Best Seller': { ar: 'الأكثر مبيعة', en: 'Best Seller', fr: 'Meilleure vente', es: 'Más vendido' },
    'رقمي': { ar: 'رقمي', en: 'Digital', fr: 'Numérique', es: 'Digital' },
    'مجسمات': { ar: 'مجسمات', en: 'Figures', fr: 'Figurines', es: 'Figuras' }
  };

  // قاموس ترجمات عنوان قسم المجسمات
  const figuresTitles = {
    ar: 'المجسمات',
    en: 'Figures',
    fr: 'Figurines',
    es: 'Figuras'
  };
// قاموس ترجمات قسم الموقع والمحل
  const storeLocationTranslations = {
    ar: {
      title: 'موقع وتواجد المحل',
      subtitle: 'تفضل بزيارتنا في متجرنا لمعاينة أحدث الأجهزة والمنتجات مباشرة',
      addressTitle: 'العنوان',
      addressDetail: 'الجزائر العاصمة، الجزائر',
      phoneTitle: 'الهاتف والتواصل',
      phoneDetail: '+213 550 00 00 00',
      hoursTitle: 'أوقات العمل',
      hoursList: [
        { day: 'السبت', time: '11:00 ص - 09:00 م' },
        { day: 'الأحد', time: '11:00 ص - 09:00 م' },
        { day: 'الإثنين', time: '11:00 ص - 09:00 م' },
        { day: 'الثلاثاء', time: '11:00 ص - 09:00 م' },
        { day: 'الأربعاء', time: '11:00 ص - 09:00 م' },
        { day: 'الخميس', time: '11:00 ص - 09:00 م' },
        { day: 'الجمعة', time: '04:00 م - 09:00 م', isFriday: true }
      ],
      directionsBtn: 'احصل على الاتجاهات (GPS)'
    },
    en: {
      title: 'Our Store Location',
      subtitle: 'Visit us in-store to check out the latest consoles and gaming products',
      addressTitle: 'Address',
      addressDetail: 'Algiers, Algeria',
      phoneTitle: 'Phone & Contact',
      phoneDetail: '+213 550 00 00 00',
      hoursTitle: 'Working Hours',
      hoursList: [
        { day: 'Saturday', time: '11:00 AM - 09:00 PM' },
        { day: 'Sunday', time: '11:00 AM - 09:00 PM' },
        { day: 'Monday', time: '11:00 AM - 09:00 PM' },
        { day: 'Tuesday', time: '11:00 AM - 09:00 PM' },
        { day: 'Wednesday', time: '11:00 AM - 09:00 PM' },
        { day: 'Thursday', time: '11:00 AM - 09:00 PM' },
        { day: 'Friday', time: '04:00 PM - 09:00 PM', isFriday: true }
      ],
      directionsBtn: 'Get Directions (GPS)'
    },
    fr: {
      title: 'Emplacement du magasin',
      subtitle: 'Rendez-nous visite pour découvrir nos nouvelles consoles et produits',
      addressTitle: 'Adresse',
      addressDetail: 'Alger, Algérie',
      phoneTitle: 'Téléphone & Contact',
      phoneDetail: '+213 550 00 00 00',
      hoursTitle: 'Heures d\'ouverture',
      hoursList: [
        { day: 'Samedi', time: '11:00 - 21:00' },
        { day: 'Dimanche', time: '11:00 - 21:00' },
        { day: 'Lundi', time: '11:00 - 21:00' },
        { day: 'Mardi', time: '11:00 - 21:00' },
        { day: 'Mercredi', time: '11:00 - 21:00' },
        { day: 'Jeudi', time: '11:00 - 21:00' },
        { day: 'Vendredi', time: '16:00 - 21:00', isFriday: true }
      ],
      directionsBtn: 'Obtenir l\'itinéraire (GPS)'
    },
    es: {
      title: 'Ubicación de la tienda',
      subtitle: 'Visítenos en la tienda para ver las últimas consolas y productos',
      addressTitle: 'Dirección',
      addressDetail: 'Argel, Argelia',
      phoneTitle: 'Teléfono y contacto',
      phoneDetail: '+213 550 00 00 00',
      hoursTitle: 'Horario de atención',
      hoursList: [
        { day: 'Sábado', time: '11:00 AM - 09:00 PM' },
        { day: 'Domingo', time: '11:00 AM - 09:00 PM' },
        { day: 'Lunes', time: '11:00 AM - 09:00 PM' },
        { day: 'Martes', time: '11:00 AM - 09:00 PM' },
        { day: 'Miércoles', time: '11:00 AM - 09:00 PM' },
        { day: 'Jueves', time: '11:00 AM - 09:00 PM' },
        { day: 'Viernes', time: '04:00 PM - 09:00 PM', isFriday: true }
      ],
      directionsBtn: 'Obtener indicaciones (GPS)'
    }
  };

  const locT = storeLocationTranslations[currentLang] || storeLocationTranslations['ar'];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    const sections = document.querySelectorAll('.fade-in-section');
    sections.forEach((section) => observer.observe(section));

    return () => {
      sections.forEach((section) => observer.unobserve(section));
    };
  }, [loading, searchQuery]);

  useEffect(() => {
    async function fetchHomeProducts() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching home products from Supabase:', error.message);
        } else {
          setProducts(data || []);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchHomeProducts();
  }, []);

  // معالجة البحث عند الضغط على Enter
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate('/products', { state: { searchQuery: searchQuery.trim() } });
    }
  };

  // الفلترة الفورية للمنتجات أثناء الكتابة
  const filteredProducts = searchQuery.trim()
    ? products.filter(p => p.title?.toLowerCase().includes(searchQuery.toLowerCase()))
    : products;

  const categories = [
    { id: 1, image: "/6photo(1).png", key: "أجهزة الألعاب", name: { ar: "أجهزة الألعاب", en: "Consoles", fr: "Consoles", es: "Consolas" } },
    { id: 2, image: "/6photo(2).png", key: "مجسمات", name: { ar: "مجسمات", en: "Figures", fr: "Figurines", es: "Figuras" } },
    { id: 3, image: "/6photo(3).png", key: "إكسسوارات", name: { ar: "إكسسوارات", en: "Accessories", fr: "Accessoires", es: "Accesorios" } },
    { id: 4, image: "/6photo(4).png", key: "اجهزة مستعملة", name: { ar: "اجهزة مستعملة", en: "Used Consoles", fr: "Consoles d'occasion", es: "Consolas usadas" } },
    { id: 5, image: "/6photo(5).png", key: "ألعاب", name: { ar: "ألعاب", en: "Games", fr: "Jeux", es: "Juegos" } },
    { id: 6, image: "/6photo(6).png", key: "بطاقات رقمية", name: { ar: "بطاقات رقمية", en: "Digital Cards", fr: "Cartes Cadeaux", es: "Tarjetas Digitales" } },
  ];

  // تصفية قسم وصل حديثاً
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const newlyArrivedProducts = filteredProducts.filter(p => 
    (p.created_at && new Date(p.created_at) >= thirtyDaysAgo) || 
    ['جديد', 'New'].includes(p.badge)
  );

  const newProducts = newlyArrivedProducts.length > 0 
    ? newlyArrivedProducts.slice(0, 5) 
    : filteredProducts.slice(0, 5);

  const bestSellers = filteredProducts.filter(p => p.badge === 'الأكثر مبيعا' || p.badge === 'Best Seller').slice(0, 5);
  
  // تصفية قسم العروض
  const discountProducts = filteredProducts.filter(p => 
    (p.discount_price && Number(p.discount_price) > 0) || 
    ['تخفيض', 'Sale', 'Promo', 'Oferta'].includes(p.badge)
  ).slice(0, 5);

  const digitalProducts = filteredProducts.filter(p => p.category === 'digital' || p.badge === 'رقمي' || p.category === 'بطاقات رقمية').slice(0, 5);
  const figuresProducts = filteredProducts.filter(p => p.category === 'مجسمات' || p.category === 'figures' || p.badge === 'مجسمات').slice(0, 5);

  // دالة تحديد كلاس الشارة بناءً على نوعها
  const getBadgeClass = (badgeText) => {
    if (!badgeText) return 'sale-badge';
    if (['تخفيض', 'Sale', 'Promo', 'Oferta'].includes(badgeText)) return 'sale-badge';
    if (['جديد', 'New'].includes(badgeText)) return 'new-badge';
    return 'default-badge';
  };

  // دالة ترجمة النص الخاص بالشارة حسب اللغة الحالية
  const translateBadge = (rawBadge) => {
    if (!rawBadge) return '';
    const translatedObj = badgeTranslations[rawBadge];
    if (translatedObj) {
      return translatedObj[currentLang] || translatedObj['ar'] || rawBadge;
    }
    return rawBadge;
  };

  const renderProductCard = (prod, index, isDirectVisible = false) => {
    const rawBadge = prod.badge || (prod.discount_price ? 'تخفيض' : null);
    const displayedBadge = translateBadge(rawBadge);

    return (
      <div 
        key={prod.id} 
        className="product-card" 
        onClick={() => navigate(`/product/${prod.id}`)}
        style={{ 
          cursor: 'pointer',
          '--card-index': index,
          ...(isDirectVisible ? { opacity: 1, transform: 'none', visibility: 'visible' } : {})
        }}
      >
        {rawBadge && (
          <span className={`product-badge ${getBadgeClass(rawBadge)}`}>
            {displayedBadge}
          </span>
        )}
        <div className="product-image-container">
          {prod.image_url ? (
            <img src={prod.image_url} alt={prod.title} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }} />
          ) : (
            <span>photo</span>
          )}
        </div>
        <div className="product-info">
          <h3 className="product-title" title={prod.title}>{prod.title}</h3>
          
          <div className="product-price-row">
            <div className="product-price-box">
              {prod.discount_price ? (
                <>
                  <span className="product-price discount">{prod.discount_price} DZD</span>
                  <span className="product-price old">{prod.price} DZD</span>
                </>
              ) : (
                <span className="product-price">{prod.price} DZD</span>
              )}
            </div>
          </div>

          <button 
            className="add-to-cart-btn" 
            onClick={(e) => {
              e.stopPropagation();
              // التأكد من تحديد السعر النهائي المخفض قبل الإرسال للسلة
              const effectivePrice = (prod.discount_price && Number(prod.discount_price) > 0)
                ? prod.discount_price
                : prod.price;

              onAddToCart && onAddToCart({
                ...prod,
                price: effectivePrice
              });
            }}
          >
            {t.addToCart}
          </button>
        </div>
      </div>
    );
  };

  return (
    <main className="store-main-container">
      {/* 1. قسم البحث */}
      <div 
        className="search-section fade-in-section" 
        style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          width: '100%', 
          margin: '20px 0' 
        }}
      >
        <form 
          onSubmit={handleSearchSubmit} 
          style={{ 
            width: '100%', 
            maxWidth: '650px', 
            margin: '0 auto', 
            display: 'flex', 
            justifyContent: 'center' 
          }}
        >
          <input 
            type="text" 
            placeholder={t.searchPlaceholder} 
            className="store-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%' }}
          />
        </form>
      </div>

      {/* نتائج البحث */}
      {searchQuery.trim() && (
        <section className="products-section fade-in-section is-visible" style={{ marginBottom: '30px', opacity: 1, visibility: 'visible' }}>
          <div className="section-header">
            <h2 className="section-title">
              {isRtl ? 'نتائج البحث' : 'Search Results'} ({filteredProducts.length})
            </h2>
            <button 
              className="view-all-btn" 
              onClick={() => navigate('/products', { state: { searchQuery: searchQuery.trim() } })}
            >
              {t.viewAll}
            </button>
          </div>
          <div className="products-grid">
            {filteredProducts.length === 0 ? (
              <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#94a3b8' }}>
                {isRtl ? 'لا توجد منتجات مطابقة لـ' : 'No products found matching'} "{searchQuery}"
              </p>
            ) : (
              filteredProducts.slice(0, 10).map((prod, idx) => renderProductCard(prod, idx, true))
            )}
          </div>
        </section>
      )}

      {/* 2. تصفح حسب الفئة */}
      <section className="categories-section fade-in-section">
        <h2 className="section-title">{t.categoriesTitle}</h2>
        <div className="categories-grid">
          {categories.map((cat, index) => (
            <div 
              key={cat.id} 
              className="category-item"
              onClick={() => navigate('/products', { state: { category: cat.key } })}
            >
              <div 
                className="category-circle" 
                style={{ '--cat-index': index }}
              >
                <img src={cat.image} alt={cat.name[currentLang] || cat.name['ar']} className="category-img" />
              </div>
              <span className="category-name">
                {cat.name[currentLang] || cat.name['ar']}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 3. قسم وصل حديثاً */}
      <section id="new" className="products-section fade-in-section" style={{ scrollMarginTop: '100px' }}>
        <div className="section-header">
          <h2 className="section-title">{t.newProducts}</h2>
          <button 
            className="view-all-btn" 
            onClick={() => navigate('/products', { state: { newlyArrived: true } })}
          >
            {t.viewAll}
          </button>
        </div>
        <div className="products-grid">
          {loading ? (
            <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#94a3b8' }}>{isRtl ? 'جاري التحميل...' : 'Loading...'}</p>
          ) : (
            newProducts.map((prod, idx) => renderProductCard(prod, idx))
          )}
        </div>
      </section>

      {/* 4. قسم الأكثر مبيعاً */}
      <section id="bestsellers" className="products-section fade-in-section" style={{ scrollMarginTop: '100px' }}>
        <div className="section-header">
          <h2 className="section-title">{t.bestSellers}</h2>
          <button 
            className="view-all-btn" 
            onClick={() => navigate('/products', { state: { bestSellersOnly: true } })}
          >
            {t.viewAll}
          </button>
        </div>
        <div className="products-grid">
          {loading ? (
            <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#94a3b8' }}>{isRtl ? 'جاري التحميل...' : 'Loading...'}</p>
          ) : (
            (bestSellers.length > 0 ? bestSellers : products.slice(0, 5)).map((prod, idx) => renderProductCard(prod, idx))
          )}
        </div>
      </section>

      {/* 5. قسم التخفيضات والعروض */}
      <section id="discounts" className="products-section fade-in-section" style={{ scrollMarginTop: '100px' }}>
        <div className="section-header">
          <h2 className="section-title">{t.discounts}</h2>
          <button 
            className="view-all-btn" 
            onClick={() => navigate('/products', { state: { offersOnly: true } })}
          >
            {t.viewAll}
          </button>
        </div>
        <div className="products-grid">
          {loading ? (
            <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#94a3b8' }}>{isRtl ? 'جاري التحميل...' : 'Loading...'}</p>
          ) : (
            (discountProducts.length > 0 ? discountProducts : products.slice(0, 5)).map((prod, idx) => renderProductCard(prod, idx))
          )}
        </div>
      </section>

      {/* 6. قسم المنتجات الرقمية */}
      <section id="digital" className="products-section fade-in-section" style={{ scrollMarginTop: '100px' }}>
        <div className="section-header">
          <h2 className="section-title">{t.digitalProducts}</h2>
          <button 
            className="view-all-btn" 
            onClick={() => navigate('/products', { state: { category: 'بطاقات رقمية' } })}
          >
            {t.viewAll}
          </button>
        </div>
        <div className="products-grid">
          {loading ? (
            <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#94a3b8' }}>{isRtl ? 'جاري التحميل...' : 'Loading...'}</p>
          ) : (
            (digitalProducts.length > 0 ? digitalProducts : products.slice(0, 5)).map((prod, idx) => renderProductCard(prod, idx))
          )}
        </div>
      </section>

      {/* 7. قسم المجسمات */}
      <section id="figures" className="products-section fade-in-section" style={{ scrollMarginTop: '100px' }}>
        <div className="section-header">
          <h2 className="section-title">
            {t.figuresTitle || figuresTitles[currentLang] || figuresTitles['ar']}
          </h2>
          <button 
            className="view-all-btn" 
            onClick={() => navigate('/products', { state: { category: 'مجسمات' } })}
          >
            {t.viewAll}
          </button>
        </div>
        <div className="products-grid">
          {loading ? (
            <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#94a3b8' }}>{isRtl ? 'جاري التحميل...' : 'Loading...'}</p>
          ) : (
            (figuresProducts.length > 0 ? figuresProducts : products.slice(0, 5)).map((prod, idx) => renderProductCard(prod, idx))
          )}
        </div>
      </section>

      {/* 8. قسم جميع أقسام المتجر */}
      <section id="all-categories" className="store-categories-section fade-in-section">
        <h2 className="section-title">{t.allCategories}</h2>
        <div className="store-categories-grid">
          {[
            { id: 1, image: "/a9sam(1).jpg", category: "ألعاب" },
            { id: 2, image: "/a9sam(2).jpg", category: "بطاقات رقمية" },
            { id: 3, image: "/a9sam(3).jpg", category: "مجسمات" },
            { id: 4, image: "/a9sam(4).jpg", category: "إكسسوارات" },
            { id: 5, image: "/a9sam(5).jpg", category: "أجهزة الألعاب" },
            { id: 6, image: "/a9sam(6).jpg", category: "اجهزة مستعملة" },
          ].map((item, index) => (
            <div 
              key={item.id} 
              className="store-category-box" 
              style={{ '--box-index': index }}
              onClick={() => navigate('/products', { state: { category: item.category } })}
            >
              <img src={item.image} alt={`Category ${item.id}`} className="store-box-img" />
            </div>
          ))}
        </div>
      </section>

      {/* 9. قسم موقع وتواجد المحل الخريطة التفاعلية الفاخرة */}
      <section className="store-location-section fade-in-section" id="location">
        <h2 className="section-title">{locT.title}</h2>
        <p className="location-subtitle">{locT.subtitle}</p>

        <div className="location-container-card">
          {/* كرت التفاصيل والمعلومات الجانبية */}
          <div className="location-info-column">
            
            <div className="location-info-item">
              <div className="location-icon-box">
                <MapPin size={22} color="#ffffff" />
              </div>
              <div className="location-text-group">
                <span className="info-label">{locT.addressTitle}</span>
                <span className="info-value">{locT.addressDetail}</span>
              </div>
            </div>

            <div className="location-info-item">
              <div className="location-icon-box">
                <Phone size={22} color="#ffffff" />
              </div>
              <div className="location-text-group">
                <span className="info-label">{locT.phoneTitle}</span>
                <span className="info-value">{locT.phoneDetail}</span>
              </div>
            </div>
<div className="location-info-item hours-item">
  <div className="location-icon-box">
    <Clock size={22} color="#ffffff" />
  </div>
  <div className="location-text-group" style={{ width: '100%' }}>
    <span className="info-label">{locT.hoursTitle}</span>
    <div className="all-hours-list">
      {locT.hoursList.map((item, idx) => (
        <div key={idx} className={`single-day-row ${item.isFriday ? 'friday-row' : ''}`}>
          <span className="day-name">{item.day}</span>
          <span className="day-time">{item.time}</span>
        </div>
      ))}
    </div>
  </div>
</div>

            <a 
              href="https://l.instagram.com/?u=https%3A%2F%2Fmaps.apple.com%2Fplace%3Fcoordinate%3D36.737352%252C3.102530%26name%3DRep%25C3%25A8re%2Bsur%2Ble%2Bplan%26span%3D0.011796%252C0.018454%26utm_source%3Dig%26utm_medium%3Dsocial%26utm_content%3Dlink_in_bio&e=AUCnFPSXtPWdbFePDg_vS-h0CaHj-sDWynJjgPYSTIxg0vEVqO1GQqdw2jD8lLvJ_pRiYy0LS4QpR2a1VB15umajFsSVP-SWhnvPFYszKw6BpBobzPk_IM0Cr6JACxpW6uCNFvo" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="directions-btn"
            >
              <Navigation size={18} />
              <span>{locT.directionsBtn}</span>
            </a>

          </div>

          {/* إطار الخريطة التفاعلية بتصميم ليلي فاخر */}
          <div className="location-map-column">
            <iframe
              title="AKGAME Store Location Map"
              className="google-map-iframe"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d102353.47352352843!2d3.00!3d36.75!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x128fb2f34789885b%3A0xc3f8e5d070b4a451!2sAlgiers!5e0!3m2!1sen!2sdz!4v1680000000000!5m2!1sen!2sdz"
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </section>

    </main>
  );
}