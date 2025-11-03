/**
 * Password Validator
 * Ensures strong password requirements
 */

class PasswordValidator {
  /**
   * Validate password strength
   * @param {string} password - Password to validate
   * @returns {Object} - Validation result
   */
  static validate(password) {
    const errors = [];
    
    // Minimum length
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    // Maximum length (prevent DoS)
    if (password.length > 128) {
      errors.push('Password must not exceed 128 characters');
    }
    
    // Contains uppercase letter
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    // Contains lowercase letter
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    // Contains number
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    // Contains special character
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character (!@#$%^&*...)');
    }
    
    // Check for common weak passwords
    const commonPasswords = [
      'password', 'password123', '12345678', 'qwerty', 'abc123',
      'password1', '111111', '123123', '1234567890', 'letmein',
      'welcome', 'admin', 'Admin123', 'Password123'
    ];
    
    if (commonPasswords.includes(password.toLowerCase())) {
      errors.push('This password is too common. Please choose a more unique password');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      strength: this.calculateStrength(password),
    };
  }
  
  /**
   * Calculate password strength score
   * @param {string} password - Password to evaluate
   * @returns {Object} - Strength score and level
   */
  static calculateStrength(password) {
    let score = 0;
    
    // Length score
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (password.length >= 16) score += 1;
    
    // Character variety score
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 1;
    
    // Complexity patterns
    if (/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/.test(password)) score += 1;
    if (/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/.test(password)) score += 1;
    
    // Determine strength level
    let level = 'weak';
    if (score >= 7) level = 'strong';
    else if (score >= 5) level = 'medium';
    
    return {
      score,
      level,
      percentage: Math.min(100, (score / 9) * 100),
    };
  }
  
  /**
   * Check if password has been compromised (simple check)
   * In production, integrate with HaveIBeenPwned API
   * @param {string} password - Password to check
   * @returns {boolean} - True if compromised
   */
  static isCompromised(password) {
    // Simple check for demonstration
    // In production: integrate with https://haveibeenpwned.com/API/v3
    const knownCompromised = [
      'password', '123456', '12345678', 'qwerty', 'password123',
      'abc123', 'monkey', '1234567', 'letmein', 'trustno1'
    ];
    
    return knownCompromised.includes(password.toLowerCase());
  }
  
  /**
   * Generate password requirements message
   * @returns {string} - Requirements message
   */
  static getRequirements() {
    return `Password must:
- Be at least 8 characters long
- Contain at least one uppercase letter (A-Z)
- Contain at least one lowercase letter (a-z)
- Contain at least one number (0-9)
- Contain at least one special character (!@#$%^&*...)
- Not be a common or compromised password`;
  }
}

module.exports = PasswordValidator;


