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

const app = express();
const PORT = process.env.PORT || 3028;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/encryptiondb';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const MASTER_KEY = process.env.MASTER_KEY || 'master-encryption-key-2024';

app.use(express.json());
app.use(cors());
app.use(helmet());

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  message: "Too many requests from this IP, please try again later."
});
app.use(apiLimiter);

// Setup HTTP server for Socket.IO
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => logger.info('Connected to MongoDB'))
  .catch(err => logger.error('MongoDB connection error:', err));

// Initialize elliptic curve for ECC
const ec = new EC.ec('secp256k1');

// Mongoose Schemas
const EncryptionKeySchema = new mongoose.Schema({
  keyId: { type: String, required: true, unique: true },
  tenantId: { type: String, required: true },
  keyType: { 
    type: String, 
    enum: ['symmetric', 'asymmetric', 'hybrid'], 
    required: true 
  },
  algorithm: { 
    type: String, 
    enum: ['AES-256', 'RSA-2048', 'RSA-4096', 'ECC-P256', 'ECC-P384', 'ECC-P521'], 
    required: true 
  },
  publicKey: String,
  privateKey: String, // Encrypted with master key
  symmetricKey: String, // Encrypted with master key
  keyVersion: { type: Number, default: 1 },
  isActive: { type: Boolean, default: true },
  expiresAt: Date,
  metadata: mongoose.Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
const EncryptionKey = mongoose.model('EncryptionKey', EncryptionKeySchema);

const EncryptedDataSchema = new mongoose.Schema({
  dataId: { type: String, required: true, unique: true },
  tenantId: { type: String, required: true },
  keyId: { type: String, required: true },
  encryptedData: { type: String, required: true },
  iv: String, // For symmetric encryption
  tag: String, // For authenticated encryption
  algorithm: { type: String, required: true },
  keyVersion: { type: Number, required: true },
  dataType: { type: String, required: true },
  metadata: mongoose.Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
const EncryptedData = mongoose.model('EncryptedData', EncryptedDataSchema);

const EncryptionLogSchema = new mongoose.Schema({
  logId: { type: String, required: true, unique: true },
  tenantId: { type: String, required: true },
  userId: String,
  operation: { 
    type: String, 
    enum: ['encrypt', 'decrypt', 'key_generate', 'key_rotate', 'key_revoke'], 
    required: true 
  },
  keyId: String,
  dataId: String,
  algorithm: String,
  success: { type: Boolean, required: true },
  errorMessage: String,
  processingTime: Number, // milliseconds
  metadata: mongoose.Schema.Types.Mixed,
  timestamp: { type: Date, default: Date.now }
});
const EncryptionLog = mongoose.model('EncryptionLog', EncryptionLogSchema);

// Encryption utilities
class EncryptionManager {
  private masterKey: string;

  constructor() {
    this.masterKey = MASTER_KEY;
  }

  // Generate symmetric key
  generateSymmetricKey(algorithm: string = 'AES-256'): string {
    const keySize = algorithm === 'AES-256' ? 32 : 16;
    return crypto.randomBytes(keySize).toString('hex');
  }

  // Generate RSA key pair
  generateRSAKeyPair(keySize: number = 2048): { publicKey: string; privateKey: string } {
    const key = new NodeRSA({ b: keySize });
    return {
      publicKey: key.exportKey('public'),
      privateKey: key.exportKey('private')
    };
  }

  // Generate ECC key pair
  generateECCKeyPair(curve: string = 'secp256k1'): { publicKey: string; privateKey: string } {
    const keyPair = ec.genKeyPair();
    return {
      publicKey: keyPair.getPublic('hex'),
      privateKey: keyPair.getPrivate('hex')
    };
  }

  // Encrypt with AES
  encryptAES(data: string, key: string, iv?: string): { encrypted: string; iv: string } {
    const keyBuffer = Buffer.from(key, 'hex');
    const ivBuffer = iv ? Buffer.from(iv, 'hex') : crypto.randomBytes(16);
    
    const cipher = crypto.createCipher('aes-256-cbc', keyBuffer);
    cipher.setAutoPadding(true);
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return {
      encrypted,
      iv: ivBuffer.toString('hex')
    };
  }

  // Decrypt with AES
  decryptAES(encryptedData: string, key: string, iv: string): string {
    const keyBuffer = Buffer.from(key, 'hex');
    const ivBuffer = Buffer.from(iv, 'hex');
    
    const decipher = crypto.createDecipher('aes-256-cbc', keyBuffer);
    decipher.setAutoPadding(true);
    
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  // Encrypt with RSA
  encryptRSA(data: string, publicKey: string): string {
    const key = new NodeRSA();
    key.importKey(publicKey, 'public');
    return key.encrypt(data, 'base64');
  }

  // Decrypt with RSA
  decryptRSA(encryptedData: string, privateKey: string): string {
    const key = new NodeRSA();
    key.importKey(privateKey, 'private');
    return key.decrypt(encryptedData, 'utf8');
  }

  // Encrypt with ECC
  encryptECC(data: string, publicKey: string): { encrypted: string; ephemeralPublicKey: string } {
    const publicKeyBuffer = Buffer.from(publicKey, 'hex');
    const ephemeralKeyPair = ec.genKeyPair();
    
    const sharedSecret = ephemeralKeyPair.derive(publicKeyBuffer);
    const sharedSecretHex = sharedSecret.toString('hex');
    
    // Use shared secret to encrypt data with AES
    const encryptionResult = this.encryptAES(data, sharedSecretHex);
    
    return {
      encrypted: encryptionResult.encrypted,
      ephemeralPublicKey: ephemeralKeyPair.getPublic('hex')
    };
  }

  // Decrypt with ECC
  decryptECC(encryptedData: string, privateKey: string, ephemeralPublicKey: string): string {
    const privateKeyBuffer = Buffer.from(privateKey, 'hex');
    const ephemeralPublicKeyBuffer = Buffer.from(ephemeralPublicKey, 'hex');
    
    const keyPair = ec.keyFromPrivate(privateKeyBuffer);
    const sharedSecret = keyPair.derive(ephemeralPublicKeyBuffer);
    const sharedSecretHex = sharedSecret.toString('hex');
    
    // Extract IV from encrypted data (assuming it's prepended)
    const iv = encryptedData.substring(0, 32);
    const actualEncryptedData = encryptedData.substring(32);
    
    return this.decryptAES(actualEncryptedData, sharedSecretHex, iv);
  }

  // Encrypt key with master key
  encryptKey(key: string): string {
    return CryptoJS.AES.encrypt(key, this.masterKey).toString();
  }

  // Decrypt key with master key
  decryptKey(encryptedKey: string): string {
    const bytes = CryptoJS.AES.decrypt(encryptedKey, this.masterKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  // Generate hybrid encryption (combine symmetric and asymmetric)
  encryptHybrid(data: string, publicKey: string): { encryptedData: string; encryptedKey: string; iv: string } {
    // Generate random symmetric key
    const symmetricKey = this.generateSymmetricKey();
    
    // Encrypt data with symmetric key
    const dataEncryption = this.encryptAES(data, symmetricKey);
    
    // Encrypt symmetric key with public key
    const encryptedKey = this.encryptRSA(symmetricKey, publicKey);
    
    return {
      encryptedData: dataEncryption.encrypted,
      encryptedKey,
      iv: dataEncryption.iv
    };
  }

  // Decrypt hybrid encryption
  decryptHybrid(encryptedData: string, encryptedKey: string, iv: string, privateKey: string): string {
    // Decrypt symmetric key with private key
    const symmetricKey = this.decryptRSA(encryptedKey, privateKey);
    
    // Decrypt data with symmetric key
    return this.decryptAES(encryptedData, symmetricKey, iv);
  }

  // Generate hash
  generateHash(data: string, algorithm: string = 'sha256'): string {
    return crypto.createHash(algorithm).update(data).digest('hex');
  }

  // Generate HMAC
  generateHMAC(data: string, key: string, algorithm: string = 'sha256'): string {
    return crypto.createHmac(algorithm, key).update(data).digest('hex');
  }

  // Verify HMAC
  verifyHMAC(data: string, key: string, hmac: string, algorithm: string = 'sha256'): boolean {
    const expectedHmac = this.generateHMAC(data, key, algorithm);
    return crypto.timingSafeEqual(Buffer.from(hmac, 'hex'), Buffer.from(expectedHmac, 'hex'));
  }
}

const encryptionManager = new EncryptionManager();

// Helper functions
async function generateEncryptionKey(tenantId: string, keyType: string, algorithm: string) {
  try {
    let publicKey = '';
    let privateKey = '';
    let symmetricKey = '';

    switch (keyType) {
      case 'symmetric':
        symmetricKey = encryptionManager.generateSymmetricKey(algorithm);
        break;
      case 'asymmetric':
        if (algorithm.startsWith('RSA')) {
          const keySize = algorithm === 'RSA-4096' ? 4096 : 2048;
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
        const rsaKeyPair = encryptionManager.generateRSAKeyPair();
        publicKey = rsaKeyPair.publicKey;
        privateKey = rsaKeyPair.privateKey;
        symmetricKey = encryptionManager.generateSymmetricKey();
        break;
    }

    const keyId = uuidv4();
    const key = new EncryptionKey({
      keyId,
      tenantId,
      keyType,
      algorithm,
      publicKey,
      privateKey: privateKey ? encryptionManager.encryptKey(privateKey) : '',
      symmetricKey: symmetricKey ? encryptionManager.encryptKey(symmetricKey) : '',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await key.save();

    // Log key generation
    await logEncryptionOperation(tenantId, 'system', 'key_generate', keyId, algorithm, true);

    return key;
  } catch (error: any) {
    logger.error('Error generating encryption key:', error);
    await logEncryptionOperation(tenantId, 'system', 'key_generate', '', algorithm, false, error.message);
    throw error;
  }
}

async function encryptData(tenantId: string, data: any, keyId: string, userId?: string) {
  const startTime = Date.now();
  
  try {
    const key = await EncryptionKey.findOne({ keyId, tenantId, isActive: true });
    if (!key) {
      throw new Error('Encryption key not found');
    }

    const dataString = JSON.stringify(data);
    let encryptedData = '';
    let iv = '';
    let tag = '';

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
        const hybridResult = encryptionManager.encryptHybrid(dataString, key.publicKey);
        encryptedData = hybridResult.encryptedData;
        iv = hybridResult.iv;
        break;
    }

    const dataId = uuidv4();
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
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await encryptedDataRecord.save();

    const processingTime = Date.now() - startTime;
    await logEncryptionOperation(tenantId, userId, 'encrypt', keyId, dataId, key.algorithm, true, '', processingTime);

    return {
      dataId,
      encryptedData,
      iv,
      algorithm: key.algorithm,
      keyVersion: key.keyVersion
    };
  } catch (error: any) {
    const processingTime = Date.now() - startTime;
    logger.error('Error encrypting data:', error);
    await logEncryptionOperation(tenantId, userId, 'encrypt', keyId, '', '', false, error.message, processingTime);
    throw error;
  }
}

async function decryptData(tenantId: string, dataId: string, userId?: string) {
  const startTime = Date.now();
  
  try {
    const encryptedDataRecord = await EncryptedData.findOne({ dataId, tenantId });
    if (!encryptedDataRecord) {
      throw new Error('Encrypted data not found');
    }

    const key = await EncryptionKey.findOne({ 
      keyId: encryptedDataRecord.keyId, 
      tenantId, 
      isActive: true 
    });
    if (!key) {
      throw new Error('Encryption key not found');
    }

    let decryptedData = '';

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
        const hybridPrivateKey = encryptionManager.decryptKey(key.privateKey);
        decryptedData = encryptionManager.decryptHybrid(
          encryptedDataRecord.encryptedData,
          encryptedDataRecord.encryptedData, // This would need to be stored separately in real implementation
          encryptedDataRecord.iv,
          hybridPrivateKey
        );
        break;
    }

    const processingTime = Date.now() - startTime;
    await logEncryptionOperation(tenantId, userId, 'decrypt', key.keyId, dataId, key.algorithm, true, '', processingTime);

    return JSON.parse(decryptedData);
  } catch (error: any) {
    const processingTime = Date.now() - startTime;
    logger.error('Error decrypting data:', error);
    await logEncryptionOperation(tenantId, userId, 'decrypt', '', dataId, '', false, error.message, processingTime);
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
  processingTime?: number
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
      timestamp: new Date()
    });

    await log.save();
  } catch (error) {
    logger.error('Error logging encryption operation:', error);
  }
}

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Encryption Service is healthy', uptime: process.uptime() });
});

// Generate Encryption Key
app.post('/keys/generate', async (req, res) => {
  try {
    const { tenantId, keyType, algorithm } = req.body;
    
    if (!tenantId || !keyType || !algorithm) {
      return res.status(400).json({ message: 'tenantId, keyType, and algorithm are required' });
    }

    const key = await generateEncryptionKey(tenantId, keyType, algorithm);
    
    res.status(201).json({
      keyId: key.keyId,
      keyType: key.keyType,
      algorithm: key.algorithm,
      publicKey: key.publicKey,
      keyVersion: key.keyVersion,
      createdAt: key.createdAt
    });
  } catch (error: any) {
    logger.error('Error generating encryption key:', error);
    res.status(400).json({ message: error.message });
  }
});

// Get Encryption Keys
app.get('/keys', async (req, res) => {
  try {
    const { tenantId, keyType, isActive } = req.query;
    
    const filter: any = { tenantId };
    if (keyType) filter.keyType = keyType;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    
    const keys = await EncryptionKey.find(filter).sort({ createdAt: -1 });
    
    res.status(200).json(keys.map(key => ({
      keyId: key.keyId,
      keyType: key.keyType,
      algorithm: key.algorithm,
      publicKey: key.publicKey,
      keyVersion: key.keyVersion,
      isActive: key.isActive,
      createdAt: key.createdAt,
      expiresAt: key.expiresAt
    })));
  } catch (error: any) {
    logger.error('Error fetching encryption keys:', error);
    res.status(500).json({ message: error.message });
  }
});

// Encrypt Data
app.post('/encrypt', async (req, res) => {
  try {
    const { tenantId, data, keyId, userId } = req.body;
    
    if (!tenantId || !data || !keyId) {
      return res.status(400).json({ message: 'tenantId, data, and keyId are required' });
    }

    const result = await encryptData(tenantId, data, keyId, userId);
    
    res.status(200).json(result);
  } catch (error: any) {
    logger.error('Error encrypting data:', error);
    res.status(400).json({ message: error.message });
  }
});

// Decrypt Data
app.post('/decrypt', async (req, res) => {
  try {
    const { tenantId, dataId, userId } = req.body;
    
    if (!tenantId || !dataId) {
      return res.status(400).json({ message: 'tenantId and dataId are required' });
    }

    const decryptedData = await decryptData(tenantId, dataId, userId);
    
    res.status(200).json({ data: decryptedData });
  } catch (error: any) {
    logger.error('Error decrypting data:', error);
    res.status(400).json({ message: error.message });
  }
});

// Generate Hash
app.post('/hash', async (req, res) => {
  try {
    const { data, algorithm = 'sha256' } = req.body;
    
    if (!data) {
      return res.status(400).json({ message: 'data is required' });
    }

    const hash = encryptionManager.generateHash(data, algorithm);
    
    res.status(200).json({ hash, algorithm });
  } catch (error: any) {
    logger.error('Error generating hash:', error);
    res.status(400).json({ message: error.message });
  }
});

// Generate HMAC
app.post('/hmac', async (req, res) => {
  try {
    const { data, key, algorithm = 'sha256' } = req.body;
    
    if (!data || !key) {
      return res.status(400).json({ message: 'data and key are required' });
    }

    const hmac = encryptionManager.generateHMAC(data, key, algorithm);
    
    res.status(200).json({ hmac, algorithm });
  } catch (error: any) {
    logger.error('Error generating HMAC:', error);
    res.status(400).json({ message: error.message });
  }
});

// Verify HMAC
app.post('/verify-hmac', async (req, res) => {
  try {
    const { data, key, hmac, algorithm = 'sha256' } = req.body;
    
    if (!data || !key || !hmac) {
      return res.status(400).json({ message: 'data, key, and hmac are required' });
    }

    const isValid = encryptionManager.verifyHMAC(data, key, hmac, algorithm);
    
    res.status(200).json({ valid: isValid });
  } catch (error: any) {
    logger.error('Error verifying HMAC:', error);
    res.status(400).json({ message: error.message });
  }
});

// Key Rotation
app.post('/keys/:keyId/rotate', async (req, res) => {
  try {
    const { keyId } = req.params;
    const { tenantId } = req.body;
    
    const key = await EncryptionKey.findOne({ keyId, tenantId, isActive: true });
    if (!key) {
      return res.status(404).json({ message: 'Encryption key not found' });
    }

    // Generate new key
    const newKey = await generateEncryptionKey(tenantId, key.keyType, key.algorithm);
    
    // Deactivate old key
    key.isActive = false;
    key.updatedAt = new Date();
    await key.save();

    // Log key rotation
    await logEncryptionOperation(tenantId, 'system', 'key_rotate', keyId, '', key.algorithm, true);

    res.status(200).json({
      message: 'Key rotated successfully',
      oldKeyId: keyId,
      newKeyId: newKey.keyId,
      newKeyVersion: newKey.keyVersion
    });
  } catch (error: any) {
    logger.error('Error rotating key:', error);
    res.status(400).json({ message: error.message });
  }
});

// Revoke Key
app.post('/keys/:keyId/revoke', async (req, res) => {
  try {
    const { keyId } = req.params;
    const { tenantId } = req.body;
    
    const key = await EncryptionKey.findOne({ keyId, tenantId });
    if (!key) {
      return res.status(404).json({ message: 'Encryption key not found' });
    }

    key.isActive = false;
    key.updatedAt = new Date();
    await key.save();

    // Log key revocation
    await logEncryptionOperation(tenantId, 'system', 'key_revoke', keyId, '', key.algorithm, true);

    res.status(200).json({ message: 'Key revoked successfully' });
  } catch (error: any) {
    logger.error('Error revoking key:', error);
    res.status(400).json({ message: error.message });
  }
});

// Get Encryption Logs
app.get('/logs', async (req, res) => {
  try {
    const { tenantId, operation, success, limit = 100, page = 1 } = req.query;
    
    const filter: any = { tenantId };
    if (operation) filter.operation = operation;
    if (success !== undefined) filter.success = success === 'true';
    
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    
    const logs = await EncryptionLog.find(filter)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit as string));
    
    const total = await EncryptionLog.countDocuments(filter);
    
    res.status(200).json({
      logs,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string))
      }
    });
  } catch (error: any) {
    logger.error('Error fetching encryption logs:', error);
    res.status(500).json({ message: error.message });
  }
});

// Encryption Statistics
app.get('/stats', async (req, res) => {
  try {
    const { tenantId } = req.query;
    
    const filter = { tenantId };
    
    const totalKeys = await EncryptionKey.countDocuments(filter);
    const activeKeys = await EncryptionKey.countDocuments({ ...filter, isActive: true });
    const totalEncryptions = await EncryptionLog.countDocuments({ ...filter, operation: 'encrypt', success: true });
    const totalDecryptions = await EncryptionLog.countDocuments({ ...filter, operation: 'decrypt', success: true });
    const failedOperations = await EncryptionLog.countDocuments({ ...filter, success: false });
    
    const algorithmStats = await EncryptionKey.aggregate([
      { $match: filter },
      { $group: { _id: '$algorithm', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    const operationStats = await EncryptionLog.aggregate([
      { $match: filter },
      { $group: { _id: '$operation', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    res.status(200).json({
      summary: {
        totalKeys,
        activeKeys,
        totalEncryptions,
        totalDecryptions,
        failedOperations
      },
      algorithmStats,
      operationStats
    });
  } catch (error: any) {
    logger.error('Error fetching encryption stats:', error);
    res.status(500).json({ message: error.message });
  }
});

// Socket.IO for real-time updates
io.on('connection', (socket) => {
  logger.info('Client connected to Encryption Service:', socket.id);
  
  socket.on('subscribe-encryption', (data) => {
    socket.join(`encryption-${data.tenantId}`);
    logger.info(`Client subscribed to encryption updates for tenant ${data.tenantId}`);
  });
  
  socket.on('disconnect', () => {
    logger.info('Client disconnected from Encryption Service:', socket.id);
  });
});

server.listen(PORT, () => {
  logger.info(`Encryption Service running on port ${PORT}`);
  console.log(`Encryption Service running on port ${PORT}`);
});
