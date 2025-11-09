// Video Import System JavaScript
class VideoImportManager {
    constructor() {
        this.currentTab = 'single';
        this.episodeCounter = 1;
        this.selectedQualities = ['720'];
        this.importLog = [];
        
        this.init();
    }

    init() {
        this.setupTabNavigation();
        this.setupSingleVideoForm();
        this.setupSeriesForm();
        this.setupBulkImport();
        this.setupVideoManagement();
        this.setupQualitySelection();
        this.loadExistingVideos();
    }

    setupTabNavigation() {
        const tabButtons = document.querySelectorAll('.tab-button');
        const tabContents = document.querySelectorAll('.tab-content');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabName = button.getAttribute('data-tab');
                
                // Remove active class from all buttons and contents
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));
                
                // Add active class to clicked button and corresponding content
                button.classList.add('active');
                document.getElementById(`${tabName}-tab`).classList.add('active');
                
                this.currentTab = tabName;
                
                // Load data if needed
                if (tabName === 'manage') {
                    this.loadVideoManagement();
                }
            });
        });
    }

    setupSingleVideoForm() {
        const form = document.getElementById('singleVideoForm');
        const previewBtn = document.getElementById('previewSingleVideo');
        const platformSelect = document.getElementById('singlePlatform');

        // Preview video functionality
        previewBtn.addEventListener('click', () => {
            const videoUrl = document.getElementById('singleVideoUrl').value;
            const platform = platformSelect.value;
            
            if (!videoUrl) {
                this.showNotification('Please enter a video URL', 'error');
                return;
            }
            
            this.previewVideo(videoUrl, platform, 'singleVideoPreview');
        });

        // Platform change handler
        platformSelect.addEventListener('change', (e) => {
            this.updatePlatformOptions(e.target.value, 'single');
        });

        // Form submission
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.importSingleVideo(new FormData(form));
        });

        // Auto-fill title from URL for YouTube/Vimeo
        document.getElementById('singleVideoUrl').addEventListener('blur', (e) => {
            this.autoFillVideoInfo(e.target.value, 'single');
        });
    }

    setupSeriesForm() {
        const form = document.getElementById('seriesForm');
        const addEpisodeBtn = document.getElementById('addEpisode');
        const seasonsInput = document.getElementById('seriesSeasons');
        const currentSeasonInput = document.getElementById('seriesCurrentSeason');

        // Add episode functionality
        addEpisodeBtn.addEventListener('click', () => {
            this.addEpisodeForm();
        });

        // Update current season max when seasons change
        seasonsInput.addEventListener('change', (e) => {
            currentSeasonInput.max = e.target.value;
            if (parseInt(currentSeasonInput.value) > parseInt(e.target.value)) {
                currentSeasonInput.value = e.target.value;
            }
        });

        // Form submission
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.importTVSeries(form);
        });

        // Add initial episode
        this.addEpisodeForm();
    }

    setupBulkImport() {
        const validateBtn = document.getElementById('validateBulk');
        const importBtn = document.getElementById('importBulk');
        const fileInput = document.getElementById('bulkFile');
        const jsonTextarea = document.getElementById('bulkJson');

        // File upload handler
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file && file.type === 'application/json') {
                const reader = new FileReader();
                reader.onload = (event) => {
                    jsonTextarea.value = event.target.result;
                };
                reader.readAsText(file);
            }
        });

        // Validate JSON
        validateBtn.addEventListener('click', () => {
            this.validateBulkJSON();
        });

        // Import bulk
        importBtn.addEventListener('click', () => {
            this.importBulkVideos();
        });
    }

    setupVideoManagement() {
        const searchInput = document.getElementById('searchVideos');
        
        searchInput.addEventListener('input', (e) => {
            this.searchVideos(e.target.value);
        });
    }

    setupQualitySelection() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('quality-option')) {
                const quality = e.target.getAttribute('data-quality');
                
                if (e.target.classList.contains('selected')) {
                    // Deselect if at least one other quality is selected
                    const selectedQualities = document.querySelectorAll('.quality-option.selected');
                    if (selectedQualities.length > 1) {
                        e.target.classList.remove('selected');
                        this.selectedQualities = this.selectedQualities.filter(q => q !== quality);
                    }
                } else {
                    // Select quality
                    e.target.classList.add('selected');
                    this.selectedQualities.push(quality);
                }
            }
        });
    }

    addEpisodeForm() {
        const container = document.getElementById('episodeContainer');
        const episodeNumber = this.episodeCounter++;
        const currentSeason = document.getElementById('seriesCurrentSeason').value || 1;

        const episodeDiv = document.createElement('div');
        episodeDiv.className = 'episode-item';
        episodeDiv.innerHTML = `
            <div class="episode-number">${episodeNumber}</div>
            <div class="episode-details">
                <div class="form-row">
                    <div class="form-group">
                        <label>Episode Title</label>
                        <input type="text" name="episodes[${episodeNumber}][title]" placeholder="Episode ${episodeNumber}" required>
                    </div>
                    <div class="form-group">
                        <label>Season</label>
                        <input type="number" name="episodes[${episodeNumber}][season]" value="${currentSeason}" min="1" required>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Video URL</label>
                        <input type="url" name="episodes[${episodeNumber}][videoUrl]" placeholder="https://..." required>
                    </div>
                    <div class="form-group">
                        <label>Duration (min)</label>
                        <input type="number" name="episodes[${episodeNumber}][duration]" min="1" placeholder="45">
                    </div>
                </div>
                <div class="form-group">
                    <label>Description</label>
                    <textarea name="episodes[${episodeNumber}][description]" placeholder="Episode description..." rows="2"></textarea>
                </div>
            </div>
            <div class="episode-actions">
                <button type="button" class="btn btn-secondary preview-episode" data-episode="${episodeNumber}">👁️ Preview</button>
                <button type="button" class="btn btn-danger remove-episode">🗑️ Remove</button>
            </div>
        `;

        container.appendChild(episodeDiv);

        // Add event listeners for this episode
        const removeBtn = episodeDiv.querySelector('.remove-episode');
        removeBtn.addEventListener('click', () => {
            episodeDiv.remove();
        });

        const previewBtn = episodeDiv.querySelector('.preview-episode');
        previewBtn.addEventListener('click', () => {
            const videoUrl = episodeDiv.querySelector('input[type="url"]').value;
            if (videoUrl) {
                this.previewVideo(videoUrl, 'direct', `episode-preview-${episodeNumber}`);
            } else {
                this.showNotification('Please enter video URL first', 'error');
            }
        });
    }

    async previewVideo(url, platform, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = '<p>Loading preview...</p>';

        try {
            // Process URL based on platform
            let videoUrl = url;
            
            switch (platform) {
                case 'youtube':
                    videoUrl = this.convertYouTubeUrl(url);
                    break;
                case 'vimeo':
                    videoUrl = this.convertVimeoUrl(url);
                    break;
                case 'direct':
                default:
                    videoUrl = url;
                    break;
            }

            // Create video element
            const video = document.createElement('video');
            video.controls = true;
            video.style.maxWidth = '100%';
            video.style.maxHeight = '200px';
            video.src = videoUrl;

            container.innerHTML = '';
            container.appendChild(video);
            container.classList.add('loaded');

            this.logImport('info', `Video preview loaded: ${url}`);

        } catch (error) {
            container.innerHTML = `<p style="color: #ff6b6b;">Preview failed: ${error.message}</p>`;
            this.logImport('error', `Preview failed: ${error.message}`);
        }
    }

    convertYouTubeUrl(url) {
        // Convert YouTube URL to embed format
        const videoId = this.extractYouTubeId(url);
        return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    }

    convertVimeoUrl(url) {
        // Convert Vimeo URL to embed format
        const videoId = this.extractVimeoId(url);
        return videoId ? `https://player.vimeo.com/video/${videoId}` : url;
    }

    extractYouTubeId(url) {
        const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
        const match = url.match(regex);
        return match ? match[1] : null;
    }

    extractVimeoId(url) {
        const regex = /vimeo\.com\/(?:video\/)?(\d+)/;
        const match = url.match(regex);
        return match ? match[1] : null;
    }

    async autoFillVideoInfo(url, formPrefix) {
        if (!url) return;

        try {
            const titleInput = document.getElementById(`${formPrefix}Title`);
            const durationInput = document.getElementById(`${formPrefix}Duration`);

            // For YouTube videos, try to get video info
            if (url.includes('youtube.com') || url.includes('youtu.be')) {
                const videoId = this.extractYouTubeId(url);
                if (videoId && !titleInput.value) {
                    // In a real implementation, you would call YouTube API
                    // For now, just extract from URL or set a placeholder
                    titleInput.placeholder = 'YouTube Video Title';
                }
            }
            
            // For Vimeo videos
            if (url.includes('vimeo.com')) {
                const videoId = this.extractVimeoId(url);
                if (videoId && !titleInput.value) {
                    titleInput.placeholder = 'Vimeo Video Title';
                }
            }

        } catch (error) {
            this.logImport('error', `Auto-fill failed: ${error.message}`);
        }
    }

    async importSingleVideo(formData) {
        try {
            this.logImport('info', 'Starting single video import...');

            // Prepare video data
            const videoData = {
                title: formData.get('title'),
                description: formData.get('description'),
                year: parseInt(formData.get('year')) || new Date().getFullYear(),
                genre: formData.get('genre'),
                type: formData.get('type'),
                duration: parseInt(formData.get('duration')) || 0,
                videoUrl: formData.get('videoUrl'),
                platform: formData.get('platform'),
                thumbnailUrl: formData.get('thumbnailUrl'),
                qualities: this.selectedQualities,
                episodes: [{
                    episodeId: 1,
                    episodeNumber: 1,
                    seasonNumber: 1,
                    title: formData.get('title'),
                    description: formData.get('description'),
                    duration: parseInt(formData.get('duration')) || 0,
                    videoUrl: formData.get('videoUrl')
                }]
            };

            // Send to server
            const response = await fetch('/api/video/import-single', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(videoData)
            });

            const result = await response.json();

            if (result.success) {
                this.showNotification('Video imported successfully!', 'success');
                this.logImport('success', `Video imported: ${videoData.title}`);
                document.getElementById('singleVideoForm').reset();
                document.getElementById('singleVideoPreview').innerHTML = '<p>Click "Preview" to load video preview</p>';
                document.getElementById('singleVideoPreview').classList.remove('loaded');
            } else {
                throw new Error(result.message || 'Import failed');
            }

        } catch (error) {
            this.showNotification(`Import failed: ${error.message}`, 'error');
            this.logImport('error', `Import failed: ${error.message}`);
        }
    }

    async importTVSeries(form) {
        try {
            this.logImport('info', 'Starting TV series import...');

            const formData = new FormData(form);
            
            // Extract episodes data
            const episodes = [];
            const episodeInputs = form.querySelectorAll('input[name*="episodes"]');
            const episodeData = {};

            // Group episode inputs by episode number
            episodeInputs.forEach(input => {
                const match = input.name.match(/episodes\[(\d+)\]\[(\w+)\]/);
                if (match) {
                    const [, episodeNum, field] = match;
                    if (!episodeData[episodeNum]) {
                        episodeData[episodeNum] = { episodeNumber: parseInt(episodeNum) };
                    }
                    episodeData[episodeNum][field] = input.value;
                }
            });

            // Convert to array
            Object.values(episodeData).forEach(ep => {
                episodes.push({
                    episodeId: ep.episodeNumber,
                    episodeNumber: ep.episodeNumber,
                    seasonNumber: parseInt(ep.season) || 1,
                    title: ep.title,
                    description: ep.description || '',
                    duration: parseInt(ep.duration) || 0,
                    videoUrl: ep.videoUrl
                });
            });

            if (episodes.length === 0) {
                throw new Error('No episodes added');
            }

            // Prepare series data
            const seriesData = {
                title: formData.get('title'),
                description: formData.get('description'),
                year: parseInt(formData.get('year')) || new Date().getFullYear(),
                genre: formData.get('genre'),
                type: 'series',
                seasons: parseInt(formData.get('seasons')) || 1,
                currentSeason: parseInt(formData.get('currentSeason')) || 1,
                episodes: episodes,
                qualities: this.selectedQualities
            };

            // Send to server
            const response = await fetch('/api/video/import-series', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(seriesData)
            });

            const result = await response.json();

            if (result.success) {
                this.showNotification(`TV Series imported successfully! (${episodes.length} episodes)`, 'success');
                this.logImport('success', `TV Series imported: ${seriesData.title} with ${episodes.length} episodes`);
                form.reset();
                document.getElementById('episodeContainer').innerHTML = '';
                this.episodeCounter = 1;
                this.addEpisodeForm(); // Add one empty episode form
            } else {
                throw new Error(result.message || 'Series import failed');
            }

        } catch (error) {
            this.showNotification(`Series import failed: ${error.message}`, 'error');
            this.logImport('error', `Series import failed: ${error.message}`);
        }
    }

    validateBulkJSON() {
        const jsonText = document.getElementById('bulkJson').value;
        
        if (!jsonText.trim()) {
            this.showNotification('Please enter JSON data', 'error');
            return false;
        }

        try {
            const data = JSON.parse(jsonText);
            
            if (!data.videos || !Array.isArray(data.videos)) {
                throw new Error('JSON must contain a "videos" array');
            }

            if (data.videos.length === 0) {
                throw new Error('Videos array is empty');
            }

            // Validate each video
            data.videos.forEach((video, index) => {
                if (!video.title || !video.videoUrl) {
                    throw new Error(`Video ${index + 1}: Missing required fields (title, videoUrl)`);
                }
            });

            this.showNotification(`✅ JSON valid! Found ${data.videos.length} videos`, 'success');
            this.logImport('success', `Bulk JSON validated: ${data.videos.length} videos`);
            return true;

        } catch (error) {
            this.showNotification(`JSON validation failed: ${error.message}`, 'error');
            this.logImport('error', `JSON validation failed: ${error.message}`);
            return false;
        }
    }

    async importBulkVideos() {
        if (!this.validateBulkJSON()) {
            return;
        }

        try {
            const jsonText = document.getElementById('bulkJson').value;
            const data = JSON.parse(jsonText);

            this.logImport('info', `Starting bulk import of ${data.videos.length} videos...`);

            // Send to server
            const response = await fetch('/api/video/import-bulk', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (result.success) {
                this.showNotification(`✅ Bulk import successful! ${result.imported} videos imported`, 'success');
                this.logImport('success', `Bulk import completed: ${result.imported}/${data.videos.length} videos`);
                
                if (result.failed > 0) {
                    this.logImport('warning', `${result.failed} videos failed to import`);
                    result.errors.forEach(error => {
                        this.logImport('error', `Import error: ${error}`);
                    });
                }
            } else {
                throw new Error(result.message || 'Bulk import failed');
            }

        } catch (error) {
            this.showNotification(`Bulk import failed: ${error.message}`, 'error');
            this.logImport('error', `Bulk import failed: ${error.message}`);
        }
    }

    async loadVideoManagement() {
        try {
            const response = await fetch('/api/video/list', {
                credentials: 'include'
            });

            const result = await response.json();

            if (result.success) {
                this.displayVideoList(result.videos);
            } else {
                throw new Error(result.message || 'Failed to load videos');
            }

        } catch (error) {
            this.showNotification(`Failed to load videos: ${error.message}`, 'error');
        }
    }

    displayVideoList(videos) {
        const container = document.getElementById('videoList');
        
        if (videos.length === 0) {
            container.innerHTML = '<p>No videos found</p>';
            return;
        }

        container.innerHTML = videos.map(video => `
            <div class="episode-item">
                <div class="episode-number">${video.contentId}</div>
                <div class="episode-details">
                    <h4>${video.title}</h4>
                    <p>${video.year} | ${video.genre} | ${video.type}</p>
                    <p>Episodes: ${video.episodeCount || 1}</p>
                    <div class="status-indicator ${video.isActive ? 'status-success' : 'status-error'}">
                        ${video.isActive ? 'Active' : 'Inactive'}
                    </div>
                </div>
                <div class="episode-actions">
                    <button class="btn btn-secondary" onclick="videoImport.editVideo(${video.contentId})">✏️ Edit</button>
                    <button class="btn btn-danger" onclick="videoImport.deleteVideo(${video.contentId})">🗑️ Delete</button>
                    <button class="btn ${video.isActive ? 'btn-secondary' : 'btn-success'}" onclick="videoImport.toggleVideo(${video.contentId})">
                        ${video.isActive ? '⏸️ Disable' : '▶️ Enable'}
                    </button>
                </div>
            </div>
        `).join('');
    }

    searchVideos(searchTerm) {
        // This would filter the displayed video list
        // For now, just log the search
        this.logImport('info', `Searching videos: ${searchTerm}`);
    }

    async deleteVideo(contentId) {
        if (!confirm('Are you sure you want to delete this video?')) {
            return;
        }

        try {
            const response = await fetch(`/api/video/delete/${contentId}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            const result = await response.json();

            if (result.success) {
                this.showNotification('Video deleted successfully', 'success');
                this.loadVideoManagement(); // Refresh list
            } else {
                throw new Error(result.message || 'Delete failed');
            }

        } catch (error) {
            this.showNotification(`Delete failed: ${error.message}`, 'error');
        }
    }

    async toggleVideo(contentId) {
        try {
            const response = await fetch(`/api/video/toggle/${contentId}`, {
                method: 'PUT',
                credentials: 'include'
            });

            const result = await response.json();

            if (result.success) {
                this.showNotification(`Video ${result.isActive ? 'enabled' : 'disabled'}`, 'success');
                this.loadVideoManagement(); // Refresh list
            } else {
                throw new Error(result.message || 'Toggle failed');
            }

        } catch (error) {
            this.showNotification(`Toggle failed: ${error.message}`, 'error');
        }
    }

    editVideo(contentId) {
        // This would open an edit form
        this.showNotification('Edit functionality coming soon', 'info');
    }

    updatePlatformOptions(platform, formPrefix) {
        // Update platform-specific options
        const qualityOptions = document.querySelectorAll('.quality-option');
        
        switch (platform) {
            case 'youtube':
                // YouTube typically supports these qualities
                qualityOptions.forEach(option => {
                    const quality = option.getAttribute('data-quality');
                    if (['1080', '720', '480', '360'].includes(quality)) {
                        option.style.display = 'block';
                    } else {
                        option.style.display = 'none';
                    }
                });
                break;
            case 'vimeo':
                // Vimeo supports most qualities
                qualityOptions.forEach(option => option.style.display = 'block');
                break;
            default:
                // Direct video files - show all
                qualityOptions.forEach(option => option.style.display = 'block');
                break;
        }
    }

    loadExistingVideos() {
        // Load existing videos count for dashboard
        this.logImport('info', 'Loading existing videos...');
    }

    logImport(type, message) {
        const log = document.getElementById('importLog');
        const timestamp = new Date().toLocaleTimeString();
        
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry log-${type}`;
        logEntry.textContent = `[${timestamp}] ${message}`;
        
        log.appendChild(logEntry);
        log.scrollTop = log.scrollHeight;

        // Keep only last 100 entries
        while (log.children.length > 100) {
            log.removeChild(log.firstChild);
        }

        this.importLog.push({ timestamp, type, message });
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;

        document.body.appendChild(notification);

        // Trigger animation
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        // Remove after 4 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.videoImport = new VideoImportManager();
});