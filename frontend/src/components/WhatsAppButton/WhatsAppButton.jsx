import React from 'react';
import { MessageCircle } from 'lucide-react';
import './WhatsAppButton.css';

export default function WhatsAppButton() {
  const phoneNumber = '2130541721442'; // ضع رقم الواتساب الخاص بك هنا (بدون +)
  const defaultMessage = encodeURIComponent('مرحباً، أود الاستفسار عن المنتجات والخدمات المتوفرة في المتجر.');

  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${defaultMessage}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-float-btn"
      title="تواصل معنا عبر واتساب"
      aria-label="WhatsApp"
    >
      <MessageCircle size={28} />
    </a>
  );
}