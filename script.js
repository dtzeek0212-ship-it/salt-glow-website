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

    bedroomsSelect.addEventListener('change', calculateEstimate);
    bathroomsSelect.addEventListener('change', calculateEstimate);
    sqftInput.addEventListener('input', calculateEstimate);
    militaryDiscountCheckbox.addEventListener('change', calculateEstimate);
    serviceTypeSelect.addEventListener('change', calculateEstimate);

    // --- Form Submission (Lead Capture via mailto) ---
    const bookingForm = document.getElementById('booking-form');

    bookingForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // For hourly, beds and baths are technically optional but we'll include whatever is selected
        const bedsText = bedroomsSelect.selectedIndex > 0 ? bedroomsSelect.options[bedroomsSelect.selectedIndex].text : "N/A";
        const bathsText = bathroomsSelect.selectedIndex > 0 ? bathroomsSelect.options[bathroomsSelect.selectedIndex].text : "N/A";
        const sqftVal = sqftInput.value;
        const typeText = serviceTypeSelect.options[serviceTypeSelect.selectedIndex].text;
        const dateRaw = document.getElementById('preferred-date').value;
        const address = document.getElementById('address').value;
        const notes = document.getElementById('notes').value;
        const currentEstimate = priceTarget.textContent;
        const isDiscountApplied = militaryDiscountCheckbox.checked ? "Yes (10% Discount Applied)" : "No";

        // Format Date
        let dateFormatted = "Not Specified";
        if (dateRaw) {
            const dateObj = new Date(dateRaw);
            dateFormatted = dateObj.toLocaleString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                hour12: true
            });
        }

        // Construct Email Body
        const subject = encodeURIComponent(`New Cleaning Request: ${typeText}`);
        const body = encodeURIComponent(`
Hello Salt & Glow Team,

I would like to request a cleaning service. Here are my details:

Service Request:
------------------
Home Size: ${bedsText}, ${bathsText}
Square Footage: ${sqftVal} sq ft
Service Type: ${typeText}
Military/First Responder Discount: ${isDiscountApplied}
Property Address: ${address}
Estimated Quote Shown: ${currentEstimate}

Scheduling:
------------------
Preferred Date/Time: ${dateFormatted}

Additional Notes:
------------------
${notes || "None"}

Please reach out to me to confirm the date and final pricing.

Thank you!
        `.trim());

        // Open Mail Client
        window.location.href = `mailto:saltandglow.clean@gmail.com?subject=${subject}&body=${body}`;
    });

    // --- Client Review Form ---
    const starRatingContainer = document.getElementById('star-rating');
    const stars = document.querySelectorAll('.interactive-stars i');
    const ratingInput = document.getElementById('rating-value');
    const reviewForm = document.getElementById('review-form');
    const successMsg = document.getElementById('review-success');

    if (starRatingContainer) {
        stars.forEach(star => {
            // Hover effect
            star.addEventListener('mouseover', function () {
                const value = parseInt(this.getAttribute('data-value'));
                stars.forEach(s => {
                    const sValue = parseInt(s.getAttribute('data-value'));
                    if (sValue <= value) {
                        s.classList.replace('fa-regular', 'fa-solid');
                        s.classList.add('hover');
                    } else {
                        s.classList.replace('fa-solid', 'fa-regular');
                        s.classList.remove('hover');
                    }
                });
            });

            // Mouse out reset
            star.addEventListener('mouseout', function () {
                const checkedValue = parseInt(ratingInput.value) || 0;
                stars.forEach(s => {
                    const sValue = parseInt(s.getAttribute('data-value'));
                    s.classList.remove('hover');
                    if (sValue <= checkedValue) {
                        s.classList.replace('fa-regular', 'fa-solid');
                        s.classList.add('active');
                    } else {
                        s.classList.replace('fa-solid', 'fa-regular');
                        s.classList.remove('active');
                    }
                });
            });

            // Click to set value
            star.addEventListener('click', function () {
                const value = parseInt(this.getAttribute('data-value'));
                ratingInput.value = value;
                stars.forEach(s => {
                    const sValue = parseInt(s.getAttribute('data-value'));
                    if (sValue <= value) {
                        s.classList.replace('fa-regular', 'fa-solid');
                        s.classList.add('active');
                    } else {
                        s.classList.replace('fa-solid', 'fa-regular');
                        s.classList.remove('active');
                    }
                });
            });
        });
    }

    // --- Global Review Database (Google Sheets + Zapier) ---
    // Wired to the 'Salt & Glow Reviews' Sheet and Zapier Webhook
    const REVIEWS_CSV_URL = "https://docs.google.com/spreadsheets/d/1W8hj0coM0TtzBQNR2rC0BaAwG4wt05mqbBlzOIsryvM/export?format=csv";
    const ZAPIER_WEBHOOK_URL = "https://hooks.zapier.com/hooks/catch/26848535/upz0b3q/";

    const reviewsShowcase = document.getElementById('reviews-showcase');

    // Function to fetch and render reviews globally
    async function fetchAndRenderReviews() {
        if (!reviewsShowcase || REVIEWS_CSV_URL === "YOUR_GOOGLE_SHEETS_CSV_URL_HERE") {
            // Provide a dummy view if not wired up yet
            reviewsShowcase.innerHTML = '<div style="text-align: center; color: var(--clr-text-muted); padding: 2rem;"><p>Awaiting Database Connection...</p></div>';
            return;
        }

        try {
            const response = await fetch(REVIEWS_CSV_URL);
            const csvText = await response.text();

            // Split by line
            const rows = csvText.split('\n').filter(row => row.trim() !== '');
            let html = '';
            let totalRating = 0;
            let validReviews = 0;

            // Skip header row (index 0)
            for (let i = 1; i < rows.length; i++) {
                // Parse CSV correctly handling commas inside quotes
                const cols = rows[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
                if (cols.length < 4) continue;

                const date = cols[0].replace(/^"|"$/g, '').trim();
                const name = cols[1].replace(/^"|"$/g, '').trim();
                const rating = parseInt(cols[2].replace(/^"|"$/g, '').trim());
                const reviewText = cols[3].replace(/^"|"$/g, '').trim() || cols[3].trim();

                if (isNaN(rating)) continue; // skip broken rows

                totalRating += rating;
                validReviews++;

                const initial = name ? name.charAt(0).toUpperCase() : 'U';

                let starsHtml = '';
                for (let j = 0; j < 5; j++) {
                    if (j < rating) {
                        starsHtml += '<i class="fa-solid fa-star"></i>';
                    } else {
                        starsHtml += '<i class="fa-regular fa-star"></i>';
                    }
                }

                // Prepend so newest is on top
                html = `
                    <div class="review-card">
                        <div class="review-header">
                            <div class="reviewer-avatar">${initial}</div>
                            <div class="reviewer-info">
                                <strong>${name}</strong>
                                <span>Verified Client</span>
                            </div>
                            <div class="review-date">${date}</div>
                        </div>
                        <div class="review-stars">
                            ${starsHtml}
                        </div>
                        <p>"${reviewText}"</p>
                    </div>
                ` + html;
            }

            if (html === '') {
                reviewsShowcase.innerHTML = '<div style="text-align: center; color: var(--clr-text-muted); padding: 2rem;"><p>No reviews yet. Be the first!</p></div>';
            } else {
                reviewsShowcase.innerHTML = html;

                // Update the average rating display on the UI
                const avgRatingDisplay = document.querySelector('.average-rating');
                if (avgRatingDisplay && validReviews > 0) {
                    avgRatingDisplay.textContent = (totalRating / validReviews).toFixed(1);
                }
            }

        } catch (error) {
            console.error("Error fetching reviews:", error);
            reviewsShowcase.innerHTML = '<div style="text-align: center; color: var(--clr-text-muted); padding: 2rem;"><p>Unable to load reviews at this time.</p></div>';
        }
    }

    // Call on load
    fetchAndRenderReviews();

    if (reviewForm) {
        reviewForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Validate rating
            if (!ratingInput.value) {
                alert('Please select a star rating before submitting.');
                return;
            }

            const nameValue = document.getElementById('reviewer-name').value;
            const reviewTextValue = document.getElementById('review-text').value;
            const ratingValue = ratingInput.value;
            const dateValue = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

            // Show loading state
            const submitBtn = reviewForm.querySelector('button[type="submit"]');
            const originalBtnHtml = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin" style="margin-right:0.5rem;"></i> Submitting...';
            submitBtn.disabled = true;

            try {
                // Send to Zapier Webhook
                if (ZAPIER_WEBHOOK_URL !== "YOUR_ZAPIER_WEBHOOK_URL_HERE") {
                    await fetch(ZAPIER_WEBHOOK_URL, {
                        method: 'POST',
                        body: JSON.stringify({
                            date: dateValue,
                            name: nameValue,
                            rating: ratingValue,
                            review: reviewTextValue
                        })
                    });
                }

                // Success UI
                reviewForm.reset();
                ratingInput.value = '';
                stars.forEach(s => {
                    s.classList.replace('fa-solid', 'fa-regular');
                    s.classList.remove('active');
                });

                successMsg.classList.remove('hidden');

                // Hide success message after 5 seconds
                setTimeout(() => {
                    successMsg.classList.add('hidden');
                }, 5000);

                // Optional: Attempt to re-fetch CSV (Google Sheets caching might delay it)
                setTimeout(fetchAndRenderReviews, 3000);

            } catch (error) {
                console.error("Error submitting review:", error);
                alert("There was an error submitting your review. Please try again later.");
            } finally {
                submitBtn.innerHTML = originalBtnHtml;
                submitBtn.disabled = false;
            }
        });
    }
});
