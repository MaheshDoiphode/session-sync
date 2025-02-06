import { getMainDomain, storageGet, storageSet, saveWithChunks, loadFromChunks } from './utils.js';

document.addEventListener('DOMContentLoaded', async () => {
    // First check if we're on a valid webpage for profile management
    const tab = await getCurrentTab();
    const isValidPage = await validateCurrentPage(tab);
    
    if (!isValidPage) {
        document.getElementById('unsupportedDomain').style.display = 'block';
        document.getElementById('profileSection').classList.add('disabled');
        return;
    }

    await loadProfiles();
    loadSessions();
    
    // Enhanced profile save handler with better validation and feedback
    document.getElementById('saveProfile').addEventListener('click', async () => {
        const profileName = document.getElementById('profileName').value.trim();
        if (!profileName) {
            showToast('Please enter a profile name', true);
            return;
        }
        
        // Extended profile name validation
        if (!/^[a-zA-Z0-9-_\s]{3,50}$/.test(profileName)) {
            showToast('Profile name must be 3-50 characters and can only contain letters, numbers, spaces, hyphens, and underscores', true);
            return;
        }
        
        const statusContainer = document.createElement('div');
        statusContainer.className = 'status-container loading';
        
        try {
            const tab = await getCurrentTab();
            if (!tab?.url) {
                throw new Error('No valid tab URL found');
            }
            
            const url = new URL(tab.url);
            const domain = url.hostname;
            
            // Show saving status with domain info
            statusContainer.textContent = `Saving profile for ${domain}...`;
            document.body.appendChild(statusContainer);
            
            // Check if profile already exists
            const storage = await chrome.storage.sync.get(null);
            const profileKey = `profile_${profileName}_${domain}`;
            
            if (storage[profileKey]) {
                const confirmOverwrite = confirm(`Profile "${profileName}" already exists for ${domain}. Do you want to overwrite it?`);
                if (!confirmOverwrite) {
                    statusContainer.remove();
                    return;
                }
            }
            
            const response = await chrome.runtime.sendMessage({
                action: 'saveProfile',
                profileName,
                domain
            });
            
            if (response?.success) {
                document.getElementById('profileName').value = '';
                await loadProfiles();
                
                statusContainer.textContent = response.warning 
                    ? `Profile saved (${response.warning})` 
                    : 'Profile saved successfully';
                statusContainer.className = response.warning 
                    ? 'status-container warning'
                    : 'status-container success';
            } else {
                throw new Error(response?.error || 'Failed to save profile');
            }
        } catch (error) {
            console.error('Error saving profile:', error);
            statusContainer.textContent = `Error: ${error.message}`;
            statusContainer.className = 'status-container error';
        } finally {
            // Add fade-out animation
            setTimeout(() => {
                statusContainer.style.opacity = '0';
                setTimeout(() => {
                    if (document.body.contains(statusContainer)) {
                        document.body.removeChild(statusContainer);
                    }
                }, 300);
            }, 2700);
        }
    });

    // Enhanced profile switch handler with better error handling
    document.getElementById('profileSelect').addEventListener('change', async (event) => {
        const profileName = event.target.value;
        if (!profileName) return;
        
        const statusContainer = document.createElement('div');
        statusContainer.className = 'status-container loading';
        
        try {
            const tab = await getCurrentTab();
            if (!tab?.url) {
                throw new Error('No valid tab URL found');
            }
            
            const url = new URL(tab.url);
            const domain = url.hostname;
            
            // Show switching status
            statusContainer.textContent = `Switching to profile "${profileName}"...`;
            document.body.appendChild(statusContainer);
            
            // First verify profile exists
            const profileKey = `profile_${profileName}_${domain}`;
            const profileData = await chrome.storage.sync.get(profileKey);
            
            if (!profileData[profileKey]) {
                throw new Error(`Profile "${profileName}" not found for ${domain}`);
            }
            
            // Attempt to switch profile
            const result = await chrome.runtime.sendMessage({
                action: 'switchProfile',
                profileName,
                domain
            });

            if (!result) {
                throw new Error('Profile switch failed');
            }

            // Verify cookies were properly switched
            const cookieCheck = await chrome.runtime.sendMessage({
                action: 'verifyCookies',
                domain
            });

            if (cookieCheck.success) {
                statusContainer.textContent = 'Profile switched successfully';
                statusContainer.className = 'status-container success';
                
                // Add reload indicator
                const reloadInfo = document.createElement('div');
                reloadInfo.textContent = 'Reloading page...';
                reloadInfo.style.fontSize = '12px';
                reloadInfo.style.marginTop = '4px';
                statusContainer.appendChild(reloadInfo);
                
                // Reload after a short delay
                setTimeout(async () => {
                    await chrome.tabs.reload(tab.id, { bypassCache: true });
                    window.close(); // Close popup after initiating reload
                }, 1000);
            } else {
                statusContainer.textContent = cookieCheck.error || 'Profile switch may be incomplete';
                statusContainer.className = 'status-container warning';
            }
        } catch (error) {
            console.error('Error switching profile:', error);
            statusContainer.textContent = `Error: ${error.message}`;
            statusContainer.className = 'status-container error';
        }
    });

    // Save session with profile
    document.getElementById('saveSession').addEventListener('click', async () => {
        const nameInput = document.getElementById('sessionName');
        const sessionName = nameInput.value.trim() || `Session ${new Date().toLocaleString()}`;
        const profileName = document.getElementById('profileSelect').value;
        
        try {
            await chrome.runtime.sendMessage({
                action: 'saveSession',
                name: sessionName,
                profile: profileName || null
            });
            nameInput.value = '';
            await loadSessions();
            showToast('Session saved successfully');
        } catch (error) {
            console.error('Error saving session:', error);
            showToast('Error saving session', true);
        }
    });

    // Merge groups button handler
    document.getElementById('mergeGroups').addEventListener('click', async () => {
        await chrome.runtime.sendMessage({ action: 'mergeGroups' });
        showToast('Similar groups merged');
    });

    // Import session handler
    document.getElementById('importSession').addEventListener('click', () => {
        document.getElementById('importInput').click();
    });

    document.getElementById('importInput').addEventListener('change', async (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const content = e.target.result.split(',')[1]; // Get base64 content
                const key = await chrome.runtime.sendMessage({
                    action: 'importSession',
                    data: content
                });
                
                if (key) {
                    await loadSessions();
                    showToast('Session imported successfully');
                } else {
                    showToast('Error importing session', true);
                }
            };
            reader.readAsDataURL(file);
        }
    });

    // Add new styles to the existing style block
    const style = document.createElement('style');
    style.textContent = `
        .status-container {
            position: fixed;
            bottom: 16px;
            left: 50%;
            transform: translateX(-50%);
            padding: 8px 16px;
            border-radius: 4px;
            color: white;
            font-size: 14px;
            z-index: 1000;
            animation: fadeInOut 3s ease-in-out;
            transition: background-color 0.3s ease;
        }

        .status-container.loading {
            background-color: #2196F3;
        }

        .status-container.success {
            background-color: #4CAF50;
        }

        .status-container.warning {
            background-color: #FFA726;
        }

        .status-container.error {
            background-color: #dc3545;
        }

        @keyframes fadeInOut {
            0%, 100% { opacity: 0; }
            10%, 90% { opacity: 1; }
        }

        .profile-indicator {
            display: inline-block;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            margin-right: 8px;
        }

        .profile-indicator.active {
            background-color: #4CAF50;
        }

        .profile-indicator.inactive {
            background-color: #757575;
        }
    `;
    document.head.appendChild(style);
    
    // Add styles for domain label
    document.head.insertAdjacentHTML('beforeend', `
        <style>
            .domain-label {
                font-size: 12px;
                color: #666;
                margin: 4px 0;
                padding: 4px;
                background: #f5f5f5;
                border-radius: 4px;
                text-align: center;
            }
            
            .profile-section {
                background: #f8f9fa;
                padding: 12px;
                border-radius: 6px;
                margin-bottom: 16px;
            }
            
            #profileSelect {
                width: 100%;
                margin-top: 8px;
                padding: 8px;
                border: 1px solid #ddd;
                border-radius: 4px;
            }
            
            #profileName {
                width: calc(100% - 120px);
            }
        </style>
    `);

    // Add validation for current page
    async function validateCurrentPage(tab) {
        if (!tab || !tab.url) return false;
        
        try {
            const url = new URL(tab.url);
            
            // Check if we're on a webpage
            if (!url.protocol.startsWith('http')) {
                return false;
            }
            
            // Don't allow profile management on browser pages
            if (url.protocol === 'chrome:' || 
                url.protocol === 'chrome-extension:' || 
                url.protocol === 'about:') {
                return false;
            }
            
            const domain = url.hostname;
            
            // Don't allow profile management on IP addresses
            if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(domain)) {
                return false;
            }
            
            // Check if domain has at least one dot (is a proper domain)
            if (!domain.includes('.')) {
                return false;
            }
            
            return true;
        } catch (error) {
            console.error('Error validating page:', error);
            return false;
        }
    }
});

// Enhanced loadProfiles function with compression
async function loadProfiles() {
    const select = document.getElementById('profileSelect');
    const profileSection = document.getElementById('profileSection');
    select.innerHTML = '<option value="">Select a profile...</option>';
    
    try {
        const tab = await getCurrentTab();
        if (!tab) {
            throw new Error('No active tab found');
        }
        
        const domain = new URL(tab.url).hostname;
        const mainDomain = getMainDomain(domain);
        
        // Update domain label
        const domainLabel = document.createElement('div');
        domainLabel.className = 'domain-label';
        domainLabel.textContent = `Profiles for: ${mainDomain}`;
        
        const existingLabel = select.parentElement.querySelector('.domain-label');
        if (existingLabel) {
            existingLabel.remove();
        }
        
        select.parentElement.insertBefore(domainLabel, select);

        // Load profiles using compression
        const profiles = await loadDomainProfiles(mainDomain);
        
        if (profiles.length === 0) {
            const emptyOption = document.createElement('option');
            emptyOption.disabled = true;
            emptyOption.textContent = 'No profiles saved for this domain';
            select.appendChild(emptyOption);
        } else {
            profiles.forEach(profile => {
                const option = document.createElement('option');
                option.value = profile.name;
                option.textContent = `${profile.name}`;
                select.appendChild(option);
            });
        }

        // Show active profile if any
        const activeProfile = await storageGet('activeProfile');
        if (activeProfile?.name) {
            select.value = activeProfile.name;
        }

    } catch (error) {
        console.error('Error loading profiles:', error);
        showToast('Error loading profiles', true);
        profileSection.classList.add('disabled');
    }
}

// Helper function to load domain profiles
async function loadDomainProfiles(domain) {
    try {
        // Try loading from chunks first
        const key = `profiles_${domain}`;
        let profiles = await loadFromChunks(key);
        
        if (!profiles) {
            // Fallback to regular storage
            profiles = await storageGet(key) || [];
        }
        
        return profiles.sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
        console.error('Error loading domain profiles:', error);
        return [];
    }
}

// Load and display saved sessions
async function loadSessions() {
    const sessionList = document.getElementById('sessionList');
    sessionList.innerHTML = '';
    
    try {
        const storage = await chrome.storage.sync.get(null);
        const sessions = Object.entries(storage)
            .filter(([key]) => key.startsWith('session_'))
            .sort(([, a], [, b]) => b.timestamp - a.timestamp);

        sessions.forEach(([key, session]) => {
            const sessionElement = createSessionElement(key, session);
            sessionList.appendChild(sessionElement);
        });
    } catch (error) {
        console.error('Error loading sessions:', error);
    }
}

// Export session
async function exportSession(key, session) {
    const exportedData = await chrome.runtime.sendMessage({
        action: 'exportSession',
        sessionKey: key
    });
    
    if (exportedData) {
        // Create and trigger download
        const blob = new Blob([exportedData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${session.name.replace(/[^a-z0-9]/gi, '_')}_session.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('Session exported successfully');
    }
}

// Create session element
function createSessionElement(key, session) {
    const div = document.createElement('div');
    div.className = 'session-item';
    
    const info = document.createElement('div');
    info.className = 'session-info';
    
    const title = document.createElement('div');
    title.className = 'session-title';
    title.textContent = session.name;
    
    if (session.profile) {
        const profileTag = document.createElement('span');
        profileTag.className = 'profile-tag';
        profileTag.textContent = session.profile;
        title.appendChild(profileTag);
    }
    
    const tabCount = document.createElement('span');
    tabCount.className = 'tab-count';
    const totalTabs = session.windows.reduce((sum, win) => sum + win.tabs.length, 0);
    tabCount.textContent = `${totalTabs} tabs`;
    title.appendChild(tabCount);
    
    const date = document.createElement('div');
    date.className = 'session-date';
    date.textContent = new Date(session.timestamp).toLocaleString();
    
    const buttonContainer = document.createElement('div');
    buttonContainer.style.display = 'flex';
    buttonContainer.style.gap = '4px';
    
    const restoreButton = document.createElement('button');
    restoreButton.textContent = 'Restore';
    restoreButton.addEventListener('click', async () => {
        try {
            await chrome.runtime.sendMessage({
                action: 'restoreSession',
                sessionKey: key
            });
            window.close();
        } catch (error) {
            console.error('Error restoring session:', error);
        }
    });
    
    const exportButton = document.createElement('button');
    exportButton.textContent = 'Export';
    exportButton.className = 'share-button';
    exportButton.addEventListener('click', () => exportSession(key, session));
    
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.style.backgroundColor = '#dc3545';
    deleteButton.addEventListener('click', async () => {
        try {
            await chrome.storage.sync.remove(key);
            await loadSessions();
        } catch (error) {
            console.error('Error deleting session:', error);
        }
    });
    
    info.appendChild(title);
    info.appendChild(date);
    div.appendChild(info);
    buttonContainer.appendChild(restoreButton);
    buttonContainer.appendChild(exportButton);
    buttonContainer.appendChild(deleteButton);
    div.appendChild(buttonContainer);
    
    return div;
}

// Enhanced showToast function with more visible styling
function showToast(message, isError = false) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    if (isError) {
        toast.style.backgroundColor = '#dc3545';
        toast.style.boxShadow = '0 2px 5px rgba(220, 53, 69, 0.2)';
    } else {
        toast.style.backgroundColor = '#28a745';
        toast.style.boxShadow = '0 2px 5px rgba(40, 167, 69, 0.2)';
    }
    toast.style.zIndex = '1000';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
        if (document.body.contains(toast)) {
            toast.style.opacity = '0';
            setTimeout(() => document.body.removeChild(toast), 300);
        }
    }, 3000);
}

// Enhanced getCurrentTab function with validation
async function getCurrentTab() {
    try {
        const [tab] = await chrome.tabs.query({ 
            active: true, 
            currentWindow: true 
        });
        
        if (!tab) {
            throw new Error('No active tab found');
        }

        // Validate URL
        if (!tab.url || !tab.url.startsWith('http')) {
            throw new Error('Invalid tab URL');
        }

        return tab;
    } catch (error) {
        console.error('Error getting current tab:', error);
        throw error;
    }
}