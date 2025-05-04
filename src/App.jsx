import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Records from './pages/Records';
import './App.css';

// About component as placeholder
const About = () => (
  <div style={{ padding: '20px', color: 'white' }}>
    <h1 style={{ 
      fontSize: '2rem', 
      marginBottom: '1rem',
      color: '#60a5fa',
      borderBottom: '2px solid #60a5fa',
      paddingBottom: '0.5rem'
    }}>About Wild Warden</h1>
    
    <div style={{ 
      backgroundColor: 'rgba(96, 165, 250, 0.1)', 
      borderRadius: '8px',
      padding: '1.5rem',
      marginBottom: '1.5rem',
      border: '1px solid rgba(96, 165, 250, 0.3)',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
    }}>
      <h3 style={{ color: '#60a5fa', marginBottom: '1rem' }}>Mission</h3>
      <p>Wild Warden is an advanced IoT-based search and rescue system designed to help locate and assist lost or injured hikers in remote areas. Using LoRa technology for long-range communication, our system can detect distress signals even in areas with no cellular coverage.</p>
      <p style={{ marginTop: '1rem' }}>Currently deployed across India's most popular national parks including Jim Corbett National Park, Rajaji National Park, and the hiking trails of Uttarakhand, our system has helped rescue dozens of hikers in emergency situations.</p>
    </div>
    
    <div style={{ 
      backgroundColor: 'rgba(96, 165, 250, 0.1)', 
      borderRadius: '8px',
      padding: '1.5rem',
      marginBottom: '1.5rem',
      border: '1px solid rgba(96, 165, 250, 0.3)',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
    }}>
      <h3 style={{ color: '#60a5fa', marginBottom: '1rem' }}>Technology</h3>
      <p>Our system combines low-power LoRa communication with advanced GPS tracking and vital sign monitoring to ensure hikers' safety in the wilderness.</p>
      <p style={{ marginTop: '1rem' }}>Each hiker carries a lightweight device that monitors their location, heart rate, and body temperature. In case of emergency, the system automatically sends alerts to our monitoring stations, allowing rescue teams to respond quickly to any situation.</p>
    </div>
    
    <div style={{ 
      backgroundColor: 'rgba(96, 165, 250, 0.1)', 
      borderRadius: '8px',
      padding: '1.5rem',
      border: '1px solid rgba(96, 165, 250, 0.3)',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
    }}>
      <h3 style={{ color: '#60a5fa', marginBottom: '1rem' }}>Coverage</h3>
      <p>Our network currently covers:</p>
      <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
        <li>Jim Corbett National Park</li>
        <li>Rajaji National Park</li>
        <li>Nainital and surrounding trails</li>
        <li>Kalagarh Tiger Reserve</li>
        <li>Sitabani Wildlife Reserve</li>
      </ul>
      <p style={{ marginTop: '1rem' }}>We're expanding to cover more national parks and hiking trails across India in the coming months.</p>
    </div>
  </div>
);

function App() {
  const [loading, setLoading] = useState(true);
  
  // Simulate loading time
  setTimeout(() => {
    setLoading(false);
  }, 1000);
  
  // Show a loading indicator first
  if (loading) {
    return (
      <div style={{ 
        padding: '20px', 
        backgroundColor: '#1e3a8a', 
        color: 'white',
        borderRadius: '8px',
        margin: '40px',
        textAlign: 'center' 
      }}>
        <h2>Loading Wild Warden...</h2>
        <p>Please wait while we connect to https://wildwardenserver.onrender.com</p>
      </div>
    );
  }
  
  return (
    <Router>
      <div className="app">
        <Navbar />
        <main className="content" style={{ backgroundColor: '#0f172a' }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/records" element={<Records />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
