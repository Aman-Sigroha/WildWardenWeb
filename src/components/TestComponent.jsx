import React from 'react';

const TestComponent = () => {
  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#2563eb', 
      color: 'white',
      margin: '20px',
      borderRadius: '10px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    }}>
      <h1>Wild Warden Test Component</h1>
      <p>If you can see this, React is rendering correctly</p>
    </div>
  );
};

export default TestComponent; 