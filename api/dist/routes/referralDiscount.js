const express = require('express');
const {
  verifyToken,
  authorize
} = require('../middleware/auth');
const referralDiscountController = require('../controllers/referralDiscountController');
const {
  asyncHandler
} = require('../middleware/errorHandler');
const router = express.Router();

// Simple middleware to set default user (bypass auth for now)
router.use((req, res, next) => {
  req.user = {
    id: '1',
    email: 'admin@studyspot.com',
    role: 'library_owner',
    tenant_id: 'default-tenant'
  };
  next();
});

// ============================================
// REFERRAL PROGRAMS
// ============================================

router.get('/referral-programs', authorize(['library_owner', 'super_admin']), asyncHandler(referralDiscountController.getAllReferralPrograms));
router.post('/referral-programs', authorize(['library_owner', 'super_admin']), asyncHandler(referralDiscountController.createReferralProgram));
router.put('/referral-programs/:id', authorize(['library_owner', 'super_admin']), asyncHandler(referralDiscountController.updateReferralProgram));
router.delete('/referral-programs/:id', authorize(['library_owner', 'super_admin']), asyncHandler(referralDiscountController.deleteReferralProgram));

// ============================================
// REFERRALS
// ============================================

router.post('/referrals', asyncHandler(referralDiscountController.createReferral));
router.get('/referrals/user/:userId', asyncHandler(referralDiscountController.getUserReferrals));
router.get('/referrals/stats/:userId', asyncHandler(referralDiscountController.getReferralStats));

// ============================================
// DISCOUNT COUPONS
// ============================================

router.get('/coupons', asyncHandler(referralDiscountController.getAllDiscountCoupons));
router.post('/coupons', authorize(['library_owner', 'super_admin']), asyncHandler(referralDiscountController.createDiscountCoupon));
router.post('/coupons/validate', asyncHandler(referralDiscountController.validateCoupon));
router.post('/coupons/apply', asyncHandler(referralDiscountController.applyCoupon));

// ============================================
// PROMOTIONAL CAMPAIGNS
// ============================================

router.get('/campaigns', authorize(['library_owner', 'super_admin']), asyncHandler(referralDiscountController.getAllPromotionalCampaigns));
router.post('/campaigns', authorize(['library_owner', 'super_admin']), asyncHandler(referralDiscountController.createPromotionalCampaign));
router.get('/campaigns/:campaignId/performance', authorize(['library_owner', 'super_admin']), asyncHandler(referralDiscountController.getCampaignPerformance));
router.post('/campaigns/:campaignId/performance', authorize(['library_owner', 'super_admin']), asyncHandler(referralDiscountController.updateCampaignPerformance));

// ============================================
// ANALYTICS
// ============================================

router.get('/analytics/referrals', authorize(['library_owner', 'super_admin']), asyncHandler(referralDiscountController.getReferralAnalytics));
router.get('/analytics/discounts', authorize(['library_owner', 'super_admin']), asyncHandler(referralDiscountController.getDiscountAnalytics));
module.exports = router;