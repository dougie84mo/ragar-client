/**
 * Validation utilities for form inputs
 */

// Email validation regex (RFC 5322 simplified)
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

// US phone number regex for format: 1-(###)-###-####
const US_PHONE_REGEX = /^1-\(\d{3}\)-\d{3}-\d{4}$/

export interface ValidationResult {
  isValid: boolean
  error: string | null
}

/**
 * Validate email address structure
 */
export const validateEmail = (email: string): ValidationResult => {
  if (!email || email.trim() === '') {
    return {
      isValid: false,
      error: 'Email address is required'
    }
  }

  const trimmedEmail = email.trim()

  if (trimmedEmail.length > 254) {
    return {
      isValid: false,
      error: 'Email address is too long (max 254 characters)'
    }
  }

  if (!EMAIL_REGEX.test(trimmedEmail)) {
    return {
      isValid: false,
      error: 'Invalid email format. Please enter a valid email address.'
    }
  }

  // Check for common typos
  const commonDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com']
  const domain = trimmedEmail.split('@')[1]?.toLowerCase()
  
  // Check for typos in common domains
  if (domain && domain.includes('.co') && !domain.endsWith('.com') && !domain.endsWith('.co.uk')) {
    const suggestion = commonDomains.find(d => d.includes(domain.split('.')[0]))
    if (suggestion) {
      return {
        isValid: true, // Still valid but warn
        error: `Did you mean @${suggestion}?`
      }
    }
  }

  return {
    isValid: true,
    error: null
  }
}

/**
 * Validate US phone number structure (format: 1-(###)-###-####)
 */
export const validatePhone = (phone: string): ValidationResult => {
  if (!phone || phone.trim() === '') {
    return {
      isValid: true, // Phone is optional
      error: null
    }
  }

  const trimmedPhone = phone.trim()

  if (!US_PHONE_REGEX.test(trimmedPhone)) {
    return {
      isValid: false,
      error: 'Invalid phone number format. Use: 1-(###)-###-####'
    }
  }

  return {
    isValid: true,
    error: null
  }
}

/**
 * Format phone number as user types (US format: 1-(###)-###-####)
 */
export const formatPhoneNumber = (digits: string): string => {
  // Ensure we're working with digits only
  const cleanDigits = digits.replace(/\D/g, '')
  
  // Limit to 15 digits for international numbers (but format as US if starts with 1)
  const limitedDigits = cleanDigits.slice(0, 15)
  
  // Format based on length
  if (limitedDigits.length === 0) return ''
  if (limitedDigits.length === 1) return limitedDigits
  if (limitedDigits.length <= 4) return `${limitedDigits.slice(0, 1)}-${limitedDigits.slice(1)}`
  if (limitedDigits.length <= 7) return `${limitedDigits.slice(0, 1)}-(${limitedDigits.slice(1, 4)})-${limitedDigits.slice(4)}`
  
  // Full format: 1-(###)-###-####
  return `${limitedDigits.slice(0, 1)}-(${limitedDigits.slice(1, 4)})-${limitedDigits.slice(4, 7)}-${limitedDigits.slice(7, 11)}`
}

/**
 * Extract clean digits from formatted phone number
 */
export const cleanPhoneNumber = (formattedPhone: string): string => {
  return formattedPhone.replace(/\D/g, '')
}

/**
 * Validate boolean input
 */
export const validateBoolean = (value: any): ValidationResult => {
  if (typeof value !== 'boolean') {
    return {
      isValid: false,
      error: `Invalid boolean value. Expected true or false, got ${typeof value}`
    }
  }

  return {
    isValid: true,
    error: null
  }
}

/**
 * Validate choice/select input against allowed options
 */
export const validateChoice = (value: string, allowedOptions: string[]): ValidationResult => {
  if (!value || value.trim() === '') {
    return {
      isValid: false,
      error: 'Please select an option'
    }
  }

  if (!allowedOptions.includes(value)) {
    return {
      isValid: false,
      error: `Invalid option. Allowed values: ${allowedOptions.join(', ')}`
    }
  }

  return {
    isValid: true,
    error: null
  }
}


/**
 * Allowed values for profile visibility
 */
export const PROFILE_VISIBILITY_OPTIONS = ['public', 'friends', 'private'] as const

/**
 * Allowed values for subscription tier
 */
export const SUBSCRIPTION_TIER_OPTIONS = ['free', 'pro', 'premium'] as const

/**
 * Allowed values for billing cycle
 */
export const BILLING_CYCLE_OPTIONS = ['monthly', 'yearly'] as const

/**
 * Allowed values for theme
 */
export const THEME_OPTIONS = ['light', 'dark', 'system'] as const

