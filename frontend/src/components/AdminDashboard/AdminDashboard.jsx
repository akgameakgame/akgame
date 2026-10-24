import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, ShoppingBag, PackagePlus, Package, 
  ArrowLeft, Search, Trash2, Edit, Plus, Image as ImageIcon, Upload, X,
  DollarSign, TrendingUp, RefreshCw, ArrowUpRight, ArrowDownRight, CheckCircle2, AlertTriangle, AlertCircle
} from 'lucide-react';
import { supabase } from '../../supabaseClient';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // حالة النافذة المنبثقة للإشعارات والتنبيهات
  const [modal, setModal] = useState({ show: false, message: '', title: '', type: 'success' });

  // حالة نافذة تأكيد الحذف المخصصة (بديل window.confirm)
  const [confirmModal, setConfirmModal] = useState({ show: false, title: '', message: '', onConfirm: null });

  // حالات نموذج إضافة منتج جديد
  const [newTitle, setNewTitle] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newDiscountPrice, setNewDiscountPrice] = useState('');
  const [newBadge, setNewBadge] = useState('');
  const [newCategory, setNewCategory] = useState('أجهزة');
  const [newDescription, setNewDescription] = useState('');
  
  // الملفات المعاينة
  const [selectedFiles, setSelectedFiles] = useState([]); 
  const [previewUrls, setPreviewUrls] = useState([]);
  const [isSubmittingProduct, setIsSubmittingProduct] = useState(false);

  // دالة إظهار النافذة المنبثقة الإشعارية
  const showModal = (message, title = '', type = 'success') => {
    setModal({
      show: true,
      message,
      title: title || (type === 'success' ? 'تمت العملية بنجاح' : 'تنبيه'),
      type
    });
  };

  const closeModal = () => {
    setModal({ ...modal, show: false });
  };

  // دالة إظهار نافذة التأكيد قبل الإجراءات الحساسة
  const askConfirmation = (title, message, onConfirmAction) => {
    setConfirmModal({
      show: true,
      title,
      message,
      onConfirm: async () => {
        setConfirmModal({ show: false, title: '', message: '', onConfirm: null });
        await onConfirmAction();
      }
    });
  };

  useEffect(() => {
    fetchOrders();
    fetchProducts();
  }, []);

  const fetchOrders = async () => {
    const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (!error && data) setOrders(data);
    setLoading(false);
  };

  const fetchProducts = async () => {
    const { data, error } = await supabase.from('products').select('*').order('id', { ascending: false });
    if (!error && data) setProducts(data);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
    if (!error) {
      setOrders(orders.map(order => order.id === orderId ? { ...order, status: newStatus } : order));
      showModal('تم تحديث حالة الطلب بنجاح.', 'تحديث الطلب', 'success');
    }
  };

  // معالجة حذف الطلب باستعمال نافذة التأكيد الاحترافية المخصصة
  const handleDeleteOrder = (orderId) => {
    askConfirmation('تأكيد حذف الطلب', 'هل أنت تأكد من رغبتك في حذف هذا الطلب نهائياً؟', async () => {
      const { error } = await supabase.from('orders').delete().eq('id', orderId);
      if (!error) {
        setOrders(orders.filter(order => order.id !== orderId));
        showModal('تم حذف الطلب المحدد بنجاح.', 'حذف الطلب', 'success');
      }
    });
  };

  // معالجة حذف المنتج باستعمال نافذة التأكيد الاحترافية المخصصة
  const handleDeleteProduct = (productId) => {
    askConfirmation('تأكيد حذف المنتج', 'هل أنت تأكد من رغبتك في حذف هذا المنتج نهائياً من المتجر؟', async () => {
      const { error } = await supabase.from('products').delete().eq('id', productId);
      if (!error) {
        setProducts(products.filter(p => p.id !== productId));
        showModal('تم حذف المنتج بنجاح من القائمة.', 'حذف منتج', 'success');
      }
    });
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    
    if (selectedFiles.length + files.length > 5) {
      showModal('يمكنك اختيار 5 صور كحد أقصى للمنتج الواحد.', 'تنبيه الرفع', 'error');
      return;
    }

    const updatedFiles = [...selectedFiles, ...files];
    setSelectedFiles(updatedFiles);

    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviewUrls([...previewUrls, ...newPreviews]);
  };

  const handleRemoveImage = (index) => {
    const updatedFiles = selectedFiles.filter((_, i) => i !== index);
    const updatedPreviews = previewUrls.filter((_, i) => i !== index);
    setSelectedFiles(updatedFiles);
    setPreviewUrls(updatedPreviews);
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newTitle || !newPrice) {
      showModal('يرجى ملء كافة الحقول الأساسية (اسم المنتج والسعر الأصلي).', 'حقول ناقصة', 'error');
      return;
    }

    setIsSubmittingProduct(true);

    try {
      const uploadedImageUrls = [];

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${i}.${fileExt}`;
        const filePath = `products/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, file);

        if (uploadError) {
          console.error('Error uploading image:', uploadError.message);
          continue;
        }

        const { data: publicUrlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);

        if (publicUrlData?.publicUrl) {
          uploadedImageUrls.push(publicUrlData.publicUrl);
        }
      }

      const mainImg = uploadedImageUrls[0] || '/logo.jpg';
      const finalBadge = newDiscountPrice ? 'تخفيض' : (newBadge || null);

      const productPayload = {
        title: newTitle,
        price: Number(newPrice),
        discount_price: newDiscountPrice ? Number(newDiscountPrice) : null,
        badge: finalBadge,
        category: newCategory,
        description: newDescription,
        image_url: mainImg,
        images: uploadedImageUrls
      };

      const { error } = await supabase.from('products').insert([productPayload]);

      if (error) {
        console.error('Error adding product:', error.message);
        showModal('حدث خطأ أثناء حفظ المنتج في قاعدة البيانات.', 'خطأ في الحفظ', 'error');
      } else {
        showModal('تمت إضافة المنتج ورفع كافة الصور الخاصة به بنجاح!', 'تم بنجاح 🎉', 'success');
        
        setNewTitle('');
        setNewPrice('');
        setNewDiscountPrice('');
        setNewBadge('');
        setNewDescription('');
        setSelectedFiles([]);
        setPreviewUrls([]);
        fetchProducts();
        setActiveTab('products');
      }
    } catch (err) {
      console.error(err);
      showModal('حدث خطأ غير متوقع أثناء معالجة الطلب.', 'خطأ غير متوقع', 'error');
    } finally {
      setIsSubmittingProduct(false);
    }
  };

  const totalRevenue = orders.reduce((sum, order) => sum + (Number(order.total_amount) || 0), 0);
  const pendingOrdersCount = orders.filter(o => o.status === 'pending').length;

  const getTopSellingProducts = () => {
    const productStats = {};
    orders.forEach(order => {
      if (Array.isArray(order.items)) {
        order.items.forEach(item => {
          if (!productStats[item.title]) {
            productStats[item.title] = {
              title: item.title,
              category: item.category || 'ألعاب / إكسسوارات',
              sold: 0,
              revenue: 0,
              image: item.image || item.image_url
            };
          }
          productStats[item.title].sold += (item.quantity || 1);
          productStats[item.title].revenue += ((item.price || 0) * (item.quantity || 1));
        });
      }
    });

    return Object.values(productStats)
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 5);
  };

  const topProducts = getTopSellingProducts();

  return (
    <div className="admin-layout" dir="rtl">
      
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <h2 className="admin-brand">AKGAME <span>ADMIN</span></h2>
        </div>

        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <LayoutDashboard size={20} />
            <span>الإحصائيات</span>
          </button>

          <button 
            className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <ShoppingBag size={20} />
            <span>إدارة الطلبات</span>
            {pendingOrdersCount > 0 && <span className="badge-count">{pendingOrdersCount}</span>}
          </button>

          <button 
            className={`nav-item ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            <Package size={20} />
            <span>إدارة المنتجات</span>
          </button>

          <button 
            className={`nav-item ${activeTab === 'add-product' ? 'active' : ''}`}
            onClick={() => setActiveTab('add-product')}
          >
            <PackagePlus size={20} />
            <span>إضافة منتج</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <button className="back-store-btn" onClick={() => navigate('/')}>
            <ArrowLeft size={18} />
            <span>العودة للمتجر</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-content">
        
        {/* overview tab */}
        {activeTab === 'overview' && (
          <div className="tab-content">
            <h1 className="content-title">نظرة عامة على المتجر</h1>
            
            <div className="stats-grid-modern">
              <div className="stat-card-modern green-theme">
                <div className="stat-card-header">
                  <span className="stat-card-title">إجمالي المبيعات</span>
                  <div className="stat-icon-wrapper"><DollarSign size={18} /></div>
                </div>
                <div className="stat-card-body">
                  <h2 className="stat-card-value">{totalRevenue.toLocaleString()} دج</h2>
                  <div className="stat-trend positive"><ArrowUpRight size={14} /><span>+18.2%</span></div>
                </div>
                <div className="stat-wave-bg"></div>
              </div>

              <div className="stat-card-modern teal-theme">
                <div className="stat-card-header">
                  <span className="stat-card-title">متوسط قيمة الطلب</span>
                  <div className="stat-icon-wrapper"><ShoppingBag size={18} /></div>
                </div>
                <div className="stat-card-body">
                  <h2 className="stat-card-value">
                    {orders.length > 0 ? (totalRevenue / orders.length).toFixed(0) : 0} دج
                  </h2>
                  <div className="stat-trend positive"><ArrowUpRight size={14} /><span>+4.8%</span></div>
                </div>
                <div className="stat-wave-bg"></div>
              </div>

              <div className="stat-card-modern blue-theme">
                <div className="stat-card-header">
                  <span className="stat-card-title">إجمالي الطلبات</span>
                  <div className="stat-icon-wrapper"><TrendingUp size={18} /></div>
                </div>
                <div className="stat-card-body">
                  <h2 className="stat-card-value">{orders.length} طلب</h2>
                  <div className="stat-trend positive"><ArrowUpRight size={14} /><span>+0.8%</span></div>
                </div>
                <div className="stat-wave-bg"></div>
              </div>

              <div className="stat-card-modern orange-theme">
                <div className="stat-card-header">
                  <span className="stat-card-title">الطلبات المعلقة</span>
                  <div className="stat-icon-wrapper"><RefreshCw size={18} /></div>
                </div>
                <div className="stat-card-body">
                  <h2 className="stat-card-value">{pendingOrdersCount}</h2>
                  <div className="stat-trend negative"><ArrowDownRight size={14} /><span>-0.3%</span></div>
                </div>
                <div className="stat-wave-bg"></div>
              </div>
            </div>

            <div className="top-selling-card">
              <div className="top-selling-header">
                <div>
                  <h3 className="top-selling-title">المنتجات الأكثر مبيعاً</h3>
                  <p className="top-selling-sub">أفضل الأداء والمبيعات بناءً على طلبات المتجر</p>
                </div>
                <button className="view-all-btn" onClick={() => setActiveTab('products')}>
                  عرض الكل &rarr;
                </button>
              </div>

              <div className="table-responsive">
                <table className="top-selling-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>المنتج</th>
                      <th>المبيعات</th>
                      <th>الإيرادات</th>
                      <th>المؤشر</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topProducts.length > 0 ? (
                      topProducts.map((prod, index) => (
                        <tr key={index}>
                          <td className="rank-td">{index + 1}</td>
                          <td className="product-info-td">
                            <div className="top-prod-details">
                              <span className="top-prod-name">{prod.title}</span>
                              <span className="top-prod-cat">{prod.category}</span>
                            </div>
                          </td>
                          <td className="sold-count-td">{prod.sold} قطعة</td>
                          <td className="revenue-td">{prod.revenue.toLocaleString()} دج</td>
                          <td className="trend-td"><div className="mini-trend-wave"></div></td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center', color: '#94a3b8', padding: '30px' }}>
                          لا توجد مبيعات مسجلة حتى الآن
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* orders tab */}
        {activeTab === 'orders' && (
          <div className="tab-content">
            <div className="content-header-row">
              <h1 className="content-title">إدارة الطلبات</h1>
              <div className="search-box">
                <Search size={18} />
                <input 
                  type="text" 
                  placeholder="بحث باسم العميل أو رقم الهاتف..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {loading ? (
              <p className="loading-text">جاري تحميل الطلبات...</p>
            ) : (
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>رقم الطلب</th>
                      <th>العميل</th>
                      <th>الهاتف</th>
                      <th>العنوان</th>
                      <th>المنتجات</th>
                      <th>المجموع</th>
                      <th>الحالة</th>
                      <th>إجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders
                      .filter(o => o.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) || o.phone?.includes(searchQuery))
                      .map((order) => (
                        <tr key={order.id}>
                          <td>#{order.id}</td>
                          <td><strong>{order.customer_name}</strong></td>
                          <td>{order.phone}</td>
                          <td>{order.wilaya} - {order.commune}</td>
                          <td>
                            <ul className="order-items-mini-list">
                              {Array.isArray(order.items) && order.items.map((item, idx) => (
                                <li key={idx}>{item.title} (x{item.quantity})</li>
                              ))}
                            </ul>
                          </td>
                          <td className="price-td">{order.total_amount} دج</td>
                          <td>
                            <select 
                              className={`status-select ${order.status}`}
                              value={order.status || 'pending'}
                              onChange={(e) => handleStatusChange(order.id, e.target.value)}
                            >
                              <option value="pending">معلق 🟡</option>
                              <option value="in_delivery">جاري التوصيل 🔵</option>
                              <option value="delivered">تم التوصيل 🟢</option>
                              <option value="cancelled">ملغي 🔴</option>
                            </select>
                          </td>
                          <td>
                            <button className="icon-delete-btn" onClick={() => handleDeleteOrder(order.id)}>
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* products tab */}
        {activeTab === 'products' && (
          <div className="tab-content">
            <div className="content-header-row">
              <h1 className="content-title">إدارة المنتجات ({products.length})</h1>
              <button className="add-product-quick-btn" onClick={() => setActiveTab('add-product')}>
                + إضافة منتج جديد
              </button>
            </div>

            <div className="products-admin-grid">
              {products.map((p) => (
                <div key={p.id} className="product-admin-card">
                  <div className="p-admin-img-box">
                    <img src={p.image_url || p.image || '/logo.jpg'} alt={p.title} className="p-admin-img" />
                    <span className="p-admin-category">{p.category || 'عام'}</span>
                  </div>

                  <div className="p-admin-info">
                    <h4 className="p-admin-title">{p.title}</h4>
                    <div className="p-admin-price-row">
                      <div className="p-price-block">
                        {p.discount_price ? (
                          <>
                            <span className="p-admin-price discount">{p.discount_price} دج</span>
                            <span className="p-admin-old-price">{p.price} دج</span>
                          </>
                        ) : (
                          <span className="p-admin-price">{p.price} دج</span>
                        )}
                      </div>
                      <div className="p-admin-actions">
                        <button className="action-btn edit-btn" title="تعديل">
                          <Edit size={16} />
                        </button>
                        <button className="action-btn delete-btn" title="حذف" onClick={() => handleDeleteProduct(p.id)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* add-product tab */}
        {activeTab === 'add-product' && (
          <div className="tab-content">
            <h1 className="content-title">إضافة منتج جديد</h1>
            <p className="sub-text">أدخل تفاصيل المنتج وارفع حتى 5 صور من جهازك مباشرة.</p>

            <form onSubmit={handleAddProduct} className="add-product-form-card">
              
              <div className="form-group">
                <label>اسم المنتج *</label>
                <input 
                  type="text" 
                  className="admin-input" 
                  placeholder="مثال: PS5 Slim Edition"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-grid-2" style={{ marginTop: '16px' }}>
                <div className="form-group">
                  <label>السعر الأصلي (دج) *</label>
                  <input 
                    type="number" 
                    className="admin-input" 
                    placeholder="مثال: 95000"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>السعر بعد التخفيض (دج) - اختياري</label>
                  <input 
                    type="number" 
                    className="admin-input" 
                    placeholder="مثال: 85000"
                    value={newDiscountPrice}
                    onChange={(e) => setNewDiscountPrice(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-grid-2" style={{ marginTop: '16px' }}>
                <div className="form-group">
                  <label>الفئة / القسم *</label>
                  <select 
                    className="admin-select"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                  >
                    <option value="أجهزة">أجهزة (Consoles)</option>
                    <option value="ألعاب">ألعاب (Games)</option>
                    <option value="إكسسوارات">إكسسوارات (Accessories)</option>
                    <option value="بطاقات رقمية">بطاقات رقمية (Digital Cards)</option>
                    <option value="مجسمات">مجسمات (Figures)</option>
                    <option value="اجهزة مستعملة">أجهزة مستعملة (Used Consoles)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>الشارة اليدوية (Badge)</label>
                  <select 
                    className="admin-select"
                    value={newBadge}
                    onChange={(e) => setNewBadge(e.target.value)}
                  >
                    <option value="">بدون شارة تلقائية</option>
                    <option value="الأكثر مبيعا">🔥 الأكثر مبيعاً</option>
                    <option value="رقمي">⚡ منتج رقمي</option>
                    <option value="مجسمات">🗿 مجسمات</option>
                    <option value="جديد">✨ جديد</option>
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '16px' }}>
                <label>وصف قصير للمنتج</label>
                <input 
                  type="text" 
                  className="admin-input" 
                  placeholder="وصف مختصر عن المميزات..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                />
              </div>

              <div className="images-upload-section">
                <h3 className="section-sub-title">
                  <ImageIcon size={18} />
                  <span>صور المنتج (اختر حتى 5 صور من جهازك)</span>
                </h3>

                {selectedFiles.length < 5 && (
                  <div className="file-dropzone-box">
                    <input 
                      type="file" 
                      accept="image/*" 
                      multiple 
                      id="product-file-input"
                      onChange={handleFileSelect}
                      style={{ display: 'none' }}
                    />
                    <label htmlFor="product-file-input" className="file-dropzone-label">
                      <Upload size={32} />
                      <span>اضغط هنا لاختيار الصور من الجهاز</span>
                      <small>(يمكنك رفع {5 - selectedFiles.length} صور إضافية)</small>
                    </label>
                  </div>
                )}

                {previewUrls.length > 0 && (
                  <div className="selected-previews-grid">
                    {previewUrls.map((url, index) => (
                      <div key={index} className="preview-image-card">
                        <img src={url} alt={`معاينة ${index + 1}`} />
                        {index === 0 && <span className="main-tag">الرئيسية</span>}
                        <button 
                          type="button" 
                          className="remove-img-btn"
                          onClick={() => handleRemoveImage(index)}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button 
                type="submit" 
                className="save-product-btn"
                disabled={isSubmittingProduct}
              >
                <Plus size={18} />
                <span>{isSubmittingProduct ? 'جاري رفع الصور ونشر المنتج...' : 'حفظ ونشر المنتج'}</span>
              </button>

            </form>
          </div>
        )}

      </main>

      {/* 1. النافذة المنبثقة للإشعارات والتنبيهات العامة */}
      {modal.show && (
        <div className="center-modal-overlay" onClick={closeModal}>
          <div className={`center-modal-card ${modal.type}`} onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-icon" onClick={closeModal}>
              <X size={18} />
            </button>

            <div className="modal-icon-badge">
              {modal.type === 'success' ? (
                <CheckCircle2 size={36} color="#22c55e" />
              ) : (
                <AlertTriangle size={36} color="#ef4444" />
              )}
            </div>

            <h3 className="modal-title">{modal.title}</h3>
            <p className="modal-message">{modal.message}</p>

            <button className="modal-confirm-btn" onClick={closeModal}>
              موافق
            </button>
          </div>
        </div>
      )}

      {/* 2. نافذة التأكيد قبل الحذف احترافية وبشكل مرتب في منتصف الشاشة */}
      {confirmModal.show && (
        <div className="center-modal-overlay" onClick={() => setConfirmModal({ ...confirmModal, show: false })}>
          <div className="center-modal-card confirm-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-icon" onClick={() => setConfirmModal({ ...confirmModal, show: false })}>
              <X size={18} />
            </button>

            <div className="modal-icon-badge danger">
              <AlertCircle size={38} color="#ef4444" />
            </div>

            <h3 className="modal-title">{confirmModal.title}</h3>
            <p className="modal-message">{confirmModal.message}</p>

            <div className="modal-actions-row">
              <button className="modal-btn cancel-btn" onClick={() => setConfirmModal({ ...confirmModal, show: false })}>
                إلغاء
              </button>
              <button className="modal-btn delete-confirm-btn" onClick={confirmModal.onConfirm}>
                تأكيد الحذف
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}