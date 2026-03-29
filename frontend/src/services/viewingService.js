import api from './api.js';

export const viewingService = {
  createViewingRequest: ({ propertyId, scheduledDatetime, notes }) => {
    return api.post('/viewings/', {
      property_id: propertyId,
      scheduled_datetime: scheduledDatetime,
      notes: notes || '',
    });
  },

  listViewings: (params = {}) => {
    const search = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        search.append(key, value);
      }
    });
    const suffix = search.toString() ? `?${search.toString()}` : '';
    return api.get(`/viewings/${suffix}`);
  },

  confirmViewing: (id) => {
    return api.post(`/viewings/${id}/confirm/`);
  },
};

export default viewingService;
