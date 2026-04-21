const BASE_URL = 'http://localhost:8082/api/customs';
const MOVEMENT_URL = 'http://localhost:8082/api/movement-logs';

export const customsService = {
  fileDeclaration: async (payload) => {
    const response = await fetch(`${BASE_URL}/declaration`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error('Failed to file declaration');
    return response.json();
  },

  getDeclarationByContainer: async (containerId) => {
    const response = await fetch(`${BASE_URL}/declaration/container/${containerId}`);
    if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error('Failed to fetch declaration');
    }
    return response.json();
  },

  getMovementLogs: async (containerId) => {
    const response = await fetch(`${MOVEMENT_URL}/container/${containerId}`);
    if (!response.ok) throw new Error('Failed to fetch movement logs');
    return response.json();
  },

  reviewDeclaration: async (id, payload) => {
    const response = await fetch(`${BASE_URL}/declaration/${id}/review`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error('Failed to review declaration');
    return response.json();
  },

  holdDeclaration: async (id, payload) => {
    const response = await fetch(`${BASE_URL}/declaration/${id}/hold`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error('Failed to hold declaration');
    return response.json();
  },

  clearDeclaration: async (id, payload) => {
    const response = await fetch(`${BASE_URL}/declaration/${id}/clear`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error('Failed to clear declaration');
    return response.json();
  }
};
