import React, { useState, useEffect } from 'react';
import { TextInput } from 'react-native';
import { getCurrencyConfig } from '../utils/currencyHelper';

export default function CurrencyInput({ 
  value, 
  onValueChange, 
  currency = 'USD', 
  style, 
  placeholder = '0.00',
  ...props 
}) {
  const [displayValue, setDisplayValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const currencyConfig = getCurrencyConfig(currency);
  
  // Update display value when value prop changes (but not when focused)
  useEffect(() => {
    if (!isFocused) {
      if (value && value > 0) {
        const formatted = formatDisplayValue(value);
        setDisplayValue(formatted);
      } else {
        setDisplayValue('');
      }
    }
  }, [value, isFocused]);

  const formatDisplayValue = (val) => {
    if (!val || val === 0) return '';
    
    const numericValue = parseFloat(val) || 0;
    
    // Use different formatting based on currency
    let formatted;
    switch (currency) {
      case 'EUR':
      case 'BRL':
        formatted = numericValue.toLocaleString('de-DE', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
        break;
      default: // USD
        formatted = numericValue.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
    }
    
    return `${currencyConfig.prefix}${formatted}${currencyConfig.suffix}`;
  };

  const handleFocus = () => {
    setIsFocused(true);
    // Show raw number when focused for easy editing
    if (value && value > 0) {
      setDisplayValue(value.toString());
    } else {
      setDisplayValue('');
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Format the value when losing focus
    if (value && value > 0) {
      const formatted = formatDisplayValue(value);
      setDisplayValue(formatted);
    }
  };

  const handleTextChange = (text) => {
    setDisplayValue(text);
    
    // Remove all non-numeric characters except decimal point
    const cleanText = text.replace(/[^0-9.]/g, '');
    
    // Handle multiple decimal points - keep only the first one
    const parts = cleanText.split('.');
    let finalText = parts[0];
    if (parts.length > 1) {
      finalText += '.' + parts.slice(1).join('');
    }
    
    // Convert to number and call onChange
    const numericValue = parseFloat(finalText) || 0;
    onValueChange(numericValue);
  };

  const getPlaceholder = () => {
    if (isFocused) {
      return placeholder; // Show simple placeholder when focused
    }
    return `${currencyConfig.prefix}${placeholder}${currencyConfig.suffix}`;
  };

  return (
    <TextInput
      {...props}
      style={style}
      value={displayValue}
      onChangeText={handleTextChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      placeholder={getPlaceholder()}
      keyboardType="decimal-pad"
    />
  );
}