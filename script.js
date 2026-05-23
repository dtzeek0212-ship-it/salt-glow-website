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

    // --- Google Places API Reviews (New API) ---
    const PLACE_ID = 'ChIJre8aefqmBQkRqqyjDvc9KWk';
    const API_KEY = 'AIzaSyCv4UzrBIHRCKAf48iw_LphRkUegIya__4';
    const reviewsShowcase = document.getElementById('reviews-showcase');
    const avgRatingDisplay = document.querySelector('.average-rating');

    async function fetchAndRenderGoogleReviews() {
        if (!reviewsShowcase) return;

        try {
            const response = await fetch(`https://places.googleapis.com/v1/places/${PLACE_ID}?fields=reviews,rating`, {
                method: 'GET',
                headers: {
                    'X-Goog-Api-Key': API_KEY,
                    'X-Goog-FieldMask': 'reviews,rating'
                }
            });
            
            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            const place = await response.json();

            if (place.reviews && place.reviews.length > 0) {
                // Update Overview
                if (avgRatingDisplay && place.rating) {
                    avgRatingDisplay.textContent = place.rating.toFixed(1);
                }

                // Render Reviews
                let html = '';
                place.reviews.forEach(review => {
                    const date = review.relativePublishTimeDescription;
                    const name = review.authorAttribution?.displayName || 'Unknown';
                    const rating = review.rating || 5;
                    const reviewText = review.text?.text || '';
                    const photoUrl = review.authorAttribution?.photoUri;
                    
                    const initial = name.charAt(0).toUpperCase();
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

                reviewsShowcase.innerHTML = html;

            } else {
                reviewsShowcase.innerHTML = '<div style="text-align: center; color: var(--clr-text-muted); padding: 2rem;"><p>No reviews yet. Be the first!</p></div>';
            }

        } catch (error) {
            console.error("Failed to fetch Google Reviews:", error);
            reviewsShowcase.innerHTML = '<div style="text-align: center; color: var(--clr-text-muted); padding: 2rem;"><p>Unable to load reviews at this time.</p></div>';
        }
    }

    // Call on load
    fetchAndRenderGoogleReviews();

});
