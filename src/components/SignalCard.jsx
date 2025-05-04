import styled from 'styled-components';
import { FaHeartbeat, FaThermometerHalf, FaClock, FaCheck, FaTimes, FaMapMarkerAlt, FaLungs } from 'react-icons/fa';

const CardContainer = styled.div`
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  height: auto;
  min-height: 380px;
  margin-bottom: 20px;
  border-left: 4px solid ${props => {
    switch(props.status) {
      case 'accepted': return 'var(--tech-secondary)';
      case 'rejected': return 'var(--rescue-secondary)';
      default: return 'var(--radar-secondary)';
    }
  }};
`;

const CardHeader = styled.div`
  padding: 1rem 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background-color: rgba(0, 0, 0, 0.15);
`;

const DeviceId = styled.div`
  font-weight: bold;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
`;

const Timestamp = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  opacity: 0.8;
`;

const MapToggleButton = styled.button`
  width: 100%;
  padding: 1rem;
  background-color: rgba(0, 0, 0, 0.2);
  border: none;
  color: white;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  cursor: pointer;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.3);
  }

  svg {
    font-size: 1.2rem;
  }
`;

const VitalsContainer = styled.div`
  padding: 1.5rem 1.25rem;
  display: flex;
  justify-content: space-around;
  flex: 0 1 auto;
  min-height: 120px;
  align-items: center;
`;

const VitalItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 33%;
  text-align: center;
  
  .value {
    font-size: 1.5rem;
    font-weight: bold;
    margin: 0.5rem 0;
    color: ${props => {
      const value = parseFloat(props.value);
      if (props.type === 'heartRate' && (value > 100 || value < 60)) return 'var(--rescue-secondary)';
      if (props.type === 'temperature' && (value > 99.5 || value < 97)) return 'var(--rescue-secondary)';
      if (props.type === 'spo2' && value < 95) return 'var(--rescue-secondary)';
      return 'var(--tech-accent)';
    }};
  }
  
  .label {
    font-size: 0.875rem;
    opacity: 0.8;
  }
  
  svg {
    margin-bottom: 0.5rem;
    font-size: 1.75rem;
  }
`;

const ButtonsContainer = styled.div`
  display: flex;
  gap: 1rem;
  padding: 1.25rem;
  background-color: rgba(0, 0, 0, 0.2);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  margin-top: auto;
  position: relative;
  bottom: 0;
  left: 0;
  right: 0;
`;

const ResponseButton = styled.button`
  flex: 1;
  padding: 0.85rem 0;
  height: 54px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  opacity: ${props => props.disabled ? 0.5 : 1};
  pointer-events: ${props => props.disabled ? 'none' : 'auto'};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  min-width: 120px;
  
  background-color: ${props => props.accept ? 'var(--tech-secondary)' : props.reject ? 'var(--rescue-secondary)' : 'var(--radar-secondary)'};
  color: white;
  
  &:hover {
    transform: translateY(-2px);
    background-color: ${props => props.accept ? 'var(--tech-primary)' : props.reject ? 'var(--rescue-primary)' : 'var(--radar-primary)'};
  }

  svg {
    font-size: 1.25rem;
  }
`;

const SignalCard = ({ signal, onResponse, onShowOnMap }) => {
  // Ensure we have the correct property names
  const deviceId = signal.deviceId || signal.id;
  const heartRate = signal.heartRate;
  const temperature = signal.temperature;
  const spo2 = signal.spo2 || 98; // Default value if not provided
  const timestamp = signal.timestamp;
  
  const formatTimestamp = (isoString) => {
    const date = new Date(isoString);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };
  
  // Determine if vitals are critical
  const isHeartRateCritical = heartRate > 100 || heartRate < 60;
  const isTemperatureCritical = temperature > 99.5 || temperature < 97;
  const isSpo2Critical = spo2 < 95;
  
  return (
    <CardContainer status={signal.status}>
      <CardHeader>
        <DeviceId>
          {deviceId}
        </DeviceId>
        <Timestamp>
          <FaClock style={{ opacity: 0.7 }} />
          {formatTimestamp(timestamp)}
        </Timestamp>
      </CardHeader>
      
      <MapToggleButton onClick={() => onShowOnMap(signal)}>
        <FaMapMarkerAlt size={18} />
        Show on Main Map
      </MapToggleButton>
      
      <VitalsContainer>
        <VitalItem type="heartRate" value={heartRate}>
          <FaHeartbeat size={28} color={isHeartRateCritical ? '#ef4444' : '#60a5fa'} />
          <div className="value">{heartRate} bpm</div>
          <div className="label">Heart Rate</div>
        </VitalItem>
        
        <VitalItem type="temperature" value={temperature}>
          <FaThermometerHalf size={28} color={isTemperatureCritical ? '#ef4444' : '#60a5fa'} />
          <div className="value">{temperature}°F</div>
          <div className="label">Body Temp</div>
        </VitalItem>
        
        <VitalItem type="spo2" value={spo2}>
          <FaLungs size={28} color={isSpo2Critical ? '#ef4444' : '#60a5fa'} />
          <div className="value">{spo2}%</div>
          <div className="label">SPO2</div>
        </VitalItem>
      </VitalsContainer>

      <ButtonsContainer>
        <ResponseButton 
          accept
          onClick={() => onResponse('accept')}
          disabled={signal.status !== 'pending'}
        >
          <FaCheck size={16} />
          Accept
        </ResponseButton>
        
        <ResponseButton 
          reject
          onClick={() => onResponse('reject')}
          disabled={signal.status !== 'pending'}
        >
          <FaTimes size={16} />
          Reject
        </ResponseButton>
      </ButtonsContainer>
    </CardContainer>
  );
};

export default SignalCard; 