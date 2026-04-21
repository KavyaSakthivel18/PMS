const BASE_URL = 'http://localhost:8082/api/fees';
const FREE_DAYS = 7;
const FEE_PER_DAY = 50; // Default value, should come from backend
const DEMURRAGE_RATE = 150; // Default value, should come from backend
const DETENTION_FEE = 200; // Default value, should come from backend

export const feeService = {
  /**
   * Calculate fees based on container storage and demurrage rules
   * Storage Fee = max(0, DaysStored - FreeDays) × FeePerDay
   * Demurrage Fee = OverstayDays × DemurrageRate
   * Total Fee = StorageFee + DemurrageFee + DetentionFee
   */
  calculateFees: (bookingData) => {
    const {
      arrivalDate,
      pickupDate = null,
      deliveryDate = null,
      isReturned = false,
      containerStatus = 'ACTIVE'
    } = bookingData;

    const arrival = new Date(arrivalDate);
    const today = new Date();

    // Calculate days stored
    const checkoutDate = pickupDate ? new Date(pickupDate) : today;
    const daysStored = Math.floor((checkoutDate - arrival) / (1000 * 60 * 60 * 24));

    // Storage Fee calculation
    const storageFeeDays = Math.max(0, daysStored - FREE_DAYS);
    const storageFee = storageFeeDays * FEE_PER_DAY;

    // Demurrage Fee calculation (for overstay beyond free period)
    let demurrageFee = 0;
    const overstayDays = Math.max(0, daysStored - FREE_DAYS);
    demurrageFee = overstayDays * DEMURRAGE_RATE;

    // Detention Fee (if container not returned after delivery)
    let detentionFee = 0;
    if (deliveryDate && !isReturned) {
      const returnDeadline = new Date(deliveryDate);
      const daysAfterDelivery = Math.floor((today - returnDeadline) / (1000 * 60 * 60 * 24));
      if (daysAfterDelivery > 0) {
        detentionFee = daysAfterDelivery * DETENTION_FEE;
      }
    }

    const totalFee = storageFee + demurrageFee + detentionFee;

    return {
      daysStored,
      freeDaysUsed: Math.min(daysStored, FREE_DAYS),
      chargeableDays: storageFeeDays,
      storageFee,
      overstayDays,
      demurrageFee,
      detentionFee,
      totalFee,
      breakdown: {
        'Storage Fee': `${storageFeeDays} days × $${FEE_PER_DAY} = $${storageFee}`,
        'Demurrage Fee': `${overstayDays} days × $${DEMURRAGE_RATE} = $${demurrageFee}`,
        'Detention Fee': `${isReturned ? 'N/A' : `${detentionFee / DETENTION_FEE} days × $${DETENTION_FEE}`} = $${detentionFee}`
      },
      status: containerStatus
    };
  },

  /**
   * Get fee details from backend
   */
  getFeeById: async (id) => {
    const response = await fetch(`${BASE_URL}/${id}`);
    if (!response.ok) throw new Error('Failed to fetch fee details');
    return response.json();
  },

  /**
   * Get fees for a specific booking
   */
  getFeesByBooking: async (bookingId) => {
    const response = await fetch(`${BASE_URL}/booking/${bookingId}`);
    if (!response.ok) throw new Error('Failed to fetch booking fees');
    return response.json();
  },

  /**
   * Get fees for a specific container
   */
  getFeesByContainer: async (containerId) => {
    const response = await fetch(`${BASE_URL}/container/${containerId}`);
    if (!response.ok) throw new Error('Failed to fetch container fees');
    return response.json();
  },

  /**
   * Calculate and save fees in backend
   */
  calculateAndSaveFees: async (bookingId, calculatedFees) => {
    const payload = {
      bookingId,
      ...calculatedFees,
      calculatedAt: new Date().toISOString()
    };

    const response = await fetch(`${BASE_URL}/calculate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error('Failed to save calculated fees');
    return response.json();
  },

  /**
   * Get all fees
   */
  getAllFees: async () => {
    const response = await fetch(BASE_URL);
    if (!response.ok) throw new Error('Failed to fetch fees');
    return response.json();
  },

  /**
   * Get fees by status
   */
  getFeesByStatus: async (status) => {
    const response = await fetch(`${BASE_URL}?status=${status}`);
    if (!response.ok) throw new Error('Failed to fetch fees by status');
    return response.json();
  },

  /**
   * Get unpaid fees
   */
  getUnpaidFees: async () => {
    const response = await fetch(`${BASE_URL}?status=UNPAID`);
    if (!response.ok) throw new Error('Failed to fetch unpaid fees');
    return response.json();
  },

  /**
   * Process fee payment
   */
  processPayment: async (feeId, paymentData) => {
    const payload = {
      ...paymentData,
      paidAt: new Date().toISOString()
    };

    const response = await fetch(`${BASE_URL}/${feeId}/payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error('Failed to process payment');
    return response.json();
  },

  /**
   * Generate invoice PDF (triggers backend to generate PDF)
   */
  generateInvoicePDF: async (feeId) => {
    const response = await fetch(`${BASE_URL}/${feeId}/invoice/pdf`);
    if (!response.ok) throw new Error('Failed to generate invoice PDF');
    return response.blob();
  },

  /**
   * Get invoice details
   */
  getInvoice: async (feeId) => {
    const response = await fetch(`${BASE_URL}/${feeId}/invoice`);
    if (!response.ok) throw new Error('Failed to fetch invoice');
    return response.json();
  }
};
