import React from 'react';

export default function Notification({ notification }) {
  if (!notification) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: '24px',
        right: '24px',
        zIndex: 9999
      }} 
      className={`alert-banner glass-panel ${notification.type === 'error' ? 'alert-error' : 'alert-success'}`}
    >
      {notification.message}
    </div>
  );
}
