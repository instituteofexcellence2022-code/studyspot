import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { logger } from './utils/logger';
import mongoose from 'mongoose';
import crypto from 'crypto';
import CryptoJS from 'crypto-js';
import NodeRSA from 'node-rsa';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import moment from 'moment';
import axios from 'axios';
import { Server as SocketIOServer } from 'socket.io';
import http from 'http';
import forge from 'node-forge';
import EC from 'elliptic';
import secp256k1 from 'secp256k1';
import Joi from 'joi';
import _ from 'lodash';

const app = express();
const PORT = process.env.PORT || 3028;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/encryptiondb';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const MASTER_KEY = process.env.MASTER_KEY || 'master-encryption-key-2024';
const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379', 10);

// Security configuration
const SECURITY_CONFIG = {
  MAX_KEY_SIZE: 4096,
  MIN_KEY_SIZE: 1024,
  MAX_DATA_SIZE: 10 * 1024 * 1024, // 10MB
  KEY_ROTATION_INTERVAL: 90 * 24 * 60 * 60 * 1000, // 90 days
  MAX_ENCRYPTION_ATTEMPTS: 3,
  ENCRYPTION_TIMEOUT: 30000, // 30 seconds
  AUDIT_RETENTION_DAYS: 365
};

app.use(express.json({ limit: '10mb' }));
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true
}));
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Enhanced rate limiting with different limits for different operations
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000,
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

const encryptionLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // More restrictive for encryption operations
  message: "Too many encryption requests, please try again later.",
});

const keyManagementLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 50, // Very restrictive for key management
  message: "Too many key management requests, please try again later.",
});

app.use(generalLimiter);

// Setup HTTP server for Socket.IO
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || "*",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Connect to MongoDB with enhanced configuration
mongoose.connect(MONGODB_URI, {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  bufferCommands: false,
  bufferMaxEntries: 0
})
.then(() => logger.info('Connected to MongoDB with enhanced configuration'))
.catch(err => logger.error('MongoDB connection error:', err));

// Initialize elliptic curve for ECC
const ec = new EC.ec('secp256k1');

// Enhanced Mongoose Schemas with validation
const EncryptionKeySchema = new mongoose.Schema({
  keyId: { 
    type: String, 
    required: true, 
    unique: true,
    validate: {
      validator: function(v: string) {
        return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
      },
      message: 'Key ID must be a valid UUID'
    }
  },
  tenantId: { 
    type: String, 
    required: true,
    validate: {
      validator: function(v: string) {
        return v && v.length >= 3 && v.length <= 50;
      },
      message: 'Tenant ID must be between 3 and 50 characters'
    }
  },
  keyType: { 
    type: String, 
    enum: ['symmetric', 'asymmetric', 'hybrid'], 
    required: true 
  },
  algorithm: { 
    type: String, 
    enum: ['AES-256', 'RSA-1024', 'RSA-2048', 'RSA-4096', 'ECC-P256', 'ECC-P384', 'ECC-P521'], 
    required: true 
  },
  publicKey: { 
    type: String,
    validate: {
      validator: function(v: string) {
        if (this.keyType === 'symmetric') return !v;
        return v && v.length > 0;
      },
      message: 'Public key is required for asymmetric and hybrid encryption'
    }
  },
  privateKey: { 
    type: String,
    validate: {
      validator: function(v: string) {
        if (this.keyType === 'symmetric') return !v;
        return v && v.length > 0;
      },
      message: 'Private key is required for asymmetric and hybrid encryption'
    }
  },
  symmetricKey: { 
    type: String,
    validate: {
      validator: function(v: string) {
        if (this.keyType === 'asymmetric') return !v;
        return v && v.length > 0;
      },
      message: 'Symmetric key is required for symmetric and hybrid encryption'
    }
  },
  keyVersion: { type: Number, default: 1, min: 1 },
  isActive: { type: Boolean, default: true },
  expiresAt: { 
    type: Date,
    validate: {
      validator: function(v: Date) {
        return !v || v > new Date();
      },
      message: 'Expiration date must be in the future'
    }
  },
  metadata: {
    createdBy: String,
    purpose: String,
    environment: { type: String, enum: ['development', 'staging', 'production'], default: 'development' },
    compliance: [String], // GDPR, HIPAA, SOC2, etc.
    tags: [String]
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Add indexes for better performance
EncryptionKeySchema.index({ tenantId: 1, isActive: 1 });
EncryptionKeySchema.index({ keyId: 1 }, { unique: true });
EncryptionKeySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const EncryptionKey = mongoose.model('EncryptionKey', EncryptionKeySchema);

const EncryptedDataSchema = new mongoose.Schema({
  dataId: { 
    type: String, 
    required: true, 
    unique: true,
    validate: {
      validator: function(v: string) {
        return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
      },
      message: 'Data ID must be a valid UUID'
    }
  },
  tenantId: { 
    type: String, 
    required: true,
    validate: {
      validator: function(v: string) {
        return v && v.length >= 3 && v.length <= 50;
      },
      message: 'Tenant ID must be between 3 and 50 characters'
    }
  },
  keyId: { 
    type: String, 
    required: true,
    validate: {
      validator: function(v: string) {
        return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
      },
      message: 'Key ID must be a valid UUID'
    }
  },
  encryptedData: { 
    type: String, 
    required: true,
    validate: {
      validator: function(v: string) {
        return v && v.length > 0 && v.length <= SECURITY_CONFIG.MAX_DATA_SIZE;
      },
      message: 'Encrypted data must not be empty and within size limits'
    }
  },
  iv: { 
    type: String,
    validate: {
      validator: function(v: string) {
        if (this.algorithm?.includes('AES')) return v && v.length > 0;
        return true;
      },
      message: 'IV is required for AES encryption'
    }
  },
  tag: { 
    type: String,
    validate: {
      validator: function(v: string) {
        if (this.algorithm?.includes('GCM')) return v && v.length > 0;
        return true;
      },
      message: 'Tag is required for GCM encryption'
    }
  },
  algorithm: { 
    type: String, 
    required: true,
    enum: ['AES-256', 'RSA-1024', 'RSA-2048', 'RSA-4096', 'ECC-P256', 'ECC-P384', 'ECC-P521']
  },
  keyVersion: { type: Number, required: true, min: 1 },
  dataType: { 
    type: String, 
    required: true,
    enum: ['string', 'object', 'array', 'number', 'boolean', 'buffer']
  },
  metadata: {
    originalSize: Number,
    compressionRatio: Number,
    checksum: String,
    encryptionTime: Number,
    userId: String,
    purpose: String,
    classification: { type: String, enum: ['public', 'internal', 'confidential', 'restricted'], default: 'internal' }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Add indexes
EncryptedDataSchema.index({ tenantId: 1, keyId: 1 });
EncryptedDataSchema.index({ dataId: 1 }, { unique: true });
EncryptedDataSchema.index({ createdAt: 1 }, { expireAfterSeconds: SECURITY_CONFIG.AUDIT_RETENTION_DAYS * 24 * 60 * 60 });

const EncryptedData = mongoose.model('EncryptedData', EncryptedDataSchema);

const EncryptionLogSchema = new mongoose.Schema({
  logId: { 
    type: String, 
    required: true, 
    unique: true,
    validate: {
      validator: function(v: string) {
        return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
      },
      message: 'Log ID must be a valid UUID'
    }
  },
  tenantId: { 
    type: String, 
    required: true,
    validate: {
      validator: function(v: string) {
        return v && v.length >= 3 && v.length <= 50;
      },
      message: 'Tenant ID must be between 3 and 50 characters'
    }
  },
  userId: { 
    type: String,
    validate: {
      validator: function(v: string) {
        return !v || v.length >= 3 && v.length <= 50;
      },
      message: 'User ID must be between 3 and 50 characters'
    }
  },
  operation: { 
    type: String, 
    enum: ['encrypt', 'decrypt', 'key_generate', 'key_rotate', 'key_revoke', 'key_export', 'key_import'], 
    required: true 
  },
  keyId: { 
    type: String,
    validate: {
      validator: function(v: string) {
        return !v || /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
      },
      message: 'Key ID must be a valid UUID'
    }
  },
  dataId: { 
    type: String,
    validate: {
      validator: function(v: string) {
        return !v || /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
      },
      message: 'Data ID must be a valid UUID'
    }
  },
  algorithm: { 
    type: String,
    enum: ['AES-256', 'RSA-1024', 'RSA-2048', 'RSA-4096', 'ECC-P256', 'ECC-P384', 'ECC-P521']
  },
  success: { type: Boolean, required: true },
  errorMessage: { 
    type: String,
    validate: {
      validator: function(v: string) {
        return !this.success || !v;
      },
      message: 'Error message should only be present when operation failed'
    }
  },
  processingTime: { 
    type: Number, 
    min: 0,
    validate: {
      validator: function(v: number) {
        return v <= SECURITY_CONFIG.ENCRYPTION_TIMEOUT;
      },
      message: 'Processing time exceeds maximum allowed time'
    }
  },
  metadata: {
    ipAddress: String,
    userAgent: String,
    requestId: String,
    sessionId: String,
    dataSize: Number,
    keySize: Number,
    encryptionMode: String,
    complianceFlags: [String]
  },
  timestamp: { type: Date, default: Date.now }
});

// Add indexes
EncryptionLogSchema.index({ tenantId: 1, timestamp: -1 });
EncryptionLogSchema.index({ operation: 1, success: 1 });
EncryptionLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: SECURITY_CONFIG.AUDIT_RETENTION_DAYS * 24 * 60 * 60 });

const EncryptionLog = mongoose.model('EncryptionLog', EncryptionLogSchema);

// Enhanced validation schemas
const keyGenerationSchema = Joi.object({
  tenantId: Joi.string().min(3).max(50).required(),
  keyType: Joi.string().valid('symmetric', 'asymmetric', 'hybrid').required(),
  algorithm: Joi.string().valid('AES-256', 'RSA-1024', 'RSA-2048', 'RSA-4096', 'ECC-P256', 'ECC-P384', 'ECC-P521').required(),
  metadata: Joi.object({
    createdBy: Joi.string().min(3).max(50),
    purpose: Joi.string().max(200),
    environment: Joi.string().valid('development', 'staging', 'production'),
    compliance: Joi.array().items(Joi.string().valid('GDPR', 'HIPAA', 'SOC2', 'PCI-DSS', 'ISO27001')),
    tags: Joi.array().items(Joi.string().max(50))
  }).optional()
});

const encryptionSchema = Joi.object({
  tenantId: Joi.string().min(3).max(50).required(),
  data: Joi.alternatives().try(
    Joi.string().max(SECURITY_CONFIG.MAX_DATA_SIZE),
    Joi.object(),
    Joi.array(),
    Joi.number(),
    Joi.boolean()
  ).required(),
  keyId: Joi.string().uuid().required(),
  userId: Joi.string().min(3).max(50).optional(),
  metadata: Joi.object({
    purpose: Joi.string().max(200),
    classification: Joi.string().valid('public', 'internal', 'confidential', 'restricted'),
    userId: Joi.string().min(3).max(50)
  }).optional()
});

const decryptionSchema = Joi.object({
  tenantId: Joi.string().min(3).max(50).required(),
  dataId: Joi.string().uuid().required(),
  userId: Joi.string().min(3).max(50).optional()
});

// Enhanced Encryption utilities with comprehensive error handling
class EncryptionManager {
  private masterKey: string;
  private keyCache: Map<string, any> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.masterKey = MASTER_KEY;
    if (!this.masterKey || this.masterKey.length < 32) {
      throw new Error('Master key must be at least 32 characters long');
    }
  }

  // Enhanced symmetric key generation with validation
  generateSymmetricKey(algorithm: string = 'AES-256'): string {
    try {
      const keySize = algorithm === 'AES-256' ? 32 : algorithm === 'AES-192' ? 24 : 16;
      const key = crypto.randomBytes(keySize);
      
      if (key.length !== keySize) {
        throw new Error(`Generated key size ${key.length} does not match expected size ${keySize}`);
      }
      
      return key.toString('hex');
    } catch (error: any) {
      logger.error('Error generating symmetric key:', error);
      throw new Error(`Failed to generate symmetric key: ${error.message}`);
    }
  }

  // Enhanced RSA key pair generation with validation
  generateRSAKeyPair(keySize: number = 2048): { publicKey: string; privateKey: string } {
    try {
      if (keySize < SECURITY_CONFIG.MIN_KEY_SIZE || keySize > SECURITY_CONFIG.MAX_KEY_SIZE) {
        throw new Error(`Key size ${keySize} is not within allowed range ${SECURITY_CONFIG.MIN_KEY_SIZE}-${SECURITY_CONFIG.MAX_KEY_SIZE}`);
      }

      const key = new NodeRSA({ b: keySize });
      
      // Validate key generation
      if (!key.getKeySize() || key.getKeySize() !== keySize) {
        throw new Error(`Generated key size ${key.getKeySize()} does not match expected size ${keySize}`);
      }

      const publicKey = key.exportKey('public');
      const privateKey = key.exportKey('private');

      if (!publicKey || !privateKey) {
        throw new Error('Failed to export RSA keys');
      }

      return { publicKey, privateKey };
    } catch (error: any) {
      logger.error('Error generating RSA key pair:', error);
      throw new Error(`Failed to generate RSA key pair: ${error.message}`);
    }
  }

  // Enhanced ECC key pair generation with validation
  generateECCKeyPair(curve: string = 'secp256k1'): { publicKey: string; privateKey: string } {
    try {
      const keyPair = ec.genKeyPair();
      
      if (!keyPair || !keyPair.getPrivate() || !keyPair.getPublic()) {
        throw new Error('Failed to generate ECC key pair');
      }

      const publicKey = keyPair.getPublic('hex');
      const privateKey = keyPair.getPrivate('hex');

      if (!publicKey || !privateKey) {
        throw new Error('Failed to extract ECC keys');
      }

      return { publicKey, privateKey };
    } catch (error: any) {
      logger.error('Error generating ECC key pair:', error);
      throw new Error(`Failed to generate ECC key pair: ${error.message}`);
    }
  }

  // Enhanced AES encryption with comprehensive validation
  encryptAES(data: string, key: string, iv?: string): { encrypted: string; iv: string } {
    try {
      if (!data || typeof data !== 'string') {
        throw new Error('Data must be a non-empty string');
      }

      if (!key || typeof key !== 'string') {
        throw new Error('Key must be a non-empty string');
      }

      const keyBuffer = Buffer.from(key, 'hex');
      if (keyBuffer.length !== 32) {
        throw new Error('Key must be 32 bytes (256 bits) for AES-256');
      }

      const ivBuffer = iv ? Buffer.from(iv, 'hex') : crypto.randomBytes(16);
      if (ivBuffer.length !== 16) {
        throw new Error('IV must be 16 bytes');
      }

      const cipher = crypto.createCipher('aes-256-cbc', keyBuffer);
      cipher.setAutoPadding(true);

      let encrypted = cipher.update(data, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      if (!encrypted) {
        throw new Error('Encryption failed - no output generated');
      }

      return {
        encrypted,
        iv: ivBuffer.toString('hex')
      };
    } catch (error: any) {
      logger.error('Error in AES encryption:', error);
      throw new Error(`AES encryption failed: ${error.message}`);
    }
  }

  // Enhanced AES decryption with comprehensive validation
  decryptAES(encryptedData: string, key: string, iv: string): string {
    try {
      if (!encryptedData || typeof encryptedData !== 'string') {
        throw new Error('Encrypted data must be a non-empty string');
      }

      if (!key || typeof key !== 'string') {
        throw new Error('Key must be a non-empty string');
      }

      if (!iv || typeof iv !== 'string') {
        throw new Error('IV must be a non-empty string');
      }

      const keyBuffer = Buffer.from(key, 'hex');
      if (keyBuffer.length !== 32) {
        throw new Error('Key must be 32 bytes (256 bits) for AES-256');
      }

      const ivBuffer = Buffer.from(iv, 'hex');
      if (ivBuffer.length !== 16) {
        throw new Error('IV must be 16 bytes');
      }

      const decipher = crypto.createDecipher('aes-256-cbc', keyBuffer);
      decipher.setAutoPadding(true);

      let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      if (!decrypted) {
        throw new Error('Decryption failed - no output generated');
      }

      return decrypted;
    } catch (error: any) {
      logger.error('Error in AES decryption:', error);
      throw new Error(`AES decryption failed: ${error.message}`);
    }
  }

  // Enhanced RSA encryption with validation
  encryptRSA(data: string, publicKey: string): string {
    try {
      if (!data || typeof data !== 'string') {
        throw new Error('Data must be a non-empty string');
      }

      if (!publicKey || typeof publicKey !== 'string') {
        throw new Error('Public key must be a non-empty string');
      }

      const key = new NodeRSA();
      key.importKey(publicKey, 'public');

      if (!key.isPublic()) {
        throw new Error('Invalid public key format');
      }

      const encrypted = key.encrypt(data, 'base64');
      
      if (!encrypted) {
        throw new Error('RSA encryption failed - no output generated');
      }

      return encrypted;
    } catch (error: any) {
      logger.error('Error in RSA encryption:', error);
      throw new Error(`RSA encryption failed: ${error.message}`);
    }
  }

  // Enhanced RSA decryption with validation
  decryptRSA(encryptedData: string, privateKey: string): string {
    try {
      if (!encryptedData || typeof encryptedData !== 'string') {
        throw new Error('Encrypted data must be a non-empty string');
      }

      if (!privateKey || typeof privateKey !== 'string') {
        throw new Error('Private key must be a non-empty string');
      }

      const key = new NodeRSA();
      key.importKey(privateKey, 'private');

      if (!key.isPrivate()) {
        throw new Error('Invalid private key format');
      }

      const decrypted = key.decrypt(encryptedData, 'utf8');
      
      if (!decrypted) {
        throw new Error('RSA decryption failed - no output generated');
      }

      return decrypted;
    } catch (error: any) {
      logger.error('Error in RSA decryption:', error);
      throw new Error(`RSA decryption failed: ${error.message}`);
    }
  }

  // Enhanced key encryption with master key
  encryptKey(key: string): string {
    try {
      if (!key || typeof key !== 'string') {
        throw new Error('Key must be a non-empty string');
      }

      const encrypted = CryptoJS.AES.encrypt(key, this.masterKey).toString();
      
      if (!encrypted) {
        throw new Error('Key encryption failed');
      }

      return encrypted;
    } catch (error: any) {
      logger.error('Error encrypting key:', error);
      throw new Error(`Key encryption failed: ${error.message}`);
    }
  }

  // Enhanced key decryption with master key
  decryptKey(encryptedKey: string): string {
    try {
      if (!encryptedKey || typeof encryptedKey !== 'string') {
        throw new Error('Encrypted key must be a non-empty string');
      }

      const bytes = CryptoJS.AES.decrypt(encryptedKey, this.masterKey);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);

      if (!decrypted) {
        throw new Error('Key decryption failed - invalid encrypted key or master key');
      }

      return decrypted;
    } catch (error: any) {
      logger.error('Error decrypting key:', error);
      throw new Error(`Key decryption failed: ${error.message}`);
    }
  }

  // Enhanced hash generation with validation
  generateHash(data: string, algorithm: string = 'sha256'): string {
    try {
      if (!data || typeof data !== 'string') {
        throw new Error('Data must be a non-empty string');
      }

      const validAlgorithms = ['sha1', 'sha256', 'sha512', 'md5'];
      if (!validAlgorithms.includes(algorithm)) {
        throw new Error(`Unsupported hash algorithm: ${algorithm}`);
      }

      const hash = crypto.createHash(algorithm).update(data).digest('hex');
      
      if (!hash) {
        throw new Error('Hash generation failed');
      }

      return hash;
    } catch (error: any) {
      logger.error('Error generating hash:', error);
      throw new Error(`Hash generation failed: ${error.message}`);
    }
  }

  // Enhanced HMAC generation with validation
  generateHMAC(data: string, key: string, algorithm: string = 'sha256'): string {
    try {
      if (!data || typeof data !== 'string') {
        throw new Error('Data must be a non-empty string');
      }

      if (!key || typeof key !== 'string') {
        throw new Error('Key must be a non-empty string');
      }

      const validAlgorithms = ['sha1', 'sha256', 'sha512'];
      if (!validAlgorithms.includes(algorithm)) {
        throw new Error(`Unsupported HMAC algorithm: ${algorithm}`);
      }

      const hmac = crypto.createHmac(algorithm, key).update(data).digest('hex');
      
      if (!hmac) {
        throw new Error('HMAC generation failed');
      }

      return hmac;
    } catch (error: any) {
      logger.error('Error generating HMAC:', error);
      throw new Error(`HMAC generation failed: ${error.message}`);
    }
  }

  // Enhanced HMAC verification with timing-safe comparison
  verifyHMAC(data: string, key: string, hmac: string, algorithm: string = 'sha256'): boolean {
    try {
      if (!data || typeof data !== 'string') {
        throw new Error('Data must be a non-empty string');
      }

      if (!key || typeof key !== 'string') {
        throw new Error('Key must be a non-empty string');
      }

      if (!hmac || typeof hmac !== 'string') {
        throw new Error('HMAC must be a non-empty string');
      }

      const expectedHmac = this.generateHMAC(data, key, algorithm);
      
      // Use timing-safe comparison to prevent timing attacks
      return crypto.timingSafeEqual(
        Buffer.from(hmac, 'hex'), 
        Buffer.from(expectedHmac, 'hex')
      );
    } catch (error: any) {
      logger.error('Error verifying HMAC:', error);
      return false;
    }
  }

  // Clear cache
  clearCache(): void {
    this.keyCache.clear();
  }

  // Get cache statistics
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.keyCache.size,
      keys: Array.from(this.keyCache.keys())
    };
  }
}

const encryptionManager = new EncryptionManager();

// Enhanced helper functions with comprehensive error handling
async function generateEncryptionKey(tenantId: string, keyType: string, algorithm: string, metadata: any = {}) {
  const startTime = Date.now();
  
  try {
    // Validate inputs
    if (!tenantId || typeof tenantId !== 'string') {
      throw new Error('Valid tenantId is required');
    }

    if (!keyType || !['symmetric', 'asymmetric', 'hybrid'].includes(keyType)) {
      throw new Error('Valid keyType is required');
    }

    if (!algorithm || !['AES-256', 'RSA-1024', 'RSA-2048', 'RSA-4096', 'ECC-P256', 'ECC-P384', 'ECC-P521'].includes(algorithm)) {
      throw new Error('Valid algorithm is required');
    }

    // Check for existing active keys to prevent duplicates
    const existingKey = await EncryptionKey.findOne({ 
      tenantId, 
      keyType, 
      algorithm, 
      isActive: true 
    });

    if (existingKey) {
      logger.warn(`Active key already exists for tenant ${tenantId}, type ${keyType}, algorithm ${algorithm}`);
    }

    let publicKey = '';
    let privateKey = '';
    let symmetricKey = '';

    // Generate keys based on type
    switch (keyType) {
      case 'symmetric':
        symmetricKey = encryptionManager.generateSymmetricKey(algorithm);
        break;
      case 'asymmetric':
        if (algorithm.startsWith('RSA')) {
          const keySize = parseInt(algorithm.split('-')[1]);
          const keyPair = encryptionManager.generateRSAKeyPair(keySize);
          publicKey = keyPair.publicKey;
          privateKey = keyPair.privateKey;
        } else if (algorithm.startsWith('ECC')) {
          const keyPair = encryptionManager.generateECCKeyPair();
          publicKey = keyPair.publicKey;
          privateKey = keyPair.privateKey;
        }
        break;
      case 'hybrid':
        const rsaKeyPair = encryptionManager.generateRSAKeyPair(2048);
        publicKey = rsaKeyPair.publicKey;
        privateKey = rsaKeyPair.privateKey;
        symmetricKey = encryptionManager.generateSymmetricKey('AES-256');
        break;
    }

    const keyId = uuidv4();
    const expiresAt = new Date(Date.now() + SECURITY_CONFIG.KEY_ROTATION_INTERVAL);

    const key = new EncryptionKey({
      keyId,
      tenantId,
      keyType,
      algorithm,
      publicKey,
      privateKey: privateKey ? encryptionManager.encryptKey(privateKey) : '',
      symmetricKey: symmetricKey ? encryptionManager.encryptKey(symmetricKey) : '',
      expiresAt,
      metadata: {
        createdBy: metadata.createdBy || 'system',
        purpose: metadata.purpose || 'general',
        environment: metadata.environment || 'development',
        compliance: metadata.compliance || [],
        tags: metadata.tags || []
      },
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await key.save();

    const processingTime = Date.now() - startTime;

    // Log key generation
    await logEncryptionOperation(
      tenantId, 
      metadata.createdBy || 'system', 
      'key_generate', 
      keyId, 
      '', 
      algorithm, 
      true, 
      '', 
      processingTime,
      {
        keyType,
        keySize: algorithm.includes('RSA') ? parseInt(algorithm.split('-')[1]) : 256,
        expiresAt
      }
    );

    logger.info(`Encryption key generated successfully: ${keyId} for tenant ${tenantId}`);

    return {
      keyId: key.keyId,
      keyType: key.keyType,
      algorithm: key.algorithm,
      publicKey: key.publicKey,
      keyVersion: key.keyVersion,
      expiresAt: key.expiresAt,
      createdAt: key.createdAt
    };

  } catch (error: any) {
    const processingTime = Date.now() - startTime;
    logger.error(`Error generating encryption key for tenant ${tenantId}:`, error);
    
    await logEncryptionOperation(
      tenantId, 
      metadata.createdBy || 'system', 
      'key_generate', 
      '', 
      '', 
      algorithm, 
      false, 
      error.message, 
      processingTime
    );
    
    throw error;
  }
}

async function encryptData(tenantId: string, data: any, keyId: string, userId?: string, metadata: any = {}) {
  const startTime = Date.now();
  
  try {
    // Validate inputs
    if (!tenantId || typeof tenantId !== 'string') {
      throw new Error('Valid tenantId is required');
    }

    if (!data) {
      throw new Error('Data is required');
    }

    if (!keyId || typeof keyId !== 'string') {
      throw new Error('Valid keyId is required');
    }

    // Get encryption key
    const key = await EncryptionKey.findOne({ keyId, tenantId, isActive: true });
    if (!key) {
      throw new Error('Encryption key not found or inactive');
    }

    // Check key expiration
    if (key.expiresAt && key.expiresAt < new Date()) {
      throw new Error('Encryption key has expired');
    }

    const dataString = JSON.stringify(data);
    const originalSize = Buffer.byteLength(dataString, 'utf8');

    if (originalSize > SECURITY_CONFIG.MAX_DATA_SIZE) {
      throw new Error(`Data size ${originalSize} exceeds maximum allowed size ${SECURITY_CONFIG.MAX_DATA_SIZE}`);
    }

    let encryptedData = '';
    let iv = '';
    let tag = '';

    // Encrypt based on key type
    switch (key.keyType) {
      case 'symmetric':
        const symmetricKey = encryptionManager.decryptKey(key.symmetricKey);
        const aesResult = encryptionManager.encryptAES(dataString, symmetricKey);
        encryptedData = aesResult.encrypted;
        iv = aesResult.iv;
        break;
      case 'asymmetric':
        encryptedData = encryptionManager.encryptRSA(dataString, key.publicKey);
        break;
      case 'hybrid':
        const hybridSymmetricKey = encryptionManager.decryptKey(key.symmetricKey);
        const hybridResult = encryptionManager.encryptAES(dataString, hybridSymmetricKey);
        encryptedData = hybridResult.encrypted;
        iv = hybridResult.iv;
        break;
    }

    const dataId = uuidv4();
    const encryptedSize = Buffer.byteLength(encryptedData, 'utf8');
    const compressionRatio = originalSize > 0 ? encryptedSize / originalSize : 1;

    const encryptedDataRecord = new EncryptedData({
      dataId,
      tenantId,
      keyId,
      encryptedData,
      iv,
      tag,
      algorithm: key.algorithm,
      keyVersion: key.keyVersion,
      dataType: typeof data,
      metadata: {
        originalSize,
        compressionRatio,
        checksum: encryptionManager.generateHash(dataString),
        encryptionTime: Date.now() - startTime,
        userId: userId || metadata.userId,
        purpose: metadata.purpose || 'general',
        classification: metadata.classification || 'internal'
      },
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await encryptedDataRecord.save();

    const processingTime = Date.now() - startTime;

    // Log encryption operation
    await logEncryptionOperation(
      tenantId, 
      userId || 'system', 
      'encrypt', 
      keyId, 
      dataId, 
      key.algorithm, 
      true, 
      '', 
      processingTime,
      {
        dataSize: originalSize,
        encryptedSize,
        compressionRatio,
        dataType: typeof data
      }
    );

    logger.info(`Data encrypted successfully: ${dataId} for tenant ${tenantId}`);

    return {
      dataId,
      encryptedData,
      iv,
      algorithm: key.algorithm,
      keyVersion: key.keyVersion,
      metadata: {
        originalSize,
        encryptedSize,
        compressionRatio
      }
    };

  } catch (error: any) {
    const processingTime = Date.now() - startTime;
    logger.error(`Error encrypting data for tenant ${tenantId}:`, error);
    
    await logEncryptionOperation(
      tenantId, 
      userId || 'system', 
      'encrypt', 
      keyId, 
      '', 
      '', 
      false, 
      error.message, 
      processingTime
    );
    
    throw error;
  }
}

async function decryptData(tenantId: string, dataId: string, userId?: string) {
  const startTime = Date.now();
  
  try {
    // Validate inputs
    if (!tenantId || typeof tenantId !== 'string') {
      throw new Error('Valid tenantId is required');
    }

    if (!dataId || typeof dataId !== 'string') {
      throw new Error('Valid dataId is required');
    }

    // Get encrypted data record
    const encryptedDataRecord = await EncryptedData.findOne({ dataId, tenantId });
    if (!encryptedDataRecord) {
      throw new Error('Encrypted data not found');
    }

    // Get encryption key
    const key = await EncryptionKey.findOne({ 
      keyId: encryptedDataRecord.keyId, 
      tenantId, 
      isActive: true 
    });
    if (!key) {
      throw new Error('Encryption key not found or inactive');
    }

    // Check key expiration
    if (key.expiresAt && key.expiresAt < new Date()) {
      throw new Error('Encryption key has expired');
    }

    let decryptedData = '';

    // Decrypt based on key type
    switch (key.keyType) {
      case 'symmetric':
        const symmetricKey = encryptionManager.decryptKey(key.symmetricKey);
        decryptedData = encryptionManager.decryptAES(
          encryptedDataRecord.encryptedData, 
          symmetricKey, 
          encryptedDataRecord.iv
        );
        break;
      case 'asymmetric':
        const privateKey = encryptionManager.decryptKey(key.privateKey);
        decryptedData = encryptionManager.decryptRSA(encryptedDataRecord.encryptedData, privateKey);
        break;
      case 'hybrid':
        const hybridSymmetricKey = encryptionManager.decryptKey(key.symmetricKey);
        decryptedData = encryptionManager.decryptAES(
          encryptedDataRecord.encryptedData,
          hybridSymmetricKey,
          encryptedDataRecord.iv
        );
        break;
    }

    // Verify data integrity
    const decryptedString = JSON.stringify(JSON.parse(decryptedData));
    const expectedChecksum = encryptedDataRecord.metadata?.checksum;
    if (expectedChecksum) {
      const actualChecksum = encryptionManager.generateHash(decryptedString);
      if (actualChecksum !== expectedChecksum) {
        throw new Error('Data integrity check failed - checksum mismatch');
      }
    }

    const processingTime = Date.now() - startTime;

    // Log decryption operation
    await logEncryptionOperation(
      tenantId, 
      userId || 'system', 
      'decrypt', 
      key.keyId, 
      dataId, 
      key.algorithm, 
      true, 
      '', 
      processingTime,
      {
        dataSize: decryptedString.length,
        dataType: encryptedDataRecord.dataType
      }
    );

    logger.info(`Data decrypted successfully: ${dataId} for tenant ${tenantId}`);

    return JSON.parse(decryptedData);

  } catch (error: any) {
    const processingTime = Date.now() - startTime;
    logger.error(`Error decrypting data for tenant ${tenantId}:`, error);
    
    await logEncryptionOperation(
      tenantId, 
      userId || 'system', 
      'decrypt', 
      '', 
      dataId, 
      '', 
      false, 
      error.message, 
      processingTime
    );
    
    throw error;
  }
}

async function logEncryptionOperation(
  tenantId: string, 
  userId: string, 
  operation: string, 
  keyId: string, 
  dataId: string, 
  algorithm: string, 
  success: boolean, 
  errorMessage?: string, 
  processingTime?: number,
  metadata?: any
) {
  try {
    const log = new EncryptionLog({
      logId: uuidv4(),
      tenantId,
      userId,
      operation,
      keyId,
      dataId,
      algorithm,
      success,
      errorMessage,
      processingTime,
      metadata: {
        ...metadata,
        timestamp: new Date(),
        serviceVersion: '1.0.0'
      },
      timestamp: new Date()
    });

    await log.save();
  } catch (error) {
    logger.error('Error logging encryption operation:', error);
  }
}

// Enhanced middleware for request validation
const validateRequest = (schema: Joi.ObjectSchema) => {
  return (req: any, res: any, next: any) => {
    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        message: 'Validation error', 
        details: error.details.map(d => d.message),
        code: 'VALIDATION_ERROR'
      });
    }
    req.validatedData = value;
    next();
  };
};

// Enhanced error handling middleware
const errorHandler = (err: any, req: any, res: any, next: any) => {
  logger.error('Unhandled error:', err);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Validation error',
      details: err.message,
      code: 'VALIDATION_ERROR'
    });
  }
  
  if (err.name === 'CastError') {
    return res.status(400).json({
      message: 'Invalid data format',
      details: err.message,
      code: 'CAST_ERROR'
    });
  }
  
  if (err.code === 11000) {
    return res.status(409).json({
      message: 'Duplicate entry',
      details: 'A record with this identifier already exists',
      code: 'DUPLICATE_ERROR'
    });
  }
  
  res.status(500).json({
    message: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
    code: 'INTERNAL_ERROR'
  });
};

app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'Encryption Service is healthy', 
    uptime: process.uptime(),
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    services: {
      database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      cache: encryptionManager.getCacheStats()
    }
  });
});

// Generate Encryption Key with enhanced validation
app.post('/keys/generate', 
  keyManagementLimiter,
  validateRequest(keyGenerationSchema), 
  async (req, res) => {
    try {
      const { tenantId, keyType, algorithm, metadata } = req.validatedData;
      
      const key = await generateEncryptionKey(tenantId, keyType, algorithm, metadata);
      
      res.status(201).json({
        success: true,
        data: key,
        message: 'Encryption key generated successfully'
      });
    } catch (error: any) {
      logger.error('Error generating encryption key:', error);
      res.status(400).json({ 
        success: false,
        message: error.message,
        code: 'KEY_GENERATION_ERROR'
      });
    }
  }
);

// Get Encryption Keys with enhanced filtering
app.get('/keys', async (req, res) => {
  try {
    const { 
      tenantId, 
      keyType, 
      isActive, 
      algorithm,
      limit = 50, 
      page = 1,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    if (!tenantId) {
      return res.status(400).json({
        success: false,
        message: 'tenantId is required',
        code: 'MISSING_TENANT_ID'
      });
    }
    
    const filter: any = { tenantId };
    if (keyType) filter.keyType = keyType;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (algorithm) filter.algorithm = algorithm;
    
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;
    
    const keys = await EncryptionKey.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit as string))
      .select('-privateKey -symmetricKey'); // Exclude sensitive data
    
    const total = await EncryptionKey.countDocuments(filter);
    
    res.status(200).json({
      success: true,
      data: {
        keys: keys.map(key => ({
          keyId: key.keyId,
          keyType: key.keyType,
          algorithm: key.algorithm,
          publicKey: key.publicKey,
          keyVersion: key.keyVersion,
          isActive: key.isActive,
          expiresAt: key.expiresAt,
          metadata: key.metadata,
          createdAt: key.createdAt,
          updatedAt: key.updatedAt
        })),
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          pages: Math.ceil(total / parseInt(limit as string))
        }
      }
    });
  } catch (error: any) {
    logger.error('Error fetching encryption keys:', error);
    res.status(500).json({ 
      success: false,
      message: error.message,
      code: 'FETCH_KEYS_ERROR'
    });
  }
});

// Encrypt Data with enhanced validation
app.post('/encrypt', 
  encryptionLimiter,
  validateRequest(encryptionSchema), 
  async (req, res) => {
    try {
      const { tenantId, data, keyId, userId, metadata } = req.validatedData;
      
      const result = await encryptData(tenantId, data, keyId, userId, metadata);
      
      res.status(200).json({
        success: true,
        data: result,
        message: 'Data encrypted successfully'
      });
    } catch (error: any) {
      logger.error('Error encrypting data:', error);
      res.status(400).json({ 
        success: false,
        message: error.message,
        code: 'ENCRYPTION_ERROR'
      });
    }
  }
);

// Decrypt Data with enhanced validation
app.post('/decrypt', 
  encryptionLimiter,
  validateRequest(decryptionSchema), 
  async (req, res) => {
    try {
      const { tenantId, dataId, userId } = req.validatedData;
      
      const decryptedData = await decryptData(tenantId, dataId, userId);
      
      res.status(200).json({
        success: true,
        data: decryptedData,
        message: 'Data decrypted successfully'
      });
    } catch (error: any) {
      logger.error('Error decrypting data:', error);
      res.status(400).json({ 
        success: false,
        message: error.message,
        code: 'DECRYPTION_ERROR'
      });
    }
  }
);

// Generate Hash with enhanced validation
app.post('/hash', async (req, res) => {
  try {
    const { data, algorithm = 'sha256' } = req.body;
    
    if (!data || typeof data !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Data must be a non-empty string',
        code: 'INVALID_DATA'
      });
    }

    const hash = encryptionManager.generateHash(data, algorithm);
    
    res.status(200).json({
      success: true,
      data: { hash, algorithm },
      message: 'Hash generated successfully'
    });
  } catch (error: any) {
    logger.error('Error generating hash:', error);
    res.status(400).json({ 
      success: false,
      message: error.message,
      code: 'HASH_ERROR'
    });
  }
});

// Generate HMAC with enhanced validation
app.post('/hmac', async (req, res) => {
  try {
    const { data, key, algorithm = 'sha256' } = req.body;
    
    if (!data || typeof data !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Data must be a non-empty string',
        code: 'INVALID_DATA'
      });
    }

    if (!key || typeof key !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Key must be a non-empty string',
        code: 'INVALID_KEY'
      });
    }

    const hmac = encryptionManager.generateHMAC(data, key, algorithm);
    
    res.status(200).json({
      success: true,
      data: { hmac, algorithm },
      message: 'HMAC generated successfully'
    });
  } catch (error: any) {
    logger.error('Error generating HMAC:', error);
    res.status(400).json({ 
      success: false,
      message: error.message,
      code: 'HMAC_ERROR'
    });
  }
});

// Verify HMAC with enhanced validation
app.post('/verify-hmac', async (req, res) => {
  try {
    const { data, key, hmac, algorithm = 'sha256' } = req.body;
    
    if (!data || typeof data !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Data must be a non-empty string',
        code: 'INVALID_DATA'
      });
    }

    if (!key || typeof key !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Key must be a non-empty string',
        code: 'INVALID_KEY'
      });
    }

    if (!hmac || typeof hmac !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'HMAC must be a non-empty string',
        code: 'INVALID_HMAC'
      });
    }

    const isValid = encryptionManager.verifyHMAC(data, key, hmac, algorithm);
    
    res.status(200).json({
      success: true,
      data: { valid: isValid },
      message: isValid ? 'HMAC verification successful' : 'HMAC verification failed'
    });
  } catch (error: any) {
    logger.error('Error verifying HMAC:', error);
    res.status(400).json({ 
      success: false,
      message: error.message,
      code: 'HMAC_VERIFICATION_ERROR'
    });
  }
});

// Key Rotation with enhanced validation
app.post('/keys/:keyId/rotate', 
  keyManagementLimiter,
  async (req, res) => {
    try {
      const { keyId } = req.params;
      const { tenantId, reason } = req.body;
      
      if (!tenantId) {
        return res.status(400).json({
          success: false,
          message: 'tenantId is required',
          code: 'MISSING_TENANT_ID'
        });
      }

      if (!keyId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(keyId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid keyId format',
          code: 'INVALID_KEY_ID'
        });
      }
      
      const key = await EncryptionKey.findOne({ keyId, tenantId, isActive: true });
      if (!key) {
        return res.status(404).json({
          success: false,
          message: 'Encryption key not found',
          code: 'KEY_NOT_FOUND'
        });
      }

      // Generate new key with same parameters
      const newKey = await generateEncryptionKey(tenantId, key.keyType, key.algorithm, {
        createdBy: 'system',
        purpose: `Rotated from ${keyId}`,
        reason: reason || 'Scheduled rotation'
      });
      
      // Deactivate old key
      key.isActive = false;
      key.updatedAt = new Date();
      await key.save();

      // Log key rotation
      await logEncryptionOperation(
        tenantId, 
        'system', 
        'key_rotate', 
        keyId, 
        '', 
        key.algorithm, 
        true,
        '',
        0,
        {
          newKeyId: newKey.keyId,
          reason: reason || 'Scheduled rotation'
        }
      );

      res.status(200).json({
        success: true,
        data: {
          oldKeyId: keyId,
          newKeyId: newKey.keyId,
          newKeyVersion: newKey.keyVersion,
          rotatedAt: new Date()
        },
        message: 'Key rotated successfully'
      });
    } catch (error: any) {
      logger.error('Error rotating key:', error);
      res.status(400).json({ 
        success: false,
        message: error.message,
        code: 'KEY_ROTATION_ERROR'
      });
    }
  }
);

// Revoke Key with enhanced validation
app.post('/keys/:keyId/revoke', 
  keyManagementLimiter,
  async (req, res) => {
    try {
      const { keyId } = req.params;
      const { tenantId, reason } = req.body;
      
      if (!tenantId) {
        return res.status(400).json({
          success: false,
          message: 'tenantId is required',
          code: 'MISSING_TENANT_ID'
        });
      }

      if (!keyId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(keyId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid keyId format',
          code: 'INVALID_KEY_ID'
        });
      }
      
      const key = await EncryptionKey.findOne({ keyId, tenantId });
      if (!key) {
        return res.status(404).json({
          success: false,
          message: 'Encryption key not found',
          code: 'KEY_NOT_FOUND'
        });
      }

      key.isActive = false;
      key.updatedAt = new Date();
      await key.save();

      // Log key revocation
      await logEncryptionOperation(
        tenantId, 
        'system', 
        'key_revoke', 
        keyId, 
        '', 
        key.algorithm, 
        true,
        '',
        0,
        {
          reason: reason || 'Manual revocation'
        }
      );

      res.status(200).json({
        success: true,
        data: {
          keyId,
          revokedAt: new Date(),
          reason: reason || 'Manual revocation'
        },
        message: 'Key revoked successfully'
      });
    } catch (error: any) {
      logger.error('Error revoking key:', error);
      res.status(400).json({ 
        success: false,
        message: error.message,
        code: 'KEY_REVOCATION_ERROR'
      });
    }
  }
);

// Get Encryption Logs with enhanced filtering
app.get('/logs', async (req, res) => {
  try {
    const { 
      tenantId, 
      operation, 
      success, 
      algorithm,
      startDate,
      endDate,
      limit = 100, 
      page = 1,
      sortBy = 'timestamp',
      sortOrder = 'desc'
    } = req.query;
    
    if (!tenantId) {
      return res.status(400).json({
        success: false,
        message: 'tenantId is required',
        code: 'MISSING_TENANT_ID'
      });
    }
    
    const filter: any = { tenantId };
    if (operation) filter.operation = operation;
    if (success !== undefined) filter.success = success === 'true';
    if (algorithm) filter.algorithm = algorithm;
    
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate as string);
      if (endDate) filter.timestamp.$lte = new Date(endDate as string);
    }
    
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;
    
    const logs = await EncryptionLog.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit as string));
    
    const total = await EncryptionLog.countDocuments(filter);
    
    res.status(200).json({
      success: true,
      data: {
        logs,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          pages: Math.ceil(total / parseInt(limit as string))
        }
      }
    });
  } catch (error: any) {
    logger.error('Error fetching encryption logs:', error);
    res.status(500).json({ 
      success: false,
      message: error.message,
      code: 'FETCH_LOGS_ERROR'
    });
  }
});

// Enhanced Encryption Statistics
app.get('/stats', async (req, res) => {
  try {
    const { tenantId, startDate, endDate } = req.query;
    
    if (!tenantId) {
      return res.status(400).json({
        success: false,
        message: 'tenantId is required',
        code: 'MISSING_TENANT_ID'
      });
    }
    
    const filter = { tenantId };
    const dateFilter: any = {};
    
    if (startDate || endDate) {
      if (startDate) dateFilter.$gte = new Date(startDate as string);
      if (endDate) dateFilter.$lte = new Date(endDate as string);
    }
    
    const [
      totalKeys,
      activeKeys,
      expiredKeys,
      totalEncryptions,
      totalDecryptions,
      failedOperations,
      algorithmStats,
      operationStats,
      performanceStats
    ] = await Promise.all([
      EncryptionKey.countDocuments(filter),
      EncryptionKey.countDocuments({ ...filter, isActive: true }),
      EncryptionKey.countDocuments({ ...filter, expiresAt: { $lt: new Date() } }),
      EncryptionLog.countDocuments({ ...filter, operation: 'encrypt', success: true }),
      EncryptionLog.countDocuments({ ...filter, operation: 'decrypt', success: true }),
      EncryptionLog.countDocuments({ ...filter, success: false }),
      EncryptionLog.aggregate([
        { $match: { ...filter, ...(Object.keys(dateFilter).length > 0 ? { timestamp: dateFilter } : {}) } },
        { $group: { _id: '$algorithm', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      EncryptionLog.aggregate([
        { $match: { ...filter, ...(Object.keys(dateFilter).length > 0 ? { timestamp: dateFilter } : {}) } },
        { $group: { _id: '$operation', count: { $sum: 1 }, avgTime: { $avg: '$processingTime' } } },
        { $sort: { count: -1 } }
      ]),
      EncryptionLog.aggregate([
        { $match: { ...filter, processingTime: { $exists: true }, ...(Object.keys(dateFilter).length > 0 ? { timestamp: dateFilter } : {}) } },
        { $group: { 
          _id: null, 
          avgProcessingTime: { $avg: '$processingTime' },
          minProcessingTime: { $min: '$processingTime' },
          maxProcessingTime: { $max: '$processingTime' },
          totalProcessingTime: { $sum: '$processingTime' }
        } }
      ])
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalKeys,
          activeKeys,
          expiredKeys,
          totalEncryptions,
          totalDecryptions,
          failedOperations,
          successRate: totalEncryptions + totalDecryptions > 0 ? 
            ((totalEncryptions + totalDecryptions) / (totalEncryptions + totalDecryptions + failedOperations)) * 100 : 0
        },
        algorithmStats,
        operationStats,
        performanceStats: performanceStats[0] || {
          avgProcessingTime: 0,
          minProcessingTime: 0,
          maxProcessingTime: 0,
          totalProcessingTime: 0
        },
        cacheStats: encryptionManager.getCacheStats()
      }
    });
  } catch (error: any) {
    logger.error('Error fetching encryption stats:', error);
    res.status(500).json({ 
      success: false,
      message: error.message,
      code: 'FETCH_STATS_ERROR'
    });
  }
});

// Clear cache endpoint
app.post('/cache/clear', async (req, res) => {
  try {
    encryptionManager.clearCache();
    
    res.status(200).json({
      success: true,
      message: 'Cache cleared successfully',
      data: encryptionManager.getCacheStats()
    });
  } catch (error: any) {
    logger.error('Error clearing cache:', error);
    res.status(500).json({ 
      success: false,
      message: error.message,
      code: 'CACHE_CLEAR_ERROR'
    });
  }
});

// Socket.IO for real-time updates
io.on('connection', (socket) => {
  logger.info('Client connected to Encryption Service:', socket.id);
  
  socket.on('subscribe-encryption', (data) => {
    if (data.tenantId) {
      socket.join(`encryption-${data.tenantId}`);
      logger.info(`Client subscribed to encryption updates for tenant ${data.tenantId}`);
    }
  });
  
  socket.on('disconnect', () => {
    logger.info('Client disconnected from Encryption Service:', socket.id);
  });
});

// Enhanced error handling middleware
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  
  try {
    await mongoose.connection.close();
    logger.info('MongoDB connection closed');
    
    server.close(() => {
      logger.info('HTTP server closed');
      process.exit(0);
    });
  } catch (error) {
    logger.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  
  try {
    await mongoose.connection.close();
    logger.info('MongoDB connection closed');
    
    server.close(() => {
      logger.info('HTTP server closed');
      process.exit(0);
    });
  } catch (error) {
    logger.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
});

server.listen(PORT, () => {
  logger.info(`Enhanced Encryption Service running on port ${PORT}`);
  console.log(`Enhanced Encryption Service running on port ${PORT}`);
});