// API Configuration
const API_ENDPOINT = '/.netlify/functions/send-email';

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
    
    // Send email using Netlify function
    fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
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
    .catch(error => {
        // Hide loading indicator
        hideLoading();
        
        // Show error message
        console.error('Send email error:', error);
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