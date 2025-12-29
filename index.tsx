
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// 注册 Service Worker 以启用 PWA 功能（离线访问和安装到桌面）
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').then(registration => {
      console.log('次元羁绊核心系统 - SW 已就绪:', registration.scope);
    }).catch(error => {
      console.error('次元羁绊核心系统 - SW 部署失败:', error);
    });
  });
}
