/*
  File: script.js
  Author: Sky
  Date: 25/10/2025
  Description: Main JavaScript file for COS10005 Assignment 2.
  Handles:
  - Form validation for register.html and order.html
  - Check blank required fields 
  - Check password strength (length & character types)
  - Check postcode (4 digits)
  - Show all errors (inline + summary)
  - Allow submit only if valid
  - Website Enhancements
    - Highlight current nav item
    - Auto-fill billing address
    - Adaptive credit card length
*/

"use strict"; // Enforce strict mode for better code quality

/**
 * Main initialization function.
 */
function init() {
    console.log("Sweet Life site initialized.");

    // Enhancement 1: Highlight current nav link on all pages
    highlightCurrentNav();

    // Check which page we're on and run page-specific init functions
    const regForm = document.getElementById("register-form");
    const orderForm = document.getElementById("order-form");

    if (regForm) {
        initRegisterPage(regForm);
    }

    if (orderForm) {
        initOrderPage(orderForm);
    }
}

// --- Global Enhancements ---

/**
 * Highlight the current page in the navigation bar
 */
function highlightCurrentNav() {
    const currentPage = window.location.pathname.split("/").pop(); // Get the filename (e.g., "index.html")
    const navLinks = document.querySelectorAll("nav ul li a");

    // Handle the case where the path is just "/" (root)
    const activePage = currentPage === "" ? "index.html" : currentPage;

    navLinks.forEach(link => {
        const linkPage = link.getAttribute("href").split("/").pop();
        if (linkPage === activePage) {
            link.classList.add("active-link");
        }
    });
}


// --- Registration Page Logic (register.html) ---

/**
 * Initializes all event listeners for the registration page.
 * @param {HTMLFormElement} regForm - The registration form element.
 */
function initRegisterPage(regForm) {
    // Validate form on submit
    regForm.addEventListener("submit", validateRegisterForm);
}

/**
 * Validates the entire registration form.
 * @param {Event} event - The form submission event.
 */
function validateRegisterForm(event) {
    event.preventDefault(); // Stop form submission
    
    let isValid = true;
    let errors = [];

    // Clear all previous errors
    clearAllErrors();

    // --- Validation Rules ---

    // 1. Username (Required)
    const username = document.getElementById("username");
    if (username.value.trim() === "") {
        isValid = false;
        errors.push("Username is required.");
        showError("username-error", "Username is required.");
    }

    // 2. Password (Required & strong: 9+ chars, upper, lower, number, symbol)
    const password = document.getElementById("password");
    if (password.value === "") {
        isValid = false;
        errors.push("Password is required.");
        showError("password-error", "Password is required.");
    } else if (!validateStrongPassword(password.value)) {
        isValid = false;
        errors.push("Password must be at least 9 characters long and include uppercase, lowercase, number, and symbol.");
        showError("password-error", "Password must be at least 9 characters long and include uppercase, lowercase, number, and symbol.");
    }

    // 3. Confirm Password (Matches password)
    //    (Assumption: This is a standard and necessary validation)
    const confirmPassword = document.getElementById("confirm-password");
    if (confirmPassword.value !== password.value) {
        isValid = false;
        errors.push("Passwords do not match.");
        showError("confirm-password-error", "Passwords do not match.");
    }

    // 4. Email (Required & basic format)
    const email = document.getElementById("email");
    if (email.value.trim() === "") {
        isValid = false;
        errors.push("Email is required.");
        showError("email-error", "Email is required.");
    } else if (!validateEmailFormat(email.value)) {
        isValid = false;
        errors.push("Please enter a valid email address.");
        showError("email-error", "Please enter a valid email address (e.g., name@domain.com).");
    }

    // 5. Gender (Required - Radio button check)
    const gender = document.querySelector('input[name="gender"]:checked');
    if (!gender) {
        isValid = false;
        errors.push("Please select a gender.");
        showError("gender-error", "Please select a gender.");
    }

    // --- Final Decision ---
    if (isValid) {
        // If all valid, allow the form to be submitted
        console.log("Registration form is valid. Submitting...");
        event.target.submit();
    } else {
        // If invalid, show a summary of all errors
        showErrorSummary(errors);
    }
}


// --- Order Page Logic (order.html) ---

/**
 * Initializes all event listeners for the order page.
 * @param {HTMLFormElement} orderForm - The order form element.
 */
function initOrderPage(orderForm) {
    // --- Enhancement 2: "Same as delivery address" checkbox ---
    // Automatic input of billing address
    const sameAsDelivery = document.getElementById("same-as-delivery");
    sameAsDelivery.addEventListener("change", copyDeliveryToBilling);

    // --- Enhancement 3: Adaptive credit card length ---
    const cardType = document.getElementById("card-type");
    cardType.addEventListener("change", updateCardLength);

    // --- Conditional Fields (Show/Hide) ---
    // Show/hide delivery fields
    document.querySelectorAll('input[name="order-type"]').forEach(radio => {
        radio.addEventListener("change", toggleDeliveryFields);
    });
    
    // Show/hide payment fields
    document.querySelectorAll('input[name="pay-method"]').forEach(radio => {
        radio.addEventListener("change", togglePaymentFields);
    });

    // Initialize conditional fields on page load
    toggleDeliveryFields();
    togglePaymentFields();

    // Initialize flavor quantity controls
    initFlavorQuantityControls();

    // Initialize session storage for form data (restores saved data)
    initSessionStorage(orderForm);

    // Validate form on submit
    orderForm.addEventListener("submit", validateOrderForm);
}

/**
 * Copies delivery address to billing address
 */
function copyDeliveryToBilling() {
    const checkbox = document.getElementById("same-as-delivery");
    
    // Get delivery fields
    const delStreet = document.getElementById("delivery-street");
    const delSuburb = document.getElementById("delivery-suburb");
    const delPostcode = document.getElementById("delivery-postcode");

    // Get billing fields
    const billStreet = document.getElementById("billing-street");
    const billSuburb = document.getElementById("billing-suburb");
    const billPostcode = document.getElementById("billing-postcode");

    if (checkbox.checked) {
        // Check if delivery address is complete
        if (delStreet.value.trim() === "" || delSuburb.value.trim() === "" || delPostcode.value.trim() === "") {
            // Requirement: "display an alert"
            alert("Please enter your delivery address first.");
            checkbox.checked = false;
        } else {
            // Copy values
            billStreet.value = delStreet.value;
            billSuburb.value = delSuburb.value;
            billPostcode.value = delPostcode.value;
        }
    } else {
        // Clear billing fields (optional, but good UX)
        billStreet.value = "";
        billSuburb.value = "";
        billPostcode.value = "";
    }
}

/**
 * Updates credit card number maxLength
 */
function updateCardLength() {
    const cardType = document.getElementById("card-type").value;
    const cardNumberInput = document.getElementById("card-number");

    switch (cardType) {
        case "visa":
        case "mastercard":
            cardNumberInput.maxLength = 16; // 16 digits for Visa/MC
            cardNumberInput.pattern = "\\d{16}";
            cardNumberInput.placeholder = "16 digits";
            break;
        case "amex":
            cardNumberInput.maxLength = 15; // 15 digits for Amex
            cardNumberInput.pattern = "\\d{15}";
            cardNumberInput.placeholder = "15 digits";
            break;
        default:
            cardNumberInput.maxLength = 19; // Default max
            cardNumberInput.pattern = "\\d{15,16}";
            cardNumberInput.placeholder = "15-16 digits";
    }
}

/**
 * Toggles the visibility of the Delivery Address fieldset and "Same as delivery address" checkbox
 */
function toggleDeliveryFields() {
    const orderType = document.querySelector('input[name="order-type"]:checked').value;
    const deliveryDetails = document.getElementById("delivery-details");
    const sameAsDeliveryCheckbox = document.getElementById("same-as-delivery");
    const sameAsDeliveryGroup = sameAsDeliveryCheckbox.closest(".form-group");
    
    if (orderType === "delivery") {
        deliveryDetails.style.display = "block";
        sameAsDeliveryGroup.style.display = "block";
    } else {
        deliveryDetails.style.display = "none";
        sameAsDeliveryGroup.style.display = "none";
        // Uncheck the checkbox and clear billing fields if they were auto-filled
        if (sameAsDeliveryCheckbox.checked) {
            sameAsDeliveryCheckbox.checked = false;
            document.getElementById("billing-street").value = "";
            document.getElementById("billing-suburb").value = "";
            document.getElementById("billing-postcode").value = "";
        }
    }
}

/**
 * Toggles the visibility of the Payment Details fieldset
 */
function togglePaymentFields() {
    const payMethod = document.querySelector('input[name="pay-method"]:checked').value;
    const paymentDetails = document.getElementById("payment-details");
    
    if (payMethod === "online") {
        paymentDetails.style.display = "block";
    } else {
        paymentDetails.style.display = "none";
    }
}

/**
 * Initializes the flavor quantity controls (up/down buttons)
 */
function initFlavorQuantityControls() {
    const upButtons = document.querySelectorAll(".qty-up");
    const downButtons = document.querySelectorAll(".qty-down");

    upButtons.forEach(button => {
        button.addEventListener("click", function() {
            incrementQuantity(this.getAttribute("data-flavor"));
        });
    });

    downButtons.forEach(button => {
        button.addEventListener("click", function() {
            decrementQuantity(this.getAttribute("data-flavor"));
        });
    });

    // Initialize button states
    updateQuantityButtonStates();
}

/**
 * Increments the quantity for a specific flavor
 * @param {string} flavor - The flavor identifier (vanilla, chocolate, strawberry)
 */
function incrementQuantity(flavor) {
    const hiddenInput = document.getElementById(`flavor-${flavor}`);
    const display = document.getElementById(`qty-${flavor}`);
    let currentQty = parseInt(hiddenInput.value) || 0;
    
    currentQty++;
    hiddenInput.value = currentQty;
    display.textContent = `[${currentQty}]`;
    
    updateQuantityButtonStates();
}

/**
 * Decrements the quantity for a specific flavor
 * @param {string} flavor - The flavor identifier (vanilla, chocolate, strawberry)
 */
function decrementQuantity(flavor) {
    const hiddenInput = document.getElementById(`flavor-${flavor}`);
    const display = document.getElementById(`qty-${flavor}`);
    let currentQty = parseInt(hiddenInput.value) || 0;
    
    if (currentQty > 0) {
        currentQty--;
        hiddenInput.value = currentQty;
        display.textContent = `[${currentQty}]`;
    }
    
    updateQuantityButtonStates();
}

/**
 * Updates the disabled state of quantity buttons (disable down button when quantity is 0)
 */
function updateQuantityButtonStates() {
    const flavors = ["vanilla", "chocolate", "strawberry"];
    
    flavors.forEach(flavor => {
        const hiddenInput = document.getElementById(`flavor-${flavor}`);
        const currentQty = parseInt(hiddenInput.value) || 0;
        const downButton = document.querySelector(`.qty-down[data-flavor="${flavor}"]`);
        
        if (downButton) {
            downButton.disabled = currentQty === 0;
        }
    });
}

/**
 * Initializes session storage functionality for the order form
 * Saves form data as user types and restores it on page load
 */
function initSessionStorage(orderForm) {
    // Restore form data from session storage on page load
    // This should happen after all other initialization
    setTimeout(restoreFormData, 50);

    // Save form data to session storage when inputs change
    const formInputs = orderForm.querySelectorAll('input, select, textarea');
    formInputs.forEach(input => {
        // Skip hidden inputs (handle flavor quantities separately)
        if (input.type !== 'hidden') {
            input.addEventListener('input', function() {
                saveFormDataToSession();
            });
            input.addEventListener('change', function() {
                saveFormDataToSession();
            });
        }
    });

    // Save flavor quantities when they change
    const flavorInputs = document.querySelectorAll('[id^="flavor-"]');
    flavorInputs.forEach(input => {
        // Use a custom event or watch the hidden inputs
        // Trigger save when quantity buttons are clicked
    });

    // Save form data when quantity changes
    document.querySelectorAll('.qty-up, .qty-down').forEach(button => {
        button.addEventListener('click', function() {
            // Small delay to ensure quantity is updated first
            setTimeout(saveFormDataToSession, 10);
        });
    });

    // Save radio button changes
    document.querySelectorAll('input[type="radio"]').forEach(radio => {
        radio.addEventListener('change', function() {
            saveFormDataToSession();
        });
    });

    // Save checkbox changes
    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            saveFormDataToSession();
        });
    });

    // Clear session storage when form is successfully submitted
    orderForm.addEventListener('submit', function(event) {
        // Only clear if form is valid (this will be checked in validateOrderForm)
        // Clear it after successful validation
    });
}

/**
 * Saves all form data to session storage
 */
function saveFormDataToSession() {
    const formData = {};
    
    // Save all text inputs, selects, and textareas
    const inputs = document.querySelectorAll('#order-form input[type="text"], #order-form input[type="email"], #order-form input[type="tel"], #order-form select, #order-form textarea');
    inputs.forEach(input => {
        if (input.id) {
            formData[input.id] = input.value;
        }
    });

    // Save radio button selections
    const radios = document.querySelectorAll('#order-form input[type="radio"]');
    radios.forEach(radio => {
        if (radio.checked) {
            formData[radio.name] = radio.value;
        }
    });

    // Save checkbox states
    const checkboxes = document.querySelectorAll('#order-form input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        if (checkbox.id) {
            formData[checkbox.id] = checkbox.checked;
        }
    });

    // Save flavor quantities
    const flavors = ["vanilla", "chocolate", "strawberry"];
    flavors.forEach(flavor => {
        const flavorInput = document.getElementById(`flavor-${flavor}`);
        if (flavorInput) {
            formData[`flavor-${flavor}`] = flavorInput.value;
        }
    });

    // Save to session storage
    sessionStorage.setItem('orderFormData', JSON.stringify(formData));
}

/**
 * Restores form data from session storage
 */
function restoreFormData() {
    const savedData = sessionStorage.getItem('orderFormData');
    if (!savedData) {
        return; // No saved data
    }

    try {
        const formData = JSON.parse(savedData);

        // Restore text inputs, selects, and textareas
        Object.keys(formData).forEach(key => {
            const element = document.getElementById(key);
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = formData[key];
                } else {
                    element.value = formData[key];
                }
            } else {
                // Handle radio buttons by name (they're saved by name, not id)
                const radio = document.querySelector(`input[name="${key}"][value="${formData[key]}"]`);
                if (radio) {
                    radio.checked = true;
                }
            }
        });

        // Restore flavor quantities and update displays
        const flavors = ["vanilla", "chocolate", "strawberry"];
        flavors.forEach(flavor => {
            const flavorInput = document.getElementById(`flavor-${flavor}`);
            const display = document.getElementById(`qty-${flavor}`);
            if (flavorInput && formData[`flavor-${flavor}`] !== undefined) {
                const qty = parseInt(formData[`flavor-${flavor}`]) || 0;
                flavorInput.value = qty;
                if (display) {
                    display.textContent = `[${qty}]`;
                }
            }
        });

        // Trigger conditional field updates
        toggleDeliveryFields();
        togglePaymentFields();
        updateQuantityButtonStates();

        // If "same as delivery" was checked, restore that functionality
        const sameAsDelivery = document.getElementById("same-as-delivery");
        if (sameAsDelivery && formData["same-as-delivery"]) {
            copyDeliveryToBilling();
        }

    } catch (error) {
        console.error("Error restoring form data:", error);
    }
}

/**
 * Clears session storage for the order form
 */
function clearOrderFormSessionStorage() {
    sessionStorage.removeItem('orderFormData');
}

/**
 * Validates the entire order form.
 * @param {Event} event - The form submission event.
 */
function validateOrderForm(event) {
    event.preventDefault(); // Stop form submission

    let isValid = true;
    let errors = [];

    // Clear all previous errors
    clearAllErrors();

    // --- Validation Rules ---
    const orderType = document.querySelector('input[name="order-type"]:checked').value;
    const payMethod = document.querySelector('input[name="pay-method"]:checked').value;
    const isDelivery = orderType === "delivery";
    const isPayOnline = payMethod === "online";

    // 1. Flavor Selection - Check if at least one flavor has quantity > 0
    const vanillaQty = parseInt(document.getElementById("flavor-vanilla").value) || 0;
    const chocolateQty = parseInt(document.getElementById("flavor-chocolate").value) || 0;
    const strawberryQty = parseInt(document.getElementById("flavor-strawberry").value) || 0;
    const totalQuantity = vanillaQty + chocolateQty + strawberryQty;
    
    if (totalQuantity === 0) {
        isValid = false;
        errors.push("Please select at least one ice cream flavor.");
        showError("flavor-error", "Please select at least one ice cream flavor.");
    }

    // 2. Delivery Address
    if (isDelivery) {
        if (document.getElementById("delivery-street").value.trim() === "") {
            isValid = false;
            errors.push("Delivery street is required.");
            showError("delivery-street-error", "Delivery street is required.");
        }
        if (document.getElementById("delivery-suburb").value.trim() === "") {
            isValid = false;
            errors.push("Delivery suburb is required.");
            showError("delivery-suburb-error", "Delivery suburb is required.");
        }
        
        // Postcode (4 digits)
        const delPostcode = document.getElementById("delivery-postcode");
        if (!validatePostcode(delPostcode.value)) {
            isValid = false;
            errors.push("Delivery postcode must be 4 digits.");
            showError("delivery-postcode-error", "Postcode must be exactly 4 digits.");
        }
    }

    // 3. Billing Address
    //    (Unless "same as delivery" is checked and valid)
    const sameAsDelivery = document.getElementById("same-as-delivery").checked;
    if (!sameAsDelivery) {
        if (document.getElementById("billing-street").value.trim() === "") {
            isValid = false;
            errors.push("Billing street is required.");
            showError("billing-street-error", "Billing street is required.");
        }
        if (document.getElementById("billing-suburb").value.trim() === "") {
            isValid = false;
            errors.push("Billing suburb is required.");
            showError("billing-suburb-error", "Billing suburb is required.");
        }

        // Postcode (4 digits)
        const billPostcode = document.getElementById("billing-postcode");
        if (!validatePostcode(billPostcode.value)) {
            isValid = false;
            errors.push("Billing postcode must be 4 digits.");
            showError("billing-postcode-error", "Postcode must be exactly 4 digits.");
        }
    }

    // 4. Contact Number
    if (document.getElementById("contact-number").value.trim() === "") {
        isValid = false;
        errors.push("Contact number is required.");
        showError("contact-number-error", "Contact number is required.");
    }

    // 5. Email
    const email = document.getElementById("email");
    if (email.value.trim() === "") {
        isValid = false;
        errors.push("Email is required.");
        showError("email-error", "Email is required.");
    } else if (!validateEmailFormat(email.value)) {
        isValid = false;
        errors.push("Please enter a valid email address.");
        showError("email-error", "Please enter a valid email address.");
    }

    // 6. Payment Details
    if (isPayOnline) {
        const cardType = document.getElementById("card-type");
        if (cardType.value === "") {
            isValid = false;
            errors.push("Credit card type is required.");
            showError("card-type-error", "Please select a card type.");
        }

        const cardNameValue = document.getElementById("card-name").value.trim();
        if (cardNameValue === "") {
            isValid = false;
            errors.push("Name on card is required.");
            showError("card-name-error", "Name on card is required.");
        } else if (!/^[A-Za-z ]+$/.test(cardNameValue)) {
            isValid = false;
            errors.push("Name on card must contain letters and spaces only.");
            showError("card-name-error", "Name on card must contain letters and spaces only.");
        }
        
        // Validate card number based on type (Enhancement 3)
        const cardNum = document.getElementById("card-number");
        let cardLengthOK = true;
        if (cardType.value === "amex" && cardNum.value.length !== 15) {
            cardLengthOK = false;
        } else if ((cardType.value === "visa" || cardType.value === "mastercard") && cardNum.value.length !== 16) {
            cardLengthOK = false;
        } else if (cardType.value !== "" && !/^\d+$/.test(cardNum.value)) {
             cardLengthOK = false; // Check if it's all digits
        }

        if (!cardLengthOK) {
             isValid = false;
             let msg = "Credit card number is invalid.";
             if (cardType.value === "amex") msg = "American Express must be 15 digits.";
             if (cardType.value === "visa" || cardType.value === "mastercard") msg = "Visa/MasterCard must be 16 digits.";
             errors.push(msg);
             showError("card-number-error", msg);
        }

        // Basic validation for Expiry and CVV
        if (document.getElementById("card-expiry").value.trim() === "") {
            isValid = false;
            errors.push("Card expiry date is required.");
            showError("card-expiry-error", "Card expiry is required.");
        }
        if (document.getElementById("card-cvv").value.trim() === "") {
            isValid = false;
            errors.push("Card CVV is required.");
            showError("card-cvv-error", "Card CVV is required.");
        }
    }

    // --- Final Decision ---
    if (isValid) {
        // If all valid, clear session storage and allow the form to be submitted
        console.log("Order form is valid. Submitting...");
        clearOrderFormSessionStorage();
        event.target.submit();
    } else {
        // If invalid, show a summary of all errors
        showErrorSummary(errors);
    }
}


// --- Validation Helper Functions ---

/**
 * Displays an inline error message for a specific field.
 * @param {string} errorId - The ID of the <span> element to show the error in.
 * @param {string} message - The error message to display.
 */
function showError(errorId, message) {
    const errorSpan = document.getElementById(errorId);
    if (errorSpan) {
        errorSpan.textContent = message;
        errorSpan.style.display = "block";
        
        // Add error class to the corresponding input
        const inputId = errorId.replace("-error", "");
        const input = document.getElementById(inputId);
        if (input) {
            input.classList.add("error");
        }
    }
}

/**
 * Clears all inline error messages and summary.
 */
function clearAllErrors() {
    // Clear all inline spans
    const errorSpans = document.querySelectorAll(".error-message");
    errorSpans.forEach(span => {
        span.textContent = "";
        span.style.display = "none";
    });

    // Clear all input error classes
    const errorInputs = document.querySelectorAll(".error");
    errorInputs.forEach(input => {
        input.classList.remove("error");
    });

    // Hide the summary box
    const errorSummary = document.getElementById("form-errors");
    if (errorSummary) {
        errorSummary.style.display = "none";
        errorSummary.innerHTML = "";
    }
}

/**
 * Displays a summary of all validation errors at the top of the form.
 * [Requirement 2.3.4: "show an... message... to display ALL the errors"]
 * @param {string[]} errors - An array of error message strings.
 */
function showErrorSummary(errors) {
    const errorSummary = document.getElementById("form-errors");
    if (errorSummary) {
        let errorList = errors.map(error => `<li>${error}</li>`).join("");
        errorSummary.innerHTML = `
            <h3>Please fill in the following ${errors.length} fields:</h3>
            <ul>${errorList}</ul>
        `;
        errorSummary.style.display = "block";
        // Focus the summary box for accessibility
        errorSummary.tabIndex = -1;
        errorSummary.focus();
    }
}

/**
 * Validates a postcode is exactly 4 digits.
 * @param {string} postcode - The postcode to validate.
 * @returns {boolean} - True if valid, false otherwise.
 */
function validatePostcode(postcode) {
    const postcodeRegex = /^\d{4}$/; // Regex for exactly 4 digits
    return postcodeRegex.test(postcode);
}

/**
 * Validates a strong password: at least 9 chars, 1 upper, 1 lower, 1 digit, 1 symbol.
 * @param {string} password - The password to validate.
 * @returns {boolean} - True if valid, false otherwise.
 */
function validateStrongPassword(password) {
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{9,}$/;
    return strongPasswordRegex.test(password);
}

/**
 * Validates a basic email format.
 * @param {string} email - The email to validate.
 * @returns {boolean} - True if valid, false otherwise.
 */
function validateEmailFormat(email) {
    // A simple regex for email validation (not perfect, but sufficient)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}


// --- Global ---
// Run the init function once the DOM is ready.
window.addEventListener("DOMContentLoaded", init);