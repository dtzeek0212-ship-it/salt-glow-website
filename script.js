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
});
