const axios = require('axios');
const { logger } = require('../utils/logger');

class MapsService {
  constructor() {
    this.googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY;
    this.baseUrl = 'https://maps.googleapis.com/maps/api';
  }

  // Check if service is configured
  isConfigured() {
    return !!this.googleMapsApiKey;
  }

  // Get coordinates from address (Geocoding)
  async geocodeAddress(address) {
    if (!this.isConfigured()) {
      logger.warn('Google Maps API not configured. Geocoding disabled.');
      return { success: false, error: 'Google Maps API not configured' };
    }

    try {
      const response = await axios.get(`${this.baseUrl}/geocode/json`, {
        params: {
          address: address,
          key: this.googleMapsApiKey
        }
      });

      if (response.data.status === 'OK' && response.data.results.length > 0) {
        const result = response.data.results[0];
        const location = result.geometry.location;

        logger.info('Address geocoded successfully', {
          address: address,
          latitude: location.lat,
          longitude: location.lng
        });

        return {
          success: true,
          data: {
            latitude: location.lat,
            longitude: location.lng,
            formattedAddress: result.formatted_address,
            placeId: result.place_id,
            addressComponents: result.address_components
          }
        };
      } else {
        logger.warn('Geocoding failed', {
          address: address,
          status: response.data.status
        });

        return { success: false, error: 'Address not found' };
      }
    } catch (error) {
      logger.error('Geocoding request failed', {
        address: address,
        error: error.message
      });

      return { success: false, error: error.message };
    }
  }

  // Get address from coordinates (Reverse Geocoding)
  async reverseGeocode(latitude, longitude) {
    if (!this.isConfigured()) {
      logger.warn('Google Maps API not configured. Reverse geocoding disabled.');
      return { success: false, error: 'Google Maps API not configured' };
    }

    try {
      const response = await axios.get(`${this.baseUrl}/geocode/json`, {
        params: {
          latlng: `${latitude},${longitude}`,
          key: this.googleMapsApiKey
        }
      });

      if (response.data.status === 'OK' && response.data.results.length > 0) {
        const result = response.data.results[0];

        logger.info('Reverse geocoding successful', {
          latitude: latitude,
          longitude: longitude,
          address: result.formatted_address
        });

        return {
          success: true,
          data: {
            formattedAddress: result.formatted_address,
            placeId: result.place_id,
            addressComponents: result.address_components
          }
        };
      } else {
        logger.warn('Reverse geocoding failed', {
          latitude: latitude,
          longitude: longitude,
          status: response.data.status
        });

        return { success: false, error: 'Location not found' };
      }
    } catch (error) {
      logger.error('Reverse geocoding request failed', {
        latitude: latitude,
        longitude: longitude,
        error: error.message
      });

      return { success: false, error: error.message };
    }
  }

  // Calculate distance between two points
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in kilometers

    return Math.round(distance * 1000) / 1000; // Round to 3 decimal places
  }

  // Convert degrees to radians
  deg2rad(deg) {
    return deg * (Math.PI/180);
  }

  // Get nearby libraries within radius
  async findNearbyLibraries(userLat, userLon, radius = 10, libraries = []) {
    const nearbyLibraries = [];

    for (const library of libraries) {
      if (library.latitude && library.longitude) {
        const distance = this.calculateDistance(
          userLat, userLon,
          library.latitude, library.longitude
        );

        if (distance <= radius) {
          nearbyLibraries.push({
            ...library,
            distance: distance
          });
        }
      }
    }

    // Sort by distance
    return nearbyLibraries.sort((a, b) => a.distance - b.distance);
  }

  // Get directions between two points
  async getDirections(origin, destination, mode = 'driving') {
    if (!this.isConfigured()) {
      logger.warn('Google Maps API not configured. Directions disabled.');
      return { success: false, error: 'Google Maps API not configured' };
    }

    try {
      const response = await axios.get(`${this.baseUrl}/directions/json`, {
        params: {
          origin: origin,
          destination: destination,
          mode: mode,
          key: this.googleMapsApiKey
        }
      });

      if (response.data.status === 'OK' && response.data.routes.length > 0) {
        const route = response.data.routes[0];
        const leg = route.legs[0];

        logger.info('Directions retrieved successfully', {
          origin: origin,
          destination: destination,
          distance: leg.distance.text,
          duration: leg.duration.text
        });

        return {
          success: true,
          data: {
            distance: {
              text: leg.distance.text,
              value: leg.distance.value
            },
            duration: {
              text: leg.duration.text,
              value: leg.duration.value
            },
            steps: route.legs[0].steps.map(step => ({
              instruction: step.html_instructions,
              distance: step.distance.text,
              duration: step.duration.text
            })),
            overviewPolyline: route.overview_polyline.points
          }
        };
      } else {
        logger.warn('Directions not found', {
          origin: origin,
          destination: destination,
          status: response.data.status
        });

        return { success: false, error: 'Directions not found' };
      }
    } catch (error) {
      logger.error('Directions request failed', {
        origin: origin,
        destination: destination,
        error: error.message
      });

      return { success: false, error: error.message };
    }
  }

  // Get place details
  async getPlaceDetails(placeId, fields = ['name', 'formatted_address', 'geometry', 'place_id']) {
    if (!this.isConfigured()) {
      logger.warn('Google Maps API not configured. Place details disabled.');
      return { success: false, error: 'Google Maps API not configured' };
    }

    try {
      const response = await axios.get(`${this.baseUrl}/place/details/json`, {
        params: {
          place_id: placeId,
          fields: fields.join(','),
          key: this.googleMapsApiKey
        }
      });

      if (response.data.status === 'OK') {
        const place = response.data.result;

        logger.info('Place details retrieved successfully', {
          placeId: placeId,
          name: place.name
        });

        return {
          success: true,
          data: place
        };
      } else {
        logger.warn('Place details not found', {
          placeId: placeId,
          status: response.data.status
        });

        return { success: false, error: 'Place not found' };
      }
    } catch (error) {
      logger.error('Place details request failed', {
        placeId: placeId,
        error: error.message
      });

      return { success: false, error: error.message };
    }
  }

  // Search for places
  async searchPlaces(query, location = null, radius = 5000, type = null) {
    if (!this.isConfigured()) {
      logger.warn('Google Maps API not configured. Place search disabled.');
      return { success: false, error: 'Google Maps API not configured' };
    }

    try {
      const params = {
        query: query,
        key: this.googleMapsApiKey
      };

      if (location) {
        params.location = `${location.lat},${location.lng}`;
        params.radius = radius;
      }

      if (type) {
        params.type = type;
      }

      const response = await axios.get(`${this.baseUrl}/place/textsearch/json`, {
        params: params
      });

      if (response.data.status === 'OK') {
        const places = response.data.results.map(place => ({
          placeId: place.place_id,
          name: place.name,
          formattedAddress: place.formatted_address,
          location: place.geometry.location,
          rating: place.rating,
          priceLevel: place.price_level,
          types: place.types
        }));

        logger.info('Place search completed', {
          query: query,
          resultsCount: places.length
        });

        return {
          success: true,
          data: places
        };
      } else {
        logger.warn('Place search failed', {
          query: query,
          status: response.data.status
        });

        return { success: false, error: 'Search failed' };
      }
    } catch (error) {
      logger.error('Place search request failed', {
        query: query,
        error: error.message
      });

      return { success: false, error: error.message };
    }
  }

  // Generate static map image URL
  generateStaticMapUrl(latitude, longitude, zoom = 15, size = '400x400', markers = []) {
    if (!this.isConfigured()) {
      return null;
    }

    let url = `${this.baseUrl}/staticmap?center=${latitude},${longitude}&zoom=${zoom}&size=${size}&key=${this.googleMapsApiKey}`;

    // Add markers
    markers.forEach(marker => {
      url += `&markers=color:${marker.color || 'red'}|${marker.lat},${marker.lng}`;
    });

    return url;
  }
}

module.exports = new MapsService();

