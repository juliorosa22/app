// src/utils/dateHelper.js
export const getLocalDateString = (date = new Date()) => {
  // Returns YYYY-MM-DD in local timezone
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const parseTransactionDate = (dateString) => {
  if (!dateString) return null;
  
  // Handle both date-only (YYYY-MM-DD) and full ISO strings
  if (dateString.includes('T')) {
    return new Date(dateString);
  } else {
    // For date-only strings, create date in local timezone
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  }
};

// ✅ Add this helper function to better handle "today" in date ranges
export const getTodayEndOfDay = () => {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return today;
};

// ✅ Update getDateRange to include today properly
export const getDateRange = (range = 'month') => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999); // End of today
  
  switch (range) {
    case 'month':
    case 'last30days': {
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(today.getDate() - 30);
      thirtyDaysAgo.setHours(0, 0, 0, 0); // Start of 30 days ago
      return { start: thirtyDaysAgo, end: today };
    }
    case 'thisMonth': {
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      return { start: firstDayOfMonth, end: lastDayOfMonth };
    }
    case 'lastMonth': {
      const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
      const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      return { start: firstDayLastMonth, end: lastDayLastMonth };
    }
    default:
      return { start: thirtyDaysAgo, end: today };
  }
};

// ✅ Update isDateInRange to be more inclusive of today
export const isDateInRange = (dateString, startDate, endDate) => {
  if (!dateString) return false;
  
  const transactionDate = parseTransactionDate(dateString);
  if (!transactionDate) return false;
  
  // Normalize transaction date to start of day for comparison
  const txDate = new Date(
    transactionDate.getFullYear(),
    transactionDate.getMonth(),
    transactionDate.getDate(),
    0, 0, 0, 0
  );
  
  // Normalize start date to start of day
  const normalizedStart = new Date(
    startDate.getFullYear(),
    startDate.getMonth(),
    startDate.getDate(),
    0, 0, 0, 0
  );
  
  // Normalize end date to end of day
  const normalizedEnd = new Date(
    endDate.getFullYear(),
    endDate.getMonth(),
    endDate.getDate(),
    23, 59, 59, 999
  );
  
  return txDate >= normalizedStart && txDate <= normalizedEnd;
};