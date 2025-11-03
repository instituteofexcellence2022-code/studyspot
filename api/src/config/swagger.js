const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'StudySpot API',
      version: '1.0.0',
      description: 'StudySpot Platform API Documentation',
      contact: {
        name: 'StudySpot Team',
        email: 'support@studyspot.com',
        url: 'https://studyspot.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: process.env.API_BASE_URL || 'http://localhost:3001/api',
        description: 'Development server'
      },
      {
        url: 'https://api.studyspot.com/api',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'User ID'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address'
            },
            firstName: {
              type: 'string',
              description: 'User first name'
            },
            lastName: {
              type: 'string',
              description: 'User last name'
            },
            phone: {
              type: 'string',
              description: 'User phone number'
            },
            role: {
              type: 'string',
              enum: ['student', 'library_staff', 'branch_manager', 'super_admin'],
              description: 'User role'
            },
            status: {
              type: 'string',
              enum: ['active', 'inactive', 'suspended'],
              description: 'User status'
            },
            kycStatus: {
              type: 'string',
              enum: ['pending', 'verified', 'rejected'],
              description: 'KYC verification status'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'User creation timestamp'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'User last update timestamp'
            }
          }
        },
        Library: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Library ID'
            },
            name: {
              type: 'string',
              description: 'Library name'
            },
            description: {
              type: 'string',
              description: 'Library description'
            },
            address: {
              type: 'string',
              description: 'Library address'
            },
            city: {
              type: 'string',
              description: 'City'
            },
            state: {
              type: 'string',
              description: 'State'
            },
            country: {
              type: 'string',
              description: 'Country'
            },
            location: {
              type: 'object',
              properties: {
                latitude: {
                  type: 'number',
                  format: 'float'
                },
                longitude: {
                  type: 'number',
                  format: 'float'
                }
              }
            },
            capacity: {
              type: 'integer',
              description: 'Total seating capacity'
            },
            amenities: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Available amenities'
            },
            pricing: {
              type: 'object',
              properties: {
                hourly: {
                  type: 'number',
                  format: 'float'
                },
                daily: {
                  type: 'number',
                  format: 'float'
                },
                monthly: {
                  type: 'number',
                  format: 'float'
                }
              }
            },
            operatingHours: {
              type: 'object',
              description: 'Operating hours for each day'
            },
            rating: {
              type: 'number',
              format: 'float',
              minimum: 0,
              maximum: 5
            },
            reviewCount: {
              type: 'integer',
              description: 'Number of reviews'
            }
          }
        },
        Booking: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Booking ID'
            },
            bookingDate: {
              type: 'string',
              format: 'date',
              description: 'Booking date'
            },
            startTime: {
              type: 'string',
              format: 'time',
              description: 'Start time'
            },
            endTime: {
              type: 'string',
              format: 'time',
              description: 'End time'
            },
            bookingType: {
              type: 'string',
              enum: ['hourly', 'daily', 'monthly'],
              description: 'Type of booking'
            },
            status: {
              type: 'string',
              enum: ['confirmed', 'cancelled', 'completed', 'no_show'],
              description: 'Booking status'
            },
            paymentStatus: {
              type: 'string',
              enum: ['pending', 'completed', 'failed', 'refunded'],
              description: 'Payment status'
            },
            totalAmount: {
              type: 'number',
              format: 'float',
              description: 'Total booking amount'
            },
            checkInTime: {
              type: 'string',
              format: 'date-time',
              description: 'Check-in timestamp'
            },
            checkOutTime: {
              type: 'string',
              format: 'date-time',
              description: 'Check-out timestamp'
            },
            qrCode: {
              type: 'string',
              description: 'QR code for check-in'
            },
            library: {
              type: 'object',
              properties: {
                name: {
                  type: 'string'
                },
                address: {
                  type: 'string'
                }
              }
            },
            seat: {
              type: 'object',
              properties: {
                number: {
                  type: 'string'
                },
                zone: {
                  type: 'string'
                }
              }
            }
          }
        },
        Payment: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Payment ID'
            },
            amount: {
              type: 'number',
              format: 'float',
              description: 'Payment amount'
            },
            currency: {
              type: 'string',
              description: 'Currency code'
            },
            paymentMethod: {
              type: 'string',
              enum: ['online', 'offline'],
              description: 'Payment method'
            },
            paymentGateway: {
              type: 'string',
              description: 'Payment gateway used'
            },
            status: {
              type: 'string',
              enum: ['pending', 'completed', 'failed', 'cancelled', 'refunded'],
              description: 'Payment status'
            },
            gatewayPaymentId: {
              type: 'string',
              description: 'Gateway payment ID'
            },
            gatewayOrderId: {
              type: 'string',
              description: 'Gateway order ID'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Payment creation timestamp'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            data: {
              type: 'null'
            },
            meta: {
              type: 'object',
              properties: {
                timestamp: {
                  type: 'string',
                  format: 'date-time'
                }
              }
            },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  code: {
                    type: 'string',
                    description: 'Error code'
                  },
                  message: {
                    type: 'string',
                    description: 'Error message'
                  },
                  details: {
                    type: 'object',
                    description: 'Additional error details'
                  }
                }
              }
            }
          }
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            data: {
              type: 'object',
              description: 'Response data'
            },
            meta: {
              type: 'object',
              properties: {
                timestamp: {
                  type: 'string',
                  format: 'date-time'
                },
                pagination: {
                  type: 'object',
                  properties: {
                    page: {
                      type: 'integer'
                    },
                    limit: {
                      type: 'integer'
                    },
                    total: {
                      type: 'integer'
                    },
                    totalPages: {
                      type: 'integer'
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: [
    './src/routes/*.js',
    './src/index.js'
  ]
};

const specs = swaggerJSDoc(options);

module.exports = specs;







































