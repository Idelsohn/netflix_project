// Authentication and user management functionality

class AuthManager {
    constructor() {
        this.init();
    }

    init() {
        // Check if we're on the login page
        if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
            this.initLoginPage();
        }
        
        // Check if we're on the profiles page
        if (window.location.pathname.includes('profiles.html')) {
            this.initProfilesPage();
        }
        
        // Check authentication state on page load
        this.checkAuthState();
    }

    initLoginPage() {
        const loginForm = document.querySelector('.login-form');
        if (!loginForm) return;

        const emailInput = loginForm.querySelector('input[type="text"]');
        const passwordInput = loginForm.querySelector('input[type="password"]');
        const submitButton = loginForm.querySelector('button[type="submit"]');

        // Add IDs for easier reference
        emailInput.id = 'email';
        passwordInput.id = 'password';

        // Real-time validation
        emailInput.addEventListener('blur', () => {
            this.validateEmailField(emailInput);
        });

        passwordInput.addEventListener('blur', () => {
            this.validatePasswordField(passwordInput);
        });

        // Form submission
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin(emailInput, passwordInput);
        });

        // Don't automatically clear auth state - let user stay logged in
        // Only clear on explicit logout
    }

    initProfilesPage() {
        // Check if user is authenticated
        const authState = StorageManager.getAuthState();
        if (!authState.isLoggedIn) {
            DOMUtils.redirectTo('index.html');
            return;
        }

        // Add click handlers to profile cards
        const profileCards = document.querySelectorAll('.profile-card');
        profileCards.forEach((card, index) => {
            const profile = profiles[index];
            card.setAttribute('data-profile-id', profile.id);
            
            card.addEventListener('click', () => {
                this.selectProfile(profile.id, profile.name);
            });

            // Add hover effect
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'scale(1.05)';
                card.style.transition = 'transform 0.3s ease';
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'scale(1)';
            });
        });
    }

    validateEmailField(emailInput) {
        const email = emailInput.value.trim();
        this.clearError(emailInput);

        if (!email) {
            this.showError(emailInput, 'Email is required');
            return false;
        }

        // Simple email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            this.showError(emailInput, 'Please enter a valid email format');
            return false;
        }

        return true;
    }

    validatePasswordField(passwordInput) {
        const password = passwordInput.value;
        this.clearError(passwordInput);

        if (!password) {
            this.showError(passwordInput, 'Password is required');
            return false;
        }

        if (password.length < 6) {
            this.showError(passwordInput, 'Password must contain at least 6 characters');
            return false;
        }

        return true;
    }

    showError(inputElement, message) {
        // Remove existing error
        this.clearError(inputElement);
        
        // Create error element
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        
        // Insert after the input
        inputElement.parentNode.insertBefore(errorDiv, inputElement.nextSibling);
    }

    clearError(inputElement) {
        const existingError = inputElement.parentNode.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
    }

    clearAllErrors(form) {
        const errors = form.querySelectorAll('.error-message');
        errors.forEach(error => error.remove());
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }

    handleLogin(emailInput, passwordInput) {
        // Clear all previous errors
        this.clearAllErrors(document.querySelector('.login-form'));

        const email = emailInput.value.trim();
        const password = passwordInput.value;

        // Validate both fields
        const isEmailValid = this.validateEmailField(emailInput);
        const isPasswordValid = this.validatePasswordField(passwordInput);

        if (!isEmailValid || !isPasswordValid) {
            return;
        }

        try {
            // Save authentication state to localStorage
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userEmail', email);
            
            console.log('Auth state saved:', {isLoggedIn: true, userEmail: email});
            
            // Show success message
            this.showNotification('Login successful!', 'success');
            
            // Immediate redirect to profiles page (relative path)
            setTimeout(() => {
                window.location.href = 'profiles.html';
            }, 1000);
            
        } catch (error) {
            console.error('Login error:', error);
            this.showNotification('Login error', 'error');
        }
    }

    selectProfile(profileId, profileName) {
        try {
            // Save selected profile
            localStorage.setItem('selectedProfileId', profileId.toString());
            localStorage.setItem('selectedProfileName', profileName);
            
            console.log('Profile saved:', {id: profileId, name: profileName});
            
            // Show selection feedback
            this.showNotification(`Profile selected: ${profileName}`, 'success');
            
            // Immediate redirect to feed page (relative path)
            setTimeout(() => {
                window.location.href = 'menu.html';
            }, 1000);
            
        } catch (error) {
            console.error('Profile selection error:', error);
            this.showNotification('Profile selection error', 'error');
        }
    }

    checkAuthState() {
        const currentPage = window.location.pathname;
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        
        console.log('Current page:', currentPage);
        console.log('Is logged in:', isLoggedIn);

        // Skip auth check for login page
        if (currentPage.includes('index.html') || currentPage === '/' || currentPage.endsWith('/')) {
            return;
        }

        // Check if user is authenticated for protected pages
        if (!isLoggedIn) {
            console.log('Not authenticated, redirecting to login');
            window.location.href = 'index.html';
            return;
        }

        // If on menu.html (feed), check if profile is selected
        if (currentPage.includes('menu.html')) {
            const profileId = localStorage.getItem('selectedProfileId');
            const profileName = localStorage.getItem('selectedProfileName');
            
            console.log('Selected profile:', {id: profileId, name: profileName});
            
            if (!profileId || !profileName) {
                console.log('No profile selected, redirecting to profiles');
                window.location.href = 'profiles.html';
                return;
            }
        }
    }

    logout() {
        // Clear ALL localStorage data as required by exercise instructions
        localStorage.clear();
        
        // Show logout message
        this.showNotification('Successfully logged out', 'info');
        
        // Redirect to login
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    }
}

// Initialize authentication manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.authManager = new AuthManager();
});