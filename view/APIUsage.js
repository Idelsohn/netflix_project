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

    async getProfileByID(profileID){
        const res = await fetch(this.baseURL + "/profiles/my_profile_by_id?id=" + profileID, {
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

    // ---------- content Catalog API methods ----------
    async getContentCatalog() {
        const res = await fetch(this.baseURL + "/content-catalog/all", {
            method: 'GET',
            credentials: 'include', // include cookies
        });
        return res.json();
    }

    async updateLikesOfContentCatalog(contentID, newLikesAmount) {
        const res = await fetch(this.baseURL + "/content-catalog/update-likes", {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ id: parseInt(contentID), likes: parseInt(newLikesAmount) })
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
                profileId: selectedProfileId,
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
                profileId: selectedProfileId,
                type: 'liked'
            })
        });
        return res;
    }
    
    // ---------- Video Player API methods ----------
    async loadEpisodes(contentId) {
        const res = await fetch(this.baseURL + `/video/episodes/${contentId}`, { 
            method: 'GET',
            credentials: 'include' 
        });
        return res;
    }

    async loadSeriesInfo(contentId) {
        const res = await fetch(this.baseURL + `/video/series/${contentId}`, {
            method: 'GET',
            credentials: 'include' 
        });
        return res;
    }
    
    async loadAllEpisodesProgress(currentContentId, currentProfileId) {
        const res = await fetch(this.baseURL + `/video/progress-batch/${currentContentId}?profileId=${currentProfileId}`, { 
            method: 'GET',
            credentials: 'include' 
        });
        return res;
    }
    
    async sendProgressUpdate(progressData) {
        const res = await fetch(this.baseURL + '/video/update-progress', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(progressData)
        });
        return res;
    }
    
    async markAsCompleted(completionData) {
        await fetch(this.baseURL + '/video/mark-completed', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(completionData)
        });
    }
    
    async loadSavedProgress(currentContentId, currentEpisodeId, currentProfileId) {
        const res = await fetch(this.baseURL + `/video/progress/${currentContentId}/${currentEpisodeId}?profileId=${currentProfileId}`, { 
            method: 'POST', 
            credentials: 'include' 
        });
        return res;
    }
    
    async loadAllProgress(contentId, currentProfileId) {
        const res = await fetch(this.baseURL + `/video/progress-all/${contentId}?profileId=${currentProfileId}`, { 
            method: 'POST', 
            credentials: 'include' 
        });
        return res;
    }
    
    async checkForRemoteUpdates(currentProfileId, params) {
        const res = await fetch(this.baseURL + `/video/progress-updates/${currentProfileId}${params}`, { 
            method: 'POST',
            credentials: 'include' 
        });
        return res;
    }
    
    async updateViewingStats(statsData) {
        await fetch(this.baseURL + '/video/update-stats', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(statsData)
        });
    }
    
    async changeVideoQuality(currentContentId, currentEpisodeId, currentProfileId, quality) {
        const res = await fetch(this.baseURL + `/video/source/quality/${currentContentId}/${currentEpisodeId}?quality=${quality}&profileId=${currentProfileId}`, { 
            method: 'GET',
            credentials: 'include' 
        });
        return res;
    }
    
    async loadAvailableQualities(currentContentId, currentEpisodeId) {
        const res = await fetch(this.baseURL + `/video/qualities/${currentContentId}/${currentEpisodeId}`, { 
            method: 'GET',
            credentials: 'include' 
        });
        return res;
    }
    
    async loadVideoContent(currentContentId, currentEpisodeId, currentProfileId) {
        const res = await fetch(this.baseURL + `/video/source/best/${currentContentId}/${currentEpisodeId}?profileId=${currentProfileId}`, { 
            method: 'GET',
            credentials: 'include' 
        });
        return res;
    }

    async checkPreviousProgress(currentContentId, currentEpisodeId, currentProfileId) {
        const res = await fetch(this.baseURL + `/video/progress/${currentContentId}/${currentEpisodeId}?profileId=${currentProfileId}`, { 
            method: 'GET',
            credentials: 'include' 
        });
        return res;
    }
}
