// Create a singleton LZMA instance
let lzmaInstance = null;

async function getLZMA() {
    if (!lzmaInstance) {
        lzmaInstance = new Promise((resolve, reject) => {
            // Create LZMA worker
            const workerBlob = new Blob([`
                importScripts('https://cdn.jsdelivr.net/npm/lzma@2.3.2/src/lzma_worker.min.js');
                self.onmessage = function(e) {
                    if (e.data.action === 'compress') {
                        LZMA.compress(e.data.data, e.data.level, function(result) {
                            self.postMessage({ id: e.data.id, result });
                        });
                    } else if (e.data.action === 'decompress') {
                        LZMA.decompress(e.data.data, function(result) {
                            self.postMessage({ id: e.data.id, result });
                        });
                    }
                };
            `], { type: 'application/javascript' });
            
            const worker = new Worker(URL.createObjectURL(workerBlob));
            resolve(worker);
        });
    }
    return lzmaInstance;
}

// Enhanced compression using LZMA
async function compressData(data) {
    try {
        const jsonString = JSON.stringify(data);
        const uint8Array = new TextEncoder().encode(jsonString);
        
        const worker = await getLZMA();
        const id = Date.now().toString();
        
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Compression timeout'));
            }, 30000); // 30 second timeout
            
            worker.onmessage = function(e) {
                if (e.data.id === id) {
                    clearTimeout(timeout);
                    const base64 = btoa(String.fromCharCode.apply(null, e.data.result));
                    resolve(base64);
                }
            };
            
            worker.postMessage({
                action: 'compress',
                data: uint8Array,
                level: 9,
                id
            });
        });
    } catch (error) {
        console.error('Compression error:', error);
        throw error;
    }
}

async function decompressData(compressedData) {
    try {
        const compressed = new Uint8Array(atob(compressedData).split('').map(c => c.charCodeAt(0)));
        const worker = await getLZMA();
        const id = Date.now().toString();
        
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Decompression timeout'));
            }, 30000);
            
            worker.onmessage = function(e) {
                if (e.data.id === id) {
                    clearTimeout(timeout);
                    const jsonString = new TextDecoder().decode(e.data.result);
                    resolve(JSON.parse(jsonString));
                }
            };
            
            worker.postMessage({
                action: 'decompress',
                data: compressed,
                id
            });
        });
    } catch (error) {
        console.error('Decompression error:', error);
        throw error;
    }
}

// Enhanced storage utilities with chunking and compression
async function storageSet(key, value, useLocal = false) {
    try {
        const compressed = await compressData(value);
        const storage = useLocal ? chrome.storage.local : chrome.storage.sync;
        
        // Check if data needs to be chunked
        if (compressed.length > 8000) { // Leave some room for key names
            return saveWithChunks(key, value, useLocal);
        }
        
        return storage.set({ [key]: compressed });
    } catch (error) {
        console.error('Storage set error:', error);
        throw error;
    }
}

async function storageGet(key, useLocal = false) {
    try {
        const storage = useLocal ? chrome.storage.local : chrome.storage.sync;
        
        // First try to get chunked data
        const chunkedData = await loadFromChunks(key, useLocal);
        if (chunkedData) return chunkedData;
        
        // If not chunked, try normal compressed data
        const result = await storage.get(key);
        if (!result[key]) return null;
        
        return decompressData(result[key]);
    } catch (error) {
        console.error('Storage get error:', error);
        throw error;
    }
}

// Enhanced chunking with compression
async function saveWithChunks(key, data, useLocal = false) {
    const storage = useLocal ? chrome.storage.local : chrome.storage.sync;
    const compressed = await compressData(data);
    const chunkSize = 8000; // Slightly less than Chrome's limit
    const chunks = [];
    
    // Split compressed data into chunks
    for (let i = 0; i < compressed.length; i += chunkSize) {
        chunks.push(compressed.slice(i, i + chunkSize));
    }
    
    // Save chunks with retries
    const maxRetries = 3;
    for (let i = 0; i < chunks.length; i++) {
        let retries = 0;
        while (retries < maxRetries) {
            try {
                await storage.set({ 
                    [`${key}_chunk_${i}`]: chunks[i]
                });
                break;
            } catch (error) {
                retries++;
                if (retries === maxRetries) throw error;
                await new Promise(resolve => setTimeout(resolve, 100 * retries));
            }
        }
    }
    
    // Save metadata
    await storage.set({
        [`${key}_meta`]: {
            chunks: chunks.length,
            timestamp: Date.now()
        }
    });
}

async function loadFromChunks(key, useLocal = false) {
    const storage = useLocal ? chrome.storage.local : chrome.storage.sync;
    
    try {
        // Get metadata
        const meta = await storage.get(`${key}_meta`);
        if (!meta[`${key}_meta`]) return null;
        
        // Load all chunks with retries
        const chunks = [];
        const maxRetries = 3;
        
        for (let i = 0; i < meta[`${key}_meta`].chunks; i++) {
            let retries = 0;
            while (retries < maxRetries) {
                try {
                    const chunk = await storage.get(`${key}_chunk_${i}`);
                    chunks.push(chunk[`${key}_chunk_${i}`]);
                    break;
                } catch (error) {
                    retries++;
                    if (retries === maxRetries) throw error;
                    await new Promise(resolve => setTimeout(resolve, 100 * retries));
                }
            }
        }
        
        // Combine chunks and decompress
        const compressed = chunks.join('');
        return decompressData(compressed);
    } catch (error) {
        console.error('Error loading chunked data:', error);
        throw error;
    }
}

// Domain utilities
function getMainDomain(domain) {
    const parts = domain.split('.');
    if (parts.length <= 2) return domain;
    
    const specialTlds = ['co.uk', 'com.au', 'co.jp', 'co.nz', 'co.in'];
    const lastTwo = parts.slice(-2).join('.');
    
    if (specialTlds.includes(lastTwo)) {
        return parts.slice(-3).join('.');
    }
    
    return parts.slice(-2).join('.');
}

export {
    getMainDomain,
    compressData,
    decompressData,
    storageSet,
    storageGet,
    saveWithChunks,
    loadFromChunks
};