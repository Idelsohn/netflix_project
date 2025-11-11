import { APIUsage } from '../APIUsage.js';

class AuthManager {
    constructor() {
        this.apiUsage = new APIUsage();
        this.init();
    }

    init() {
        // Check if we're on the login page
        if (window.location.pathname.includes('login.html') || window.location.pathname === '/') {
            this.initLoginPage();
        }

        // Check if we're on the sign-up page
        if (window.location.pathname.includes('sign-up.html')) {
            this.initSignUpPage();
        }
        
        // Check if we're on the profiles page
        if (window.location.pathname.includes('profiles/profiles.html')) {
            this.initProfilesPage();
        }
        
        // Check authentication state on page load
        this.checkAuthState();
    }

    initLoginPage() {
        const loginForm = document.querySelector('.login-form');
        if (!loginForm) return;
        this.setupLoginToggle();

        const usernameInput = loginForm.querySelector('input[id="login-username"]');
        const passwordInput = loginForm.querySelector('input[id="login-password"]');

        // Real-time validation
        usernameInput.addEventListener('blur', () => {
            this.validateUsernameField(usernameInput);
        });

        passwordInput.addEventListener('blur', () => {
            this.validatePasswordField(passwordInput);
        });

        // Form submission
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Prevent default form submission
            this.handleLogin(usernameInput, passwordInput);
        });

        // Don't automatically clear auth state - let user stay logged in
        // Only clear on explicit logout
    }

    initSignUpPage() {
        const signUpForm = document.querySelector('.sign-up-form');
        if (!signUpForm) return;
        this.setupSignUpToggle();

        const usernameInput = signUpForm.querySelector('input[id="sign-up-username"]');
        const emailInput = signUpForm.querySelector('input[id="sign-up-email"]');
        const passwordInput = signUpForm.querySelector('input[id="sign-up-password"]');
        const confirmPasswordInput = signUpForm.querySelector('input[id="sign-up-confirm-password"]');
        const agreeToTermsCheckbox = signUpForm.querySelector('input[id="agree-to-terms"]');

        // Real-time validation
        // blur events for when user leaves the input field
        usernameInput.addEventListener('blur', () => { 
            this.validateUsernameField(usernameInput);
        });

        emailInput.addEventListener('blur', () => { 
            this.validateEmailField(emailInput);
        });

        passwordInput.addEventListener('blur', () => {
            this.validatePasswordField(passwordInput);
            this.validatePasswordConfirmationField(passwordInput, confirmPasswordInput);
        });
        
        confirmPasswordInput.addEventListener('blur', () => {
            this.validatePasswordConfirmationField(passwordInput, confirmPasswordInput);
        });

        agreeToTermsCheckbox.addEventListener('change', () => {
            this.validateAgreeToTermsField(agreeToTermsCheckbox);
        });
        
        // Form submission
        signUpForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Prevent default form submission
            this.handleSignUp(usernameInput, emailInput, passwordInput, confirmPasswordInput, agreeToTermsCheckbox);
        });
    }

    setupLoginToggle() {
        const pwd = document.getElementById('login-password');
        const passwordToggle = document.getElementById('password-togglePwd');
        passwordToggle.addEventListener('click', ()=> {
            if (pwd.type === 'password'){
                pwd.type = 'text'; 
                passwordToggle.textContent = 'Hide';
            } else {
                pwd.type = 'password'; 
                passwordToggle.textContent = 'Show';
            }
        });
    }

    setupSignUpToggle() {
        const pwd = document.getElementById('sign-up-password');
        const confirmPwd = document.getElementById('sign-up-confirm-password');
        const passwordToggle = document.getElementById('password-togglePwd');
        const confirmPasswordToggle = document.getElementById('confirm-password-togglePwd');
        passwordToggle.addEventListener('click', ()=> {
            if (pwd.type === 'password'){
                pwd.type = 'text'; 
                passwordToggle.textContent = 'Hide';
            }
            else {
                pwd.type = 'password'; 
                passwordToggle.textContent = 'Show';
            }
        });
        confirmPasswordToggle.addEventListener('click', ()=> {
            if (confirmPwd.type === 'password'){
                confirmPwd.type = 'text'; 
                confirmPasswordToggle.textContent = 'Hide';
            }
            else {
                confirmPwd.type = 'password'; 
                confirmPasswordToggle.textContent = 'Show';
            }
        });
    }

    async initProfilesPage() {
        // Check if user is authenticated
        const hasActiveSession = await this.apiUsage.hasActiveSession();
        if (!hasActiveSession.success) {
            this.logout();
            return;
        }
        
        // Load profiles and setup selection
        const username = await this.apiUsage.getCurrentUser().then(user => user.username);
        const profiles = await this.apiUsage.getAllProfiles(username);
        this.createCardList(profiles);

        const allProfilesCards = document.querySelector('.profile-list').querySelectorAll('.profile-card');
        allProfilesCards.forEach((card) => {
            card.addEventListener('click', () => {
                this.selectProfile(
                    card.getAttribute("data-profile-id"), 
                    card.querySelector('.profile-name').textContent
                );
            });
        });

        // Handle Manage Profiles button
        const manageBtn = document.querySelector('.manage-profiles-button');
        if (manageBtn) {
            manageBtn.addEventListener('click', () => {
                window.location.href = '../profiles/profiles-edit.html'; // Redirect to the edit page
            });
        }
    }

    createCardList(profiles) {
        profiles.forEach((profile) => {
            let card = document.createElement('div');
            card.className = 'profile-card';
            card.setAttribute('data-profile-id', profile.id);
            const img = document.createElement('img');
            img.src = "../../" + profile.image;
            img.alt = profile.name;
            const nameDiv = document.createElement('div');
            nameDiv.className = 'profile-name';
            nameDiv.textContent = profile.profile_name;
            card.appendChild(img);
            card.appendChild(nameDiv);
            document.querySelector('.profile-list').appendChild(card);
        });
    }

    validateUsernameField(usernameInput) {
        const username = usernameInput.value.trim(); // Trim whitespace
        this.clearError(usernameInput);

        if (!username) {
            this.showError(usernameInput, 'Username is required');
            return false;
        }

        if (username.length < 4) {
            this.showError(usernameInput, 'Username must contain at least 4 characters');
            return false;
        }

        return true;
    }

    validateEmailField(emailInput) {
        const email = emailInput.value.trim(); // Trim whitespace
        this.clearError(emailInput);

        if (!email) {
            this.showError(emailInput, 'Email is required');
            return false;
        }

        // Simple email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
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

    validatePasswordConfirmationField(passwordInput, confirmPasswordInput) {
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        this.clearError(confirmPasswordInput);

        if (!confirmPassword) {
            this.showError(confirmPasswordInput, 'Please confirm your password');
            return false;
        }

        if (confirmPassword !== password) {
            this.showError(confirmPasswordInput, 'Passwords do not match');
            return false;
        }

        return true;
    }

    validateAgreeToTermsField(agreeToTermsCheckbox) {
        this.clearError(agreeToTermsCheckbox);
        if (!agreeToTermsCheckbox.checked) {
            this.showError(agreeToTermsCheckbox, 'You must agree to the Terms of Use and Privacy Policy');
            return false;
        }

        return true;
    }

    showError(inputElement, message) {
        // Remove existing error
        this.clearError(inputElement);
        
        // Create error element
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message-' + inputElement.id;
        errorDiv.textContent = message;
        
        // Insert after the input
        inputElement.parentNode.insertBefore(errorDiv, inputElement.nextSibling);
    }

    clearError(inputElement) {
        const existingError = inputElement.parentNode.querySelector('.error-message-' + inputElement.id);
        if (existingError) {
            existingError.remove();
        }
    }

    clearAllErrors(form) {
        const errors = form.querySelectorAll('[class^="error-message"]');
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
            if (notification.parentNode) { // Check if still in DOM
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }

    async handleLogin(usernameInput, passwordInput) {
        // Clear all previous errors
        this.clearAllErrors(document.querySelector('.login-form'));

        const username = usernameInput.value.trim();
        const password = passwordInput.value;

        // Validate both fields
        const isUsernameValid = this.validateUsernameField(usernameInput);
        const isPasswordValid = this.validatePasswordField(passwordInput);

        if (!isUsernameValid || !isPasswordValid) {
            return;
        }

        // Call API to authenticate user
        const res = await this.apiUsage.authenticateUser(username, password);
        if (res.error) {
            this.showNotification(res.error, 'error');
            return;
        }

        try {
            // Save authentication state to localStorage
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('username', username);
            
            console.log('Auth state saved:', {isLoggedIn: true, username: username});
            
            // Show success message
            this.showNotification('Login successful!', 'success');
            
            // Immediate redirect to profiles page (relative path)
            setTimeout(() => {
                window.location.href = '../profiles/profiles.html';
            }, 1000);
            
        } catch (error) {
            console.error('Login error:', error);
            this.showNotification('Login error', 'error');
        }
    }

    async handleSignUp(usernameInput, emailInput, passwordInput, confirmPasswordInput, agreeToTermsCheckbox) {
        // Clear all previous errors
        this.clearAllErrors(document.querySelector('.sign-up-form'));

        const username = usernameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value;

        // Validate all fields
        const isUsernameValid = this.validateUsernameField(usernameInput);
        const isEmailValid = this.validateEmailField(emailInput);
        const isPasswordValid = this.validatePasswordField(passwordInput);
        const isConfirmPasswordValid = this.validatePasswordConfirmationField(passwordInput, confirmPasswordInput);
        const isAgreeToTermsValid = this.validateAgreeToTermsField(agreeToTermsCheckbox);

        if (!isUsernameValid || !isEmailValid || !isPasswordValid || !isConfirmPasswordValid || !isAgreeToTermsValid) {
            return;
        }
        
        // Call API to create user
        const res = await this.apiUsage.createUser(username, email, password);
        if (res.error) {
            if (res.error.includes('Username')) {
                this.showError(usernameInput, res.error);
            } else if (res.error.includes('Email')) {
                this.showError(emailInput, res.error);
            } else {
                this.showNotification(res.error, 'error');
            }
            return;
        }
        
        try {
            // Show success message
            this.showNotification('Sign-up successful!', 'success');
            
            // Immediate redirect to profiles page (relative path)
            setTimeout(() => {
                window.location.href = '../auth/login.html';
            }, 1000);
            
        } catch (error) {
            console.error('Sign-up error:', error);
            this.showNotification('Sign-up error', 'error');
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
                window.location.href = '../feed/feed.html';
            }, 1000);
            
        } catch (error) {
            console.error('Profile selection error:', error);
            this.showNotification('Profile selection error', 'error');
        }
    }

    async checkAuthState() {
        const currentPage = window.location.pathname;
        // Check if user is authenticated
        const hasActiveSession = await this.apiUsage.hasActiveSession();
        const isLoggedIn = hasActiveSession.success;
        
        console.log('Current page:', currentPage);
        console.log('Is logged in:', isLoggedIn);

        // Skip auth check for login page
        if (currentPage.includes('login.html') || currentPage.includes('sign-up.html') || 
            currentPage === '/' || currentPage.endsWith('/')) {
            return;
        }

        // Check if user is authenticated for protected pages
        if (!isLoggedIn) {
            console.log('Not authenticated, redirecting to login');
            window.location.href = '../auth/login.html';
            return;
        }

        // If on feed.html (feed), check if profile is selected
        if (currentPage.includes('../feed/feed.html')) {
            const profileId = localStorage.getItem('selectedProfileId');
            const profileName = localStorage.getItem('selectedProfileName');
            
            console.log('Selected profile:', {id: profileId, name: profileName});
            
            if (!profileId || !profileName) {
                console.log('No profile selected, redirecting to profiles');
                window.location.href = '../profiles/profiles.html';
                return;
            }
        }
    }

    logout() {
        // Clear ALL localStorage data as required by exercise instructions
        localStorage.clear();

        // Clear the cookies by calling the logout API
        this.apiUsage.logoutUser();

        // Redirect to login
        setTimeout(() => {
            window.location.href = '../auth/login.html';
        }, 1000);
    }
}

// Initialize authentication manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.authManager = new AuthManager();
});
