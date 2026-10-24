import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Minus, Share2, ShieldCheck, Truck, CreditCard } from 'lucide-react';
import { supabase } from '../../supabaseClient';
import { translations } from '../../locales/translations';
import './ProductDetails.css';

export default function ProductDetails({ currentLang, onAddToCart }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const isRtl = currentLang === 'ar';

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  // ترجمات واجهة صفحة تفاصيل المنتج
  const localTranslations = {
    ar: {
      addToCart: 'أضف إلى السلة',
      cashOnDelivery: 'الدفع عند الاستلام',
      warranty: 'ضمان شهر كامل',
      fastShipping: 'التوصيل السريع',
      share: 'مشاركة',
      description: 'الوصف',
      relatedProducts: 'منتجات ذات صلة',
      viewAll: 'عرض الكل',
      loading: 'جاري تحميل تفاصيل المنتج...',
      notFound: 'المنتج غير موجود',
      backToStore: 'العودة للمتجر',
      noRelated: 'لا توجد منتجات ذات صلة حالياً'
    },
    en: {
      addToCart: 'Add to Cart',
      cashOnDelivery: 'Cash on Delivery',
      warranty: '1 Month Warranty',
      fastShipping: 'Fast Shipping',
      share: 'Share',
      description: 'Description',
      relatedProducts: 'Related Products',
      viewAll: 'View All',
      loading: 'Loading product details...',
      notFound: 'Product not found',
      backToStore: 'Back to store',
      noRelated: 'No related products found'
    },
    fr: {
      addToCart: 'Ajouter au panier',
      cashOnDelivery: 'Paiement à la livraison',
      warranty: 'Garantie 1 mois',
      fastShipping: 'Livraison rapide',
      share: 'Partager',
      description: 'Description',
      relatedProducts: 'Produits similaires',
      viewAll: 'Voir tout',
      loading: 'Chargement des détails...',
      notFound: 'Produit non trouvé',
      backToStore: 'Retour à la boutique',
      noRelated: 'Aucun produit similaire trouvé'
    },
    es: {
      addToCart: 'Añadir al carrito',
      cashOnDelivery: 'Pago contra entrega',
      warranty: 'Garantía de 1 mes',
      fastShipping: 'Envío rápido',
      share: 'Compartir',
      description: 'Descripción',
      relatedProducts: 'Productos relacionados',
      viewAll: 'Ver todo',
      loading: 'Cargando detalles del producto...',
      notFound: 'Producto no encontrado',
      backToStore: 'Volver a la tienda',
      noRelated: 'No se encontraron productos relacionados'
    }
  };

  const t = translations?.[currentLang]?.productDetails || localTranslations[currentLang] || localTranslations['ar'];

  // جلب بيانات المنتج والمنتجات ذات الصلة من Supabase
  useEffect(() => {
    async function fetchProductDetails() {
      setLoading(true);
      try {
        const { data: currentProd, error: prodError } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();

        if (prodError) {
          console.error('Error fetching product:', prodError.message);
        } else {
          setProduct(currentProd);

          const { data: related, error: relError } = await supabase
            .from('products')
            .select('*')
            .neq('id', id)
            .eq('category', currentProd.category || '')
            .limit(4);

          if (!relError && related) {
            setRelatedProducts(related);
          }
        }
      } catch (err) {
        console.error('Unexpected error:', err);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchProductDetails();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [id]);

  const handleQuantityChange = (type) => {
    if (type === 'inc') {
      setQuantity((prev) => prev + 1);
    } else if (type === 'dec' && quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  // دالة الشراء والإضافة إلى السلة بالسعر الصحيح (سعر التخفيض إذا وجد)
  const handleAddToCart = (item, qty = 1) => {
    const finalPrice = (item.discount_price && Number(item.discount_price) > 0)
      ? item.discount_price
      : item.price;

    const itemToAdd = {
      ...item,
      price: finalPrice, // اعتماد السعر المخفض في السلة
      quantity: qty
    };

    if (onAddToCart) {
      onAddToCart(itemToAdd);
    }
  };

  if (loading) {
    return (
      <div className="product-details-container loading-state">
        <p>{t.loading}</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-details-container error-state">
        <h2>{t.notFound}</h2>
        <button className="back-btn" onClick={() => navigate('/products')}>
          {t.backToStore}
        </button>
      </div>
    );
  }

  // معرفة هل المنتج يحتوي على تخفيض أم لا
  const hasDiscount = product.discount_price && Number(product.discount_price) > 0;

  return (
    <div className="product-details-container" dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* 1. القسم العلوي الرئيسي للمنتج */}
      <div className="product-main-grid">
        
        {/* صندوق التفاصيل والشراء */}
        <div className="product-info-box">
          <span className="product-category-tag">{product.category || 'jeux retro'}</span>
          <h1 className="product-main-title">{product.title}</h1>

          {/* عرض السعر بناءً على وجود تخفيض أم لا */}
          <div className="product-price-tag" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {hasDiscount ? (
              <>
                <span style={{ color: '#dc2626', fontWeight: '800' }}>
                  {product.discount_price} DZD
                </span>
                <span style={{ fontSize: '18px', color: '#94a3b8', textDecoration: 'line-through', fontWeight: '500' }}>
                  {product.price} DZD
                </span>
              </>
            ) : (
              <span>{product.price} DZD</span>
            )}
          </div>

          <p className="product-short-desc">
            {product.description || 'BATMAN: ARKHAM CITY | PS3 (NTSC-J) Donnez une dimension supérieure à votre collection PlayStation 3 avec Batman: Arkham City en édition originale japonaise.'}
          </p>

          {/* عداد الكمية */}
          <div className="quantity-selector">
            <button className="qty-btn" onClick={() => handleQuantityChange('inc')}>
              <Plus size={16} />
            </button>
            <span className="qty-value">{quantity}</span>
            <button className="qty-btn" onClick={() => handleQuantityChange('dec')}>
              <Minus size={16} />
            </button>
          </div>

          {/* زر إضافة للسلة بالسعر المخفض */}
          <button 
            className="main-add-to-cart-btn"
            onClick={() => handleAddToCart(product, quantity)}
          >
            {t.addToCart}
          </button>

          {/* مميزات الخدمة والتوصيل */}
          <div className="product-features-badges">
            <div className="feature-badge-item">
              <CreditCard size={18} />
              <span>{t.cashOnDelivery}</span>
            </div>
            <div className="feature-badge-item">
              <ShieldCheck size={18} />
              <span>{t.warranty}</span>
            </div>
            <div className="feature-badge-item">
              <Truck size={18} />
              <span>{t.fastShipping}</span>
            </div>
          </div>

          {/* مشاركة المنتج */}
          <div className="share-section">
            <span className="share-title">{t.share}:</span>
            <div className="share-circles">
              <button className="share-circle-btn"><Share2 size={16} /></button>
            </div>
          </div>
        </div>

        {/* صندوق صورة المنتج */}
        <div className="product-image-box">
          {product.image_url ? (
            <img src={product.image_url} alt={product.title} className="product-detail-img" />
          ) : (
            <div className="photo-placeholder">photo</div>
          )}
        </div>

      </div>

      <hr className="section-divider" />

      {/* 2. قسم الوصف التفصيلي الكامل */}
      <div className="product-full-description-section">
        <h2 className="desc-section-title">{t.description}</h2>
        <h3 className="desc-subtitle">{product.title}</h3>
        <p className="desc-full-text">
          {product.full_description || product.description || 'Donnez une dimension supérieure à votre collection PlayStation 3 avec Batman: Arkham City en édition originale japonaise (NTSC-J). Développé par Rocksteady Studios et édité par Warner Bros. Interactive Entertainment, ce chef-d\'œuvre du jeu d\'action-aventure super-héroïque a redéfini le genre.'}
        </p>
      </div>

      <hr className="section-divider" />

      {/* 3. قسم منتجات ذات صلة */}
      <div className="related-products-section">
        <div className="related-header">
          <h2 className="related-title">{t.relatedProducts}</h2>
          <button className="view-all-related-btn" onClick={() => navigate('/products')}>
            {t.viewAll}
          </button>
        </div>

        <div className="related-products-grid">
          {relatedProducts.length > 0 ? (
            relatedProducts.map((relProd) => {
              const relHasDiscount = relProd.discount_price && Number(relProd.discount_price) > 0;

              return (
                <div key={relProd.id} className="product-card" onClick={() => navigate(`/product/${relProd.id}`)}>
                  {relProd.badge && <span className="product-badge">{relProd.badge}</span>}
                  <div className="product-image-container">
                    {relProd.image_url ? (
                      <img src={relProd.image_url} alt={relProd.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span>photo</span>
                    )}
                  </div>
                  <div className="product-info">
                    <h3 className="product-title">{relProd.title}</h3>
                    <div className="product-price-stock" style={{ justifyContent: 'center' }}>
                      <span className="product-price" style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        {relHasDiscount ? (
                          <>
                            <span style={{ color: '#dc2626', fontWeight: '800' }}>{relProd.discount_price} DZD</span>
                            <span style={{ fontSize: '11px', color: '#94a3b8', textDecoration: 'line-through' }}>{relProd.price} DZD</span>
                          </>
                        ) : (
                          <span>{relProd.price} DZD</span>
                        )}
                      </span>
                    </div>
                    <button 
                      className="add-to-cart-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(relProd, 1);
                      }}
                    >
                      {t.addToCart}
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#94a3b8' }}>
              {t.noRelated}
            </p>
          )}
        </div>
      </div>

    </div>
  );
}