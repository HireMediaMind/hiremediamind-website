// Currency Converter for HireMediaMind
// Supports: USD, GBP, EUR, AED, SGD, AUD, INR

const currencyRates = {
    USD: 1.0,
    GBP: 0.79,
    EUR: 0.92,
    AED: 3.67,
    SGD: 1.34,
    AUD: 1.52,
    INR: 83.0
};

const currencySymbols = {
    USD: '$',
    GBP: '£',
    EUR: '€',
    AED: 'AED ',
    SGD: 'S$',
    AUD: 'A$',
    INR: '₹'
};

// Base prices in USD
const basePrices = {
    starter: 500,
    growth: 1200,
    premium: 3000
};

let currentCurrency = 'USD';

// Initialize currency based on user location or preference
function initCurrency() {
    // Check if user has saved preference
    const savedCurrency = localStorage.getItem('preferredCurrency');
    if (savedCurrency && currencyRates[savedCurrency]) {
        currentCurrency = savedCurrency;
    } else {
        // Try to detect from browser/API
        detectUserCurrency();
    }
    
    updateCurrencySelector();
    updateAllPrices();
}

// Detect user currency based on location
async function detectUserCurrency() {
    try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        
        const countryToCurrency = {
            'US': 'USD',
            'GB': 'GBP',
            'AE': 'AED',
            'SG': 'SGD',
            'AU': 'AUD',
            'IN': 'INR',
            'DE': 'EUR',
            'FR': 'EUR',
            'NL': 'EUR',
            'PL': 'EUR',
            'RU': 'USD' // Russia - use USD
        };
        
        const detectedCurrency = countryToCurrency[data.country_code] || 'USD';
        currentCurrency = detectedCurrency;
    } catch (error) {
        console.log('Could not detect currency, using USD');
        currentCurrency = 'USD';
    }
}

// Convert price to selected currency
function convertPrice(usdPrice) {
    const converted = usdPrice * currencyRates[currentCurrency];
    
    // Format based on currency
    if (currentCurrency === 'USD' || currentCurrency === 'GBP' || currentCurrency === 'EUR' || currentCurrency === 'AUD') {
        return Math.round(converted);
    } else if (currentCurrency === 'AED' || currentCurrency === 'SGD') {
        return Math.round(converted);
    } else if (currentCurrency === 'INR') {
        return Math.round(converted / 1000) + 'K'; // Show as 10K, 20K etc.
    }
    
    return Math.round(converted);
}

// Update currency selector UI
function updateCurrencySelector() {
    const selector = document.getElementById('currencySelector');
    if (selector) {
        selector.value = currentCurrency;
    }
    
    // Update currency display
    const currencyDisplay = document.getElementById('currencyDisplay');
    if (currencyDisplay) {
        currencyDisplay.textContent = currentCurrency;
    }
}

// Update all prices on the page
function updateAllPrices() {
    const symbol = currencySymbols[currentCurrency];
    
    // Update Starter plan
    const starterPrice = document.getElementById('starterPrice');
    if (starterPrice) {
        const price = convertPrice(basePrices.starter);
        starterPrice.textContent = symbol + price;
    }
    
    // Update Growth plan
    const growthPrice = document.getElementById('growthPrice');
    if (growthPrice) {
        const price = convertPrice(basePrices.growth);
        growthPrice.textContent = symbol + price;
    }
    
    // Update Premium plan
    const premiumPrice = document.getElementById('premiumPrice');
    if (premiumPrice) {
        const price = convertPrice(basePrices.premium);
        premiumPrice.textContent = symbol + price + '+';
    }
    
    // Update any other price displays
    document.querySelectorAll('[data-price="starter"]').forEach(el => {
        el.textContent = symbol + convertPrice(basePrices.starter);
    });
    
    document.querySelectorAll('[data-price="growth"]').forEach(el => {
        el.textContent = symbol + convertPrice(basePrices.growth);
    });
    
    document.querySelectorAll('[data-price="premium"]').forEach(el => {
        el.textContent = symbol + convertPrice(basePrices.premium) + '+';
    });
}

// Handle currency change
function changeCurrency(newCurrency) {
    if (currencyRates[newCurrency]) {
        currentCurrency = newCurrency;
        localStorage.setItem('preferredCurrency', newCurrency);
        updateCurrencySelector();
        updateAllPrices();
        
        // Track currency change
        if (typeof trackEvent !== 'undefined') {
            trackEvent('Currency', 'currency_changed', newCurrency);
        }
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initCurrency();
    
    // Add event listener to currency selector
    const selector = document.getElementById('currencySelector');
    if (selector) {
        selector.addEventListener('change', function(e) {
            changeCurrency(e.target.value);
        });
    }
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { changeCurrency, convertPrice, currentCurrency };
}



