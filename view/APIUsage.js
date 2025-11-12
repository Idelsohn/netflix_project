export class APIUsage {
    constructor() {
        this.baseURL = "http://localhost:3000/api";
    }

    // ---------- User API methods ----------
    async getUser(username) {
        const res = await fetch(this.baseURL + "/users/" + username);
        return res.json();
    }

    async getCurrentUser() {
        const res = await fetch(this.baseURL + "/users/me", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json', // specify JSON content type
            },
            credentials: 'include', // include cookies
        });
        return res.json();
    }

    async authenticateUser(username, password) {
        const res = await fetch(this.baseURL + "/users/authenticate", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json', // specify JSON content type
            },
            credentials: 'include', // include cookies
            body: JSON.stringify({ username, password })
        });
        return res.json();
    }

    async createUser(username, email, password) {
        const res = await fetch(this.baseURL + "/users/create", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, email, password })
        });
        return res.json();
    }

    async hasActiveSession() {
        const res = await fetch(this.baseURL + "/users/has-active-session", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json', // specify JSON content type
            },
            credentials: 'include', // include cookies
        });
        if (!res.ok) {
            return { success: false };
        }
        return res.json();
    }

    async logoutUser() {
        const res = await fetch(this.baseURL + "/users/logout", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json', // specify JSON content type
            },
            credentials: 'include', // include cookies
        });
        return res.json();
    }

    // ---------- Profile API methods ----------
    async getAllProfiles(username) {
        const res = await fetch(this.baseURL + "/profiles/all?username=" + username, {
            method: 'GET',
            credentials: 'include', // include cookies
        });
        return res.json();
    }

    async getProfile(username, profileName){
        const res = await fetch(this.baseURL + "/profiles/my_profile?username=" + username + "&profile_name=" + profileName, {
            method: 'GET',
            credentials: 'include', // include cookies
        });
        return res.json();
    }

    async createProfile(username, profileName, avatarUrl) {
        const res = await fetch(this.baseURL + "/profiles/create", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ username, profile_name: profileName, image: avatarUrl })
        });
        return res.json();
    }

    async updateProfile(username, profileName, newProfileName, newImageUrl) {
        const res = await fetch(this.baseURL + "/profiles/update", {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
                username,
                old_profile_name: profileName,
                profile_name: newProfileName,
                image: newImageUrl
            })
        });
        return res.json();
    }

    async deleteProfile(username, profileName) {
        const res = await fetch(this.baseURL + "/profiles/delete", {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ username, profile_name: profileName })
        });
        return res.json();
    }

    // ---------- Feed API methods ----------
    async loadWatchlist(selectedProfileId) {
        const res = await fetch(this.baseURL + `/saved-content/watchlist?profileId=${selectedProfileId}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        });
        return res;
    }
    
    async loadLikedContent(selectedProfileId) {
        const res = await fetch(this.baseURL + `/saved-content/liked?profileId=${selectedProfileId}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        });
        return res;
    }
    
    async syncWatchlist(contentId, selectedProfileId) {
        const res = await fetch(this.baseURL + '/saved-content/toggle', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
                contentId: parseInt(contentId),
                profileId: parseInt(selectedProfileId),
                type: 'watchlist'
            })
        });
        return res;
    }
    
    async syncLikedContent(contentId, selectedProfileId) {
        const res = await fetch(this.baseURL + '/saved-content/toggle', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
                contentId: parseInt(contentId),
                profileId: parseInt(selectedProfileId),
                type: 'liked'
            })
        });
        return res;
    }
}
