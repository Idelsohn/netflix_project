import { APIUsage } from '../APIUsage.js';

class ProfileManagement {
    constructor() {
        this.apiUsage = new APIUsage();
        this.baseImagePath = '../../images/profile_pictures/'
        this.profileImages = [
            'profile_picture_1.jfif',
            'profile_picture_2.jfif',
            'profile_picture_3.jfif',
            'profile_picture_4.jfif',
            'profile_picture_5.jfif',
        ];
        this.init();
    }

    async init() {
        const profileEditForm = document.querySelector('.profile-edit-form');
        if (!profileEditForm) return;

        const hasActiveSession = await this.apiUsage.hasActiveSession();
        if (!hasActiveSession.success) {
            this.logout();
            return;
        }
        this.currentUsername = await this.apiUsage.getCurrentUser().then(user => user.username);
        this.curentUserProfiles = await this.apiUsage.getAllProfiles(this.currentUsername);

        this.showProfilesForUser();
        this.setDefaultProfileNameSelaction();
        this.setDefaultImageSelection();
        
        const selectionField = document.getElementById('profileSelect');
        const profileNameField = document.getElementById('selectedProfileName');
        const getSelectedImage = () => {
            const checked = document.querySelector('input[name="profileImageOption"]:checked');
            const imagePathInsideImagesFolder = checked.value.substring(checked.value.indexOf('images'));
            return checked ? imagePathInsideImagesFolder : '';
        };
        selectionField.addEventListener('change', () => {
            this.toggleReadonly(selectionField, profileNameField);
            this.setImageSelection(selectionField, profileNameField);
        });

        // Form submission
        profileEditForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Prevent default form submission
            this.validateAndSubmitForm(selectionField.value, profileNameField.value, getSelectedImage());
        });

        // canxel button
        document.getElementById('cancelButton').addEventListener('click', () => {
            console.log("hello")
            window.location.href = '../profiles/profiles.html';
        });
    }

    async showProfilesForUser() {
        const profileSelect = document.getElementById('profileSelect');
        if (!profileSelect) return;
        
        this.curentUserProfiles.forEach(profile => {
            const option = document.createElement('option');
            option.value = profile.profile_name;
            option.textContent = "Edit profile " + profile.profile_name;
            profileSelect.appendChild(option);
        });
    }

    setDefaultProfileNameSelaction() {
        const select = document.getElementById('profileSelect');
        const nameField = document.getElementById('selectedProfileName');
        nameField.readOnly = true; // Start readonly until a selection is made
        this.toggleReadonly(select, nameField);
    }

    toggleReadonly(selectionField, nameField) {
        nameField.value = selectionField.value || '';
        if (selectionField.value) {
            nameField.readOnly = false;
            selectionField.style.borderColor = '';
            selectionField.style.borderWidth = '';
        } else {
            nameField.readOnly = true;
            selectionField.style.borderColor = 'red';
            selectionField.style.borderWidth = '2px';
            nameField.value = '';
        }
    }

    setDefaultImageSelection() {
        const container = document.getElementById('profileImageOptions');

        if (!container) return;

        // Hide existing file-input chooser (keeps it in DOM but not visible)
        const fileInput = document.getElementById('profileImage');
        if (fileInput) {
            const wrapper = fileInput.closest('div');
            if (wrapper) wrapper.style.display = 'none';
        }

        this.profileImages.forEach((imageFilename, idx) => {
            const value = this.baseImagePath + imageFilename;
            const id = 'profileImageOption-' + idx;

            const label = document.createElement('label');
            label.className = 'd-inline-block text-center';
            label.style.cursor = 'pointer';

            const radio = document.createElement('input');
            radio.type = 'radio';
            radio.name = 'profileImageOption';
            radio.id = id;
            radio.value = value;
            radio.className = 'form-check-input d-none'; // keep native input but hide default

            const img = this.createImageElement(value);

            // Clicking image checks the radio
            label.appendChild(radio);
            label.appendChild(img);
            container.appendChild(label);
        });
    }

    createImageElement(imagePath){
        const img = document.createElement('img');
        img.src = imagePath;
        img.alt = imagePath;
        img.width = 90;
        img.height = 90;
        img.className = 'rounded border';
        img.style.objectFit = 'cover';
        img.style.transition = 'transform .08s, box-shadow .08s';
        img.style.marginRight = '6px';
        return img;
    }

    async setImageSelection(selectionField) {
        const container = document.getElementById('profileImageOptions');
        if (!container) return;
        const currentProfile = await this.apiUsage.getProfile(this.currentUsername, selectionField.value);

        // expose container to updatePreview (which references `container`)
        window.container = container;

        // wire up each thumbnail label / radio to update the preview when selected
        container.querySelectorAll('label').forEach(label => {
            const radio = label.querySelector('input[type="radio"][name="profileImageOption"]');
            const img = label.querySelector('img');
            if (!radio || !img) return;
            if (!currentProfile && !container.querySelector('input[name="profileImageOption"]:checked')) {
                radio.checked = true;
                this.updatePreview(img.src, img);
            }
            if (currentProfile && img.src.includes(currentProfile.image)){
                radio.checked = true;
                this.updatePreview(img.src, img);
            }
            const value = radio.value;

            // clicking the thumbnail selects the radio and updates the preview
            label.addEventListener('click', (e) => {
                // ensure profile selection exists before allowing image selection
                if (!selectionField.value) return;
                // set the radio and update preview
                radio.checked = true;
                this.updatePreview(value, img);
            });

            // keyboard accessibility: update preview when radio changes
            radio.addEventListener('change', () => {
                if (!selectionField.value) return;
                if (radio.checked) this.updatePreview(value, img);
            });
        });

        // if any image is already checked, show it in the preview
        const initiallyChecked = container.querySelector('input[name="profileImageOption"]:checked');
        if (initiallyChecked) {
            const img = initiallyChecked.closest('label')?.querySelector('img');
            if (img) this.updatePreview(initiallyChecked.value, img);
        } else {
            // clear preview when no profile selected
            if (!selectionField.value) {
                const preview = document.getElementById('profileImagePreview');
                if (preview) preview.src = '';
            }
        }
    }

    updatePreview(src, imgElement) {
        const preview = document.getElementById('profileImagePreview');
        preview.src = src;
        // visual selected state: highlight chosen thumbnail
        container.querySelectorAll('img').forEach(i => {
            i.style.boxShadow = '';
            i.style.transform = '';
        });
        if (imgElement) {
            imgElement.style.boxShadow = '0 0 0 3px rgba(13,110,253,0.25)';
            imgElement.style.transform = 'scale(1.03)';
        }
    }

    async validateAndSubmitForm(selection, profile_name, image) {
        if (!selection || selection === '') {
            this.showNotification('You didn\'t select a profile', 'error');
            return;
        }
        if (!profile_name || profile_name === '') {
            this.showNotification('You didn\'t enter a profile name', 'error');
            return;
        }
        const currentProfile = await this.apiUsage.getProfile(this.currentUsername, profile_name);
        if (selection === "remove-profile") {
            if (!currentProfile){
                this.showNotification('Profile with this name does not exist', 'error');
                return;
            }
            // delete profile
            this.showNotification('Profile deleted successfully', 'success');
            const res = await this.apiUsage.deleteProfile(this.currentUsername, profile_name);
        }
        else if (selection === "new-profile") {
            if (this.curentUserProfiles.length >= 5) {
                this.showNotification('Cannot add more than 5 profiles', 'error');
                return;
            }
            if (currentProfile){
                this.showNotification('Profile with this name already exist', 'error');
                return;
            }
            // create profile
            this.showNotification('Profile created successfully', 'success');
            const res = await this.apiUsage.createProfile(this.currentUsername, profile_name, image);
        }
        else {
            // Edit profile
            this.showNotification('Profile updated successfully', 'success');
            const res = await this.apiUsage.updateProfile(this.currentUsername, selection, profile_name, image);
        }
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
        }, 2000);
        
        setTimeout(() => {
            location.reload();
        }, 2000);
    }
}

// Initialize authentication manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.profileManager = new ProfileManagement();
});
