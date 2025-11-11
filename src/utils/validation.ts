// Form validation utilities
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: unknown) => boolean;
}

export interface ValidationError {
  field: string;
  message: string;
}

export const validateField = (value: unknown, rules: ValidationRule, fieldName: string): ValidationError | null => {
  if (rules.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
    return { field: fieldName, message: `${fieldName} is required` };
  }

  if (typeof value === 'string') {
    if (rules.minLength && value.length < rules.minLength) {
      return { field: fieldName, message: `${fieldName} must be at least ${rules.minLength} characters` };
    }
    if (rules.maxLength && value.length > rules.maxLength) {
      return { field: fieldName, message: `${fieldName} must not exceed ${rules.maxLength} characters` };
    }
    if (rules.pattern && !rules.pattern.test(value)) {
      return { field: fieldName, message: `${fieldName} format is invalid` };
    }
  }

  if (typeof value === 'number') {
    if (rules.min !== undefined && value < rules.min) {
      return { field: fieldName, message: `${fieldName} must be at least ${rules.min}` };
    }
    if (rules.max !== undefined && value > rules.max) {
      return { field: fieldName, message: `${fieldName} must not exceed ${rules.max}` };
    }
  }

  if (rules.custom && !rules.custom(value)) {
    return { field: fieldName, message: `${fieldName} is invalid` };
  }

  return null;
};

export const validateForm = (data: Record<string, unknown>, schema: Record<string, ValidationRule>): ValidationError[] => {
  const errors: ValidationError[] = [];
  
  for (const [field, rules] of Object.entries(schema)) {
    const error = validateField(data[field], rules, field);
    if (error) {
      errors.push(error);
    }
  }
  
  return errors;
};

// Common validation patterns
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_PATTERN = /^\+?[\d\s-()]+$/;