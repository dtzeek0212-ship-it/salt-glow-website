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

    // --- Instant Quote Engine ---
    const bedroomsSelect = document.getElementById('bedrooms');
    const bathroomsSelect = document.getElementById('bathrooms');
    const sqftInput = document.getElementById('sqft');
    const militaryDiscountCheckbox = document.getElementById('military-discount');
    const serviceTypeSelect = document.getElementById('service-type');
    const priceTarget = document.getElementById('price-target');

    // Base market pricing based on square footage
    const pricingMatrix = {
        routine: { base: 70, perSqft: 0.10 },
        deep: { base: 100, perSqft: 0.18 },
        airbnb: { base: 90, perSqft: 0.15 }
    };

    function calculateEstimate() {
        const sqftVal = parseInt(sqftInput.value);
        const typeVal = serviceTypeSelect.value;
        const bedsVal = bedroomsSelect.value;
        const bathsVal = bathroomsSelect.value;

        // Handle Hourly Service
        if (typeVal === 'hourly') {
            let estimate = 165; // $55 * 3 hr minimum
            if (militaryDiscountCheckbox.checked) estimate *= 0.9;

            priceTarget.textContent = `$${estimate.toFixed(0)}+ (3hr min)`;
            priceTarget.style.color = 'var(--clr-taupe-dark)';

            priceTarget.style.transform = 'scale(1.1)';
            setTimeout(() => {
                priceTarget.style.transform = 'scale(1)';
                priceTarget.style.transition = 'transform 0.3s ease';
            }, 150);
            return;
        }

        // Require SqFt, Beds, Baths, and Service Type to calculate standard services
        if (bedsVal && bathsVal && sqftVal && !isNaN(sqftVal) && typeVal && pricingMatrix[typeVal]) {
            const pricing = pricingMatrix[typeVal];

            // Base + (SqFt * MarketRatePerSqft)
            let estimate = pricing.base + (sqftVal * pricing.perSqft);

            // Add a small surcharge per extra bedroom and bathroom just to be thorough
            // (even though market is usually strictly sqft, mixing the two is a good balance for cleaners)
            estimate += (parseInt(bedsVal) * 8);
            estimate += (parseFloat(bathsVal) * 12);

            // Apply military/first responder discount if checked
            if (militaryDiscountCheckbox.checked) {
                estimate = estimate * 0.9;
            }

            // Format to currency
            priceTarget.textContent = `$${estimate.toFixed(0)}+`;
            priceTarget.style.color = 'var(--clr-taupe-dark)';

            // Add a small animation effect
            priceTarget.style.transform = 'scale(1.1)';
            setTimeout(() => {
                priceTarget.style.transform = 'scale(1)';
                priceTarget.style.transition = 'transform 0.3s ease';
            }, 150);

        } else {
            priceTarget.textContent = '--';
            priceTarget.style.color = 'var(--clr-text-dark)';
        }
    }

    if (bedroomsSelect) {
        bedroomsSelect.addEventListener('change', calculateEstimate);
        bathroomsSelect.addEventListener('change', calculateEstimate);
        sqftInput.addEventListener('input', calculateEstimate);
        militaryDiscountCheckbox.addEventListener('change', calculateEstimate);
        serviceTypeSelect.addEventListener('change', calculateEstimate);
    }

    // --- Form Submission (Lead Capture via mailto) ---
    const bookingForm = document.getElementById('booking-form');

    bookingForm.addEventListener('submit', (e) => {
        e.preventDefault();
        // Redirect to Zenmaid Booking Portal
        window.location.href = "https://app.zenmaid.com/book/b8vye";
    });

});

// --- Global Google Maps Callback ---
window.initGoogleReviews = function() {
    const PLACE_ID = 'ChIJre8aefqmBQkRqqyjDvc9KWk';
    const reviewsShowcase = document.getElementById('reviews-showcase');
    const avgRatingDisplay = document.querySelector('.average-rating');

    if (!reviewsShowcase || !window.google || !window.google.maps) {
        console.error("Google Maps API not loaded properly.");
        return;
    }

    const service = new google.maps.places.PlacesService(document.createElement('div'));
    
    service.getDetails({
        placeId: PLACE_ID,
        fields: ['reviews', 'rating', 'user_ratings_total']
    }, (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && place.reviews) {
            // Update Overview
            if (avgRatingDisplay && place.rating) {
                avgRatingDisplay.textContent = place.rating.toFixed(1);
            }

            // Render Reviews
            let html = '';
            // Google returns up to 5 most helpful reviews
            place.reviews.forEach(review => {
                const date = review.relative_time_description;
                const name = review.author_name;
                const rating = review.rating;
                const reviewText = review.text;
                const photoUrl = review.profile_photo_url;
                
                const initial = name ? name.charAt(0).toUpperCase() : 'U';
                const avatarHtml = photoUrl 
                    ? `<img src="${photoUrl}" alt="${name}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">` 
                    : initial;

                let starsHtml = '';
                for (let j = 0; j < 5; j++) {
                    if (j < rating) {
                        starsHtml += '<i class="fa-solid fa-star"></i>';
                    } else {
                        starsHtml += '<i class="fa-regular fa-star"></i>';
                    }
                }

                html += `
                    <div class="review-card">
                        <div class="review-header">
                            <div class="reviewer-avatar" style="overflow:hidden;">${avatarHtml}</div>
                            <div class="reviewer-info">
                                <strong>${name}</strong>
                                <span>Google Reviewer</span>
                            </div>
                            <div class="review-date">${date}</div>
                        </div>
                        <div class="review-stars">
                            ${starsHtml}
                        </div>
                        <p>"${reviewText}"</p>
                    </div>
                `;
            });

            if (html === '') {
                reviewsShowcase.innerHTML = '<div style="text-align: center; color: var(--clr-text-muted); padding: 2rem;"><p>No reviews yet. Be the first!</p></div>';
            } else {
                reviewsShowcase.innerHTML = html;
            }

        } else {
            console.error("Failed to fetch Google Reviews:", status);
            reviewsShowcase.innerHTML = '<div style="text-align: center; color: var(--clr-text-muted); padding: 2rem;"><p>Unable to load reviews at this time.</p></div>';
        }
    });
};
