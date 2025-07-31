// Simple network status check
export interface NetworkStatus {
  isConnected: boolean;
  isBackendReachable: boolean;
}

export const checkNetworkStatus = async (): Promise<NetworkStatus> => {
  try {
    // Check if backend is reachable
    const backendReachable = await isBackendReachable();
    
    return {
      isConnected: true, // Assume connected if we can make requests
      isBackendReachable: backendReachable,
    };
  } catch (error) {
    console.error('Error checking network status:', error);
    return {
      isConnected: false,
      isBackendReachable: false,
    };
  }
};

export const isBackendReachable = async (): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch('http://localhost:8080/api/health', {
      method: 'GET',
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    console.error('Backend not reachable:', error);
    return false;
  }
}; 