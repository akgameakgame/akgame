import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
// إلغاء الاستعادة التلقائية لمكان التمرير من المتصفح
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

// جعل الصفحة تبدأ من الأعلى دائماً عند إعادة التحميل
window.addEventListener('beforeunload', () => {
  window.scrollTo(0, 0);
});
