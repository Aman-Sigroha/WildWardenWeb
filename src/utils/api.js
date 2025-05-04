import axios from 'axios';

// Base URL for the API
const API_BASE_URL = 'https://wildwardenserver.onrender.com';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API functions
export const fetchAllCases = async () => {
  try {
    const response = await api.get('/api/cases');
    return response.data;
  } catch (error) {
    console.error('Error fetching all cases:', error);
    throw error;
  }
};

export const fetchPendingCases = async () => {
  try {
    const response = await api.get('/api/cases/pending');
    return response.data;
  } catch (error) {
    console.error('Error fetching pending cases:', error);
    throw error;
  }
};

export const fetchProcessedCases = async () => {
  try {
    const response = await api.get('/api/cases/processed');
    return response.data;
  } catch (error) {
    console.error('Error fetching processed cases:', error);
    throw error;
  }
};

export const acceptCase = async (caseId, processedAt) => {
  try {
    const response = await api.post(`/api/cases/${caseId}/accept`, { processedAt });
    return response.data;
  } catch (error) {
    console.error('Error accepting case:', error);
    throw error;
  }
};

export const rejectCase = async (caseId, processedAt) => {
  try {
    const response = await api.post(`/api/cases/${caseId}/reject`, { processedAt });
    return response.data;
  } catch (error) {
    console.error('Error rejecting case:', error);
    throw error;
  }
};

export const getBuzzerStatus = async () => {
  try {
    const response = await api.get('/api/buzzer-status');
    return response.data;
  } catch (error) {
    console.error('Error checking buzzer status:', error);
    throw error;
  }
};

export default api; 