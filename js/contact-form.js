/**
 * Contact Form Handler with Enhanced Error Handling
 * HireMediaMind - v2.0
 */

(function() {
    'use strict';
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initContactForm);
    } else {
        initContactForm();
    }
    
    function initContactForm() {
        const form = document.getElementById('contactForm');
        if (!form) {
            console.warn('Contact form not found on this page');
            return;
        }
        
        const submitBtn = form.querySelector('button[type="submit"]');
        const statusEl = document.getElementById('form-status');
        
        if (!submitBtn) {
            console.error('Submit button not found');
            return;
        }
        
        // Store original button text
        const originalBtnText = submitBtn.textContent;
        
        // Form submission handler
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Validate form
            if (!validateForm(form)) {
                showStatus('error', 'Please fill in all required fields correctly.');
                return;
            }
            
            // Show loading state
            submitBtn.disabled = true;
            submitBtn.textContent = '⏳ Sending...';
            submitBtn.classList.add('opacity-70', 'cursor-not-allowed');
            
            try {
                // Collect form data
                const formData = new FormData(form);
                
                // Add tracking data
                formData.append('page_source', window.location.href);
                formData.append('timestamp', new Date().toISOString());
                formData.append('user_agent', navigator.userAgent);
                
                // Get geo data (non-blocking)
                await addGeoData(formData);
                
                // Track form submission attempt
                trackEvent('Contact', 'form_submit_attempt', formData.get('service') || 'Unknown');
                
                // Submit to server
                const response = await fetch('/api/submit-lead.php', {
                    method: 'POST',
                    body: formData
                });
                
                // Check if response is OK
                if (!response.ok) {
                    throw new Error(`Server error: ${response.status}`);
                }
                
                // Parse JSON response
                const result = await response.json();
                
                if (result.status === 'success') {
                    // Success!
                    showStatus('success', `
                        <div class="text-center">
                            <svg class="w-16 h-16 mx-auto mb-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            <p class="text-2xl font-bold mb-2">🎉 Thank You!</p>
                            <p class="text-lg">Your message has been received!</p>
                            <p class="text-sm text-green-700 mt-2">We'll contact you within 24 hours.</p>
                        </div>
                    `);
                    
                    // Track successful submission
                    trackEvent('Contact', 'form_submit_success', formData.get('service') || 'Unknown');
                    
                    // Reset form
                    form.reset();
                    
                    // Hide form after 2 seconds
                    setTimeout(() => {
                        form.style.display = 'none';
                    }, 2000);
                    
                } else {
                    throw new Error(result.msg || 'Submission failed');
                }
                
            } catch (error) {
                console.error('Form submission error:', error);
                
                // Show error message
                showStatus('error', `
                    <div class="text-center">
                        <p class="text-xl font-bold mb-2">⚠️ Oops!</p>
                        <p>There was an error submitting your form.</p>
                        <p class="text-sm mt-2">Please try again or contact us via WhatsApp.</p>
                        <a href="https://wa.me/918429889303" class="inline-block mt-4 bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors">
                            📱 WhatsApp Us
                        </a>
                    </div>
                `);
                
                // Track error
                trackEvent('Contact', 'form_submit_error', error.message);
                
            } finally {
                // Restore button state
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
                submitBtn.classList.remove('opacity-70', 'cursor-not-allowed');
            }
        });
        
        // Real-time field validation
        const requiredFields = form.querySelectorAll('[required]');
        requiredFields.forEach(field => {
            field.addEventListener('blur', function() {
                validateField(this);
            });
        });
        
        console.log('✅ Contact form initialized successfully');
    }
    
    /**
     * Validate entire form
     */
    function validateForm(form) {
        let isValid = true;
        const requiredFields = form.querySelectorAll('[required]');
        
        requiredFields.forEach(field => {
            if (!validateField(field)) {
                isValid = false;
            }
        });
        
        return isValid;
    }
    
    /**
     * Validate individual field
     */
    function validateField(field) {
        const value = field.value.trim();
        const fieldName = field.name || field.id;
        let isValid = true;
        let errorMsg = '';
        
        // Check if required and empty
        if (field.hasAttribute('required') && !value) {
            isValid = false;
            errorMsg = 'This field is required';
        }
        
        // Email validation
        if (field.type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                errorMsg = 'Please enter a valid email address';
            }
        }
        
        // Phone validation (basic)
        if (field.type === 'tel' && value) {
            const phoneRegex = /^[\d\s\+\-\(\)]+$/;
            if (!phoneRegex.test(value) || value.length < 10) {
                isValid = false;
                errorMsg = 'Please enter a valid phone number';
            }
        }
        
        // Show/hide error
        if (!isValid) {
            field.classList.add('border-red-500');
            showFieldError(field, errorMsg);
        } else {
            field.classList.remove('border-red-500');
            hideFieldError(field);
        }
        
        return isValid;
    }
    
    /**
     * Show field-specific error
     */
    function showFieldError(field, message) {
        let errorEl = field.parentElement.querySelector('.field-error');
        if (!errorEl) {
            errorEl = document.createElement('p');
            errorEl.className = 'field-error text-red-600 text-sm mt-1';
            field.parentElement.appendChild(errorEl);
        }
        errorEl.textContent = message;
    }
    
    /**
     * Hide field error
     */
    function hideFieldError(field) {
        const errorEl = field.parentElement.querySelector('.field-error');
        if (errorEl) {
            errorEl.remove();
        }
    }
    
    /**
     * Show form status message
     */
    function showStatus(type, message) {
        const statusEl = document.getElementById('form-status');
        if (!statusEl) return;
        
        const bgColor = type === 'success' ? 'bg-green-100' : 'bg-red-100';
        const textColor = type === 'success' ? 'text-green-800' : 'text-red-800';
        
        statusEl.className = `mt-6 p-6 rounded-lg ${bgColor} ${textColor} animate-fade-in`;
        statusEl.innerHTML = message;
        statusEl.classList.remove('hidden');
        
        // Scroll to status
        setTimeout(() => {
            statusEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
    }
    
    /**
     * Add geo data (non-blocking)
     */
    async function addGeoData(formData) {
        try {
            const response = await fetch('https://ipapi.co/json/', {
                timeout: 3000
            });
            
            if (response.ok) {
                const data = await response.json();
                formData.append('country', data.country_name || '');
                formData.append('city', data.city || '');
                formData.append('region', data.region || '');
            }
        } catch (error) {
            console.log('Geo detection failed (non-critical):', error);
            // Don't block form submission
        }
    }
    
    /**
     * Track events (Google Analytics / GTM)
     */
    function trackEvent(category, action, label) {
        // Google Analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', action, {
                'event_category': category,
                'event_label': label
            });
        }
        
        // Google Tag Manager
        if (typeof window.dataLayer !== 'undefined') {
            window.dataLayer.push({
                'event': action,
                'eventCategory': category,
                'eventLabel': label
            });
        }
        
        console.log(`📊 Event tracked: ${category} - ${action} - ${label}`);
    }
    
})();