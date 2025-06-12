// Currency and number formatting utilities

export const formatCurrency = (amount, currency = 'PHP', locale = 'en-PH') => {
  try {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) return '₱0.00';
    
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency === 'PHP' ? 'PHP' : currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numAmount);
  } catch (error) {
    // Fallback formatting
    const numAmount = parseFloat(amount) || 0;
    return `₱${numAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
};

export const formatNumber = (number, decimals = 0) => {
  try {
    const num = parseFloat(number);
    if (isNaN(num)) return '0';
    
    return num.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  } catch (error) {
    return '0';
  }
};

export const formatPercentage = (value, decimals = 1) => {
  try {
    const num = parseFloat(value);
    if (isNaN(num)) return '0%';
    
    return `${num.toFixed(decimals)}%`;
  } catch (error) {
    return '0%';
  }
};

export const formatBudgetRange = (budget, variance = 0.2) => {
  try {
    const budgetAmount = parseFloat(budget);
    if (!budgetAmount || budgetAmount <= 0) return null;
    
    const minBudget = Math.floor(budgetAmount * (1 - variance));
    const maxBudget = Math.ceil(budgetAmount * (1 + variance));
    
    return {
      min: minBudget,
      max: maxBudget,
      formatted: `₱${minBudget.toLocaleString()} - ₱${maxBudget.toLocaleString()}`
    };
  } catch (error) {
    return null;
  }
};

export const formatDate = (dateString, options = {}) => {
  try {
    if (!dateString) return 'Today';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Today';
    
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    }
    
    const defaultOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    };
    
    return date.toLocaleDateString('en-US', { ...defaultOptions, ...options });
  } catch (error) {
    return 'Today';
  }
};

export default {
  formatCurrency,
  formatNumber,
  formatPercentage,
  formatBudgetRange,
  formatDate
}; 