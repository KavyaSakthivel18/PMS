const BASE_URL = 'http://localhost:8080/api/containers';

export const containerService = {
  getAllContainers: async () => {
    const response = await fetch(BASE_URL);
    if (!response.ok) throw new Error('Failed to fetch containers');
    return response.json();
  },
  
  getContainerById: async (id) => {
    const response = await fetch(`${BASE_URL}/${id}`);
    if (!response.ok) throw new Error('Failed to fetch container details');
    return response.json();
  },
  
  createContainer: async (containerData) => {
    // Formats and cleans data to match backend expectations exactly
    const payload = {
        ...containerData,
        weightKG: parseFloat(containerData.weightKG),
        sizeTEU: parseInt(containerData.sizeTEU)
    };

    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      let errorMsg = 'Failed to create container';
      try {
          const errorData = await response.json();
          // Typically Spring Boot Validation returning a Map of errors
          if (errorData && typeof errorData === 'object' && !errorData.error) {
              const fieldErrors = Object.entries(errorData).map(([key, val]) => `${key}: ${val}`).join(', ');
              if (fieldErrors) errorMsg = fieldErrors;
          } else if (errorData.error) {
              errorMsg = errorData.error;
          }
      } catch (e) {
          // Non-JSON response
      }
      throw new Error(errorMsg);
    }
    return response.json();
  },
  
  updateContainerStatus: async (id, status) => {
    const response = await fetch(`${BASE_URL}/${id}/status?status=${status}`, {
      method: 'PUT'
    });
    
    if (!response.ok) throw new Error('Failed to update status');
    return response.json();
  }
};
