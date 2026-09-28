(function () {
  'use strict';

  var currencyByLanguage = {
    'en-IN': 'INR', 'hi-IN': 'INR', 'en-US': 'USD', 'en-GB': 'GBP',
    'en-AU': 'AUD', 'en-CA': 'CAD', 'ja-JP': 'JPY', 'de-DE': 'EUR',
    'fr-FR': 'EUR', 'es-ES': 'EUR', 'it-IT': 'EUR'
  };

  var options = [
    { code: 'USD', label: 'US Dollar (USD)' },
    { code: 'EUR', label: 'Euro (EUR)' },
    { code: 'GBP', label: 'British Pound (GBP)' },
    { code: 'INR', label: 'Indian Rupee (INR)' },
    { code: 'CAD', label: 'Canadian Dollar (CAD)' },
    { code: 'AUD', label: 'Australian Dollar (AUD)' },
    { code: 'JPY', label: 'Japanese Yen (JPY)' }
  ];

  var browserLocale = navigator.language || 'en-US';
  var defaultCurrency = currencyByLanguage[browserLocale] || '';

  window.StepUpDownLocale = Object.freeze({
    browserLocale: browserLocale,
    defaultCurrency: defaultCurrency,
    options: options,
    formatMoney: function (value, currency) {
      var locale = browserLocale;
      var digits = currency === 'JPY' ? 0 : 2;
      return new Intl.NumberFormat(locale, {
        style: 'currency', currency: currency || defaultCurrency,
        maximumFractionDigits: digits
      }).format(Number(value) || 0);
    },
    formatPercent: function (value) {
      return new Intl.NumberFormat(browserLocale, {
        maximumFractionDigits: 2, minimumFractionDigits: 0
      }).format(Number(value) || 0) + '%';
    }
  });
}());
