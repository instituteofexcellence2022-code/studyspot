import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import { logger } from './utils/logger';
import mongoose from 'mongoose';
import i18next from 'i18next';
import Backend from 'i18next-fs-backend';
import middleware from 'i18next-http-middleware';
import { translate } from 'google-translate-api-x';
import axios from 'axios';
import { Server as SocketIOServer } from 'socket.io';
import http from 'http';
import { v4 as uuidv4 } from 'uuid';
import moment from 'moment';
import _ from 'lodash';
import csv from 'csv-parser';
import ExcelJS from 'exceljs';
import { Parser } from 'json2csv';
import cron from 'node-cron';
import { Queue, Worker, Job } from 'bullmq';

const app = express();
const PORT = process.env.PORT || 3029;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/i18ndb';
const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379', 10);

app.use(express.json());
app.use(cors());

// Setup HTTP server for Socket.IO
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const connection = {
  host: REDIS_HOST,
  port: REDIS_PORT,
};

const translationQueue = new Queue('translationQueue', { connection });

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => logger.info('Connected to MongoDB'))
  .catch(err => logger.error('MongoDB connection error:', err));

// Initialize i18next
i18next
  .use(Backend)
  .use(middleware.LanguageDetector)
  .init({
    lng: 'en',
    fallbackLng: 'en',
    debug: false,
    backend: {
      loadPath: './locales/{{lng}}/{{ns}}.json'
    },
    detection: {
      order: ['header', 'querystring', 'cookie'],
      caches: ['cookie']
    }
  });

// Mongoose Schemas
const LanguageSchema = new mongoose.Schema({
  languageId: { type: String, required: true, unique: true },
  tenantId: { type: String, required: true },
  code: { type: String, required: true }, // en, es, fr, de, etc.
  name: { type: String, required: true }, // English, Spanish, French, German
  nativeName: { type: String, required: true }, // English, Español, Français, Deutsch
  isRTL: { type: Boolean, default: false }, // Right-to-left languages
  isActive: { type: Boolean, default: true },
  isDefault: { type: Boolean, default: false },
  metadata: {
    country: String,
    region: String,
    script: String,
    currency: String,
    dateFormat: String,
    timeFormat: String,
    numberFormat: String
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
const Language = mongoose.model('Language', LanguageSchema);

const TranslationSchema = new mongoose.Schema({
  translationId: { type: String, required: true, unique: true },
  tenantId: { type: String, required: true },
  namespace: { type: String, required: true }, // common, auth, dashboard, etc.
  key: { type: String, required: true },
  language: { type: String, required: true },
  value: { type: String, required: true },
  context: String, // Additional context for translators
  isPlural: { type: Boolean, default: false },
  pluralForms: [String], // For languages with multiple plural forms
  isAutoTranslated: { type: Boolean, default: false },
  translatorId: String,
  lastModified: { type: Date, default: Date.now },
  version: { type: Number, default: 1 },
  metadata: mongoose.Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
const Translation = mongoose.model('Translation', TranslationSchema);

const TranslationRequestSchema = new mongoose.Schema({
  requestId: { type: String, required: true, unique: true },
  tenantId: { type: String, required: true },
  userId: String,
  sourceLanguage: { type: String, required: true },
  targetLanguage: { type: String, required: true },
  text: { type: String, required: true },
  context: String,
  status: { 
    type: String, 
    enum: ['pending', 'processing', 'completed', 'failed'], 
    default: 'pending' 
  },
  translatedText: String,
  confidence: Number, // Translation confidence score
  provider: { type: String, default: 'google' }, // google, microsoft, deepl, etc.
  errorMessage: String,
  processingTime: Number, // milliseconds
  metadata: mongoose.Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
const TranslationRequest = mongoose.model('TranslationRequest', TranslationRequestSchema);

const UserLanguagePreferenceSchema = new mongoose.Schema({
  preferenceId: { type: String, required: true, unique: true },
  tenantId: { type: String, required: true },
  userId: { type: String, required: true },
  preferredLanguage: { type: String, required: true },
  fallbackLanguage: { type: String, default: 'en' },
  autoDetect: { type: Boolean, default: true },
  lastUsed: { type: Date, default: Date.now },
  metadata: mongoose.Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
const UserLanguagePreference = mongoose.model('UserLanguagePreference', UserLanguagePreferenceSchema);

// Supported languages
const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English', isRTL: false, country: 'US' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', isRTL: false, country: 'ES' },
  { code: 'fr', name: 'French', nativeName: 'Français', isRTL: false, country: 'FR' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', isRTL: false, country: 'DE' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', isRTL: false, country: 'IT' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', isRTL: false, country: 'PT' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', isRTL: false, country: 'RU' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', isRTL: false, country: 'JP' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', isRTL: false, country: 'KR' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', isRTL: false, country: 'CN' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', isRTL: false, country: 'IN' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', isRTL: true, country: 'SA' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', isRTL: true, country: 'PK' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', isRTL: false, country: 'BD' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', isRTL: false, country: 'IN' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', isRTL: false, country: 'IN' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', isRTL: false, country: 'IN' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', isRTL: false, country: 'IN' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', isRTL: false, country: 'IN' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', isRTL: false, country: 'IN' }
];

// Worker to process translation jobs
const worker = new Worker('translationQueue', async (job: Job) => {
  logger.info(`Processing translation job ${job.id} of type ${job.name}`);
  const { jobType, data } = job.data;

  try {
    switch (jobType) {
      case 'translate_text':
        await translateText(data);
        break;
      case 'auto_translate_missing':
        await autoTranslateMissing(data);
        break;
      case 'update_translations':
        await updateTranslations(data);
        break;
      case 'detect_language':
        await detectLanguage(data);
        break;
      default:
        logger.warn(`Unknown translation job type: ${jobType}`);
    }
  } catch (error: any) {
    logger.error(`Error processing translation job ${job.id}:`, error);
    throw error;
  }
}, { connection });

worker.on('failed', (job, err) => {
  logger.error(`Translation job ${job?.id} failed with error ${err.message}`);
});

// Helper functions
async function translateText(data: any) {
  const { requestId, tenantId, sourceLanguage, targetLanguage, text, context } = data;
  
  try {
    const startTime = Date.now();
    
    // Update request status to processing
    await TranslationRequest.findOneAndUpdate(
      { requestId },
      { status: 'processing', updatedAt: new Date() }
    );

    // Use Google Translate API
    const result = await translate(text, {
      from: sourceLanguage,
      to: targetLanguage
    });

    const processingTime = Date.now() - startTime;

    // Update request with translation result
    await TranslationRequest.findOneAndUpdate(
      { requestId },
      {
        status: 'completed',
        translatedText: result.text,
        confidence: result.confidence || 0.95,
        processingTime,
        updatedAt: new Date()
      }
    );

    logger.info(`Translation completed: ${sourceLanguage} -> ${targetLanguage}`);
    
  } catch (error: any) {
    logger.error(`Error translating text:`, error);
    
    await TranslationRequest.findOneAndUpdate(
      { requestId },
      {
        status: 'failed',
        errorMessage: error.message,
        updatedAt: new Date()
      }
    );
    
    throw error;
  }
}

async function autoTranslateMissing(data: any) {
  const { tenantId, namespace, sourceLanguage, targetLanguages } = data;
  
  try {
    // Get all translations for the source language and namespace
    const sourceTranslations = await Translation.find({
      tenantId,
      namespace,
      language: sourceLanguage
    });

    for (const targetLanguage of targetLanguages) {
      // Check which translations are missing for target language
      const existingTranslations = await Translation.find({
        tenantId,
        namespace,
        language: targetLanguage
      });

      const existingKeys = existingTranslations.map(t => t.key);
      const missingTranslations = sourceTranslations.filter(
        t => !existingKeys.includes(t.key)
      );

      // Translate missing translations
      for (const translation of missingTranslations) {
        try {
          const result = await translate(translation.value, {
            from: sourceLanguage,
            to: targetLanguage
          });

          const newTranslation = new Translation({
            translationId: uuidv4(),
            tenantId,
            namespace: translation.namespace,
            key: translation.key,
            language: targetLanguage,
            value: result.text,
            context: translation.context,
            isPlural: translation.isPlural,
            pluralForms: translation.pluralForms,
            isAutoTranslated: true,
            translatorId: 'system',
            lastModified: new Date(),
            version: 1,
            metadata: {
              sourceLanguage,
              confidence: result.confidence || 0.95,
              autoTranslatedAt: new Date()
            },
            createdAt: new Date(),
            updatedAt: new Date()
          });

          await newTranslation.save();
          
        } catch (error) {
          logger.error(`Error auto-translating ${translation.key} to ${targetLanguage}:`, error);
        }
      }
    }

    logger.info(`Auto-translation completed for namespace ${namespace}`);
    
  } catch (error: any) {
    logger.error(`Error in auto-translation:`, error);
    throw error;
  }
}

async function updateTranslations(data: any) {
  const { tenantId, translations } = data;
  
  try {
    for (const translation of translations) {
      await Translation.findOneAndUpdate(
        {
          tenantId,
          namespace: translation.namespace,
          key: translation.key,
          language: translation.language
        },
        {
          value: translation.value,
          context: translation.context,
          isAutoTranslated: false,
          translatorId: translation.translatorId,
          lastModified: new Date(),
          version: { $inc: 1 },
          updatedAt: new Date()
        },
        { upsert: true, new: true }
      );
    }

    logger.info(`Translations updated for tenant ${tenantId}`);
    
  } catch (error: any) {
    logger.error(`Error updating translations:`, error);
    throw error;
  }
}

async function detectLanguage(data: any) {
  const { text, tenantId, userId } = data;
  
  try {
    // Simple language detection based on character patterns
    // In a real implementation, you would use a proper language detection library
    
    const languagePatterns = {
      'en': /[a-zA-Z]/,
      'ar': /[\u0600-\u06FF]/,
      'hi': /[\u0900-\u097F]/,
      'zh': /[\u4e00-\u9fff]/,
      'ja': /[\u3040-\u309f\u30a0-\u30ff]/,
      'ko': /[\uac00-\ud7af]/,
      'ru': /[\u0400-\u04ff]/,
      'es': /[ñáéíóúü]/i,
      'fr': /[àâäéèêëïîôöùûüÿç]/i,
      'de': /[äöüß]/i
    };

    let detectedLanguage = 'en';
    let maxScore = 0;

    for (const [lang, pattern] of Object.entries(languagePatterns)) {
      const matches = text.match(new RegExp(pattern, 'g'));
      const score = matches ? matches.length : 0;
      
      if (score > maxScore) {
        maxScore = score;
        detectedLanguage = lang;
      }
    }

    // Update user language preference if auto-detect is enabled
    if (userId) {
      const preference = await UserLanguagePreference.findOne({ tenantId, userId });
      if (preference && preference.autoDetect) {
        preference.preferredLanguage = detectedLanguage;
        preference.lastUsed = new Date();
        preference.updatedAt = new Date();
        await preference.save();
      }
    }

    logger.info(`Language detected: ${detectedLanguage} for text: ${text.substring(0, 50)}...`);
    
    return detectedLanguage;
    
  } catch (error: any) {
    logger.error(`Error detecting language:`, error);
    throw error;
  }
}

async function initializeDefaultLanguages(tenantId: string) {
  try {
    for (const lang of SUPPORTED_LANGUAGES) {
      const existingLanguage = await Language.findOne({ tenantId, code: lang.code });
      
      if (!existingLanguage) {
        const language = new Language({
          languageId: uuidv4(),
          tenantId,
          code: lang.code,
          name: lang.name,
          nativeName: lang.nativeName,
          isRTL: lang.isRTL,
          isActive: lang.code === 'en', // Only English is active by default
          isDefault: lang.code === 'en',
          metadata: {
            country: lang.country,
            region: 'global',
            script: 'latin',
            currency: 'USD',
            dateFormat: 'MM/DD/YYYY',
            timeFormat: '12h',
            numberFormat: '1,234.56'
          },
          createdAt: new Date(),
          updatedAt: new Date()
        });

        await language.save();
      }
    }

    logger.info(`Default languages initialized for tenant ${tenantId}`);
    
  } catch (error: any) {
    logger.error(`Error initializing default languages:`, error);
    throw error;
  }
}

async function getTranslations(tenantId: string, language: string, namespace: string = 'common') {
  try {
    const translations = await Translation.find({
      tenantId,
      language,
      namespace
    });

    const translationObject = {};
    translations.forEach(t => {
      _.set(translationObject, t.key, t.value);
    });

    return translationObject;
  } catch (error: any) {
    logger.error(`Error getting translations:`, error);
    throw error;
  }
}

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'i18n Service is healthy', uptime: process.uptime() });
});

// Initialize tenant languages
app.post('/tenants/:tenantId/initialize', async (req, res) => {
  try {
    const { tenantId } = req.params;
    
    await initializeDefaultLanguages(tenantId);
    
    res.status(200).json({ message: 'Languages initialized successfully' });
  } catch (error: any) {
    logger.error('Error initializing languages:', error);
    res.status(400).json({ message: error.message });
  }
});

// Get supported languages
app.get('/languages', async (req, res) => {
  try {
    const { tenantId } = req.query;
    
    const languages = await Language.find({ tenantId, isActive: true }).sort({ name: 1 });
    
    res.status(200).json(languages);
  } catch (error: any) {
    logger.error('Error fetching languages:', error);
    res.status(500).json({ message: error.message });
  }
});

// Add/Update language
app.post('/languages', async (req, res) => {
  try {
    const { tenantId, code, name, nativeName, isRTL, metadata } = req.body;
    
    const language = new Language({
      languageId: uuidv4(),
      tenantId,
      code,
      name,
      nativeName,
      isRTL: isRTL || false,
      isActive: true,
      isDefault: false,
      metadata,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await language.save();
    
    res.status(201).json(language);
  } catch (error: any) {
    logger.error('Error adding language:', error);
    res.status(400).json({ message: error.message });
  }
});

// Get translations
app.get('/translations', async (req, res) => {
  try {
    const { tenantId, language, namespace = 'common' } = req.query;
    
    const translations = await getTranslations(tenantId as string, language as string, namespace as string);
    
    res.status(200).json(translations);
  } catch (error: any) {
    logger.error('Error fetching translations:', error);
    res.status(500).json({ message: error.message });
  }
});

// Add/Update translation
app.post('/translations', async (req, res) => {
  try {
    const { tenantId, namespace, key, language, value, context, translatorId } = req.body;
    
    const translation = await Translation.findOneAndUpdate(
      { tenantId, namespace, key, language },
      {
        value,
        context,
        isAutoTranslated: false,
        translatorId,
        lastModified: new Date(),
        version: { $inc: 1 },
        updatedAt: new Date()
      },
      { upsert: true, new: true }
    );
    
    res.status(200).json(translation);
  } catch (error: any) {
    logger.error('Error updating translation:', error);
    res.status(400).json({ message: error.message });
  }
});

// Bulk update translations
app.post('/translations/bulk', async (req, res) => {
  try {
    const { tenantId, translations } = req.body;
    
    await translationQueue.add('update_translations', {
      jobType: 'update_translations',
      data: { tenantId, translations }
    });
    
    res.status(202).json({ message: 'Translation update initiated' });
  } catch (error: any) {
    logger.error('Error bulk updating translations:', error);
    res.status(400).json({ message: error.message });
  }
});

// Translate text
app.post('/translate', async (req, res) => {
  try {
    const { tenantId, sourceLanguage, targetLanguage, text, context, userId } = req.body;
    
    const requestId = uuidv4();
    
    const request = new TranslationRequest({
      requestId,
      tenantId,
      userId,
      sourceLanguage,
      targetLanguage,
      text,
      context,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await request.save();
    
    await translationQueue.add('translate_text', {
      jobType: 'translate_text',
      data: { requestId, tenantId, sourceLanguage, targetLanguage, text, context }
    });
    
    res.status(202).json({ requestId, message: 'Translation initiated' });
  } catch (error: any) {
    logger.error('Error initiating translation:', error);
    res.status(400).json({ message: error.message });
  }
});

// Get translation status
app.get('/translate/:requestId', async (req, res) => {
  try {
    const { requestId } = req.params;
    
    const request = await TranslationRequest.findOne({ requestId });
    
    if (!request) {
      return res.status(404).json({ message: 'Translation request not found' });
    }
    
    res.status(200).json(request);
  } catch (error: any) {
    logger.error('Error fetching translation status:', error);
    res.status(500).json({ message: error.message });
  }
});

// Auto-translate missing translations
app.post('/auto-translate', async (req, res) => {
  try {
    const { tenantId, namespace, sourceLanguage, targetLanguages } = req.body;
    
    await translationQueue.add('auto_translate_missing', {
      jobType: 'auto_translate_missing',
      data: { tenantId, namespace, sourceLanguage, targetLanguages }
    });
    
    res.status(202).json({ message: 'Auto-translation initiated' });
  } catch (error: any) {
    logger.error('Error initiating auto-translation:', error);
    res.status(400).json({ message: error.message });
  }
});

// Detect language
app.post('/detect-language', async (req, res) => {
  try {
    const { text, tenantId, userId } = req.body;
    
    const detectedLanguage = await detectLanguage({ text, tenantId, userId });
    
    res.status(200).json({ language: detectedLanguage });
  } catch (error: any) {
    logger.error('Error detecting language:', error);
    res.status(400).json({ message: error.message });
  }
});

// Set user language preference
app.post('/user-preferences', async (req, res) => {
  try {
    const { tenantId, userId, preferredLanguage, fallbackLanguage, autoDetect } = req.body;
    
    const preference = await UserLanguagePreference.findOneAndUpdate(
      { tenantId, userId },
      {
        preferredLanguage,
        fallbackLanguage: fallbackLanguage || 'en',
        autoDetect: autoDetect !== undefined ? autoDetect : true,
        lastUsed: new Date(),
        updatedAt: new Date()
      },
      { upsert: true, new: true }
    );
    
    res.status(200).json(preference);
  } catch (error: any) {
    logger.error('Error setting user language preference:', error);
    res.status(400).json({ message: error.message });
  }
});

// Get user language preference
app.get('/user-preferences/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { tenantId } = req.query;
    
    const preference = await UserLanguagePreference.findOne({ tenantId, userId });
    
    if (!preference) {
      return res.status(404).json({ message: 'User language preference not found' });
    }
    
    res.status(200).json(preference);
  } catch (error: any) {
    logger.error('Error fetching user language preference:', error);
    res.status(500).json({ message: error.message });
  }
});

// Export translations
app.post('/export', async (req, res) => {
  try {
    const { tenantId, language, namespace, format = 'json' } = req.body;
    
    const translations = await Translation.find({ tenantId, language, namespace });
    
    if (format === 'json') {
      const translationObject = {};
      translations.forEach(t => {
        _.set(translationObject, t.key, t.value);
      });
      
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${namespace}_${language}.json"`);
      res.json(translationObject);
    } else if (format === 'csv') {
      const parser = new Parser();
      const csv = parser.parse(translations);
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${namespace}_${language}.csv"`);
      res.send(csv);
    } else if (format === 'excel') {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Translations');
      
      worksheet.addRow(['Key', 'Value', 'Context', 'Last Modified']);
      
      translations.forEach(t => {
        worksheet.addRow([t.key, t.value, t.context || '', t.lastModified]);
      });
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${namespace}_${language}.xlsx"`);
      
      await workbook.xlsx.write(res);
      res.end();
    } else {
      res.status(400).json({ message: 'Invalid format' });
    }
    
  } catch (error: any) {
    logger.error('Error exporting translations:', error);
    res.status(500).json({ message: error.message });
  }
});

// Import translations
app.post('/import', async (req, res) => {
  try {
    const { tenantId, language, namespace, translations, translatorId } = req.body;
    
    const translationUpdates = [];
    
    for (const [key, value] of Object.entries(translations)) {
      translationUpdates.push({
        tenantId,
        namespace,
        key,
        language,
        value: value as string,
        translatorId,
        isAutoTranslated: false,
        lastModified: new Date(),
        version: 1
      });
    }
    
    await translationQueue.add('update_translations', {
      jobType: 'update_translations',
      data: { tenantId, translations: translationUpdates }
    });
    
    res.status(202).json({ message: 'Translation import initiated' });
  } catch (error: any) {
    logger.error('Error importing translations:', error);
    res.status(400).json({ message: error.message });
  }
});

// Translation statistics
app.get('/stats', async (req, res) => {
  try {
    const { tenantId } = req.query;
    
    const filter = { tenantId };
    
    const totalLanguages = await Language.countDocuments(filter);
    const activeLanguages = await Language.countDocuments({ ...filter, isActive: true });
    const totalTranslations = await Translation.countDocuments(filter);
    const autoTranslated = await Translation.countDocuments({ ...filter, isAutoTranslated: true });
    const manualTranslations = await Translation.countDocuments({ ...filter, isAutoTranslated: false });
    
    const languageStats = await Translation.aggregate([
      { $match: filter },
      { $group: { _id: '$language', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    const namespaceStats = await Translation.aggregate([
      { $match: filter },
      { $group: { _id: '$namespace', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    res.status(200).json({
      summary: {
        totalLanguages,
        activeLanguages,
        totalTranslations,
        autoTranslated,
        manualTranslations
      },
      languageStats,
      namespaceStats
    });
  } catch (error: any) {
    logger.error('Error fetching translation stats:', error);
    res.status(500).json({ message: error.message });
  }
});

// Socket.IO for real-time updates
io.on('connection', (socket) => {
  logger.info('Client connected to i18n Service:', socket.id);
  
  socket.on('subscribe-translations', (data) => {
    socket.join(`translations-${data.tenantId}`);
    logger.info(`Client subscribed to translation updates for tenant ${data.tenantId}`);
  });
  
  socket.on('disconnect', () => {
    logger.info('Client disconnected from i18n Service:', socket.id);
  });
});

// Scheduled tasks
cron.schedule('0 2 * * *', async () => {
  // Daily auto-translation for missing translations
  const tenants = await Language.distinct('tenantId');
  
  for (const tenantId of tenants) {
    const activeLanguages = await Language.find({ tenantId, isActive: true });
    const languageCodes = activeLanguages.map(l => l.code);
    
    if (languageCodes.length > 1) {
      await translationQueue.add('auto_translate_missing', {
        jobType: 'auto_translate_missing',
        data: {
          tenantId,
          namespace: 'common',
          sourceLanguage: 'en',
          targetLanguages: languageCodes.filter(code => code !== 'en')
        }
      });
    }
  }
  
  logger.info('Daily auto-translation job completed');
});

server.listen(PORT, () => {
  logger.info(`i18n Service running on port ${PORT}`);
  console.log(`i18n Service running on port ${PORT}`);
});
