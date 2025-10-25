const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');
const { AppError, asyncHandler } = require('../middleware/errorHandler');

// Initialize database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// ============================================
// REFERRAL PROGRAMS
// ============================================

const getAllReferralPrograms = asyncHandler(async (req, res) => {
  const query = `
    SELECT 
      rp.*,
      COUNT(r.id) as total_referrals,
      COUNT(CASE WHEN r.status = 'completed' THEN 1 END) as successful_referrals,
      COALESCE(SUM(r.total_referral_value), 0) as total_referral_value
    FROM referral_programs rp
    LEFT JOIN referrals r ON rp.id = r.referral_program_id
    WHERE rp.tenant_id = $1 AND rp.is_active = true
    GROUP BY rp.id
    ORDER BY rp.created_at DESC
  `;
  
  const result = await pool.query(query, [req.user.tenant_id]);
  
  res.status(200).json({
    success: true,
    data: result.rows,
    count: result.rows.length
  });
});

const createReferralProgram = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    referral_code,
    referrer_bonus_type,
    referrer_bonus_value,
    referee_bonus_type,
    referee_bonus_value,
    min_referral_amount,
    max_referral_amount,
    validity_days,
    max_referrals_per_user,
    start_date,
    end_date,
    terms_and_conditions
  } = req.body;
  
  const query = `
    INSERT INTO referral_programs (
      id, tenant_id, name, description, referral_code, referrer_bonus_type,
      referrer_bonus_value, referee_bonus_type, referee_bonus_value,
      min_referral_amount, max_referral_amount, validity_days,
      max_referrals_per_user, start_date, end_date, terms_and_conditions
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
    RETURNING *
  `;
  
  const values = [
    uuidv4(),
    req.user.tenant_id,
    name,
    description,
    referral_code,
    referrer_bonus_type,
    referrer_bonus_value,
    referee_bonus_type,
    referee_bonus_value,
    min_referral_amount,
    max_referral_amount,
    validity_days,
    max_referrals_per_user,
    start_date,
    end_date,
    terms_and_conditions
  ];
  
  const result = await pool.query(query, values);
  
  res.status(201).json({
    success: true,
    data: result.rows[0]
  });
});

const updateReferralProgram = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  
  const setClause = Object.keys(updates)
    .map((key, index) => `${key} = $${index + 3}`)
    .join(', ');
  
  const query = `
    UPDATE referral_programs 
    SET ${setClause}, updated_at = CURRENT_TIMESTAMP
    WHERE id = $1 AND tenant_id = $2
    RETURNING *
  `;
  
  const values = [id, req.user.tenant_id, ...Object.values(updates)];
  const result = await pool.query(query, values);
  
  if (result.rows.length === 0) {
    throw new AppError('Referral program not found', 404);
  }
  
  res.status(200).json({
    success: true,
    data: result.rows[0]
  });
});

const deleteReferralProgram = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const query = `
    UPDATE referral_programs 
    SET is_active = false, updated_at = CURRENT_TIMESTAMP
    WHERE id = $1 AND tenant_id = $2
    RETURNING *
  `;
  
  const result = await pool.query(query, [id, req.user.tenant_id]);
  
  if (result.rows.length === 0) {
    throw new AppError('Referral program not found', 404);
  }
  
  res.status(200).json({
    success: true,
    message: 'Referral program deactivated successfully'
  });
});

// ============================================
// REFERRALS
// ============================================

const createReferral = asyncHandler(async (req, res) => {
  const { referral_code, referee_email, referee_phone } = req.body;
  
  // Get referral program
  const programQuery = `
    SELECT * FROM referral_programs 
    WHERE referral_code = $1 AND tenant_id = $2 AND is_active = true
    AND (start_date IS NULL OR start_date <= NOW())
    AND (end_date IS NULL OR end_date >= NOW())
  `;
  
  const programResult = await pool.query(programQuery, [referral_code, req.user.tenant_id]);
  
  if (programResult.rows.length === 0) {
    throw new AppError('Invalid or expired referral code', 400);
  }
  
  const program = programResult.rows[0];
  
  // Check if user has reached max referrals
  const userReferralsQuery = `
    SELECT COUNT(*) as count FROM referrals 
    WHERE referrer_id = $1 AND referral_program_id = $2
  `;
  
  const userReferralsResult = await pool.query(userReferralsQuery, [req.user.id, program.id]);
  
  if (parseInt(userReferralsResult.rows[0].count) >= program.max_referrals_per_user) {
    throw new AppError('Maximum referrals limit reached', 400);
  }
  
  // Check if email/phone already referred
  const existingReferralQuery = `
    SELECT id FROM referrals 
    WHERE (referee_email = $1 OR referee_phone = $2) 
    AND referral_program_id = $3
  `;
  
  const existingReferralResult = await pool.query(existingReferralQuery, [referee_email, referee_phone, program.id]);
  
  if (existingReferralResult.rows.length > 0) {
    throw new AppError('This email/phone has already been referred', 400);
  }
  
  // Create referral
  const referralQuery = `
    INSERT INTO referrals (
      id, tenant_id, referral_program_id, referrer_id, referral_code,
      referee_email, referee_phone, expires_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *
  `;
  
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + program.validity_days);
  
  const values = [
    uuidv4(),
    req.user.tenant_id,
    program.id,
    req.user.id,
    referral_code,
    referee_email,
    referee_phone,
    expiresAt
  ];
  
  const result = await pool.query(referralQuery, values);
  
  res.status(201).json({
    success: true,
    data: result.rows[0]
  });
});

const getUserReferrals = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  
  const query = `
    SELECT 
      r.*,
      rp.name as program_name,
      rp.referrer_bonus_type,
      rp.referrer_bonus_value,
      rp.referee_bonus_type,
      rp.referee_bonus_value,
      u.first_name as referee_first_name,
      u.last_name as referee_last_name,
      u.email as referee_email
    FROM referrals r
    JOIN referral_programs rp ON r.referral_program_id = rp.id
    LEFT JOIN users u ON r.referee_id = u.id
    WHERE r.referrer_id = $1 AND r.tenant_id = $2
    ORDER BY r.created_at DESC
  `;
  
  const result = await pool.query(query, [userId, req.user.tenant_id]);
  
  res.status(200).json({
    success: true,
    data: result.rows
  });
});

const getReferralStats = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  
  const query = `
    SELECT 
      COUNT(*) as total_referrals,
      COUNT(CASE WHEN status = 'completed' THEN 1 END) as successful_referrals,
      COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_referrals,
      COALESCE(SUM(total_referral_value), 0) as total_referral_value,
      COALESCE(SUM(referrer_bonus_amount), 0) as total_bonus_earned,
      COALESCE(SUM(CASE WHEN referrer_bonus_paid = true THEN referrer_bonus_amount ELSE 0 END), 0) as paid_bonus,
      COALESCE(SUM(CASE WHEN referrer_bonus_paid = false THEN referrer_bonus_amount ELSE 0 END), 0) as pending_bonus
    FROM referrals
    WHERE referrer_id = $1 AND tenant_id = $2
  `;
  
  const result = await pool.query(query, [userId, req.user.tenant_id]);
  
  res.status(200).json({
    success: true,
    data: result.rows[0]
  });
});

// ============================================
// DISCOUNT COUPONS
// ============================================

const getAllDiscountCoupons = asyncHandler(async (req, res) => {
  const { status, type } = req.query;
  
  let whereConditions = ['tenant_id = $1'];
  let queryParams = [req.user.tenant_id];
  let paramCount = 1;
  
  if (status === 'active') {
    paramCount++;
    whereConditions.push('is_active = true AND (start_date IS NULL OR start_date <= NOW()) AND (end_date IS NULL OR end_date >= NOW())');
  }
  
  if (type) {
    paramCount++;
    whereConditions.push(`discount_type = $${paramCount}`);
    queryParams.push(type);
  }
  
  const query = `
    SELECT 
      dc.*,
      COUNT(cu.id) as usage_count,
      CASE 
        WHEN usage_limit IS NOT NULL THEN usage_limit - COUNT(cu.id)
        ELSE NULL
      END as remaining_usage
    FROM discount_coupons dc
    LEFT JOIN coupon_usage cu ON dc.id = cu.coupon_id
    WHERE ${whereConditions.join(' AND ')}
    GROUP BY dc.id
    ORDER BY dc.created_at DESC
  `;
  
  const result = await pool.query(query, queryParams);
  
  res.status(200).json({
    success: true,
    data: result.rows,
    count: result.rows.length
  });
});

const createDiscountCoupon = asyncHandler(async (req, res) => {
  const {
    code,
    name,
    description,
    discount_type,
    discount_value,
    min_order_amount,
    max_discount_amount,
    usage_limit,
    usage_limit_per_user,
    applicable_to,
    applicable_libraries,
    applicable_services,
    start_date,
    end_date,
    terms_and_conditions
  } = req.body;
  
  const query = `
    INSERT INTO discount_coupons (
      id, tenant_id, code, name, description, discount_type, discount_value,
      min_order_amount, max_discount_amount, usage_limit, usage_limit_per_user,
      applicable_to, applicable_libraries, applicable_services, start_date,
      end_date, terms_and_conditions, created_by
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
    RETURNING *
  `;
  
  const values = [
    uuidv4(),
    req.user.tenant_id,
    code,
    name,
    description,
    discount_type,
    discount_value,
    min_order_amount,
    max_discount_amount,
    usage_limit,
    usage_limit_per_user,
    applicable_to,
    applicable_libraries,
    applicable_services,
    start_date,
    end_date,
    terms_and_conditions,
    req.user.id
  ];
  
  const result = await pool.query(query, values);
  
  res.status(201).json({
    success: true,
    data: result.rows[0]
  });
});

const validateCoupon = asyncHandler(async (req, res) => {
  const { code, user_id, amount, library_id } = req.body;
  
  const query = `
    SELECT 
      dc.*,
      COUNT(cu.id) as user_usage_count,
      COUNT(cu_all.id) as total_usage_count
    FROM discount_coupons dc
    LEFT JOIN coupon_usage cu ON dc.id = cu.coupon_id AND cu.user_id = $2
    LEFT JOIN coupon_usage cu_all ON dc.id = cu_all.coupon_id
    WHERE dc.code = $1 AND dc.tenant_id = $3
    AND dc.is_active = true
    AND (dc.start_date IS NULL OR dc.start_date <= NOW())
    AND (dc.end_date IS NULL OR dc.end_date >= NOW())
    GROUP BY dc.id
  `;
  
  const result = await pool.query(query, [code, user_id, req.user.tenant_id]);
  
  if (result.rows.length === 0) {
    throw new AppError('Invalid or expired coupon code', 400);
  }
  
  const coupon = result.rows[0];
  
  // Validate conditions
  if (coupon.min_order_amount > amount) {
    throw new AppError(`Minimum order amount of ₹${coupon.min_order_amount} required`, 400);
  }
  
  if (coupon.usage_limit && coupon.total_usage_count >= coupon.usage_limit) {
    throw new AppError('Coupon usage limit exceeded', 400);
  }
  
  if (coupon.usage_limit_per_user && coupon.user_usage_count >= coupon.usage_limit_per_user) {
    throw new AppError('You have already used this coupon maximum times', 400);
  }
  
  // Calculate discount
  let discountAmount = 0;
  if (coupon.discount_type === 'percentage') {
    discountAmount = (amount * coupon.discount_value) / 100;
    if (coupon.max_discount_amount && discountAmount > coupon.max_discount_amount) {
      discountAmount = coupon.max_discount_amount;
    }
  } else if (coupon.discount_type === 'fixed') {
    discountAmount = coupon.discount_value;
  } else if (coupon.discount_type === 'free_hours') {
    // This would need to be calculated based on hourly rate
    discountAmount = coupon.discount_value * 50; // Assuming ₹50 per hour
  }
  
  const finalAmount = Math.max(0, amount - discountAmount);
  
  res.status(200).json({
    success: true,
    data: {
      coupon,
      original_amount: amount,
      discount_amount: discountAmount,
      final_amount: finalAmount
    }
  });
});

const applyCoupon = asyncHandler(async (req, res) => {
  const { coupon_id, user_id, booking_id, payment_id, original_amount, discount_amount } = req.body;
  
  const finalAmount = original_amount - discount_amount;
  
  const query = `
    INSERT INTO coupon_usage (
      id, tenant_id, coupon_id, user_id, booking_id, payment_id,
      discount_amount, original_amount, final_amount
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *
  `;
  
  const values = [
    uuidv4(),
    req.user.tenant_id,
    coupon_id,
    user_id,
    booking_id,
    payment_id,
    discount_amount,
    original_amount,
    finalAmount
  ];
  
  const result = await pool.query(query, values);
  
  res.status(201).json({
    success: true,
    data: result.rows[0]
  });
});

// ============================================
// PROMOTIONAL CAMPAIGNS
// ============================================

const getAllPromotionalCampaigns = asyncHandler(async (req, res) => {
  const { status, type } = req.query;
  
  let whereConditions = ['tenant_id = $1'];
  let queryParams = [req.user.tenant_id];
  let paramCount = 1;
  
  if (status) {
    paramCount++;
    whereConditions.push(`status = $${paramCount}`);
    queryParams.push(status);
  }
  
  if (type) {
    paramCount++;
    whereConditions.push(`campaign_type = $${paramCount}`);
    queryParams.push(type);
  }
  
  const query = `
    SELECT 
      pc.*,
      u.first_name as created_by_name,
      u.last_name as created_by_last_name
    FROM promotional_campaigns pc
    LEFT JOIN users u ON pc.created_by = u.id
    WHERE ${whereConditions.join(' AND ')}
    ORDER BY pc.created_at DESC
  `;
  
  const result = await pool.query(query, queryParams);
  
  res.status(200).json({
    success: true,
    data: result.rows,
    count: result.rows.length
  });
});

const createPromotionalCampaign = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    campaign_type,
    target_audience,
    target_segment,
    budget,
    expected_reach,
    expected_conversions,
    start_date,
    end_date
  } = req.body;
  
  const query = `
    INSERT INTO promotional_campaigns (
      id, tenant_id, name, description, campaign_type, target_audience,
      target_segment, budget, expected_reach, expected_conversions,
      start_date, end_date, created_by
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    RETURNING *
  `;
  
  const values = [
    uuidv4(),
    req.user.tenant_id,
    name,
    description,
    campaign_type,
    target_audience,
    JSON.stringify(target_segment),
    budget,
    expected_reach,
    expected_conversions,
    start_date,
    end_date,
    req.user.id
  ];
  
  const result = await pool.query(query, values);
  
  res.status(201).json({
    success: true,
    data: result.rows[0]
  });
});

const getCampaignPerformance = asyncHandler(async (req, res) => {
  const { campaignId } = req.params;
  
  const query = `
    SELECT 
      cp.*,
      pc.name as campaign_name,
      pc.budget,
      pc.expected_reach,
      pc.expected_conversions
    FROM campaign_performance cp
    JOIN promotional_campaigns pc ON cp.campaign_id = pc.id
    WHERE cp.campaign_id = $1 AND cp.tenant_id = $2
    ORDER BY cp.date DESC
  `;
  
  const result = await pool.query(query, [campaignId, req.user.tenant_id]);
  
  res.status(200).json({
    success: true,
    data: result.rows
  });
});

const updateCampaignPerformance = asyncHandler(async (req, res) => {
  const { campaignId } = req.params;
  const { date, impressions, clicks, conversions, revenue, cost } = req.body;
  
  const query = `
    INSERT INTO campaign_performance (
      id, tenant_id, campaign_id, date, impressions, clicks,
      conversions, revenue, cost
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    ON CONFLICT (campaign_id, date)
    DO UPDATE SET
      impressions = EXCLUDED.impressions,
      clicks = EXCLUDED.clicks,
      conversions = EXCLUDED.conversions,
      revenue = EXCLUDED.revenue,
      cost = EXCLUDED.cost,
      created_at = CURRENT_TIMESTAMP
    RETURNING *
  `;
  
  const values = [
    uuidv4(),
    req.user.tenant_id,
    campaignId,
    date,
    impressions,
    clicks,
    conversions,
    revenue,
    cost
  ];
  
  const result = await pool.query(query, values);
  
  res.status(200).json({
    success: true,
    data: result.rows[0]
  });
});

// ============================================
// ANALYTICS
// ============================================

const getReferralAnalytics = asyncHandler(async (req, res) => {
  const { timeRange = '30d' } = req.query;
  
  let dateFilter = '';
  switch (timeRange) {
    case '7d':
      dateFilter = "AND r.created_at >= NOW() - INTERVAL '7 days'";
      break;
    case '30d':
      dateFilter = "AND r.created_at >= NOW() - INTERVAL '30 days'";
      break;
    case '90d':
      dateFilter = "AND r.created_at >= NOW() - INTERVAL '90 days'";
      break;
    case '1y':
      dateFilter = "AND r.created_at >= NOW() - INTERVAL '1 year'";
      break;
  }
  
  const query = `
    SELECT 
      COUNT(*) as total_referrals,
      COUNT(CASE WHEN status = 'completed' THEN 1 END) as successful_referrals,
      COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_referrals,
      COALESCE(SUM(total_referral_value), 0) as total_referral_value,
      COALESCE(SUM(referrer_bonus_amount), 0) as total_bonus_paid,
      COALESCE(AVG(total_referral_value), 0) as avg_referral_value,
      COUNT(DISTINCT referrer_id) as unique_referrers
    FROM referrals r
    WHERE r.tenant_id = $1 ${dateFilter}
  `;
  
  const result = await pool.query(query, [req.user.tenant_id]);
  
  res.status(200).json({
    success: true,
    data: result.rows[0]
  });
});

const getDiscountAnalytics = asyncHandler(async (req, res) => {
  const { timeRange = '30d' } = req.query;
  
  let dateFilter = '';
  switch (timeRange) {
    case '7d':
      dateFilter = "AND cu.used_at >= NOW() - INTERVAL '7 days'";
      break;
    case '30d':
      dateFilter = "AND cu.used_at >= NOW() - INTERVAL '30 days'";
      break;
    case '90d':
      dateFilter = "AND cu.used_at >= NOW() - INTERVAL '90 days'";
      break;
    case '1y':
      dateFilter = "AND cu.used_at >= NOW() - INTERVAL '1 year'";
      break;
  }
  
  const query = `
    SELECT 
      COUNT(*) as total_redemptions,
      COUNT(DISTINCT cu.coupon_id) as unique_coupons_used,
      COUNT(DISTINCT cu.user_id) as unique_users,
      COALESCE(SUM(cu.discount_amount), 0) as total_discount_given,
      COALESCE(SUM(cu.original_amount), 0) as total_original_amount,
      COALESCE(SUM(cu.final_amount), 0) as total_final_amount,
      COALESCE(AVG(cu.discount_amount), 0) as avg_discount_per_redemption
    FROM coupon_usage cu
    WHERE cu.tenant_id = $1 ${dateFilter}
  `;
  
  const result = await pool.query(query, [req.user.tenant_id]);
  
  res.status(200).json({
    success: true,
    data: result.rows[0]
  });
});

module.exports = {
  // Referral Programs
  getAllReferralPrograms,
  createReferralProgram,
  updateReferralProgram,
  deleteReferralProgram,
  
  // Referrals
  createReferral,
  getUserReferrals,
  getReferralStats,
  
  // Discount Coupons
  getAllDiscountCoupons,
  createDiscountCoupon,
  validateCoupon,
  applyCoupon,
  
  // Promotional Campaigns
  getAllPromotionalCampaigns,
  createPromotionalCampaign,
  getCampaignPerformance,
  updateCampaignPerformance,
  
  // Analytics
  getReferralAnalytics,
  getDiscountAnalytics,
};
