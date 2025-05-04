import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      padding: '1rem 2rem',
      background: 'linear-gradient(90deg, #1e3a8a 0%, #0f172a 100%)',
      color: 'white',
      boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
      borderBottom: '2px solid #60a5fa'
    }}>
      <div style={{ 
        fontWeight: 'bold', 
        fontSize: '1.5rem', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '0.5rem' 
      }}>
        {/* Simple radar icon */}
        <div style={{ 
          width: '24px', 
          height: '24px',
          borderRadius: '50%',
          border: '2px solid #60a5fa',
          position: 'relative',
          display: 'inline-flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <div style={{ 
            width: '12px', 
            height: '12px',
            borderRadius: '50%',
            backgroundColor: '#60a5fa',
            animation: 'pulse 2s infinite'
          }}></div>
        </div>
        <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>Wild Warden</Link>
      </div>
      
      <div style={{ display: 'flex', gap: '2rem' }}>
        <Link to="/" style={{ 
          color: 'white', 
          textDecoration: 'none',
          padding: '0.5rem 1rem',
          borderRadius: '4px',
          transition: 'background-color 0.3s ease',
          ':hover': {
            backgroundColor: 'rgba(96, 165, 250, 0.2)'
          }
        }}>
          Dashboard
        </Link>
        <Link to="/records" style={{ 
          color: 'white', 
          textDecoration: 'none',
          padding: '0.5rem 1rem',
          borderRadius: '4px',
          transition: 'background-color 0.3s ease',
          ':hover': {
            backgroundColor: 'rgba(96, 165, 250, 0.2)'
          }
        }}>
          Records
        </Link>
        <Link to="/about" style={{ 
          color: 'white', 
          textDecoration: 'none',
          padding: '0.5rem 1rem',
          borderRadius: '4px',
          transition: 'background-color 0.3s ease',
          ':hover': {
            backgroundColor: 'rgba(96, 165, 250, 0.2)'
          } 
        }}>
          About Us
        </Link>
      </div>
      
      {/* Status indicator */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '0.75rem',
        backgroundColor: 'rgba(96, 165, 250, 0.2)',
        padding: '0.5rem 1rem',
        borderRadius: '4px'
      }}>
        <div style={{ 
          width: '10px', 
          height: '10px', 
          borderRadius: '50%', 
          backgroundColor: '#10b981',
          boxShadow: '0 0 5px #10b981'
        }}></div>
        <span style={{ fontSize: '0.875rem' }}>System Active</span>
      </div>
    </nav>
  );
};

export default Navbar; 