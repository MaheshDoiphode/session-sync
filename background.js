// Store for active sessions
let activeSessions = new Map();

// Threshold for considering tabs related (similarity in URL or title)
const SIMILARITY_THRESHOLD = 0.5;

// Calculate similarity between two strings
function calculateSimilarity(str1, str2) {
    const words1 = str1.toLowerCase().split(/[^\w]+/);
    const words2 = str2.toLowerCase().split(/[^\w]+/);
    const intersection = words1.filter(word => words2.includes(word));
    return intersection.length / Math.max(words1.length, words2.length);
}

// Group related tabs
async function groupRelatedTabs(tabId) {
    try {
        const tab = await chrome.tabs.get(tabId);
        const allTabs = await chrome.tabs.query({ windowId: tab.windowId });
        
        // Find related tabs based on URL and title similarity
        const relatedTabs = allTabs.filter(otherTab => {
            if (otherTab.id === tabId) return false;
            const urlSimilarity = calculateSimilarity(tab.url, otherTab.url);
            const titleSimilarity = calculateSimilarity(tab.title, otherTab.title);
            return Math.max(urlSimilarity, titleSimilarity) > SIMILARITY_THRESHOLD;
        });

        if (relatedTabs.length > 0) {
            // Check if any of the related tabs are already in a group
            const existingGroup = relatedTabs.find(t => t.groupId !== -1)?.groupId;

            if (existingGroup) {
                // Add the new tab to existing group
                await chrome.tabs.group({
                    tabIds: tabId,
                    groupId: existingGroup
                });
            } else {
                // Create a new group
                const groupId = await chrome.tabs.group({
                    tabIds: [tabId, ...relatedTabs.map(t => t.id)]
                });
                
                // Set group color and title based on common terms
                const commonTerms = findCommonTerms([tab, ...relatedTabs]);
                await chrome.tabGroups.update(groupId, {
                    color: 'blue',
                    title: commonTerms.slice(0, 2).join(' ')
                });
            }
        }
    } catch (error) {
        console.error('Error grouping tabs:', error);
    }
}

// Find common terms between tabs for group title
function findCommonTerms(tabs) {
    const allTerms = new Map();
    tabs.forEach(tab => {
        const terms = tab.title.toLowerCase().split(/[^\w]+/);
        terms.forEach(term => {
            if (term.length > 3) { // Ignore short terms
                allTerms.set(term, (allTerms.get(term) || 0) + 1);
            }
        });
    });
    return Array.from(allTerms.entries())
        .filter(([_, count]) => count >= tabs.length / 2)
        .map(([term]) => term);
}

// Save current session
async function saveSession(sessionName, profileName = null) {
    const windows = await chrome.windows.getAll({ populate: true });
    const session = {
        name: sessionName,
        timestamp: Date.now(),
        profile: profileName,
        windows: windows.map(win => ({
            tabs: win.tabs.map(tab => ({
                url: tab.url,
                title: tab.title,
                groupId: tab.groupId,
                domain: new URL(tab.url).hostname
            })),
            groups: [] // Will be populated with group information
        }))
    };

    // Get unique domains in this session
    const domains = new Set(session.windows.flatMap(w => 
        w.tabs.map(t => t.domain)
    ));

    // Save profile state for each domain
    if (profileName) {
        for (const domain of domains) {
            await saveProfileState(profileName, domain);
        }
    }

    // Get group information for each window
    for (const win of session.windows) {
        const groups = await chrome.tabGroups.query({ windowId: win.id });
        win.groups = groups.map(group => ({
            id: group.id,
            title: group.title,
            color: group.color
        }));
    }

    // Save to sync storage
    const key = `session_${Date.now()}`;
    await chrome.storage.sync.set({ [key]: session });
    return key;
}

// Clean up old sessions to stay within storage limits
async function cleanupOldSessions() {
    const MAX_SESSIONS = 50;
    const storage = await chrome.storage.sync.get(null);
    const sessions = Object.entries(storage)
        .filter(([key]) => key.startsWith('session_'))
        .sort(([, a], [, b]) => b.timestamp - a.timestamp);

    if (sessions.length > MAX_SESSIONS) {
        const toRemove = sessions.slice(MAX_SESSIONS).map(([key]) => key);
        await chrome.storage.sync.remove(toRemove);
    }
}

// Restore session
async function restoreSession(sessionKey) {
    const data = await chrome.storage.sync.get(sessionKey);
    const session = data[sessionKey];

    if (!session) return;

    // Switch profiles for each domain if profile is specified
    if (session.profile) {
        const domains = new Set(session.windows.flatMap(w => 
            w.tabs.map(t => t.domain)
        ));
        
        for (const domain of domains) {
            await switchProfile(session.profile, domain);
        }
    }

    for (const windowData of session.windows) {
        // Create new window with first tab
        const window = await chrome.windows.create({
            url: windowData.tabs[0].url
        });

        // Create remaining tabs
        const tabPromises = windowData.tabs.slice(1).map(tab =>
            chrome.tabs.create({
                windowId: window.id,
                url: tab.url
            })
        );
        await Promise.all(tabPromises);

        // Recreate groups
        for (const group of windowData.groups) {
            const tabIds = windowData.tabs
                .filter(tab => tab.groupId === group.id)
                .map(tab => tab.id);
            
            if (tabIds.length > 0) {
                const newGroupId = await chrome.tabs.group({
                    tabIds,
                    windowId: window.id
                });
                await chrome.tabGroups.update(newGroupId, {
                    color: group.color,
                    title: group.title
                });
            }
        }
    }
}

// Merge similar groups in a window
async function mergeRelatedGroups(windowId) {
    const groups = await chrome.tabGroups.query({ windowId });
    const merged = new Set();

    for (const group1 of groups) {
        if (merged.has(group1.id)) continue;

        for (const group2 of groups) {
            if (group1.id === group2.id || merged.has(group2.id)) continue;

            const similarity = calculateSimilarity(group1.title || '', group2.title || '');
            if (similarity > SIMILARITY_THRESHOLD) {
                const tabs = await chrome.tabs.query({ groupId: group2.id });
                await chrome.tabs.group({
                    tabIds: tabs.map(t => t.id),
                    groupId: group1.id
                });
                merged.add(group2.id);
            }
        }
    }
}

// Listen for tab creation
chrome.tabs.onCreated.addListener((tab) => {
    setTimeout(() => groupRelatedTabs(tab.id), 1000); // Delay to allow page load
});

// Listen for tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.url || changeInfo.title) {
        groupRelatedTabs(tabId);
    }
});

// Export functions for popup usage
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Received message:', request);
    
    switch (request.action) {
        case 'saveSession':
            saveSession(request.name)
                .then(key => {
                    cleanupOldSessions();
                    sendResponse(key);
                });
            return true;
        case 'restoreSession':
            restoreSession(request.sessionKey).then(() => sendResponse(true));
            return true;
        case 'mergeGroups':
            chrome.windows.getCurrent()
                .then(window => mergeRelatedGroups(window.id))
                .then(() => sendResponse(true));
            return true;
        case 'exportSession':
            exportSession(request.sessionKey).then(sendResponse);
            return true;
        case 'importSession':
            importSession(request.data).then(sendResponse);
            return true;
        case 'switchProfile':
            switchProfile(request.profileName, request.domain)
                .then(() => sendResponse(true))
                .catch(error => {
                    console.error('Error switching profile:', error);
                    sendResponse(false);
                });
            return true;
        case 'saveProfile':
            saveProfileState(request.profileName, request.domain)
                .then(response => {
                    console.log('Save profile response:', response);
                    sendResponse(response);
                })
                .catch(error => {
                    console.error('Profile save error:', error);
                    sendResponse({ success: false, error: error.message });
                });
            return true;
        case 'verifyCookies':
            verifyCookieSwitch(request.domain)
                .then(result => sendResponse(result))
                .catch(error => sendResponse({ success: false, error: error.message }));
            return true;
    }
});

let lastSyncTime = 0;
const SYNC_INTERVAL = 1000 * 60; // 1 minute

// Sync state with other instances
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'sync') {
        for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
            if (key.startsWith('session_') && newValue && Date.now() - lastSyncTime > SYNC_INTERVAL) {
                // Update local state when remote changes are detected
                updateSessionState(key, newValue);
            }
        }
    }
});

async function updateSessionState(key, session) {
    lastSyncTime = Date.now();
    const currentWindow = await chrome.windows.getCurrent({ populate: true });
    
    // Check if this session is currently active in this window
    const activeSessionKey = await chrome.storage.local.get('activeSession');
    if (activeSessionKey?.activeSession === key) {
        // Update group titles and colors if they changed
        for (const windowData of session.windows) {
            for (const group of windowData.groups) {
                const existingGroup = await chrome.tabGroups.query({
                    windowId: currentWindow.id,
                    title: group.title
                });
                
                if (existingGroup.length > 0) {
                    await chrome.tabGroups.update(existingGroup[0].id, {
                        color: group.color
                    });
                }
            }
        }
    }
}

// Export the current window state as a sharable session
async function exportSession(sessionKey) {
    const data = await chrome.storage.sync.get(sessionKey);
    const session = data[sessionKey];
    
    if (session) {
        // Create a shareable format
        const exportData = {
            version: "1.0",
            timestamp: Date.now(),
            session: session
        };
        
        // Convert to base64 for easy sharing
        const blob = new Blob([JSON.stringify(exportData)], {type: 'application/json'});
        return await new Promise(resolve => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result.split(',')[1]);
            reader.readAsDataURL(blob);
        });
    }
    return null;
}

// Import a shared session
async function importSession(encodedData) {
    try {
        const jsonStr = atob(encodedData);
        const importData = JSON.parse(jsonStr);
        
        if (importData.version === "1.0" && importData.session) {
            const key = `session_${Date.now()}`;
            await chrome.storage.sync.set({ [key]: importData.session });
            return key;
        }
    } catch (error) {
        console.error('Error importing session:', error);
        return null;
    }
}

// Profile management
const profiles = new Map();

// Enhanced cookie management
async function clearAllCookiesForDomain(domain) {
    try {
        // Try getting main domain if it's a subdomain
        const mainDomain = getMainDomain(domain);
        console.log(`Clearing data for domain: ${domain} (main domain: ${mainDomain})`);

        // Get cookies for both original and main domain
        const cookiesPromises = [domain, mainDomain].map(d => 
            chrome.cookies.getAll({ domain: d })
        );
        
        const [domainCookies, mainDomainCookies] = await Promise.all(cookiesPromises);
        const allCookies = [...new Set([...domainCookies, ...mainDomainCookies])];
        
        console.log(`Found ${allCookies.length} total cookies to clear`);
        
        const results = await Promise.allSettled(allCookies.map(cookie => {
            const protocol = cookie.secure ? 'https:' : 'http:';
            const cookieUrl = `${protocol}//${cookie.domain}${cookie.path}`;
            
            return chrome.cookies.remove({
                url: cookieUrl,
                name: cookie.name,
                storeId: cookie.storeId
            }).catch(error => {
                console.warn(`Failed to remove cookie ${cookie.name}:`, error);
                return null;
            });
        }));

        const successfulRemovals = results.filter(r => r.status === 'fulfilled').length;
        console.log(`Successfully removed ${successfulRemovals}/${allCookies.length} cookies`);

        // Clear browsing data for both domains
        const origins = [domain, mainDomain].flatMap(d => [
            `http://${d}`,
            `https://${d}`,
            `http://*.${d}`,
            `https://*.${d}`
        ]);

        await chrome.browsingData.remove({
            "origins": origins
        }, {
            "appcache": true,
            "cache": true,
            "cacheStorage": true,
            "cookies": true,
            "fileSystems": true,
            "indexedDB": true,
            "localStorage": true,
            "serviceWorkers": true,
            "webSQL": true
        });

        return true;
    } catch (error) {
        console.error('Error in clearAllCookiesForDomain:', error);
        // Don't throw error, return false to indicate failure
        return false;
    }
}

// Enhanced profile switching with better cookie management
async function switchProfile(profileName, domain) {
    const mainDomain = getMainDomain(domain);
    console.log('Switching profile for domain:', { original: domain, main: mainDomain });
    
    try {
        await clearAllCookiesForDomain(mainDomain);
        
        // Get profile data using main domain
        const profileKey = `profile_${profileName}_${mainDomain}`;
        const syncData = await chrome.storage.sync.get(profileKey);
        let profile;

        if (syncData[profileKey]?.isChunked) {
            console.log('Found chunked profile data, reassembling...');
            profile = await getChunkedData(profileKey, syncData[profileKey]);
        } else {
            profile = syncData[profileKey];
        }

        // If sync storage failed, try local storage
        if (!profile) {
            console.log('No sync data found, trying local storage');
            const localData = await chrome.storage.local.get(profileKey);
            profile = localData[profileKey];
        }
        
        if (!profile) {
            throw new Error(`Profile "${profileName}" not found for ${mainDomain}`);
        }

        console.log('Found profile data:', { 
            cookiesCount: profile.cookies?.length,
            hasStorage: !!profile.storage?.page 
        });

        // 3. Restore cookies with proper error handling
        if (profile.cookies?.length > 0) {
            console.log('Restoring cookies...');
            const cookiePromises = profile.cookies.map(async (cookie) => {
                try {
                    const protocol = cookie.secure ? 'https:' : 'http:';
                    const cookieUrl = `${protocol}//${cookie.domain}${cookie.path}`;
                    
                    // Set the cookie
                    await chrome.cookies.set({
                        url: cookieUrl,
                        name: cookie.name,
                        value: cookie.value,
                        domain: cookie.domain,
                        path: cookie.path,
                        secure: cookie.secure,
                        httpOnly: cookie.httpOnly,
                        sameSite: cookie.sameSite,
                        expirationDate: cookie.expirationDate
                    });
                } catch (error) {
                    console.error(`Error setting cookie ${cookie.name}:`, error);
                }
            });

            await Promise.all(cookiePromises);
            console.log('Cookies restored');
        }

        // 4. Execute content script to restore storage
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab && profile.storage?.page) {
            console.log('Restoring page storage...');
            try {
                await chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    function: (storageData) => {
                        try {
                            // Clear existing storage
                            localStorage.clear();
                            sessionStorage.clear();
                            
                            // Restore localStorage
                            Object.entries(storageData.localStorage || {}).forEach(([key, value]) => {
                                try {
                                    localStorage.setItem(key, value);
                                } catch (e) {
                                    console.warn('Error setting localStorage item:', e);
                                }
                            });

                            // Restore sessionStorage
                            Object.entries(storageData.sessionStorage || {}).forEach(([key, value]) => {
                                try {
                                    sessionStorage.setItem(key, value);
                                } catch (e) {
                                    console.warn('Error setting sessionStorage item:', e);
                                }
                            });

                            // Return success status
                            return { success: true };
                        } catch (error) {
                            console.error('Error in content script:', error);
                            return { success: false, error: error.message };
                        }
                    },
                    args: [profile.storage.page]
                });
                console.log('Page storage restored');
            } catch (error) {
                console.warn('Error executing storage restore script:', error);
            }
        }

        // 5. Update active profile information
        await chrome.storage.local.set({
            activeProfile: profileName,
            activeProfileDomain: domain,
            lastSwitchTime: Date.now()
        });
        console.log('Profile switch completed successfully');

        return true;
    } catch (error) {
        console.error('Error during profile switch:', error);
        throw error;
    }
}

// Enhanced profile saving with better error handling and size management
async function saveProfileState(profileName, domain) {
    console.log('Starting profile save:', { profileName, domain });
    
    try {
        if (!profileName || !domain) {
            throw new Error('Profile name and domain are required');
        }

        // Collect all data first
        const originalData = await collectProfileData(domain);
        
        // Try saving to storage
        const success = await trySaveProfile(profileName, domain, originalData);
        
        if (!success) {
            throw new Error('Failed to save profile data');
        }

        // Verify the save was successful
        const verified = await verifySaveSuccess(profileName, domain, originalData);
        
        if (!verified) {
            throw new Error('Profile save verification failed');
        }

        return { success: true };
    } catch (error) {
        console.error('Fatal error in saveProfileState:', error);
        return { 
            success: false, 
            error: error.message 
        };
    }
}

// Add cookie verification function
async function verifyCookieSwitch(domain) {
    try {
        // Get all current cookies for the domain
        const currentCookies = await chrome.cookies.getAll({ domain });
        
        // Get stored cookies for the active profile
        const activeProfile = await chrome.storage.local.get('activeProfile');
        if (!activeProfile?.activeProfile) {
            return { success: false, error: 'No active profile found' };
        }

        const profileKey = `profile_${activeProfile.activeProfile}_${domain}`;
        const profileData = await chrome.storage.sync.get(profileKey);
        const storedCookies = profileData[profileKey]?.cookies;

        if (!storedCookies) {
            return { success: false, error: 'No stored cookies found for profile' };
        }

        // Compare essential cookies (auth, session, etc.)
        const essentialCookies = currentCookies.filter(cookie => 
            cookie.name.toLowerCase().includes('auth') ||
            cookie.name.toLowerCase().includes('session') ||
            cookie.name.toLowerCase().includes('token') ||
            cookie.name.toLowerCase().includes('id')
        );

        const storedEssentialCookies = storedCookies.filter(cookie =>
            cookie.name.toLowerCase().includes('auth') ||
            cookie.name.toLowerCase().includes('session') ||
            cookie.name.toLowerCase().includes('token') ||
            cookie.name.toLowerCase().includes('id')
        );

        if (essentialCookies.length === 0) {
            return { success: false, error: 'No essential cookies found' };
        }

        // Check if essential cookies match
        const cookieMatches = essentialCookies.every(currentCookie => {
            const matchingCookie = storedEssentialCookies.find(c => c.name === currentCookie.name);
            return matchingCookie && matchingCookie.value === currentCookie.value;
        });

        if (!cookieMatches) {
            // If cookies don't match, try to fix by re-applying stored cookies
            await clearAllCookiesForDomain(domain);
            const reapplyPromises = storedEssentialCookies.map(cookie => {
                const protocol = cookie.secure ? 'https:' : 'http:';
                const cookieUrl = `${protocol}//${cookie.domain}${cookie.path}`;
                return chrome.cookies.set({
                    url: cookieUrl,
                    name: cookie.name,
                    value: cookie.value,
                    domain: cookie.domain,
                    path: cookie.path,
                    secure: cookie.secure,
                    httpOnly: cookie.httpOnly,
                    sameSite: cookie.sameSite,
                    expirationDate: cookie.expirationDate
                });
            });
            await Promise.all(reapplyPromises);
            
            // Verify again after reapplying
            const newCookies = await chrome.cookies.getAll({ domain });
            const newMatches = storedEssentialCookies.every(storedCookie => {
                const currentCookie = newCookies.find(c => c.name === storedCookie.name);
                return currentCookie && currentCookie.value === storedCookie.value;
            });
            
            return {
                success: newMatches,
                error: newMatches ? null : 'Cookie reapplication failed'
            };
        }

        return { success: true };
    } catch (error) {
        console.error('Error verifying cookies:', error);
        return { success: false, error: error.message };
    }
}

// Helper function to get main domain from any subdomain
function getMainDomain(domain) {
    const parts = domain.split('.');
    if (parts.length <= 2) return domain;
    
    // Handle special cases like co.uk, com.au, etc.
    const specialTlds = ['co.uk', 'com.au', 'co.jp', 'co.nz'];
    const lastTwo = parts.slice(-2).join('.');
    
    if (specialTlds.includes(lastTwo)) {
        return parts.slice(-3).join('.');
    }
    
    return parts.slice(-2).join('.');
}

// Add constants for storage limits
const CHROME_SYNC_QUOTA_BYTES = 102400; // 100KB per item limit
const CHROME_SYNC_QUOTA_BYTES_PER_ITEM = 8192; // 8KB per item limit

// Helper function to reduce data size
function reduceDataSize(data) {
    const stringified = JSON.stringify(data);
    if (stringified.length <= CHROME_SYNC_QUOTA_BYTES_PER_ITEM) {
        return data;
    }

    console.log('Data too large, reducing size...');
    const reduced = {
        ...data,
        cookies: data.cookies
            // Keep only essential auth cookies
            .filter(cookie => 
                cookie.name.toLowerCase().includes('auth') ||
                cookie.name.toLowerCase().includes('token') ||
                cookie.name.toLowerCase().includes('session')
            )
            // Remove unnecessary cookie properties
            .map(cookie => ({
                name: cookie.name,
                value: cookie.value,
                domain: cookie.domain,
                path: cookie.path,
                secure: cookie.secure,
                httpOnly: cookie.httpOnly
            }))
    };

    // If still too large, further reduce storage data
    if (JSON.stringify(reduced).length > CHROME_SYNC_QUOTA_BYTES_PER_ITEM) {
        reduced.storage = {
            page: {
                localStorage: Object.fromEntries(
                    Object.entries(data.storage?.page?.localStorage || {})
                        .filter(([key]) => 
                            key.toLowerCase().includes('auth') ||
                            key.toLowerCase().includes('token') ||
                            key.toLowerCase().includes('session')
                        )
                )
            }
        };
    }

    return reduced;
}

// Constants for chunking
const CHUNK_SIZE = 7000; // Slightly less than 8KB to account for key names
const CHUNK_PREFIX = 'chunk_';

// Helper function to chunk large data
async function saveWithChunking(key, data) {
    const stringified = JSON.stringify(data);
    const chunks = [];
    
    for (let i = 0; i < stringified.length; i += CHUNK_SIZE) {
        chunks.push(stringified.slice(i, i + CHUNK_SIZE));
    }
    
    console.log(`Splitting data into ${chunks.length} chunks`);

    // Save chunks
    const chunkKeys = [];
    for (let i = 0; i < chunks.length; i++) {
        const chunkKey = `${CHUNK_PREFIX}${key}_${i}`;
        chunkKeys.push(chunkKey);
        await chrome.storage.sync.set({ [chunkKey]: chunks[i] });
    }

    // Save metadata
    await chrome.storage.sync.set({
        [key]: {
            isChunked: true,
            chunkCount: chunks.length,
            chunkKeys: chunkKeys,
            timestamp: Date.now()
        }
    });

    return true;
}

// Helper function to retrieve chunked data
async function getChunkedData(key, metadata) {
    if (!metadata.isChunked) {
        return metadata;
    }

    const chunks = await Promise.all(
        metadata.chunkKeys.map(chunkKey => 
            chrome.storage.sync.get(chunkKey)
                .then(result => result[chunkKey])
        )
    );

    const fullData = chunks.join('');
    return JSON.parse(fullData);
}

// Add storage cleanup functions
async function cleanupStorage() {
    try {
        // Get all stored items
        const storage = await chrome.storage.sync.get(null);
        const now = Date.now();
        const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
        
        // Find old chunks and orphaned chunks
        const toRemove = [];
        const profileKeys = new Set();
        
        // First pass: collect profile keys and find old items
        for (const [key, value] of Object.entries(storage)) {
            if (key.startsWith('profile_')) {
                profileKeys.add(key);
                // Remove profiles older than 30 days that haven't been accessed
                if (value.lastAccessed && (now - value.lastAccessed > maxAge)) {
                    toRemove.push(key);
                    // Also remove any associated chunks
                    if (value.isChunked && value.chunkKeys) {
                        toRemove.push(...value.chunkKeys);
                    }
                }
            }
        }
        
        // Second pass: find orphaned chunks
        for (const [key, value] of Object.entries(storage)) {
            if (key.startsWith(CHUNK_PREFIX)) {
                // Check if this chunk belongs to any existing profile
                const belongsToProfile = Array.from(profileKeys).some(profileKey => 
                    storage[profileKey]?.chunkKeys?.includes(key)
                );
                
                if (!belongsToProfile) {
                    toRemove.push(key);
                }
            }
        }
        
        if (toRemove.length > 0) {
            console.log(`Cleaning up ${toRemove.length} old/orphaned items`);
            await chrome.storage.sync.remove(toRemove);
        }
    } catch (error) {
        console.error('Error during storage cleanup:', error);
    }
}

// Update trySaveProfile to include cleanup
async function trySaveProfile(profileName, domain, data) {
    const mainDomain = getMainDomain(domain);
    const profileKey = `profile_${profileName}_${mainDomain}`;
    
    try {
        // Run cleanup before saving new data
        await cleanupStorage();
        
        // Save full data to local storage
        await chrome.storage.local.set({ [profileKey]: data });
        
        // Try to save to sync storage with chunking
        try {
            const stringified = JSON.stringify(data);
            if (stringified.length > CHROME_SYNC_QUOTA_BYTES_PER_ITEM) {
                console.log('Data too large, using chunked storage');
                await saveWithChunking(profileKey, data);
            } else {
                await chrome.storage.sync.set({ [profileKey]: data });
            }
            console.log('Profile saved successfully');
        } catch (error) {
            console.warn('Error saving to sync storage:', error);
            // If chunking fails, try with reduced data
            const reducedData = reduceDataSize(data);
            await chrome.storage.sync.set({ [profileKey]: reducedData });
        }

        // Update domain profiles list with minimal data
        const domainProfilesKey = `domain_profiles_${mainDomain}`;
        const existingData = await chrome.storage.sync.get(domainProfilesKey);
        const domainProfiles = existingData[domainProfilesKey] || [];
        
        if (!domainProfiles.includes(profileName)) {
            domainProfiles.push(profileName);
            await chrome.storage.sync.set({ 
                [domainProfilesKey]: {
                    profiles: domainProfiles,
                    lastUpdated: Date.now()
                }
            });
        }

        return true;
    } catch (error) {
        console.error('Error in trySaveProfile:', error);
        // If sync storage fails but local storage succeeded, return partial success
        return { 
            success: true, 
            warning: 'Saved to local storage only' 
        };
    }
}

// Update collectProfileData to be more selective
async function collectProfileData(domain) {
    const mainDomain = getMainDomain(domain);
    const allCookies = await chrome.cookies.getAll({ domain: mainDomain });
    
    // Only collect essential cookies
    const essentialCookies = allCookies.filter(cookie => 
        cookie.name.toLowerCase().includes('auth') ||
        cookie.name.toLowerCase().includes('session') ||
        cookie.name.toLowerCase().includes('token') ||
        cookie.name.toLowerCase().includes('login') ||
        cookie.name.toLowerCase().includes('id')
    ).map(cookie => ({
        name: cookie.name,
        value: cookie.value,
        domain: cookie.domain,
        path: cookie.path,
        secure: cookie.secure,
        httpOnly: cookie.httpOnly,
        sameSite: cookie.sameSite,
        expirationDate: cookie.expirationDate
    }));

    // Get current tab
    const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
    });

    let pageStorage = null;
    if (tab) {
        try {
            const result = await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                function: () => {
                    const storage = {
                        localStorage: {},
                        sessionStorage: {}
                    };

                    // Only collect auth-related storage items
                    for (let i = 0; i < localStorage.length; i++) {
                        const key = localStorage.key(i);
                        if (key.toLowerCase().includes('auth') || 
                            key.toLowerCase().includes('token') || 
                            key.toLowerCase().includes('session')) {
                            storage.localStorage[key] = localStorage.getItem(key);
                        }
                    }

                    for (let i = 0; i < sessionStorage.length; i++) {
                        const key = sessionStorage.key(i);
                        if (key.toLowerCase().includes('auth') || 
                            key.toLowerCase().includes('token') || 
                            key.toLowerCase().includes('session')) {
                            storage.sessionStorage[key] = sessionStorage.getItem(key);
                        }
                    }

                    return storage;
                }
            });
            pageStorage = result[0].result;
        } catch (error) {
            console.warn('Error collecting page storage:', error);
        }
    }

    return {
        cookies: essentialCookies,
        storage: {
            page: pageStorage
        },
        timestamp: Date.now(),
        domain: mainDomain,
        lastAccessed: Date.now()
    };
}

// Add verification for profile save success
async function verifySaveSuccess(profileName, domain, originalData) {
    try {
        const profileKey = `profile_${profileName}_${getMainDomain(domain)}`;
        const savedData = await chrome.storage.sync.get(profileKey);
        
        if (!savedData[profileKey]) {
            console.error('Verification failed: Profile data not found after save');
            return false;
        }

        // Verify essential cookies were saved
        const savedCookies = savedData[profileKey].cookies || [];
        const originalCookies = originalData.cookies || [];
        
        if (savedCookies.length !== originalCookies.length) {
            console.error('Verification failed: Cookie count mismatch', {
                saved: savedCookies.length,
                original: originalCookies.length
            });
            return false;
        }

        // Verify storage data
        if (originalData.storage?.page && !savedData[profileKey].storage?.page) {
            console.error('Verification failed: Missing page storage data');
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error verifying save:', error);
        return false;
    }
}

// Add automatic cleanup trigger
chrome.runtime.onInstalled.addListener(() => {
    // Schedule cleanup every 24 hours
    chrome.alarms.create('storageCleanup', {
        periodInMinutes: 24 * 60
    });
});

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'storageCleanup') {
        cleanupStorage();
    }
});

// Update saveProfileState to use compression
async function saveProfileState(profileName, domain) {
    console.log('Starting profile save:', { profileName, domain });
    
    try {
        if (!profileName || !domain) {
            throw new Error('Profile name and domain are required');
        }

        // Collect profile data
        const originalData = await collectProfileData(domain);
        
        // Try compressing and saving
        try {
            const mainDomain = getMainDomain(domain);
            const profileKey = `profile_${profileName}_${mainDomain}`;
            
            // Compress the data
            const compressed = await compressData(originalData);
            console.log('Data compressed successfully');

            // Save compressed data in chunks if needed
            if (compressed.length > CHROME_SYNC_QUOTA_BYTES_PER_ITEM) {
                console.log('Using chunked storage for large compressed data');
                await saveWithChunks(profileKey, originalData);
            } else {
                // Save as single compressed item
                await chrome.storage.local.set({ [profileKey]: compressed });
            }

            // Update domain profiles list
            const domainKey = `domain_profiles_${mainDomain}`;
            const existingProfiles = await storageGet(domainKey) || [];
            
            if (!existingProfiles.some(p => p.name === profileName)) {
                existingProfiles.push({
                    name: profileName,
                    timestamp: Date.now()
                });
                await storageSet(domainKey, existingProfiles);
            }

            return { success: true };
        } catch (error) {
            console.error('Error saving compressed data:', error);
            throw error;
        }
    } catch (error) {
        console.error('Fatal error in saveProfileState:', error);
        return { 
            success: false, 
            error: error.message 
        };
    }
}

// Update switchProfile to handle compressed data
async function switchProfile(profileName, domain) {
    const mainDomain = getMainDomain(domain);
    console.log('Switching profile for domain:', { original: domain, main: mainDomain });
    
    try {
        await clearAllCookiesForDomain(mainDomain);
        
        // Get profile data
        const profileKey = `profile_${profileName}_${mainDomain}`;
        
        // Try loading chunked data first
        let profile = await loadFromChunks(profileKey);
        
        // If not chunked, try regular compressed storage
        if (!profile) {
            const compressed = await chrome.storage.local.get(profileKey);
            if (compressed[profileKey]) {
                profile = await decompressData(compressed[profileKey]);
            }
        }

        if (!profile) {
            throw new Error(`Profile "${profileName}" not found for ${mainDomain}`);
        }

        console.log('Profile data loaded successfully');

        // Restore cookies
        if (profile.cookies?.length > 0) {
            console.log('Restoring cookies...');
            const cookiePromises = profile.cookies.map(async (cookie) => {
                try {
                    const protocol = cookie.secure ? 'https:' : 'http:';
                    const cookieUrl = `${protocol}//${cookie.domain}${cookie.path}`;
                    
                    await chrome.cookies.set({
                        url: cookieUrl,
                        name: cookie.name,
                        value: cookie.value,
                        domain: cookie.domain,
                        path: cookie.path,
                        secure: cookie.secure,
                        httpOnly: cookie.httpOnly,
                        sameSite: cookie.sameSite,
                        expirationDate: cookie.expirationDate
                    });
                } catch (error) {
                    console.error(`Error setting cookie ${cookie.name}:`, error);
                }
            });

            await Promise.all(cookiePromises);
            console.log('Cookies restored');
        }

        // Restore storage data
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab && profile.storage?.page) {
            console.log('Restoring page storage...');
            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                function: (storageData) => {
                    try {
                        localStorage.clear();
                        sessionStorage.clear();
                        
                        Object.entries(storageData.localStorage || {}).forEach(([key, value]) => {
                            try {
                                localStorage.setItem(key, value);
                            } catch (e) {
                                console.warn('Error setting localStorage item:', e);
                            }
                        });

                        Object.entries(storageData.sessionStorage || {}).forEach(([key, value]) => {
                            try {
                                sessionStorage.setItem(key, value);
                            } catch (e) {
                                console.warn('Error setting sessionStorage item:', e);
                            }
                        });
                    } catch (error) {
                        console.error('Error in storage restore script:', error);
                    }
                },
                args: [profile.storage.page]
            });
            console.log('Page storage restored');
        }

        // Update active profile
        await storageSet('activeProfile', {
            name: profileName,
            domain: mainDomain,
            timestamp: Date.now()
        });

        return true;
    } catch (error) {
        console.error('Error during profile switch:', error);
        throw error;
    }
}

// Import compression utilities
let LZMA;
importScripts('./lib/lzma_worker.min.js');

// Import utility functions
import { compressData, decompressData, storageSet, storageGet, saveWithChunks, loadFromChunks, getMainDomain } from './utils.js';

// Initialize LZMA asynchronously
let LZMA_WORKER = null;
async function initLZMA() {
    if (!LZMA_WORKER) {
        // Create a blob URL for the LZMA worker
        const response = await fetch(chrome.runtime.getURL('lib/lzma_worker.min.js'));
        const workerText = await response.text();
        const blob = new Blob([workerText], { type: 'application/javascript' });
        const workerUrl = URL.createObjectURL(blob);
        
        // Initialize LZMA worker
        LZMA_WORKER = new Worker(workerUrl);
        console.log('LZMA worker initialized');
    }
    return LZMA_WORKER;
}

// Initialize LZMA when extension starts
initLZMA().catch(console.error);