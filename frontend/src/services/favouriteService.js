import api from './api';

export const favouriteService = {
  getFavourites: (params = {}) => {
    return api.get('/favourites/', { params });
  },

  addFavourite: (propertyId) => {
    return api.post('/favourites/', { property_id: propertyId });
  },

  removeFavourite: (favouriteId) => {
    return api.delete(`/favourites/${favouriteId}/`);
  },

  toggleFavourite: async (propertyId, isFavourited) => {
    if (isFavourited) {
      
      const favResponse = await api.get('/favourites/');
      const favourite = favResponse.data.results?.find(fav => fav.property.id === propertyId);
      if (favourite) {
        return favouriteService.removeFavourite(favourite.id);
      }
      throw new Error('Favourite not found');
    } else {
      return favouriteService.addFavourite(propertyId);
    }
  },

  isFavourited: async (propertyId) => {
    try {
      const response = await api.get('/favourites/');
      return response.data.results?.some(fav => fav.property.id === propertyId) || false;
    } catch (error) {
      console.error('Error checking favourite status:', error);
      return false;
    }
  }
};

export default favouriteService;
