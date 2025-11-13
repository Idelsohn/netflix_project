// Utility functions for localStorage management and general helpers

class StorageManager {
    // Authentication state management
    static setAuthState(isLoggedIn, username = null) {
        localStorage.setItem('isLoggedIn', isLoggedIn.toString());
        if (username) {
            localStorage.setItem('username', username);
        }
    }

    static getAuthState() {
        return {
            isLoggedIn: localStorage.getItem('isLoggedIn') === 'true',
            username: localStorage.getItem('username')
        };
    }

    static clearAuthState() {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('username');
    }

    // Profile management
    static setSelectedProfile(profileId, profileName) {
        localStorage.setItem('selectedProfileId', profileId.toString());
        localStorage.setItem('selectedProfileName', profileName);
    }

    static getSelectedProfile() {
        return {
            id: localStorage.getItem('selectedProfileId'),
            name: localStorage.getItem('selectedProfileName')
        };
    }

    static clearSelectedProfile() {
        localStorage.removeItem('selectedProfileId');
        localStorage.removeItem('selectedProfileName');
    }

    // Liked content management
    static getLikedContent() {
        const liked = localStorage.getItem('likedContent');
        return liked ? JSON.parse(liked) : [];
    }

    static setLikedContent(likedArray) {
        localStorage.setItem('likedContent', JSON.stringify(likedArray));
    }

    static addLikedContent(contentId) {
        const liked = this.getLikedContent();
        if (!liked.includes(contentId)) {
            liked.push(contentId);
            this.setLikedContent(liked);
        }
    }

    static removeLikedContent(contentId) {
        const liked = this.getLikedContent();
        const filtered = liked.filter(id => id !== contentId);
        this.setLikedContent(filtered);
    }

    static isContentLiked(contentId) {
        return this.getLikedContent().includes(contentId);
    }

    // Content likes count management
    static getContentLikes() {
        const likes = localStorage.getItem('contentLikes');
        return likes ? JSON.parse(likes) : {};
    }

    static setContentLikes(likesObject) {
        localStorage.setItem('contentLikes', JSON.stringify(likesObject));
    }

    static updateContentLikes(contentId, newCount) {
        const likes = this.getContentLikes();
        likes[contentId] = newCount;
        this.setContentLikes(likes);
    }

    static getContentLikeCount(contentId) {
        const likes = this.getContentLikes();
        return likes[contentId] || null;
    }

    // Clear all data (for logout)
    static clearAllData() {
        this.clearAuthState();
        this.clearSelectedProfile();
        // Note: We keep liked content data even after logout (common UX pattern)
    }
}

// Validation utilities
class ValidationUtils {
    static validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    static validatePassword(password) {
        return password && password.length >= 6;
    }

    static showError(inputElement, message) {
        // Remove existing error
        this.clearError(inputElement);
        
        // Create error element
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        
        // Insert after the input
        inputElement.parentNode.insertBefore(errorDiv, inputElement.nextSibling);
    }

    static clearError(inputElement) {
        const existingError = inputElement.parentNode.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
    }

    static clearAllErrors(form) {
        const errors = form.querySelectorAll('.error-message');
        errors.forEach(error => error.remove());
    }
}

// DOM utilities
class DOMUtils {
    static createElement(tag, className = '', content = '') {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (content) element.textContent = content;
        return element;
    }

    static showNotification(message, type = 'info') {
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

    static redirectTo(page) {
        window.location.href = page;
    }
}

// Animation utilities
class AnimationUtils {
    static pulseElement(element) {
        element.classList.add('pulse-animation');
        setTimeout(() => {
            element.classList.remove('pulse-animation');
        }, 600);
    }

    static fadeIn(element) {
        element.style.opacity = '0';
        element.style.display = 'block';
        
        let opacity = 0;
        const timer = setInterval(() => {
            if (opacity >= 1) {
                clearInterval(timer);
            }
            element.style.opacity = opacity;
            opacity += 0.1;
        }, 50);
    }

    static fadeOut(element) {
        let opacity = 1;
        const timer = setInterval(() => {
            if (opacity <= 0) {
                clearInterval(timer);
                element.style.display = 'none';
            }
            element.style.opacity = opacity;
            opacity -= 0.1;
        }, 50);
    }
}