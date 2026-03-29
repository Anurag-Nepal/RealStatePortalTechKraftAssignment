import api from './api';

export const propertyService = {
  getProperties: (params = {}) => {
    const queryString = new URLSearchParams();

    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
        if (Array.isArray(params[key])) {
          params[key].forEach(v => queryString.append(key, v));
        } else {
          queryString.append(key, params[key]);
        }
      }
    });

    const url = queryString.toString() ? `/properties/?${queryString}` : '/properties/';
    return api.get(url);
  },

  getProperty: (propertyId) => {
    return api.get(`/properties/${propertyId}/`);
  },

  createProperty: (propertyData) => {
    return api.post('/properties/', propertyData);
  },

  updateProperty: (propertyId, propertyData) => {
    return api.patch(`/properties/${propertyId}/`, propertyData);
  },

  deleteProperty: (propertyId) => {
    return api.delete(`/properties/${propertyId}/`);
  },

  searchProperties: (searchParams) => {
    const params = {
      ...searchParams,
      
      is_available: true
    };
    return propertyService.getProperties(params);
  }
};

export const propertyFilters = {
  buildSearchParams: (filters = {}) => {
    const params = {};
    
    
    if (filters.minPrice && filters.minPrice > 0) {
      params.min_price = filters.minPrice;
    }
    if (filters.maxPrice && filters.maxPrice > 0) {
      params.max_price = filters.maxPrice;
    }
    
    
    if (filters.minBedrooms && filters.minBedrooms > 0) {
      params.min_bedrooms = filters.minBedrooms;
    }
    
    
    if (filters.city && filters.city.trim()) {
      params.city = filters.city.trim();
    }
    if (filters.state && filters.state.trim()) {
      params.state = filters.state.trim();
    }
    
    
    if (filters.propertyType && filters.propertyType !== 'all') {
      params.property_type = filters.propertyType;
    }
    
    
    params.is_available = filters.includeUnavailable !== true;

    if (filters.ordering) {
      params.ordering = filters.ordering;
    }
    
    
    if (filters.page && filters.page > 1) {
      params.page = filters.page;
    }
    
    return params;
  },

  propertyTypes: [
    { value: 'all', label: 'All Types' },
    { value: 'house', label: 'House' },
    { value: 'apartment', label: 'Apartment' },
    { value: 'condo', label: 'Condo' },
    { value: 'townhouse', label: 'Townhouse' }
  ],

  bedroomOptions: [
    { value: '', label: 'Any Bedrooms' },
    { value: 1, label: '1+ Bedroom' },
    { value: 2, label: '2+ Bedrooms' },
    { value: 3, label: '3+ Bedrooms' },
    { value: 4, label: '4+ Bedrooms' },
    { value: 5, label: '5+ Bedrooms' }
  ]
};

export default propertyService;
