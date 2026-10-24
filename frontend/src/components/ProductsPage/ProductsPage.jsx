import React, { useState, useEffect } from 'react';
import { Filter, ArrowRight, ArrowLeft, Gamepad2 } from 'lucide-react';
import { translations } from '../../locales/translations';
import { supabase } from '../../supabaseClient';
import { useLocation, useNavigate } from 'react-router-dom';
import './ProductsPage.css';

export default function ProductsPage({ currentLang, onAddToCart }) {
  const isRtl = currentLang === 'ar';
  const location = useLocation();
  const navigate = useNavigate();

  const storeTranslations = {
    ar: {
      title: 'المتجر',
      filter: 'تصفية',
      sortBy: 'ترتيب حسب',
      platform: 'المنصة',
      availability: 'التوفر',
      inStockOnly: 'المتوفر فقط',
      offersOnly: 'العروض فقط',
      newlyArrived: 'وصل حديثاً (آخر 30 يوماً)',
      bestSellersOnly: 'الأكثر مبيعاً',
      price: 'السعر (دج)',
      categoriesTitle: 'الأقسام',
      addToCart: 'اضف الى السلة',
      loading: 'جاري تحميل المنتجات...',
      noProducts: 'لا توجد منتجات مطابقة للفلاتر المحددة'
    },
    en: {
      title: 'Store',
      filter: 'Filter',
      sortBy: 'Sort By',
      platform: 'Platform',
      availability: 'Availability',
      inStockOnly: 'In stock only',
      offersOnly: 'Offers only',
      newlyArrived: 'Newly arrived (last 30 days)',
      bestSellersOnly: 'Best Sellers',
      price: 'Price (DZD)',
      categoriesTitle: 'Categories',
      addToCart: 'Add to Cart',
      loading: 'Loading products...',
      noProducts: 'No products found matching filters'
    },
    fr: {
      title: 'Boutique',
      filter: 'Filtrer',
      sortBy: 'Trier par',
      platform: 'Plateforme',
      availability: 'Disponibilité',
      inStockOnly: 'En stock uniquement',
      offersOnly: 'Offres uniquement',
      newlyArrived: 'Nouveautés (30 derniers jours)',
      bestSellersOnly: 'Meilleures ventes',
      price: 'Prix (DZD)',
      categoriesTitle: 'Catégories',
      addToCart: 'Ajouter au panier',
      loading: 'Chargement des produits...',
      noProducts: 'Aucun produit trouvé'
    },
    es: {
      title: 'Tienda',
      filter: 'Filtrar',
      sortBy: 'Ordenar por',
      platform: 'Plataforma',
      availability: 'Disponibilidad',
      inStockOnly: 'Solo en stock',
      offersOnly: 'Solo ofertas',
      newlyArrived: 'Novedades (últimos 30 días)',
      bestSellersOnly: 'Más vendidos',
      price: 'Precio (DZD)',
      categoriesTitle: 'Categorías',
      addToCart: 'Añadir al carrito',
      loading: 'Cargando productos...',
      noProducts: 'No se encontraron productos'
    }
  };

  const t = translations?.[currentLang]?.store || storeTranslations[currentLang] || storeTranslations['ar'];

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // حالات التحديد الديناميكي
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(location.state?.category || '');

  // حالات التوفر
  const [inStockOnly, setInStockOnly] = useState(false);
  const [offersOnly, setOffersOnly] = useState(location.state?.offersOnly || false);
  const [newlyArrived, setNewlyArrived] = useState(location.state?.newlyArrived || false);
  const [bestSellersOnly, setBestSellersOnly] = useState(location.state?.bestSellersOnly || false);

  // قاموس ترجمات الشارات لتتوافق وتترجم ديناميكياً مع الصفحة الرئيسية
  const badgeTranslations = {
    'تخفيض': { ar: 'تخفيض', en: 'Sale', fr: 'Promo', es: 'Oferta' },
    'Sale': { ar: 'تخفيض', en: 'Sale', fr: 'Promo', es: 'Oferta' },
    'جديد': { ar: 'جديد', en: 'New', fr: 'Nouveau', es: 'Nuevo' },
    'New': { ar: 'جديد', en: 'New', fr: 'Nouveau', es: 'Nuevo' },
    'الأكثر مبيعا': { ar: 'الأكثر مبيعة', en: 'Best Seller', fr: 'Meilleure vente', es: 'Más vendido' },
    'Best Seller': { ar: 'الأكثر مبيعة', en: 'Best Seller', fr: 'Meilleure vente', es: 'Más vendido' }
  };

  useEffect(() => {
    if (location.state?.offersOnly !== undefined) {
      setOffersOnly(location.state.offersOnly);
    }
    if (location.state?.newlyArrived !== undefined) {
      setNewlyArrived(location.state.newlyArrived);
    }
    if (location.state?.bestSellersOnly !== undefined) {
      setBestSellersOnly(location.state.bestSellersOnly);
    }
    if (location.state?.category !== undefined) {
      setSelectedCategory(location.state.category);
    }
  }, [location.state]);

  const [sortBy, setSortBy] = useState('newest');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(50000);
  const maxLimit = 100000;

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const totalPages = Math.ceil(products.length / itemsPerPage);
  const indexOfLastProduct = currentPage * itemsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - itemsPerPage;
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);

  const platforms = ['الكل', 'PS5', 'Xbox Series', 'PS4', 'Switch', 'Switch 2'];
  
  const categoriesList = [
    { key: 'الكل', ar: 'الكل', en: 'All', fr: 'Tous', es: 'Todos' },
    { key: 'إكسسوارات', ar: 'إكسسوارات', en: 'Accessories', fr: 'Accessoires', es: 'Accesorios' },
    { key: 'ألعاب', ar: 'ألعاب', en: 'Games', fr: 'Jeux', es: 'Juegos' },
    { key: 'بطاقات رقمية', ar: 'بطاقات رقمية', en: 'Digital Cards', fr: 'Cartes Cadeaux', es: 'Tarjetas Digitales' },
    { key: 'أجهزة الألعاب', ar: 'أجهزة الألعاب', en: 'Consoles', fr: 'Consoles', es: 'Consolas' },
    { key: 'اجهزة مستعملة', ar: 'اجهزة مستعملة', en: 'Used Consoles', fr: "Consoles d'occasion", es: 'Consolas usadas' },
    { key: 'مجسمات', ar: 'مجسمات', en: 'Figures', fr: 'Figurines', es: 'Figuras' },
  ];

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        let query = supabase.from('products').select('*');

        if (selectedPlatform && selectedPlatform !== 'الكل') {
          query = query.eq('platform', selectedPlatform);
        }

        if (selectedCategory && selectedCategory !== 'الكل') {
          query = query.eq('category', selectedCategory);
        }

        if (inStockOnly) {
          query = query.eq('in_stock', true);
        }

        if (offersOnly) {
          query = query.or('discount_price.gt.0,badge.eq.تخفيض,badge.eq.Sale,badge.eq.Promo,badge.eq.Oferta');
        }

        if (newlyArrived) {
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          query = query.gte('created_at', thirtyDaysAgo.toISOString());
        }

        if (bestSellersOnly) {
          query = query.or('badge.eq.الأكثر مبيعا,badge.eq.Best Seller,badge.eq.Meilleures ventes,badge.eq.Más vendidos');
        }

        if (location.state?.searchQuery) {
          query = query.ilike('title', `%${location.state.searchQuery}%`);
        }

        query = query.gte('price', minPrice).lte('price', maxPrice);

        if (sortBy === 'price_asc') {
          query = query.order('price', { ascending: true });
        } else if (sortBy === 'price_desc') {
          query = query.order('price', { ascending: false });
        } else {
          query = query.order('created_at', { ascending: false });
        }

        const { data, error } = await query;

        if (error) {
          console.error('Error fetching products:', error.message);
        } else {
          setProducts(data || []);
          setCurrentPage(1);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [selectedPlatform, selectedCategory, inStockOnly, offersOnly, newlyArrived, bestSellersOnly, minPrice, maxPrice, sortBy, location.state?.searchQuery]);

  // دالة تحديد كلاس الشارة
  const getBadgeClass = (badgeText) => {
    if (!badgeText) return 'sale-badge';
    if (['تخفيض', 'Sale', 'Promo', 'Oferta'].includes(badgeText)) return 'sale-badge';
    if (['جديد', 'New'].includes(badgeText)) return 'new-badge';
    return 'default-badge';
  };

  // دالة ترجمة الشارة
  const translateBadge = (rawBadge) => {
    if (!rawBadge) return '';
    const translatedObj = badgeTranslations[rawBadge];
    if (translatedObj) {
      return translatedObj[currentLang] || translatedObj['ar'] || rawBadge;
    }
    return rawBadge;
  };

  return (
    <div className="products-page-container" dir={isRtl ? 'rtl' : 'ltr'}>
      
      <h1 className="page-main-title">{t.title}</h1>

      <div className="advanced-filter-box">
        <div className="filter-box-header">
          <div className="filter-title-side">
            <Filter size={18} />
            <span>{t.filter}</span>
          </div>
          <div className="sort-side">
            <select 
              className="sort-btn" 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              style={{ cursor: 'pointer', outline: 'none', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '6px 12px' }}
            >
              <option value="newest">{isRtl ? 'الأحدث' : 'Newest'}</option>
              <option value="price_asc">{isRtl ? 'السعر: من الأقل للأعلى' : 'Price: Low to High'}</option>
              <option value="price_desc">{isRtl ? 'السعر: من الأعلى للأقل' : 'Price: High to Low'}</option>
            </select>
          </div>
        </div>

        <div className="filter-box-body">
          
          {/* المنصة */}
          <div className="filter-col">
            <h3 className="filter-col-title">{t.platform}</h3>
            <div className="filter-grid platform-grid">
              {platforms.map((plat) => (
                <button 
                  key={plat} 
                  className={`filter-item-btn ${(selectedPlatform === plat || (!selectedPlatform && plat === 'الكل')) ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedPlatform(plat === 'الكل' ? '' : plat);
                  }}
                >
                  {plat}
                </button>
              ))}
            </div>
          </div>

          {/* التوفر */}
          <div className="filter-col">
            <h3 className="filter-col-title">{t.availability}</h3>
            <div className="toggle-group">
              <label className="toggle-item">
                <span className="toggle-label">{t.inStockOnly}</span>
                <div className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={inStockOnly} 
                    onChange={() => setInStockOnly(!inStockOnly)} 
                  />
                  <span className="toggle-slider"></span>
                </div>
              </label>

              <label className="toggle-item">
                <span className="toggle-label">{t.offersOnly}</span>
                <div className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={offersOnly} 
                    onChange={() => setOffersOnly(!offersOnly)} 
                  />
                  <span className="toggle-slider"></span>
                </div>
              </label>

              <label className="toggle-item">
                <span className="toggle-label">{t.newlyArrived}</span>
                <div className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={newlyArrived} 
                    onChange={() => setNewlyArrived(!newlyArrived)} 
                  />
                  <span className="toggle-slider"></span>
                </div>
              </label>

              <label className="toggle-item">
                <span className="toggle-label">{t.bestSellersOnly}</span>
                <div className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={bestSellersOnly} 
                    onChange={() => setBestSellersOnly(!bestSellersOnly)} 
                  />
                  <span className="toggle-slider"></span>
                </div>
              </label>
            </div>
          </div>

          {/* السعر */}
          <div className="filter-col price-col">
            <h3 className="filter-col-title">{t.price}</h3>
            <div className="price-slider-wrapper">
              <div className="price-values">
                <span>{minPrice} DZD</span>
                <span>{maxPrice} DZD</span>
              </div>
              <div className="multi-range-slider">
                <input 
                  type="range" 
                  min="0" 
                  max={maxLimit} 
                  step="500" 
                  value={minPrice} 
                  onChange={(e) => setMinPrice(Math.min(Number(e.target.value), maxPrice - 500))} 
                  className="thumb thumb-min" 
                />
                <input 
                  type="range" 
                  min="0" 
                  max={maxLimit} 
                  step="500" 
                  value={maxPrice} 
                  onChange={(e) => setMaxPrice(Math.max(Number(e.target.value), minPrice + 500))} 
                  className="thumb thumb-max" 
                />
                <div className="slider-track"></div>
                <div 
                  className="slider-range" 
                  style={{ 
                    right: isRtl ? `${(minPrice / maxLimit) * 100}%` : 'auto',
                    left: isRtl ? 'auto' : `${(minPrice / maxLimit) * 100}%`, 
                    width: `${((maxPrice - minPrice) / maxLimit) * 100}%` 
                  }}
                ></div>
              </div>
            </div>
          </div>

          {/* الأقسام */}
          <div className="filter-col">
            <h3 className="filter-col-title" style={{ width: '100%', textAlign: isRtl ? 'right' : 'left' }}>
              {t.categoriesTitle}
            </h3>
            <div className="filter-pills-grid">
              {categoriesList.map((catObj) => (
                <button 
                  key={catObj.key} 
                  className={`filter-pill-btn ${(selectedCategory === catObj.key || (!selectedCategory && catObj.key === 'الكل')) ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedCategory(catObj.key === 'الكل' ? '' : catObj.key);
                  }}
                >
                  <span className="pill-text">{catObj[currentLang] || catObj.ar}</span>
                  <Gamepad2 size={16} className="pill-icon" />
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* شبكة المنتجات بتصميم مطابق تماماً للصفحة الرئيسية */}
      <div className="products-grid-4">
        {loading ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
            {t.loading}
          </div>
        ) : products.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
            {t.noProducts}
          </div>
        ) : (
          currentProducts.map((prod, idx) => {
            const rawBadge = prod.badge || (prod.discount_price ? 'تخفيض' : null);
            const displayedBadge = translateBadge(rawBadge);

            return (
              <div 
                key={prod.id} 
                className="product-card"
                onClick={() => navigate(`/product/${prod.id}`)}
                style={{ cursor: 'pointer', '--card-index': idx }}
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
                      onAddToCart && onAddToCart(prod);
                    }}
                  >
                    {t.addToCart}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ترقيم الصفحات */}
      {totalPages > 1 && (
        <div className="pagination-container">
          <button 
            className="page-nav-btn" 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          >
            {isRtl ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
            <button 
              key={pageNum} 
              className={`page-num-btn ${currentPage === pageNum ? 'active' : ''}`}
              onClick={() => setCurrentPage(pageNum)}
            >
              {pageNum}
            </button>
          ))}

          <button 
            className="page-nav-btn" 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          >
            {isRtl ? <ArrowLeft size={20} /> : <ArrowRight size={20} />}
          </button>
        </div>
      )}

    </div>
  );
}