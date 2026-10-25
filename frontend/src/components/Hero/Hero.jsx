import React, { useEffect, useRef, useState } from 'react';
import { Compass } from 'lucide-react';
import { translations } from '../../locales/translations';
import { motion } from 'framer-motion';
import '@google/model-viewer';
import './Hero.css';

export default function Hero({ currentLang }) {
  const t = translations[currentLang]?.hero || translations['ar'].hero;
  const canvasRef = useRef(null);

  const glassCardRef = useRef(null);
  const [tiltStyle, setTiltStyle] = useState({});

  const scrollToNew = (e) => {
    e.preventDefault();
    const element = document.getElementById('new');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleTiltMove = (e) => {
    if (!glassCardRef.current) return;
    const rect = glassCardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -10; 
    const rotateY = ((x - centerX) / centerX) * 10;
    
    setTiltStyle({
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
      transition: 'none',
    });
  };

  const handleTiltLeave = () => {
    setTiltStyle({
      transform: `perspective(1000px) rotateX(0deg) rotateY(0deg)`,
      transition: 'transform 0.5s ease',
    });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const SEPARATION = 35;
    const AMOUNTX = Math.floor(width / SEPARATION) + 5;
    const AMOUNTY = Math.floor(height / SEPARATION) + 5;

    const particles = [];
    let count = 0;

    const mouse = {
      x: -1000,
      y: -1000,
      radius: 130
    };

    for (let ix = 0; ix < AMOUNTX; ix++) {
      for (let iy = 0; iy < AMOUNTY; iy++) {
        const originX = ix * SEPARATION - (AMOUNTX * SEPARATION) / 2 + width / 2;
        const originY = iy * SEPARATION - (AMOUNTY * SEPARATION) / 2 + height / 2;
        
        particles.push({
          x: originX,
          y: originY,
          baseX: originX,
          baseY: originY,
          ix,
          iy,
          vx: 0,
          vy: 0,
          size: Math.random() * 1.5 + 1
        });
      }
    }

    const handleMouseMove = (event) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = event.clientX - rect.left;
      mouse.y = event.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('resize', handleResize);

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      count += 0.03;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        const waveX = Math.sin(p.ix * 0.3 + count) * 8;
        const waveY = Math.cos(p.iy * 0.3 + count) * 8;

        const targetX = p.baseX + waveX;
        const targetY = p.baseY + waveY;

        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < mouse.radius) {
          const force = (mouse.radius - distance) / mouse.radius;
          const angle = Math.atan2(dy, dx);

          p.vx -= Math.cos(angle) * force * 7;
          p.vy -= Math.sin(angle) * force * 7;
        }

        p.vx += (targetX - p.x) * 0.06;
        p.vy += (targetY - p.y) * 0.06;

        p.vx *= 0.82;
        p.vy *= 0.82;

        p.x += p.vx;
        p.y += p.vy;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
    },
  };

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.9, x: 50 },
    visible: {
      opacity: 1,
      scale: 1,
      x: 0,
      transition: { duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.3 },
    },
  };

  return (
    <section className="hero-section">
      <canvas ref={canvasRef} className="hero-particle-canvas" />

      <div className="hero-container">
        <motion.div 
          className="hero-content"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div 
            className="hero-glass-card"
            ref={glassCardRef}
            style={tiltStyle}
            onMouseMove={handleTiltMove}
            onMouseLeave={handleTiltLeave}
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
          </div>
        </motion.div>

        <motion.div 
          className="hero-image-wrapper"
          variants={imageVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="hero-3d-card">
            <model-viewer
              src="/model.glb"
              alt="AKGAME 3D Model"
              auto-rotate
              camera-controls
              disable-zoom
              shadow-intensity="1"
              shadow-softness="0.5"
              exposure="1"
              camera-orbit="0deg 75deg 80%" 
              field-of-view="30deg"         
              className="hero-model-viewer"
            ></model-viewer>
          </div>
        </motion.div>
      </div>
    </section>
  );
}