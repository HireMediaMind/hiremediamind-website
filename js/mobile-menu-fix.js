/**
 * Mobile Menu Fix - HireMediaMind
 * Simple toggle functionality
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Mobile menu script loaded');
    
    const mobileMenuBtn = document.querySelector('.mobile-menu-button');
    const closeMobileBtn = document.querySelector('.close-mobile-menu');
    const mobileMenu = document.querySelector('.mobile-menu');
    
    if (!mobileMenuBtn || !mobileMenu) {
        console.error('Mobile menu elements not found');
        return;
    }
    
    // Open menu
    mobileMenuBtn.addEventListener('click', function() {
        console.log('Opening mobile menu');
        mobileMenu.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    });
    
    // Close menu
    if (closeMobileBtn) {
        closeMobileBtn.addEventListener('click', function() {
            console.log('Closing mobile menu');
            mobileMenu.classList.add('hidden');
            document.body.style.overflow = '';
        });
    }
    
    // Close when clicking links
    const mobileLinks = mobileMenu.querySelectorAll('a');
    mobileLinks.forEach(link => {
        link.addEventListener('click', function() {
            mobileMenu.classList.add('hidden');
            document.body.style.overflow = '';
        });
    });
    
    console.log('✅ Mobile menu ready');
});