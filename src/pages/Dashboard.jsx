import { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useTheme } from '../contexts/useTheme';
import SignalCard from '../components/SignalCard';
import { fetchPendingCases, acceptCase, rejectCase, getBuzzerStatus } from '../utils/api';

// Fix for Leaflet marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons for different status
const createCustomIcon = (status, heartRate, temperature) => {
  let color = '#3b82f6'; // Default blue
  
  if (status === 'accepted') {
    color = '#10b981'; // Green
  } else if (status === 'rejected') {
    color = '#6b7280'; // Gray
  } else if (heartRate > 100 || heartRate < 60 || temperature > 99.5 || temperature < 97) {
    color = '#ef4444'; // Red for anomalies
  }
  
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="
      background-color: ${color};
      width: 12px;
      height: 12px;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 0 4px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10]
  });
};

const DashboardContainer = styled.div`
  display: grid;
  grid-template-rows: auto auto 1fr;
  gap: 25px;
  padding: 1.5rem;
  background-color: var(--${props => props.theme}-background);
  color: var(--${props => props.theme}-text);
  min-height: calc(100vh - 70px);
  width: 100%;
  max-width: 100vw;
`;

const ControlPanel = styled.div`
  background-color: rgba(96, 165, 250, 0.1);
  padding: 1.75rem;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid rgba(96, 165, 250, 0.3);
`;

const ControlButtonGroup = styled.div`
  display: flex;
  gap: 10px;
`;

const ControlButton = styled.button`
  background-color: ${props => props.active ? '#3b82f6' : props.variant === 'danger' ? 'rgba(239, 68, 68, 0.2)' : 'transparent'};
  color: ${props => props.variant === 'danger' ? '#ef4444' : 'white'};
  border: 2px solid ${props => props.variant === 'danger' ? '#ef4444' : '#3b82f6'};
  border-radius: 4px;
  padding: 0.75rem 1.5rem;
  min-width: 150px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: ${props => props.variant === 'danger' ? 'rgba(239, 68, 68, 0.4)' : '#3b82f6'};
  }
`;

const Stats = styled.div`
  display: flex;
  gap: 2rem;
`;

const StatItem = styled.div`
  text-align: center;
  
  .number {
    font-size: 1.5rem;
    font-weight: bold;
    color: #60a5fa;
  }
  
  .label {
    font-size: 0.875rem;
    opacity: 0.8;
  }
`;

const DashboardLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  height: 100%;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const MapSection = styled.div`
  background-color: rgba(96, 165, 250, 0.1);
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid rgba(96, 165, 250, 0.3);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  height: 100%;
  min-height: 500px;
  padding: 15px 20px;

  .leaflet-container {
    height: calc(100% - 60px);
    width: 100%;
    border-radius: 8px;
    margin-top: 10px;
  }
`;

const SignalsSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-height: 80vh;
  overflow-y: auto;
  padding-right: 15px;
  padding-bottom: 20px;
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(96, 165, 250, 0.1);
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(96, 165, 250, 0.5);
    border-radius: 4px;
  }
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 1.25rem;
  color: #60a5fa;
  border-bottom: 2px solid #60a5fa;
  padding-bottom: 0.75rem;
  padding-left: 0.5rem;
`;

const ViewToggle = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 1rem;
`;

const ViewButton = styled.button`
  background-color: ${props => props.active ? '#3b82f6' : 'rgba(96, 165, 250, 0.2)'};
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: #3b82f6;
  }
`;

const Dashboard = () => {
  const { theme } = useTheme();
  const [signals, setSignals] = useState([]);
  const [isReceiving, setIsReceiving] = useState(true);
  const [startTime, setStartTime] = useState(Date.now());
  const [activeView, setActiveView] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [buzzerActive, setBuzzerActive] = useState(false);
  const [focusedLocation, setFocusedLocation] = useState(null);
  const [mapZoom, setMapZoom] = useState(9);
  
  // Reference for polling interval
  const pollingIntervalRef = useRef(null);
  
  // Fetch data from the API
  const fetchData = async () => {
    try {
      // Only fetch if we're in receiving mode
      if (isReceiving) {
        const pendingData = await fetchPendingCases();
        
        // Map the API data structure to match our frontend structure
        const mappedSignals = pendingData.map(signal => ({
          id: signal._id,
          deviceId: signal.deviceId,
          timestamp: signal.timestamp,
          location: { 
            lat: signal.gps.latitude, 
            lng: signal.gps.longitude 
          },
          heartRate: signal.heartRate,
          temperature: signal.temperature,
          spo2: signal.spo2,
          accelerometer: signal.accelerometer,
          gyroscope: signal.gyroscope,
          status: signal.status === 'none' ? 'pending' : signal.status
        }));
        
        setSignals(mappedSignals);
        
        // Check buzzer status
        const buzzerStatus = await getBuzzerStatus();
        setBuzzerActive(buzzerStatus.buzzerActive);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to fetch data. Please try again.');
      setLoading(false);
    }
  };
  
  // Setup polling on component mount
  useEffect(() => {
    // Fetch data immediately
    fetchData();
    
    // Setup interval for polling
    pollingIntervalRef.current = setInterval(fetchData, 5000); // Poll every 5 seconds
    
    // Cleanup interval on unmount
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [isReceiving]);
  
  const toggleReceiving = () => {
    if (!isReceiving) {
      // If turning receiving back on, reset the start time
      setStartTime(Date.now());
      
      // Start polling again
      pollingIntervalRef.current = setInterval(fetchData, 5000);
    } else {
      // If turning receiving off, clear the polling interval
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    }
    
    setIsReceiving(!isReceiving);
  };
  
  const resetMonitoring = () => {
    // Reset everything to initial state
    setStartTime(Date.now());
    setSignals([]);
    
    // Ensure receiving is on
    if (!isReceiving) {
      setIsReceiving(true);
      
      // Start polling again
      pollingIntervalRef.current = setInterval(fetchData, 5000);
    }
  };
  
  const handleResponse = async (id, action) => {
    try {
      // First, get the signal that's being responded to
      const targetSignal = signals.find(signal => signal.id === id);
      
      if (!targetSignal) {
        console.error(`Signal with ID ${id} not found`);
        return;
      }
      
      // Generate the current timestamp for when the case is processed
      const processedAt = new Date().toISOString();
      
      // If accepting this signal, find and reject all other pending signals from the same device
      if (action === 'accept') {
        // Include the processed timestamp with the accept request
        await acceptCase(id, processedAt);
        
        // Find other signals from the same device that are pending
        const otherSignalsFromSameDevice = signals.filter(
          signal => signal.deviceId === targetSignal.deviceId && 
                   signal.id !== id && 
                   signal.status === 'pending'
        );
        
        // Reject all other signals from the same device
        for (const otherSignal of otherSignalsFromSameDevice) {
          console.log(`Auto-rejecting signal ${otherSignal.id} from the same device ${otherSignal.deviceId}`);
          // Include the same processed timestamp for auto-rejected signals
          await rejectCase(otherSignal.id, processedAt);
        }
      } else if (action === 'reject') {
        // Include the processed timestamp with the reject request
        await rejectCase(id, processedAt);
      }
      
      // Remove the processed signals from the list
      setSignals(prevSignals => prevSignals.filter(
        signal => signal.id !== id && 
        !(action === 'accept' && signal.deviceId === targetSignal.deviceId && signal.status === 'pending')
      ));
      
      // Refresh data
      fetchData();
    } catch (err) {
      console.error(`Error ${action === 'accept' ? 'accepting' : 'rejecting'} case:`, err);
      setError(`Failed to ${action} the case. Please try again.`);
    }
  };
  
  // Filter signals based on active view
  const filteredSignals = signals.filter(signal => {
    if (activeView === 'all') return true;
    if (activeView === 'critical') {
      return (
        signal.heartRate > 100 || 
        signal.heartRate < 60 || 
        signal.temperature > 99.5 || 
        signal.temperature < 97 ||
        signal.spo2 < 95
      );
    }
    return true;
  });
  
  return (
    <DashboardContainer theme={theme}>
      <ControlPanel>
        <ControlButtonGroup>
          <ControlButton 
            active={isReceiving} 
            onClick={toggleReceiving}
          >
            {isReceiving ? 'Receiving Data' : 'Paused'}
          </ControlButton>
          <ControlButton 
            variant="danger" 
            onClick={resetMonitoring}
          >
            Reset Monitor
          </ControlButton>
        </ControlButtonGroup>
        
        <Stats>
          <StatItem>
            <div className="number">{signals.length}</div>
            <div className="label">Active Signals</div>
          </StatItem>
          <StatItem>
            <div className="number">{buzzerActive ? 'ON' : 'OFF'}</div>
            <div className="label">Buzzer Status</div>
          </StatItem>
          <StatItem>
            <div className="number">{formatElapsedTime()}</div>
            <div className="label">Monitoring Time</div>
          </StatItem>
        </Stats>
      </ControlPanel>
      
      <ViewToggle>
        <ViewButton 
          active={activeView === 'all'} 
          onClick={() => setActiveView('all')}
        >
          All Signals
        </ViewButton>
        <ViewButton 
          active={activeView === 'critical'} 
          onClick={() => setActiveView('critical')}
        >
          Critical Only
        </ViewButton>
      </ViewToggle>
      
      <DashboardLayout>
        <SignalsSection>
          <SectionTitle>Active Distress Signals</SectionTitle>
          
          {loading ? (
            <div style={{ color: 'white', textAlign: 'center', marginTop: '2rem' }}>
              Loading signals...
            </div>
          ) : error ? (
            <div style={{ color: 'red', textAlign: 'center', marginTop: '2rem' }}>
              {error}
            </div>
          ) : filteredSignals.length === 0 ? (
            <div style={{ color: 'white', textAlign: 'center', marginTop: '2rem' }}>
              No active signals. All hikers are safe.
            </div>
          ) : (
            filteredSignals.map(signal => (
              <SignalCard 
                key={signal.id} 
                signal={signal} 
                onResponse={(action) => handleResponse(signal.id, action)}
                onShowOnMap={() => handleShowOnMap(signal)}
              />
            ))
          )}
        </SignalsSection>
        
        <MapSection>
          <SectionTitle>Location Map</SectionTitle>
          
          <MapContainer 
            center={focusedLocation || [29.5, 79.3]} 
            zoom={mapZoom} 
            style={{ height: '100%', width: '100%' }}
            key={`map-${focusedLocation ? focusedLocation.join('-') : 'default'}-${mapZoom}`}
          >
            <TileLayer 
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            
            {filteredSignals.map(signal => (
              <Marker 
                key={signal.id}
                position={[signal.location.lat, signal.location.lng]} 
                icon={createCustomIcon(signal.status, signal.heartRate, signal.temperature)}
                eventHandlers={{
                  click: () => handleMarkerClick(signal.location)
                }}
              >
                <Popup>
                  <div style={{ padding: '8px' }}>
                    <h3 style={{ margin: '0 0 8px 0' }}>Device: {signal.deviceId}</h3>
                    <p style={{ margin: '0 0 5px 0' }}>Heart Rate: {signal.heartRate} bpm</p>
                    <p style={{ margin: '0 0 5px 0' }}>Temperature: {signal.temperature}°F</p>
                    <p style={{ margin: '0 0 5px 0' }}>SPO2: {signal.spo2}%</p>
                    <p style={{ margin: '0' }}>
                      <strong>Status:</strong> {signal.status.charAt(0).toUpperCase() + signal.status.slice(1)}
                    </p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </MapSection>
      </DashboardLayout>
    </DashboardContainer>
  );

  // Format elapsed time function
  function formatElapsedTime() {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }

  // Handle showing a signal on the map
  function handleShowOnMap(signal) {
    if (signal && signal.location) {
      // Center map on the signal's location
      setFocusedLocation([signal.location.lat, signal.location.lng]);
      setMapZoom(15); // Zoom in closer when focusing on a location
      console.log(`Showing signal from device ${signal.deviceId} on map`);
    }
  }

  // Handle marker click
  function handleMarkerClick(location) {
    if (location) {
      setFocusedLocation([location.lat, location.lng]);
      setMapZoom(15);
      console.log(`Map marker clicked at coordinates: ${location.lat}, ${location.lng}`);
    }
  }
};

export default Dashboard; 