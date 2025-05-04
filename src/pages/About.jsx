import styled from 'styled-components';
import { useTheme } from '../contexts/ThemeContext';
import { FaShieldAlt, FaMap, FaHeart, FaTemperatureHigh, FaMicrochip } from 'react-icons/fa';

const AboutContainer = styled.div`
  background-color: var(--${props => props.theme}-background);
  color: var(--${props => props.theme}-text);
  min-height: calc(100vh - 70px);
  padding: 2rem;
`;

const AboutHeader = styled.div`
  text-align: center;
  margin-bottom: 3rem;
  
  h1 {
    font-size: 2.5rem;
    margin-bottom: 1rem;
    color: var(--${props => props.theme}-accent);
  }
  
  p {
    font-size: 1.1rem;
    max-width: 800px;
    margin: 0 auto;
    opacity: 0.9;
    line-height: 1.6;
  }
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  margin: 3rem 0;
`;

const FeatureCard = styled.div`
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
  }
  
  .icon {
    font-size: 2.5rem;
    color: var(--${props => props.theme}-accent);
    margin-bottom: 1rem;
  }
  
  h3 {
    font-size: 1.2rem;
    margin-bottom: 1rem;
  }
  
  p {
    opacity: 0.8;
    line-height: 1.5;
  }
`;

const TechStack = styled.div`
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 2rem;
  margin-top: 3rem;
  
  h2 {
    text-align: center;
    margin-bottom: 2rem;
    color: var(--${props => props.theme}-accent);
  }
  
  .tech-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1.5rem;
  }
  
  .tech-item {
    background-color: rgba(255, 255, 255, 0.1);
    padding: 1rem;
    border-radius: 6px;
    text-align: center;
    font-weight: 500;
  }
`;

const About = () => {
  const { theme } = useTheme();
  
  return (
    <AboutContainer theme={theme}>
      <AboutHeader theme={theme}>
        <h1>Wild Warden: Hiker Rescue System</h1>
        <p>
          Wild Warden is an advanced IoT-based search and rescue system designed to help locate and assist 
          lost or injured hikers in remote areas. Using LoRa technology for long-range communication, 
          our system can detect distress signals even in areas with no cellular coverage.
        </p>
      </AboutHeader>
      
      <FeaturesGrid>
        <FeatureCard theme={theme}>
          <div className="icon">
            <FaShieldAlt />
          </div>
          <h3>Real-time Monitoring</h3>
          <p>
            Our system provides real-time monitoring of hikers' vital signs and location data, 
            allowing rescue teams to respond quickly and effectively to emergency situations.
          </p>
        </FeatureCard>
        
        <FeatureCard theme={theme}>
          <div className="icon">
            <FaMap />
          </div>
          <h3>Precise Location Tracking</h3>
          <p>
            Using GPS technology, we can pinpoint the exact location of hikers in distress, 
            even in remote areas with challenging terrain.
          </p>
        </FeatureCard>
        
        <FeatureCard theme={theme}>
          <div className="icon">
            <FaHeart />
          </div>
          <h3>Vital Signs Monitoring</h3>
          <p>
            The system tracks hikers' heart rate and other vital signs, providing critical 
            health information to rescue teams before they arrive on scene.
          </p>
        </FeatureCard>
        
        <FeatureCard theme={theme}>
          <div className="icon">
            <FaTemperatureHigh />
          </div>
          <h3>Environmental Monitoring</h3>
          <p>
            Temperature readings help assess risk factors such as hypothermia or heat stroke, 
            allowing rescue teams to prepare appropriate medical equipment.
          </p>
        </FeatureCard>
        
        <FeatureCard theme={theme}>
          <div className="icon">
            <FaMicrochip />
          </div>
          <h3>Low-Power Technology</h3>
          <p>
            Our LoRa-based communication system operates on minimal power, extending battery life 
            and ensuring that hikers can send distress signals even with limited power resources.
          </p>
        </FeatureCard>
      </FeaturesGrid>
      
      <TechStack theme={theme}>
        <h2>Technology Stack</h2>
        <div className="tech-grid">
          <div className="tech-item">React</div>
          <div className="tech-item">MongoDB</div>
          <div className="tech-item">Node.js</div>
          <div className="tech-item">Express</div>
          <div className="tech-item">LoRa</div>
          <div className="tech-item">ESP32</div>
          <div className="tech-item">Arduino</div>
          <div className="tech-item">React Leaflet</div>
        </div>
      </TechStack>
    </AboutContainer>
  );
};

export default About; 