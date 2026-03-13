document.addEventListener('DOMContentLoaded', () => {
    // --- Mobile Menu Toggle ---
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', () => {
            const isVisible = navLinks.style.display === 'flex';
            navLinks.style.display = isVisible ? 'none' : 'flex';
            navLinks.style.flexDirection = 'column';
            navLinks.style.position = 'absolute';
            navLinks.style.top = '100%';
            navLinks.style.left = '0';
            navLinks.style.right = '0';
            navLinks.style.backgroundColor = 'var(--clr-cream-base)';
            navLinks.style.padding = '1rem';
            navLinks.style.gap = '1rem';
            navLinks.style.boxShadow = '0 4px 10px rgba(0,0,0,0.1)';
        });
    }

    // Removed quote calculator because Jobber form embed will handle quoting.

    // --- Form Submission (Lead Capture via mailto) ---
    // Removed because Jobber form embed will handle this.
    // Replace this section with any custom Jobber scripts if necessary in the future.
});
