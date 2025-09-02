export const getCurrencyConfig = (currency) => {
  const configs = {
    USD: {
      prefix: '$',
      suffix: '',
      separator: ',',
      delimiter: '.',
      precision: 2,
    },
    EUR: {
      prefix: '€',
      suffix: '',
      separator: '.',
      delimiter: ',',
      precision: 2,
    },
    BRL: {
      prefix: 'R$ ',
      suffix: '',
      separator: '.',
      delimiter: ',',
      precision: 2,
    },
  };
  
  return configs[currency] || configs.USD;
};

export const formatCurrency = (amount, currency = 'USD') => {
  const config = getCurrencyConfig(currency);
  const numAmount = parseFloat(amount) || 0;
  
  // Format the number with proper decimal places
  const formatted = numAmount.toFixed(config.precision);
  
  // Split into integer and decimal parts
  const [integerPart, decimalPart] = formatted.split('.');
  
  // Add thousands separators
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, config.separator);
  
  // Combine with delimiter
  const finalAmount = decimalPart ? `${formattedInteger}${config.delimiter}${decimalPart}` : formattedInteger;
  
  // Add prefix and suffix
  return `${config.prefix}${finalAmount}${config.suffix}`;
};