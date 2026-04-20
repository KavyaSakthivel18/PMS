const BASE_URL = 'http://localhost:8080/api/bookings';

export const bookingService = {
  getAllBookings: async () => {
    const response = await fetch(BASE_URL);
    if (!response.ok) throw new Error('Failed to fetch bookings');
    return response.json();
  },

  getBookingById: async (id) => {
    const response = await fetch(`${BASE_URL}/${id}`);
    if (!response.ok) throw new Error('Failed to fetch booking details');
    return response.json();
  },

  createBooking: async (bookingData) => {
    const payload = {
      ...bookingData,
      bookingDate: new Date(bookingData.bookingDate).toISOString(),
      expectedDeliveryDate: bookingData.expectedDeliveryDate 
        ? new Date(bookingData.expectedDeliveryDate).toISOString() 
        : null
    };

    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      let errorMsg = 'Failed to create booking';
      try {
        const errorData = await response.json();
        if (errorData && typeof errorData === 'object' && !errorData.error) {
          const fieldErrors = Object.entries(errorData)
            .map(([key, val]) => `${key}: ${val}`)
            .join(', ');
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

  updateBookingStatus: async (id, status) => {
    const response = await fetch(`${BASE_URL}/${id}/status?status=${status}`, {
      method: 'PUT'
    });

    if (!response.ok) throw new Error('Failed to update booking status');
    return response.json();
  },

  getBookingsByStatus: async (status) => {
    const response = await fetch(`${BASE_URL}?status=${status}`);
    if (!response.ok) throw new Error('Failed to fetch bookings by status');
    return response.json();
  },

  getBookingsByUser: async (userId) => {
    const response = await fetch(`${BASE_URL}?userId=${userId}`);
    if (!response.ok) throw new Error('Failed to fetch user bookings');
    return response.json();
  },

  logBookingMovement: async (bookingId, movementData) => {
    const payload = {
      ...movementData,
      timestamp: new Date(movementData.timestamp).toISOString()
    };

    const response = await fetch(`${BASE_URL}/${bookingId}/movement`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error('Failed to log movement');
    return response.json();
  },

  getBookingMovementHistory: async (bookingId) => {
    const response = await fetch(`${BASE_URL}/${bookingId}/movements`);
    if (!response.ok) throw new Error('Failed to fetch movement history');
    return response.json();
  }
};
