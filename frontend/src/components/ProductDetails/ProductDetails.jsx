import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Minus, Share2, ShieldCheck, Truck, CreditCard, ChevronLeft, ChevronRight, Check } from 'lucide-react';
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

  // حالة الصورة المعروضة مع مصفوفة الصور
  const [productImages, setProductImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // حالة إظهار تم النسخ بنجاح
  const [copied, setCopied] = useState(false);

  // ترجمات واجهة صفحة تفاصيل المنتج
  const localTranslations = {
    ar: {
      addToCart: 'أضف إلى السلة',
      cashOnDelivery: 'الدفع عند الاستلام',
      warranty: 'ضمان شهر كامل',
      fastShipping: 'التوصيل السريع',
      share: 'مشاركة',
      copiedText: 'تم نسخ الرابط بنجاح!',
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
      copiedText: 'Link copied to clipboard!',
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
      copiedText: 'Lien copié dans le presse-papier !',
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
      copiedText: '¡Enlace copiado al portapapeles!',
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

          let imgs = [];
          if (Array.isArray(currentProd.images) && currentProd.images.length > 0) {
            imgs = currentProd.images;
          } else if (Array.isArray(currentProd.images_url) && currentProd.images_url.length > 0) {
            imgs = currentProd.images_url;
          } else if (typeof currentProd.image_url === 'string' && currentProd.image_url.includes(',')) {
            imgs = currentProd.image_url.split(',').map((url) => url.trim());
          } else if (currentProd.image_url) {
            imgs = [currentProd.image_url];
          }

          setProductImages(imgs);
          setCurrentImageIndex(0);

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

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? productImages.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === productImages.length - 1 ? 0 : prev + 1));
  };

  // دالة المشاركة والنسخ
  const handleShare = async () => {
    const shareData = {
      title: product?.title || 'AKGAME Store',
      text: `شاهد هذا المنتج المميز في متجر AKGAME: ${product?.title}`,
      url: window.location.href,
    };

    // تجربة فتح نافذة المشاركة المباشرة للهواتف (Native Web Share)
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        console.log('Share error/cancelled:', err);
      }
    }

    // إذا كان المتصفح على الكمبيوتر أو لا يدعم Web Share يتم نسخ الرابط
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleAddToCart = (item, qty = 1) => {
    const finalPrice = (item.discount_price && Number(item.discount_price) > 0)
      ? item.discount_price
      : item.price;

    const itemToAdd = {
      ...item,
      price: finalPrice,
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

  const hasDiscount = product.discount_price && Number(product.discount_price) > 0;

  return (
    <div className="product-details-container" dir={isRtl ? 'rtl' : 'ltr'}>
      
      <div className="product-main-grid">
        
        {/* صندوق التفاصيل والشراء */}
        <div className="product-info-box">
          <span className="product-category-tag">{product.category || 'jeux retro'}</span>
          <h1 className="product-main-title">{product.title}</h1>

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
            {product.description || 'BATMAN: ARKHAM CITY | PS3 (NTSC-J)'}
          </p>

          <div className="quantity-selector">
            <button className="qty-btn" onClick={() => handleQuantityChange('inc')}>
              <Plus size={16} />
            </button>
            <span className="qty-value">{quantity}</span>
            <button className="qty-btn" onClick={() => handleQuantityChange('dec')}>
              <Minus size={16} />
            </button>
          </div>

          <button 
            className="main-add-to-cart-btn"
            onClick={() => handleAddToCart(product, quantity)}
          >
            {t.addToCart}
          </button>

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

          {/* زر المشاركة التفاعلي */}
          <div className="share-section">
            <span className="share-title">{t.share}:</span>
            <div className="share-circles">
              <button 
                className={`share-circle-btn ${copied ? 'copied-btn' : ''}`}
                onClick={handleShare}
                title={t.share}
              >
                {copied ? <Check size={16} color="#4ade80" /> : <Share2 size={16} />}
              </button>
            </div>
            {copied && <span className="copied-toast-msg">{t.copiedText}</span>}
          </div>
        </div>

        {/* معرض الصور والتنقل */}
        <div className="product-gallery-wrapper">
          <div className="product-image-box">
            {productImages.length > 0 ? (
              <img 
                src={productImages[currentImageIndex]} 
                alt={`${product.title} - ${currentImageIndex + 1}`} 
                className="product-detail-img" 
              />
            ) : (
              <div className="photo-placeholder">photo</div>
            )}

            {productImages.length > 1 && (
              <>
                <button 
                  className="gallery-nav-btn gallery-prev-btn" 
                  onClick={handlePrevImage}
                  aria-label="Previous Image"
                >
                  {isRtl ? <ChevronRight size={24} /> : <ChevronLeft size={24} />}
                </button>
                <button 
                  className="gallery-nav-btn gallery-next-btn" 
                  onClick={handleNextImage}
                  aria-label="Next Image"
                >
                  {isRtl ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}
                </button>
                
                <div className="gallery-counter">
                  {currentImageIndex + 1} / {productImages.length}
                </div>
              </>
            )}
          </div>

          {productImages.length > 1 && (
            <div className="product-thumbnails-bar">
              {productImages.map((imgUrl, index) => (
                <div
                  key={index}
                  className={`thumbnail-item ${index === currentImageIndex ? 'active-thumb' : ''}`}
                  onClick={() => setCurrentImageIndex(index)}
                >
                  <img src={imgUrl} alt={`Thumbnail ${index + 1}`} />
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      <hr className="section-divider" />

      {/* الوصف والمنتجات ذات الصلة */}
      <div className="product-full-description-section">
        <h2 className="desc-section-title">{t.description}</h2>
        <h3 className="desc-subtitle">{product.title}</h3>
        <p className="desc-full-text">
          {product.full_description || product.description}
        </p>
      </div>

      <hr className="section-divider" />

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