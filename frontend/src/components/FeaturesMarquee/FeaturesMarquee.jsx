import React from 'react';
import { translations } from '../../locales/translations';
import './FeaturesMarquee.css';

export default function FeaturesMarquee({ currentLang }) {
  // جلب الترجمات الخاصة بالشريط بناءً على اللغة الحالية، أو الرجوع للعربية كافتراضي
  const t = translations[currentLang]?.marquee || translations['ar'].marquee;

  const features = [
    t.original,
    t.warranty,
    t.delivery,
    t.cod,
  ];

  return (
    <div className="marquee-container">
      <div className="marquee-track">
        {/* تكرار العناصر لضمان استمرارية الحركة بسلاسة تامة */}
        {[...features, ...features, ...features].map((feature, index) => (
          <div className="marquee-item" key={index}>
            <span>{feature}</span>
          </div>
        ))}
      </div>
    </div>
  );
}