export const getCurrencyConfig = (currency) => {
  switch (currency) {
    case 'USD':
      return {
        prefix: '$',
        suffix: '',
        groupSeparator: ',',
        decimalSeparator: '.',
        decimalScale: 2,
      };
    case 'EUR':
      return {
        prefix: '',
        suffix: ' €',
        groupSeparator: '.',
        decimalSeparator: ',',
        decimalScale: 2,
      };
    case 'BRL':
      return {
        prefix: 'R$ ',
        suffix: '',
        groupSeparator: '.',
        decimalSeparator: ',',
        decimalScale: 2,
      };
    default:
      return {
        prefix: '$',
        suffix: '',
        groupSeparator: ',',
        decimalSeparator: '.',
        decimalScale: 2,
      };
  }
};