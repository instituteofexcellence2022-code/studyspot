const express = require('express');
const {
  body,
  query: queryValidator,
  validationResult
} = require('express-validator');
const {
  query
} = require('../config/database');
const {
  verifyToken,
  setTenantContext
} = require('../middleware/auth');
const {
  AppError,
  asyncHandler
} = require('../middleware/errorHandler');
const {
  logger
} = require('../utils/logger');
const mapsService = require('../services/mapsService');
const router = express.Router();

// Apply authentication and tenant context to all routes
router.use(verifyToken);
router.use(setTenantContext);

// Geocode address to coordinates
router.post('/geocode', [body('address').trim().isLength({
  min: 1
}).withMessage('Address is required')], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400, 'VALIDATION_ERROR', {
      details: errors.array()
    });
  }
  const {
    address
  } = req.body;
  const result = await mapsService.geocodeAddress(address);
  if (!result.success) {
    throw new AppError(result.error, 400, 'GEOCODING_FAILED');
  }
  res.json({
    success: true,
    data: result.data,
    meta: {
      timestamp: new Date().toISOString()
    }
  });
}));

// Reverse geocode coordinates to address
router.post('/reverse-geocode', [body('latitude').isFloat({
  min: -90,
  max: 90
}).withMessage('Valid latitude is required'), body('longitude').isFloat({
  min: -180,
  max: 180
}).withMessage('Valid longitude is required')], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400, 'VALIDATION_ERROR', {
      details: errors.array()
    });
  }
  const {
    latitude,
    longitude
  } = req.body;
  const result = await mapsService.reverseGeocode(latitude, longitude);
  if (!result.success) {
    throw new AppError(result.error, 400, 'REVERSE_GEOCODING_FAILED');
  }
  res.json({
    success: true,
    data: result.data,
    meta: {
      timestamp: new Date().toISOString()
    }
  });
}));

// Calculate distance between two points
router.post('/distance', [body('origin.latitude').isFloat({
  min: -90,
  max: 90
}).withMessage('Valid origin latitude is required'), body('origin.longitude').isFloat({
  min: -180,
  max: 180
}).withMessage('Valid origin longitude is required'), body('destination.latitude').isFloat({
  min: -90,
  max: 90
}).withMessage('Valid destination latitude is required'), body('destination.longitude').isFloat({
  min: -180,
  max: 180
}).withMessage('Valid destination longitude is required')], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400, 'VALIDATION_ERROR', {
      details: errors.array()
    });
  }
  const {
    origin,
    destination
  } = req.body;
  const distance = mapsService.calculateDistance(origin.latitude, origin.longitude, destination.latitude, destination.longitude);
  res.json({
    success: true,
    data: {
      distance: distance,
      unit: 'kilometers',
      origin: origin,
      destination: destination
    },
    meta: {
      timestamp: new Date().toISOString()
    }
  });
}));

// Get nearby libraries
router.get('/nearby-libraries', [queryValidator('latitude').isFloat({
  min: -90,
  max: 90
}).withMessage('Valid latitude is required'), queryValidator('longitude').isFloat({
  min: -180,
  max: 180
}).withMessage('Valid longitude is required'), queryValidator('radius').optional().isFloat({
  min: 0.1,
  max: 100
}).withMessage('Radius must be between 0.1 and 100 km')], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400, 'VALIDATION_ERROR', {
      details: errors.array()
    });
  }
  const {
    latitude,
    longitude,
    radius = 10
  } = req.query;

  // Get all active libraries
  const librariesResult = await query(`
    SELECT id, name, address, latitude, longitude, capacity, amenities, pricing, status
    FROM libraries
    WHERE status = 'active' AND latitude IS NOT NULL AND longitude IS NOT NULL
  `);
  const libraries = librariesResult.rows;
  const nearbyLibraries = await mapsService.findNearbyLibraries(parseFloat(latitude), parseFloat(longitude), parseFloat(radius), libraries);
  res.json({
    success: true,
    data: {
      libraries: nearbyLibraries,
      searchLocation: {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude)
      },
      radius: parseFloat(radius),
      count: nearbyLibraries.length
    },
    meta: {
      timestamp: new Date().toISOString()
    }
  });
}));

// Get directions between two points
router.post('/directions', [body('origin').isString().withMessage('Origin is required'), body('destination').isString().withMessage('Destination is required'), body('mode').optional().isIn(['driving', 'walking', 'bicycling', 'transit']).withMessage('Invalid travel mode')], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400, 'VALIDATION_ERROR', {
      details: errors.array()
    });
  }
  const {
    origin,
    destination,
    mode = 'driving'
  } = req.body;
  const result = await mapsService.getDirections(origin, destination, mode);
  if (!result.success) {
    throw new AppError(result.error, 400, 'DIRECTIONS_FAILED');
  }
  res.json({
    success: true,
    data: result.data,
    meta: {
      timestamp: new Date().toISOString()
    }
  });
}));

// Search for places
router.post('/search-places', [body('query').trim().isLength({
  min: 1
}).withMessage('Search query is required'), body('location.latitude').optional().isFloat({
  min: -90,
  max: 90
}).withMessage('Valid latitude is required'), body('location.longitude').optional().isFloat({
  min: -180,
  max: 180
}).withMessage('Valid longitude is required'), body('radius').optional().isFloat({
  min: 1,
  max: 50000
}).withMessage('Radius must be between 1 and 50000 meters'), body('type').optional().isString().withMessage('Type must be a string')], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400, 'VALIDATION_ERROR', {
      details: errors.array()
    });
  }
  const {
    query: searchQuery,
    location,
    radius = 5000,
    type
  } = req.body;
  const searchLocation = location ? {
    lat: location.latitude,
    lng: location.longitude
  } : null;
  const result = await mapsService.searchPlaces(searchQuery, searchLocation, radius, type);
  if (!result.success) {
    throw new AppError(result.error, 400, 'PLACE_SEARCH_FAILED');
  }
  res.json({
    success: true,
    data: {
      places: result.data,
      query: searchQuery,
      location: searchLocation,
      radius: radius,
      type: type,
      count: result.data.length
    },
    meta: {
      timestamp: new Date().toISOString()
    }
  });
}));

// Get place details
router.get('/place-details/:placeId', [queryValidator('fields').optional().isString().withMessage('Fields must be a string')], asyncHandler(async (req, res) => {
  const {
    placeId
  } = req.params;
  const {
    fields
  } = req.query;
  const fieldsArray = fields ? fields.split(',') : ['name', 'formatted_address', 'geometry', 'place_id'];
  const result = await mapsService.getPlaceDetails(placeId, fieldsArray);
  if (!result.success) {
    throw new AppError(result.error, 400, 'PLACE_DETAILS_FAILED');
  }
  res.json({
    success: true,
    data: result.data,
    meta: {
      timestamp: new Date().toISOString()
    }
  });
}));

// Generate static map image URL
router.post('/static-map', [body('latitude').isFloat({
  min: -90,
  max: 90
}).withMessage('Valid latitude is required'), body('longitude').isFloat({
  min: -180,
  max: 180
}).withMessage('Valid longitude is required'), body('zoom').optional().isInt({
  min: 1,
  max: 20
}).withMessage('Zoom must be between 1 and 20'), body('size').optional().matches(/^\d+x\d+$/).withMessage('Size must be in format WIDTHxHEIGHT'), body('markers').optional().isArray().withMessage('Markers must be an array')], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400, 'VALIDATION_ERROR', {
      details: errors.array()
    });
  }
  const {
    latitude,
    longitude,
    zoom = 15,
    size = '400x400',
    markers = []
  } = req.body;
  const mapUrl = mapsService.generateStaticMapUrl(latitude, longitude, zoom, size, markers);
  if (!mapUrl) {
    throw new AppError('Static map generation failed', 500, 'STATIC_MAP_FAILED');
  }
  res.json({
    success: true,
    data: {
      mapUrl: mapUrl,
      parameters: {
        latitude: latitude,
        longitude: longitude,
        zoom: zoom,
        size: size,
        markers: markers
      }
    },
    meta: {
      timestamp: new Date().toISOString()
    }
  });
}));

// Get maps configuration for frontend
router.get('/config', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: {
      googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY ? 'configured' : 'not_configured',
      isConfigured: mapsService.isConfigured(),
      features: {
        geocoding: mapsService.isConfigured(),
        directions: mapsService.isConfigured(),
        placeSearch: mapsService.isConfigured(),
        staticMaps: mapsService.isConfigured()
      }
    },
    meta: {
      timestamp: new Date().toISOString()
    }
  });
}));
module.exports = router;