document.addEventListener('DOMContentLoaded', () => {
    // Inputs
    const inputs = {
        adSpend: document.getElementById('adSpend'),
        cpc: document.getElementById('cpc'),
        conversionRate: document.getElementById('conversionRate'),
        aov: document.getElementById('aov'),
        aiToggle: document.getElementById('aiToggle')
    };

    // Outputs
    const outputs = {
        traffic: document.getElementById('resTraffic'),
        sales: document.getElementById('resSales'),
        revenue: document.getElementById('resRevenue'),
        roas: document.getElementById('resRoas'),
        card: document.querySelector('.result-card.highlight'),
        aiMessage: document.getElementById('aiMessage'),
        addedRevenue: document.getElementById('addedRevenue')
    };

    // Constants
    const AI_BOOST_FACTORS = {
        cpc: 0.85, // 15% lower CPC
        conversionRate: 1.35, // 35% higher conversion rate
        aov: 1.10 // 10% higher AOV
    };

    function formatNumber(num) {
        return new Intl.NumberFormat('en-US').format(Math.round(num));
    }

    function formatCurrency(num) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0
        }).format(num);
    }

    function calculate() {
        // Get base values
        let spend = parseFloat(inputs.adSpend.value) || 0;
        let cpc = parseFloat(inputs.cpc.value) || 0;
        let convRate = parseFloat(inputs.conversionRate.value) || 0;
        let aov = parseFloat(inputs.aov.value) || 0;

        // Apply AI Boost if toggled
        const isAiActive = inputs.aiToggle.checked;

        if (isAiActive) {
            cpc *= AI_BOOST_FACTORS.cpc;
            convRate *= AI_BOOST_FACTORS.conversionRate;
            aov *= AI_BOOST_FACTORS.aov;

            // Visual feedback
            outputs.card.classList.add('ring-4', 'ring-green-400', 'ring-opacity-50');
            outputs.aiMessage.classList.remove('hidden');
        } else {
            outputs.card.classList.remove('ring-4', 'ring-green-400', 'ring-opacity-50');
            outputs.aiMessage.classList.add('hidden');
        }

        // Calculate
        const traffic = cpc > 0 ? spend / cpc : 0;
        const sales = traffic * (convRate / 100);
        const revenue = sales * aov;
        const roas = spend > 0 ? revenue / spend : 0;

        // Update UI
        outputs.traffic.textContent = formatNumber(traffic);
        outputs.sales.textContent = formatNumber(sales);
        outputs.revenue.textContent = formatCurrency(revenue);
        outputs.roas.textContent = roas.toFixed(2) + 'x';

        // Calculate difference for AI message
        if (isAiActive) {
            // Calculate base revenue without AI
            const baseCpc = parseFloat(inputs.cpc.value) || 0;
            const baseConv = parseFloat(inputs.conversionRate.value) || 0;
            const baseAov = parseFloat(inputs.aov.value) || 0;

            const baseTraffic = baseCpc > 0 ? spend / baseCpc : 0;
            const baseSales = baseTraffic * (baseConv / 100);
            const baseRevenue = baseSales * baseAov;

            const diff = revenue - baseRevenue;
            outputs.addedRevenue.textContent = formatCurrency(diff);
        }
    }

    // Event Listeners
    Object.values(inputs).forEach(input => {
        input.addEventListener('input', calculate);
        input.addEventListener('change', calculate);
    });

    // Initial calculation
    calculate();
});
