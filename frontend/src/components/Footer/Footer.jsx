import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Phone, MapPin } from 'lucide-react';
import { translations } from '../../locales/translations';
import './Footer.css';

export default function Footer({ currentLang }) {
  const t = translations?.[currentLang]?.footer || translations?.['ar']?.footer || {};
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavClick = (e, targetId) => {
    e.preventDefault();
    
    if (location.pathname !== '/') {
      // الانتقال أولاً للصفحة الرئيسية ثم التمرير للقسم
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById(targetId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 150);
    } else {
      // إذا كان في الصفحة الرئيسية ينزل مباشرة للقسم
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <footer className="footer-container">
      <div className="footer-content">
        
        <div className="footer-col contact-col">
          <h3 className="footer-title">{t.contactTitle}</h3>
          <div className="contact-item">
            <span className="contact-text" dir="ltr">0541721442</span>
            <Phone size={16} className="contact-icon" />
          </div>
          <div className="contact-item">
            <span className="contact-text" dir="ltr">0778980164</span>
            <Phone size={16} className="contact-icon" />
          </div>
          <div className="contact-item">
            <span className="contact-text">{t.address}</span>
            <MapPin size={16} className="contact-icon" />
          </div>
        </div>

        <div className="footer-divider"></div>

        <div className="footer-col links-col">
          <h3 className="footer-title">{t.linksTitle}</h3>
          <ul className="footer-links-list">
            <li><a href="#new" onClick={(e) => handleNavClick(e, 'new')}>{t.accessories}</a></li>
            <li><a href="#bestsellers" onClick={(e) => handleNavClick(e, 'bestsellers')}>{t.subscriptions}</a></li>
            <li><a href="#discounts" onClick={(e) => handleNavClick(e, 'discounts')}>{t.devices}</a></li>
            <li><a href="#digital" onClick={(e) => handleNavClick(e, 'digital')}>{t.consoles}</a></li>
          </ul>
        </div>

        <div className="footer-divider"></div>

        <div className="footer-col brand-col">
          <div className="footer-logo-circle">
            <img src="/logo.jpg" alt="AKGAME Logo" className="footer-logo-img" />
          </div>
          <h2 className="footer-brand-name">AKGAME</h2>
          <div className="footer-social-circles">
            <a 
              href="https://instagram.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="footer-social-circle" 
              title="Instagram"
            >
              <img src="/instagram.png" alt="Instagram" className="social-icon-img" />
            </a>
            <a 
              href="https://tiktok.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="footer-social-circle" 
              title="TikTok"
            >
              <img src="/tik-tok.png" alt="TikTok" className="social-icon-img" />
            </a>
          </div>
          <p className="footer-description">
            {t.description}
          </p>
        </div>

      </div>

      <div className="footer-bottom-line"></div>

      <div className="footer-copyright">
        {t.copyright}
      </div>
    </footer>
  );
}