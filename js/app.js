// ==========================================
// HIREMEDIAMIND - ENHANCED FUNCTIONALITY v2.0
// ==========================================

// Utility: Track events with Google Analytics
function trackEvent(category, action, label) {
    if (typeof gtag !== 'undefined') {
        gtag('event', action, {
            'event_category': category,
            'event_label': label
        });
    }
    
    // Also send to dataLayer for GTM
    if (typeof window.dataLayer !== 'undefined') {
        window.dataLayer.push({
            'event': action,
            'eventCategory': category,
            'eventLabel': label
        });
    }
    
    console.log(`📊 Event tracked: ${category} - ${action} - ${label}`);
}

// Track page engagement time
let engagementStartTime = Date.now();
window.addEventListener('beforeunload', () => {
    const engagementTime = Math.round((Date.now() - engagementStartTime) / 1000);
    trackEvent('Engagement', 'time_on_site', `${engagementTime} seconds`);
});

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 HireMediaMind Enhanced v2.0 Loading...');
    
    // ==========================================
    // MOBILE MENU FUNCTIONALITY
    // ==========================================
    const mobileMenuBtn = document.querySelector('.mobile-menu-button');
    const closeMobileBtn = document.querySelector('.close-mobile-menu');
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-menu a');

    // Open mobile menu
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function(e) {
            e.preventDefault();
            mobileMenu.classList.add('menu-open');
            document.body.style.overflow = 'hidden';
            trackEvent('Navigation', 'mobile_menu_open', 'Hamburger Click');
        });
    }

    // Close mobile menu
    if (closeMobileBtn) {
        closeMobileBtn.addEventListener('click', function(e) {
            e.preventDefault();
            mobileMenu.classList.remove('menu-open');
            document.body.style.overflow = '';
            trackEvent('Navigation', 'mobile_menu_close', 'Close Button');
        });
    }

    // Close menu when clicking a link
    mobileLinks.forEach(link => {
        link.addEventListener('click', function() {
            mobileMenu.classList.remove('menu-open');
            document.body.style.overflow = '';
            trackEvent('Navigation', 'mobile_link_click', link.getAttribute('href'));
        });
    });

    // Close menu when clicking outside
    mobileMenu?.addEventListener('click', function(e) {
        if (e.target === mobileMenu) {
            mobileMenu.classList.remove('menu-open');
            document.body.style.overflow = '';
        }
    });

    // ==========================================
    // SMOOTH SCROLLING FOR ANCHOR LINKS
    // ==========================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const target = document.querySelector(targetId);
            if (target) {
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
                
                // Track section views
                trackEvent('Navigation', 'section_view', targetId.replace('#', ''));
            }
        });
    });

    // ==========================================
    // VIDEO CONTROLS
    // ==========================================
    initVideoControls();

    // Re-adjust video on window resize (debounced)
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            const video = document.querySelector('.hero-video-left video, #hero-video');
            if (video && video.readyState >= 2) {
                adjustVideoSize(video);
            }
        }, 250);
    });

    // ==========================================
    // ENHANCED FORM SUBMISSION TRACKING
    // ==========================================
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        // Track form field interactions
        const formFields = contactForm.querySelectorAll('input, select, textarea');
        formFields.forEach(field => {
            let focused = false;
            field.addEventListener('focus', function() {
                if (!focused) {
                    trackEvent('Form', 'field_focus', this.name || this.id);
                    focused = true;
                }
            });
        });

        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const form = this;
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const statusElement = document.getElementById('form-status');
            const originalText = submitBtn.textContent;
            
            // Get form data for tracking
            const formData = new FormData(form);
            const service = formData.get('service') || formData.get('services[]') || 'Unknown';
            
            // Show loading state
            submitBtn.textContent = '⏳ Sending...';
            submitBtn.disabled = true;
            submitBtn.classList.add('opacity-70', 'cursor-not-allowed');

            // Track form submission attempt
            trackEvent('Contact', 'form_submit_attempt', service);

            // Submit form via AJAX
            fetch(form.action, {
                method: 'POST',
                body: formData
            })
            .then(response => response.text())
            .then(data => {
                // Success handling
                if (statusElement) {
                    statusElement.className = 'mt-6 p-6 rounded-lg text-center font-semibold bg-green-100 text-green-800 animate-fade-in';
                    statusElement.innerHTML = `
                        <svg class="w-16 h-16 mx-auto mb-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <p class="text-2xl mb-2">🎉 Thank You!</p>
                        <p class="text-lg">Your message has been received!</p>
                        <p class="text-sm text-green-700 mt-2">We'll contact you within 24 hours.</p>
                    `;
                    statusElement.classList.remove('hidden');
                }
                
                // Track successful submission
                trackEvent('Contact', 'form_submit_success', service);
                
                // Reset form
                form.reset();
                
                // Hide form after success
                setTimeout(() => {
                    form.style.display = 'none';
                }, 2000);
            })
            .catch(error => {
                // Error handling
                console.error('Form submission error:', error);
                
                if (statusElement) {
                    statusElement.className = 'mt-6 p-6 rounded-lg text-center font-semibold bg-red-100 text-red-800';
                    statusElement.innerHTML = `
                        <p class="text-xl mb-2"⚠️ Oops!</p>
                        <p>There was an error. Please try again or contact us via WhatsApp.</p>
                    `;
                    statusElement.classList.remove('hidden');
                }
                
                // Track error
                trackEvent('Contact', 'form_submit_error', error.message);
                
                // Restore button
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
                submitBtn.classList.remove('opacity-70', 'cursor-not-allowed');
            });
        });
    }

    // ==========================================
    // HEADER SCROLL EFFECT
    // ==========================================
    const header = document.querySelector('header');
    let lastScroll = 0;

    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset;

        if (currentScroll <= 0) {
            header?.classList.remove('scroll-up');
            return;
        }

        if (currentScroll > lastScroll && !header?.classList.contains('scroll-down')) {
            // Scrolling down
            header?.classList.remove('scroll-up');
            header?.classList.add('scroll-down');
        } else if (currentScroll < lastScroll && header?.classList.contains('scroll-down')) {
            // Scrolling up
            header?.classList.remove('scroll-down');
            header?.classList.add('scroll-up');
        }
        lastScroll = currentScroll;
    });

    // ==========================================
    // CTA BUTTON TRACKING
    // ==========================================
    const ctaButtons = document.querySelectorAll('[href="#contact"], [href*="wa.me"]');
    ctaButtons.forEach(button => {
        button.addEventListener('click', function() {
            const buttonText = this.textContent.trim();
            const isWhatsApp = this.href.includes('wa.me');
            trackEvent('CTA', isWhatsApp ? 'whatsapp_click' : 'contact_click', buttonText);
        });
    });

    // ==========================================
    // PRICING PLAN TRACKING
    // ==========================================
    const pricingButtons = document.querySelectorAll('#pricing a[href="#contact"]');
    pricingButtons.forEach(button => {
        button.addEventListener('click', function() {
            const planCard = this.closest('.hover-lift, .rounded-2xl');
            const planName = planCard?.querySelector('h3')?.textContent || 'Unknown Plan';
            trackEvent('Pricing', 'plan_click', planName);
        });
    });

    // ==========================================
    // SCROLL DEPTH TRACKING
    // ==========================================
    let scrollDepths = [25, 50, 75, 100];
    let trackedDepths = new Set();

    window.addEventListener('scroll', throttle(function() {
        const scrollPercent = (window.pageYOffset / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
        
        scrollDepths.forEach(depth => {
            if (scrollPercent >= depth && !trackedDepths.has(depth)) {
                trackedDepths.add(depth);
                trackEvent('Engagement', 'scroll_depth', `${depth}%`);
            }
        });
    }, 500));

    // ==========================================
    // EXIT INTENT DETECTION
    // ==========================================
    let exitIntentShown = false;
    document.addEventListener('mouseout', function(e) {
        if (!exitIntentShown && e.clientY < 10 && e.clientX > 0) {
            exitIntentShown = true;
            trackEvent('Engagement', 'exit_intent', 'Mouse Leave Top');
            console.log('💡 Exit intent detected');
            // You can show a modal here later
        }
    });

    // ==========================================
    // VISITOR INFORMATION TRACKING
    // ==========================================
    function logVisitorInfo() {
        const visitorInfo = {
            referrer: document.referrer || 'Direct',
            userAgent: navigator.userAgent,
            language: navigator.language,
            screen: `${screen.width}x${screen.height}`,
            viewport: `${window.innerWidth}x${window.innerHeight}`,
            timestamp: new Date().toISOString()
        };
        
        console.log('👤 Visitor Info:', visitorInfo);
        
        // Track referrer
        if (document.referrer) {
            try {
                const referrerDomain = new URL(document.referrer).hostname;
                trackEvent('Traffic Source', 'referrer', referrerDomain);
            } catch (e) {
                console.log('Could not parse referrer');
            }
        } else {
            trackEvent('Traffic Source', 'direct', 'No Referrer');
        }
    }
    
    logVisitorInfo();

    // ==========================================
    // PERFORMANCE MONITORING
    // ==========================================
    window.addEventListener('load', function() {
        setTimeout(() => {
            if (window.performance) {
                const perfData = window.performance.timing;
                const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
                console.log(`⚡ Page Load Time: ${pageLoadTime}ms`);
                
                // Track if page is slow
                if (pageLoadTime > 3000) {
                    trackEvent('Performance', 'slow_load', `${pageLoadTime}ms`);
                }
            }
        }, 0);
    });

    // ==========================================
    // FAQ ACCORDION FUNCTIONALITY
    // ==========================================
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        const icon = item.querySelector('.faq-icon');
        
        if (question && answer && icon) {
            question.addEventListener('click', function() {
                const isOpen = !answer.classList.contains('hidden');
                
                // Close all other FAQs
                faqItems.forEach(otherItem => {
                    if (otherItem !== item) {
                        const otherAnswer = otherItem.querySelector('.faq-answer');
                        const otherIcon = otherItem.querySelector('.faq-icon');
                        const otherQuestion = otherItem.querySelector('.faq-question');
                        if (otherAnswer && otherIcon && otherQuestion) {
                            otherAnswer.classList.add('hidden');
                            otherIcon.classList.remove('rotate-180');
                            otherQuestion.setAttribute('aria-expanded', 'false');
                        }
                    }
                });
                
                // Toggle current FAQ
                if (isOpen) {
                    answer.classList.add('hidden');
                    icon.classList.remove('rotate-180');
                    question.setAttribute('aria-expanded', 'false');
                } else {
                    answer.classList.remove('hidden');
                    icon.classList.add('rotate-180');
                    question.setAttribute('aria-expanded', 'true');
                    
                    // Track FAQ interaction
                    trackEvent('FAQ', 'question_opened', question.textContent.trim());
                }
            });
        }
    });

    console.log('✅ HireMediaMind website initialized successfully!');
});

// ==========================================
// VIDEO FUNCTIONS
// ==========================================
function initVideoControls() {
    const videos = document.querySelectorAll('video');
    
    videos.forEach(video => {
        // Video loaded successfully
        video.addEventListener('loadeddata', function() {
            console.log('✅ Video loaded successfully');
            video.parentElement?.classList.add('video-loaded');
            adjustVideoSize(video);
        });
        
        // Video error handling
        video.addEventListener('error', function(e) {
            console.log('⚠️ Video failed to load, showing fallback');
            video.parentElement?.classList.add('video-fallback');
            video.style.display = 'none';
            trackEvent('Media', 'video_error', 'Hero Video Failed');
        });
        
        // Ensure video plays on mobile
        video.addEventListener('canplay', function() {
            const playPromise = video.play();
            if (playPromise !== undefined) {
                playPromise.catch(err => {
                    console.log('Autoplay prevented:', err);
                });
            }
        });

        // Track video engagement
        let videoPlayed = false;
        video.addEventListener('play', function() {
            if (!videoPlayed) {
                videoPlayed = true;
                trackEvent('Media', 'video_play', 'Hero Video');
            }
        });
    });
}

function adjustVideoSize(video) {
    if (!video.videoWidth || !video.videoHeight) return;
    
    const videoAspectRatio = video.videoWidth / video.videoHeight;
    const containerAspectRatio = window.innerWidth / 360;
    
    if (videoAspectRatio > containerAspectRatio) {
        video.parentElement?.classList.remove('video-zoom-medium');
        video.parentElement?.classList.add('video-zoom-small');
    } else {
        video.parentElement?.classList.remove('video-zoom-small');
        video.parentElement?.classList.add('video-zoom-medium');
    }
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

// Throttle function for performance
function throttle(func, delay) {
    let lastCall = 0;
    return function(...args) {
        const now = new Date().getTime();
        if (now - lastCall < delay) {
            return;
        }
        lastCall = now;
        return func(...args);
    };
}

// Debounce function
function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

// Set current year in footer
window.addEventListener('load', function() {
    const yearElement = document.getElementById('currentYear');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
});

// ==========================================
// EXPORT FOR TESTING
// ==========================================
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        trackEvent,
        throttle,
        debounce
    };
}