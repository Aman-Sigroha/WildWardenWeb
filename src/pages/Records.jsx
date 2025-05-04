import { useState, useEffect } from 'react';
import { fetchProcessedCases } from '../utils/api';

const Records = () => {
  // State for records
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Load records from API on component mount
  useEffect(() => {
    const loadRecords = async () => {
      try {
        setLoading(true);
        
        // Fetch processed cases from the API
        const processedData = await fetchProcessedCases();
        
        // Map the API data structure to match our frontend structure
        const mappedRecords = processedData.map(record => ({
          id: record._id,
          deviceId: record.deviceId,
          timestamp: record.timestamp,
          location: { 
            lat: record.gps.latitude, 
            lng: record.gps.longitude 
          },
          heartRate: record.heartRate,
          temperature: record.temperature,
          spo2: record.spo2,
          batteryLevel: "N/A", // Not available from API
          signalStrength: "N/A", // Not available from API
          status: record.status.charAt(0).toUpperCase() + record.status.slice(1),
          processedAt: record.timestamp // Use timestamp as processedAt since API doesn't have this field
        }));
        
        // Sort records by most recent first
        const sortedRecords = mappedRecords.sort((a, b) => {
          return new Date(b.timestamp) - new Date(a.timestamp);
        });
        
        setRecords(sortedRecords);
        setLoading(false);
      } catch (error) {
        console.error("Error loading records:", error);
        setLoading(false);
        setNotification("Failed to load records from server");
        
        // Auto-dismiss notification after 3 seconds
        setTimeout(() => {
          setNotification(null);
        }, 3000);
      }
    };
    
    loadRecords();
  }, []);

  // For sorting and filtering
  const [sortField, setSortField] = useState('timestamp');
  const [sortDirection, setSortDirection] = useState('desc');
  const [filter, setFilter] = useState('');

  // Handle sorting
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filter and sort records
  const filteredRecords = records
    .filter(record => 
      record.deviceId.toLowerCase().includes(filter.toLowerCase()) ||
      record.status.toLowerCase().includes(filter.toLowerCase())
    )
    .sort((a, b) => {
      if (sortField === 'heartRate' || sortField === 'temperature' || sortField === 'spo2') {
        return sortDirection === 'asc' 
          ? a[sortField] - b[sortField]
          : b[sortField] - a[sortField];
      }
      
      if (sortField === 'timestamp' || sortField === 'processedAt') {
        return sortDirection === 'asc'
          ? new Date(a[sortField] || a.timestamp) - new Date(b[sortField] || b.timestamp)
          : new Date(b[sortField] || b.timestamp) - new Date(a[sortField] || a.timestamp);
      }
      
      return sortDirection === 'asc'
        ? (a[sortField] || '').toString().localeCompare((b[sortField] || '').toString())
        : (b[sortField] || '').toString().localeCompare((a[sortField] || '').toString());
    });

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  // Get status color
  const getStatusColor = (status) => {
    switch(status.toLowerCase()) {
      case 'rejected': return '#ef4444';
      case 'accepted': return '#10b981';
      default: return '#3b82f6';
    }
  };

  // Generate location name from coordinates
  const getLocationName = (coords) => {
    const locations = {
      '29.3919,79.4554': 'Jim Corbett National Park',
      '29.5219,79.5551': 'Kalagarh Tiger Reserve',
      '29.4753,79.1582': 'Nainital hiking area',
      '30.1392,78.6537': 'Rajaji National Park',
      '29.3542,79.5355': 'Sitabani Wildlife Reserve'
    };
    
    // Try to match exact coordinates or find nearest
    const coordString = `${coords.lat.toFixed(4)},${coords.lng.toFixed(4)}`;
    for (const [key, value] of Object.entries(locations)) {
      if (key.startsWith(coordString.substring(0, 6))) {
        return value;
      }
    }
    
    return 'Unknown Location';
  };

  // Handle exporting records as CSV
  const handleExportCSV = () => {
    // Create CSV header
    const csvHeader = [
      'Device ID',
      'Signal Time',
      'Processed At',
      'Location Name',
      'Latitude',
      'Longitude',
      'Heart Rate',
      'Temperature',
      'SPO2',
      'Status'
    ].join(',');
    
    // Escape CSV values to handle commas and quotes
    const escapeCSV = (field) => {
      const stringField = String(field || '');
      if (stringField.includes(',') || stringField.includes('"')) {
        return `"${stringField.replace(/"/g, '""')}"`;
      }
      return stringField;
    };

    // Create CSV rows
    const csvRows = filteredRecords.map(record => [
      escapeCSV(record.deviceId),
      escapeCSV(formatDate(record.timestamp)),
      escapeCSV(formatDate(record.processedAt || record.timestamp)),
      escapeCSV(getLocationName(record.location)),
      escapeCSV(record.location.lat),
      escapeCSV(record.location.lng),
      escapeCSV(record.heartRate),
      escapeCSV(record.temperature),
      escapeCSV(record.spo2 || 'N/A'),
      escapeCSV(record.status)
    ].join(','));
    
    // Combine header and rows
    const csvContent = [csvHeader, ...csvRows].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    // Set link properties
    link.setAttribute('href', url);
    link.setAttribute('download', `wild-warden-records-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    // Add to document, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Show success notification
    setNotification('Records exported successfully');
    
    // Auto-dismiss notification after 3 seconds
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  // Handle clearing records
  const handleClearRecords = () => {
    if (window.confirm('Are you sure you want to clear all records? This action cannot be undone.')) {
      localStorage.removeItem('signalRecords');
      setRecords([]);
      
      // Show notification
      setNotification('All records have been cleared');
      
      // Auto-dismiss notification after 3 seconds
      setTimeout(() => {
        setNotification(null);
      }, 3000);
    }
  };

  // Handle printing the report
  const handlePrintReport = () => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    
    // Current date for the report header
    const reportDate = new Date().toLocaleDateString();
    const reportTime = new Date().toLocaleTimeString();
    
    // Create report HTML content
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Wild Warden Signal Report</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            color: #333;
          }
          .report-header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #3b82f6;
          }
          .report-title {
            color: #3b82f6;
            font-size: 24px;
            margin-bottom: 10px;
          }
          .report-date {
            font-size: 14px;
            color: #666;
          }
          .report-summary {
            margin-bottom: 30px;
            background-color: #f0f7ff;
            padding: 15px;
            border-radius: 8px;
          }
          .summary-title {
            font-weight: bold;
            margin-bottom: 10px;
          }
          .summary-item {
            display: inline-block;
            margin-right: 30px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          th, td {
            padding: 12px 15px;
            border-bottom: 1px solid #ddd;
            text-align: left;
          }
          th {
            background-color: #f0f7ff;
            font-weight: bold;
            color: #3b82f6;
          }
          tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          .status-accepted {
            color: #10b981;
            font-weight: bold;
          }
          .status-rejected {
            color: #ef4444;
            font-weight: bold;
          }
          .warning {
            color: #ef4444;
          }
          .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 12px;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 20px;
          }
          @media print {
            .no-print {
              display: none;
            }
            body {
              padding: 0;
              margin: 0;
            }
          }
        </style>
      </head>
      <body>
        <div class="report-header">
          <div class="report-title">Wild Warden Signal Report</div>
          <div class="report-date">Generated on ${reportDate} at ${reportTime}</div>
        </div>
        
        <div class="report-summary">
          <div class="summary-title">Report Summary</div>
          <div class="summary-item">Total Records: <strong>${filteredRecords.length}</strong></div>
          <div class="summary-item">Accepted Signals: <strong>${filteredRecords.filter(r => r.status.toLowerCase() === 'accepted').length}</strong></div>
          <div class="summary-item">Rejected Signals: <strong>${filteredRecords.filter(r => r.status.toLowerCase() === 'rejected').length}</strong></div>
          <div class="summary-item">Anomalies Detected: <strong>${filteredRecords.filter(r => r.heartRate > 100 || r.heartRate < 60 || r.temperature > 99.5 || r.temperature < 97).length}</strong></div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Device ID</th>
              <th>Location</th>
              <th>Signal Time</th>
              <th>Vital Signs</th>
              <th>Signal Info</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${filteredRecords.map(record => `
              <tr>
                <td>${record.deviceId}</td>
                <td>${getLocationName(record.location)}<br><span style="font-size: 12px; color: #666;">(${record.location.lat.toFixed(4)}, ${record.location.lng.toFixed(4)})</span></td>
                <td>${formatDate(record.timestamp)}</td>
                <td>
                  HR: <span class="${(record.heartRate > 100 || record.heartRate < 60) ? 'warning' : ''}">${record.heartRate} bpm</span><br>
                  Temp: <span class="${(record.temperature > 99.5 || record.temperature < 97) ? 'warning' : ''}">${record.temperature}°F</span>
                </td>
                <td>
                  Battery: ${record.batteryLevel}<br>
                  Signal: ${record.signalStrength}
                </td>
                <td class="status-${record.status.toLowerCase()}">${record.status}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <button class="no-print" onclick="window.print();" style="
          background-color: #3b82f6;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 4px;
          cursor: pointer;
          display: block;
          margin: 0 auto;
        ">Print this Report</button>
        
        <div class="footer">
          Wild Warden - National Park Hiker Monitoring System<br>
          This is a confidential report for authorized personnel only.
        </div>
      </body>
      </html>
    `;
    
    // Write to the new window
    printWindow.document.open();
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // Focus the new window
    printWindow.focus();
  };

  // Open details modal
  const handleShowDetails = (record) => {
    setSelectedRecord(record);
    setShowModal(true);
  };

  // Close details modal
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedRecord(null);
  };

  return (
    <div style={{ 
      padding: '2rem', 
      color: 'white', 
      maxWidth: '1400px', 
      margin: '0 auto' 
    }}>
      <h1 style={{ 
        fontSize: '2rem', 
        marginBottom: '1.75rem',
        color: '#60a5fa',
        borderBottom: '2px solid #60a5fa',
        paddingBottom: '0.75rem'
      }}>Signal Records</h1>
      
      {/* Search and filter */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        marginBottom: '1.75rem',
        alignItems: 'center'
      }}>
        <div>
          <input 
            type="text"
            placeholder="Filter by Device ID or Status..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{
              padding: '0.75rem',
              borderRadius: '6px',
              border: '1px solid #60a5fa',
              backgroundColor: 'rgba(15, 23, 42, 0.8)',
              color: 'white',
              width: '320px',
              fontSize: '0.95rem'
            }}
          />
        </div>
        <div style={{ color: '#a3a3a3', fontSize: '0.95rem' }}>
          {filteredRecords.length} records found
        </div>
      </div>
      
      {/* Records table */}
      <div style={{ 
        backgroundColor: 'rgba(96, 165, 250, 0.1)', 
        borderRadius: '10px',
        overflow: 'hidden',
        border: '1px solid rgba(96, 165, 250, 0.3)',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
        position: 'relative',
        minHeight: '300px',
        marginBottom: '1.5rem'
      }}>
        {loading ? (
          <div style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            backgroundColor: 'rgba(15, 23, 42, 0.7)',
            borderRadius: '10px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                border: '4px solid rgba(96, 165, 250, 0.3)', 
                borderTop: '4px solid #60a5fa', 
                borderRadius: '50%',
                margin: '0 auto 10px',
                animation: 'spin 1s linear infinite'
              }}></div>
              <div>Loading records...</div>
            </div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ 
              width: '100%', 
              borderCollapse: 'collapse',
              fontSize: '0.9rem'
            }}>
              <thead>
                <tr style={{ 
                  backgroundColor: 'rgba(37, 99, 235, 0.2)',
                  borderBottom: '2px solid rgba(96, 165, 250, 0.5)'
                }}>
                  <th style={{ 
                    padding: '1.25rem 1.5rem', 
                    textAlign: 'left',
                    cursor: 'pointer'
                  }} onClick={() => handleSort('deviceId')}>
                    Device ID {sortField === 'deviceId' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th style={{ 
                    padding: '1.25rem 1.5rem', 
                    textAlign: 'left',
                    cursor: 'pointer'
                  }} onClick={() => handleSort('timestamp')}>
                    Signal Time {sortField === 'timestamp' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th style={{ 
                    padding: '1.25rem 1.5rem', 
                    textAlign: 'left',
                    cursor: 'pointer'
                  }} onClick={() => handleSort('processedAt')}>
                    Processed At {sortField === 'processedAt' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th style={{ 
                    padding: '1.25rem 1.5rem', 
                    textAlign: 'left',
                    cursor: 'pointer'
                  }} onClick={() => handleSort('heartRate')}>
                    Heart Rate {sortField === 'heartRate' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th style={{ 
                    padding: '1.25rem 1.5rem', 
                    textAlign: 'left',
                    cursor: 'pointer'
                  }} onClick={() => handleSort('temperature')}>
                    Temperature {sortField === 'temperature' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th style={{ 
                    padding: '1.25rem 1.5rem', 
                    textAlign: 'left',
                    cursor: 'pointer'
                  }} onClick={() => handleSort('status')}>
                    Status {sortField === 'status' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th style={{ padding: '1.25rem 1.5rem', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.length > 0 ? (
                  filteredRecords.map((record) => (
                    <tr 
                      key={record.id}
                      style={{ 
                        borderBottom: '1px solid rgba(96, 165, 250, 0.2)',
                        transition: 'background-color 0.2s',
                        ':hover': { backgroundColor: 'rgba(96, 165, 250, 0.1)' }
                      }}
                    >
                      <td style={{ padding: '1.25rem 1.5rem' }}>
                        <div style={{ fontWeight: 'bold' }}>{record.deviceId}</div>
                        <div style={{ fontSize: '0.8rem', color: '#a3a3a3', marginTop: '0.25rem' }}>{record.id.split('-').slice(0, 2).join('-')}</div>
                      </td>
                      <td style={{ padding: '1.25rem 1.5rem' }}>{formatDate(record.timestamp)}</td>
                      <td style={{ padding: '1.25rem 1.5rem' }}>{record.processedAt ? formatDate(record.processedAt) : '-'}</td>
                      <td style={{ padding: '1.25rem 1.5rem' }}>
                        <span style={{ 
                          color: record.heartRate > 100 || record.heartRate < 60 ? '#ef4444' : 'inherit'
                        }}>
                          {record.heartRate} bpm
                        </span>
                      </td>
                      <td style={{ padding: '1.25rem 1.5rem' }}>
                        <span style={{ 
                          color: record.temperature > 99.5 || record.temperature < 97 ? '#ef4444' : 'inherit'
                        }}>
                          {record.temperature}°F
                        </span>
                      </td>
                      <td style={{ padding: '1.25rem 1.5rem' }}>
                        <span style={{ 
                          display: 'inline-block',
                          padding: '0.35rem 0.75rem',
                          borderRadius: '6px',
                          fontSize: '0.85rem',
                          fontWeight: 'bold',
                          backgroundColor: `${getStatusColor(record.status)}20`,
                          color: getStatusColor(record.status),
                          border: `1px solid ${getStatusColor(record.status)}40`
                        }}>
                          {record.status}
                        </span>
                      </td>
                      <td style={{ padding: '1.25rem 1.5rem', textAlign: 'center' }}>
                        <button 
                          style={{ 
                            backgroundColor: 'rgba(59, 130, 246, 0.2)',
                            color: '#60a5fa',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '0.4rem 0.75rem',
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          onClick={() => handleShowDetails(record)}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" style={{ padding: '3rem', textAlign: 'center', color: '#a3a3a3' }}>
                      No records found. Start receiving signals on the Dashboard to create records.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* CSS for the spinner animation */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @keyframes slideUp {
            0% { transform: translateY(100%); opacity: 0; }
            10% { transform: translateY(0); opacity: 1; }
            90% { transform: translateY(0); opacity: 1; }
            100% { transform: translateY(100%); opacity: 0; }
          }
        `}
      </style>
      
      {/* Export options */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'flex-end',
        marginTop: '1.5rem',
        gap: '0.75rem'
      }}>
        <button 
          style={{ 
            backgroundColor: 'rgba(239, 68, 68, 0.2)',
            color: '#ef4444',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            borderRadius: '6px',
            padding: '0.75rem 1rem',
            fontWeight: 'medium',
            cursor: 'pointer'
          }}
          onClick={handleClearRecords}
        >
          Clear Records
        </button>
        <button 
          style={{ 
            backgroundColor: 'rgba(16, 185, 129, 0.2)',
            color: '#10b981',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            borderRadius: '6px',
            padding: '0.75rem 1rem',
            fontWeight: 'medium',
            cursor: 'pointer'
          }}
          onClick={handleExportCSV}
        >
          Export CSV
        </button>
        <button 
          style={{ 
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
            color: '#60a5fa',
            border: '1px solid rgba(59, 130, 246, 0.4)',
            borderRadius: '6px',
            padding: '0.75rem 1rem',
            fontWeight: 'medium',
            cursor: 'pointer'
          }}
          onClick={handlePrintReport}
        >
          Print Report
        </button>
      </div>

      {/* Notification toast */}
      {notification && (
        <div style={{ 
          position: 'fixed', 
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '0.75rem 1.5rem', 
          backgroundColor: '#10b981',
          color: 'white',
          textAlign: 'center',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          zIndex: 1000,
          animation: 'slideUp 3s forwards',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontWeight: '500'
        }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM8 15L3 10L4.41 8.59L8 12.17L15.59 4.58L17 6L8 15Z" fill="white"/>
          </svg>
          {notification}
        </div>
      )}

      {/* Details Modal */}
      {showModal && selectedRecord && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            backgroundColor: '#0f172a',
            borderRadius: '10px',
            width: '90%',
            maxWidth: '700px',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 0 30px rgba(60, 130, 246, 0.3)',
            border: '1px solid rgba(96, 165, 250, 0.3)',
            position: 'relative'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '1.5rem',
              borderBottom: '1px solid rgba(96, 165, 250, 0.3)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h2 style={{ 
                margin: 0, 
                color: '#60a5fa', 
                fontSize: '1.5rem' 
              }}>
                Signal Details
              </h2>
              <button 
                onClick={handleCloseModal}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#9ca3af',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  padding: '0.5rem',
                  marginRight: '-0.5rem'
                }}
              >
                ×
              </button>
            </div>
            
            {/* Modal Content */}
            <div style={{ padding: '1.5rem' }}>
              {/* Device and Status Section */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem'
              }}>
                <div>
                  <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.25rem' }}>
                    Device {selectedRecord.deviceId}
                  </h3>
                  <div style={{ color: '#9ca3af', fontSize: '0.9rem' }}>
                    ID: {selectedRecord.id}
                  </div>
                </div>
                <div>
                  <span style={{ 
                    display: 'inline-block',
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    fontWeight: 'bold',
                    backgroundColor: `${getStatusColor(selectedRecord.status)}20`,
                    color: getStatusColor(selectedRecord.status),
                    border: `1px solid ${getStatusColor(selectedRecord.status)}40`
                  }}>
                    {selectedRecord.status}
                  </span>
                </div>
              </div>
              
              {/* Grid layout for signal details */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '1.5rem',
                marginBottom: '1.5rem'
              }}>
                {/* Timestamps */}
                <div style={{ 
                  backgroundColor: 'rgba(15, 23, 42, 0.7)', 
                  padding: '1.25rem', 
                  borderRadius: '8px',
                  border: '1px solid rgba(96, 165, 250, 0.2)'
                }}>
                  <h4 style={{ margin: '0 0 1rem 0', color: '#60a5fa', fontSize: '1rem' }}>
                    Time Information
                  </h4>
                  <div style={{ marginBottom: '0.75rem' }}>
                    <div style={{ color: '#9ca3af', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                      Signal Received
                    </div>
                    <div style={{ fontSize: '0.95rem' }}>
                      {formatDate(selectedRecord.timestamp)}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: '#9ca3af', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                      Processed At
                    </div>
                    <div style={{ fontSize: '0.95rem' }}>
                      {selectedRecord.processedAt ? formatDate(selectedRecord.processedAt) : 'N/A'}
                    </div>
                  </div>
                </div>
                
                {/* Location */}
                <div style={{ 
                  backgroundColor: 'rgba(15, 23, 42, 0.7)', 
                  padding: '1.25rem', 
                  borderRadius: '8px',
                  border: '1px solid rgba(96, 165, 250, 0.2)'
                }}>
                  <h4 style={{ margin: '0 0 1rem 0', color: '#60a5fa', fontSize: '1rem' }}>
                    Location Information
                  </h4>
                  <div style={{ marginBottom: '0.75rem' }}>
                    <div style={{ color: '#9ca3af', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                      Location Name
                    </div>
                    <div style={{ fontSize: '0.95rem' }}>
                      {getLocationName(selectedRecord.location)}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: '#9ca3af', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                      GPS Coordinates
                    </div>
                    <div style={{ fontSize: '0.95rem' }}>
                      {selectedRecord.location.lat.toFixed(6)}, {selectedRecord.location.lng.toFixed(6)}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Vital Signs */}
              <div style={{ 
                backgroundColor: 'rgba(15, 23, 42, 0.7)', 
                padding: '1.25rem', 
                borderRadius: '8px',
                border: '1px solid rgba(96, 165, 250, 0.2)',
                marginBottom: '1.5rem'
              }}>
                <h4 style={{ margin: '0 0 1rem 0', color: '#60a5fa', fontSize: '1rem' }}>
                  Vital Signs
                </h4>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '1rem'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ 
                      fontSize: '1.5rem', 
                      fontWeight: 'bold',
                      color: selectedRecord.heartRate > 100 || selectedRecord.heartRate < 60 
                        ? '#ef4444' : 'white'
                    }}>
                      {selectedRecord.heartRate} bpm
                    </div>
                    <div style={{ color: '#9ca3af', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                      Heart Rate
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ 
                      fontSize: '1.5rem', 
                      fontWeight: 'bold',
                      color: selectedRecord.temperature > 99.5 || selectedRecord.temperature < 97
                        ? '#ef4444' : 'white'
                    }}>
                      {selectedRecord.temperature}°F
                    </div>
                    <div style={{ color: '#9ca3af', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                      Temperature
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ 
                      fontSize: '1.5rem', 
                      fontWeight: 'bold',
                      color: selectedRecord.spo2 < 95 ? '#ef4444' : 'white'
                    }}>
                      {selectedRecord.spo2 || 'N/A'}%
                    </div>
                    <div style={{ color: '#9ca3af', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                      SpO2
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Additional Data */}
              {selectedRecord.accelerometer && (
                <div style={{ 
                  backgroundColor: 'rgba(15, 23, 42, 0.7)', 
                  padding: '1.25rem', 
                  borderRadius: '8px',
                  border: '1px solid rgba(96, 165, 250, 0.2)'
                }}>
                  <h4 style={{ margin: '0 0 1rem 0', color: '#60a5fa', fontSize: '1rem' }}>
                    Motion Data
                  </h4>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '1.5rem'
                  }}>
                    <div>
                      <h5 style={{ margin: '0 0 0.5rem 0', color: '#9ca3af', fontSize: '0.9rem', fontWeight: 'normal' }}>
                        Accelerometer
                      </h5>
                      <div style={{ marginBottom: '0.25rem' }}>
                        X: {selectedRecord.accelerometer.x.toString()}
                      </div>
                      <div style={{ marginBottom: '0.25rem' }}>
                        Y: {selectedRecord.accelerometer.y.toString()}
                      </div>
                      <div>
                        Z: {selectedRecord.accelerometer.z.toString()}
                      </div>
                    </div>
                    {selectedRecord.gyroscope && (
                      <div>
                        <h5 style={{ margin: '0 0 0.5rem 0', color: '#9ca3af', fontSize: '0.9rem', fontWeight: 'normal' }}>
                          Gyroscope
                        </h5>
                        <div style={{ marginBottom: '0.25rem' }}>
                          X: {selectedRecord.gyroscope.x.toString()}
                        </div>
                        <div style={{ marginBottom: '0.25rem' }}>
                          Y: {selectedRecord.gyroscope.y.toString()}
                        </div>
                        <div>
                          Z: {selectedRecord.gyroscope.z.toString()}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Records; 