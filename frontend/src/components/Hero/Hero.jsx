import React from 'react';
import { Compass } from 'lucide-react';
import { translations } from '../../locales/translations';
import { motion } from 'framer-motion';
import '@google/model-viewer';
import './Hero.css';

export default function Hero({ currentLang }) {
  const t = translations[currentLang]?.hero || translations['ar'].hero;

  // دالة التمرير السلس إلى قسم الجديد
  const scrollToNew = (e) => {
    e.preventDefault();
    const element = document.getElementById('new');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // إعدادات الحركات المتسلسلة لظهور النصوص
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.9, x: 50 },
    visible: {
      opacity: 1,
      scale: 1,
      x: 0,
      transition: {
        duration: 1,
        ease: [0.16, 1, 0.3, 1],
        delay: 0.3,
      },
    },
  };

  return (
    <section className="hero-section">
      <div className="hero-container">
        
        {/* جهة النصوص مع أنميشن دخول متسلسل */}
        <motion.div 
          className="hero-content"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h1 variants={itemVariants} className="hero-title">
            {t.title}
          </motion.h1>

          <motion.p variants={itemVariants} className="hero-description">
            {t.description}
          </motion.p>

          <motion.div variants={itemVariants} className="hero-buttons">
            <a href="#new" onClick={scrollToNew} className="hero-btn white-long-btn">
              <Compass size={20} />
              <span>{t.btnPrimary}</span>
            </a>
          </motion.div>
        </motion.div>

        {/* جهة الصورة والمجسم مع أنميشن دخول فاخر */}
        <motion.div 
          className="hero-image-wrapper"
          variants={imageVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="hero-glow"></div>
          <div className="hero-3d-card">
            {/* صورة الخلفية black.jpg */}
            <img src="/black.jpg" alt="AKGAME Hero Visual" className="hero-game-img" />
            
            {/* عنصر عرض المجسم الثلاثي الأبعاد */}
            <model-viewer
              src="/model.glb"
              alt="AKGAME 3D Model"
              auto-rotate
              camera-controls
              disable-zoom
              shadow-intensity="1"
              className="hero-model-viewer"
            ></model-viewer>
          </div>
        </motion.div>

      </div>
    </section>
  );
}