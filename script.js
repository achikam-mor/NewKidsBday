// EmailJS configuration
// Replace these with the IDs you got from your EmailJS account
const EMAILJS_USER_ID = 'Wba6DXKooGEeFURmU'; // Your EmailJS User ID (from Account > API Keys)
const EMAILJS_SERVICE_ID = 'service_v31t38c'; // Your EmailJS Service ID (from Email Services)
const EMAILJS_TEMPLATE_ID = 'template_rg96ck9'; // Your EmailJS Template ID (from Email Templates)

// Initialize EmailJS
(function() {
    emailjs.init(EMAILJS_USER_ID);
})();

// DOM Elements
const kidCircles = document.querySelectorAll('.kid-circle');
const giftForm = document.getElementById('giftForm');
const selectedChildInput = document.getElementById('selectedChild');
const successModal = document.getElementById('successModal');
const modalClose = document.querySelector('.close');

// Add event listeners to kid circles for selection
kidCircles.forEach(circle => {
    circle.addEventListener('click', function() {
        // Remove selected class from all circles
        kidCircles.forEach(c => c.classList.remove('selected'));
        
        // Add selected class to this circle
        this.classList.add('selected');
        
        // Update the selected child input
        const childName = this.getAttribute('data-name');
        selectedChildInput.value = childName;
    });
});

// Form submission handler
giftForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
        return;
    }
    
    // Show loading indicator
    showLoading();
    
    // Prepare form data for submission
    const formData = {
        name: document.getElementById('name').value,
        birthdate: document.getElementById('birthdate').value,
        gifts: document.getElementById('gifts').value,
        links: document.getElementById('links').value,
        selectedChild: selectedChildInput.value
    };
    
    // Send email using EmailJS
    emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
        to_email: 'Achikamor@gmail.com',
        from_name: formData.name,
        child_name: formData.selectedChild,
        birthdate: formData.birthdate,
        gifts: formData.gifts,
        links: formData.links
    })
    .then(function() {
        // Hide loading indicator
        hideLoading();
        
        // Show success modal
        successModal.style.display = 'block';
        
        // Reset form
        giftForm.reset();
        
        // Clear selected child
        kidCircles.forEach(circle => circle.classList.remove('selected'));
        selectedChildInput.value = '';
    })
    .catch(function(error) {
        // Hide loading indicator
        hideLoading();
        
        // Show error message
        console.error('EmailJS error:', error);
        alert('Failed to send your gift registration. Please try again later.');
    });
});

// Form validation
function validateForm() {
    // Check if a child is selected
    if (!selectedChildInput.value) {
        alert('Please select a child first.');
        return false;
    }
    
    // Check name field
    if (!document.getElementById('name').value.trim()) {
        alert('Please enter your name.');
        return false;
    }
    
    // Check birthdate field
    if (!document.getElementById('birthdate').value) {
        alert('Please enter your birthdate.');
        return false;
    }
    
    return true;
}

// Modal close button
modalClose.addEventListener('click', function() {
    successModal.style.display = 'none';
});

// Close modal when clicking outside
window.addEventListener('click', function(event) {
    if (event.target === successModal) {
        successModal.style.display = 'none';
    }
});

// Loading indicator functions
function showLoading() {
    // Create loading element if it doesn't exist
    if (!document.querySelector('.loading')) {
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'loading';
        
        const spinnerDiv = document.createElement('div');
        spinnerDiv.className = 'spinner';
        
        loadingDiv.appendChild(spinnerDiv);
        document.body.appendChild(loadingDiv);
    }
    
    document.querySelector('.loading').style.display = 'flex';
}

function hideLoading() {
    const loading = document.querySelector('.loading');
    if (loading) {
        loading.style.display = 'none';
    }
}

// Create images directory if it doesn't exist
document.addEventListener('DOMContentLoaded', function() {
    // This is just a placeholder function
    // In a real environment, you would need to create the directory server-side
    console.log('Gift Registry initialized');
});