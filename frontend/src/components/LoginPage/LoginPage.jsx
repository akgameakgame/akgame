import React, { useState } from 'react';
import { Lock, User, KeyRound, ShieldAlert } from 'lucide-react';
import './LoginPage.css';

export default function LoginPage({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // جلب اسم المستخدم وكلمة السر من متغيرات البيئة
  const envUsername = import.meta.env.VITE_ADMIN_USERNAME || '';
  const envPassword = import.meta.env.VITE_ADMIN_PASSWORD || '';

  const handleLogin = (e) => {
    e.preventDefault();

    if (username === envUsername && password === envPassword) {
      // حفظ حالة تسجيل الدخول في الجلسة الحالية
      sessionStorage.setItem('isAdminAuthenticated', 'true');
      setError('');
      onLoginSuccess();
    } else {
      setError('اسم المستخدم أو كلمة المرور غير صحيحة!');
    }
  };

  return (
    <div className="login-page-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-icon-box">
            <Lock size={32} color="#ffffff" />
          </div>
          <h2 className="login-title">لوحة التحكم</h2>
          <p className="login-subtitle">يرجى إدخال بيانات الدخول للمتابعة</p>
        </div>

        {error && (
          <div className="login-error-banner">
            <ShieldAlert size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="login-form">
          <div className="login-input-group">
            <User size={20} className="input-icon" />
            <input
              type="text"
              className="login-input"
              placeholder="اسم المستخدم"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="login-input-group">
            <KeyRound size={20} className="input-icon" />
            <input
              type="password"
              className="login-input"
              placeholder="كلمة المرور"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="login-submit-btn">
            تسجيل الدخول
          </button>
        </form>
      </div>
    </div>
  );
}