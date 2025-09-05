// Pinata IPFS integration for file storage
export interface PinataResponse {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

class PinataService {
  private apiKey: string;
  private apiSecret: string;
  private baseUrl = 'https://api.pinata.cloud';

  constructor() {
    this.apiKey = process.env.PINATA_API_KEY || '';
    this.apiSecret = process.env.PINATA_API_SECRET || '';
    
    if (!this.apiKey || !this.apiSecret) {
      console.warn('Pinata API credentials not found. File uploads will not work.');
    }
  }

  private getHeaders() {
    return {
      'pinata_api_key': this.apiKey,
      'pinata_secret_api_key': this.apiSecret,
    };
  }

  async uploadFile(
    file: File, 
    metadata?: { name?: string; keyvalues?: Record<string, string> },
    onProgress?: (progress: UploadProgress) => void
  ): Promise<PinataResponse> {
    if (!this.apiKey || !this.apiSecret) {
      throw new Error('Pinata API credentials not configured');
    }

    const formData = new FormData();
    formData.append('file', file);

    if (metadata) {
      const pinataMetadata = {
        name: metadata.name || file.name,
        keyvalues: metadata.keyvalues || {}
      };
      formData.append('pinataMetadata', JSON.stringify(pinataMetadata));
    }

    const pinataOptions = {
      cidVersion: 1,
    };
    formData.append('pinataOptions', JSON.stringify(pinataOptions));

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      if (onProgress) {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress: UploadProgress = {
              loaded: event.loaded,
              total: event.total,
              percentage: Math.round((event.loaded / event.total) * 100)
            };
            onProgress(progress);
          }
        });
      }

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (error) {
            reject(new Error('Failed to parse response'));
          }
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Network error during upload'));
      });

      xhr.open('POST', `${this.baseUrl}/pinning/pinFileToIPFS`);
      
      // Set headers
      Object.entries(this.getHeaders()).forEach(([key, value]) => {
        xhr.setRequestHeader(key, value);
      });

      xhr.send(formData);
    });
  }

  async uploadJSON(
    jsonData: any,
    metadata?: { name?: string; keyvalues?: Record<string, string> }
  ): Promise<PinataResponse> {
    if (!this.apiKey || !this.apiSecret) {
      throw new Error('Pinata API credentials not configured');
    }

    const body = {
      pinataContent: jsonData,
      pinataMetadata: {
        name: metadata?.name || 'json-data',
        keyvalues: metadata?.keyvalues || {}
      },
      pinataOptions: {
        cidVersion: 1
      }
    };

    const response = await fetch(`${this.baseUrl}/pinning/pinJSONToIPFS`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getHeaders()
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new Error(`Failed to upload JSON: ${response.statusText}`);
    }

    return response.json();
  }

  async unpinFile(ipfsHash: string): Promise<void> {
    if (!this.apiKey || !this.apiSecret) {
      throw new Error('Pinata API credentials not configured');
    }

    const response = await fetch(`${this.baseUrl}/pinning/unpin/${ipfsHash}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to unpin file: ${response.statusText}`);
    }
  }

  async listFiles(
    options?: {
      status?: 'pinned' | 'unpinned';
      pageLimit?: number;
      pageOffset?: number;
      metadata?: Record<string, string>;
    }
  ): Promise<any> {
    if (!this.apiKey || !this.apiSecret) {
      throw new Error('Pinata API credentials not configured');
    }

    const params = new URLSearchParams();
    if (options?.status) params.append('status', options.status);
    if (options?.pageLimit) params.append('pageLimit', options.pageLimit.toString());
    if (options?.pageOffset) params.append('pageOffset', options.pageOffset.toString());
    if (options?.metadata) {
      Object.entries(options.metadata).forEach(([key, value]) => {
        params.append(`metadata[keyvalues][${key}]`, value);
      });
    }

    const response = await fetch(`${this.baseUrl}/data/pinList?${params}`, {
      headers: this.getHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to list files: ${response.statusText}`);
    }

    return response.json();
  }

  getIPFSUrl(hash: string): string {
    return `https://gateway.pinata.cloud/ipfs/${hash}`;
  }

  getPublicIPFSUrl(hash: string): string {
    return `https://ipfs.io/ipfs/${hash}`;
  }

  async testConnection(): Promise<boolean> {
    try {
      if (!this.apiKey || !this.apiSecret) {
        return false;
      }

      const response = await fetch(`${this.baseUrl}/data/testAuthentication`, {
        headers: this.getHeaders()
      });

      return response.ok;
    } catch (error) {
      console.error('Pinata connection test failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const pinata = new PinataService();

// Utility functions for file handling
export const fileUtils = {
  validateFile(file: File, maxSize: number = 100 * 1024 * 1024): { valid: boolean; error?: string } {
    // Check file size (default 100MB)
    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File size exceeds ${Math.round(maxSize / (1024 * 1024))}MB limit`
      };
    }

    // Check file type
    const allowedTypes = [
      'audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/ogg',
      'video/mp4', 'video/avi', 'video/mov', 'video/webm'
    ];

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Unsupported file type. Please use MP3, WAV, MP4, AVI, or MOV files.'
      };
    }

    return { valid: true };
  },

  getFileType(file: File): 'audio' | 'video' | 'unknown' {
    if (file.type.startsWith('audio/')) return 'audio';
    if (file.type.startsWith('video/')) return 'video';
    return 'unknown';
  },

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  async getVideoDuration(file: File): Promise<number> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        resolve(video.duration);
      };
      
      video.onerror = () => {
        reject(new Error('Failed to load video metadata'));
      };
      
      video.src = URL.createObjectURL(file);
    });
  },

  async getAudioDuration(file: File): Promise<number> {
    return new Promise((resolve, reject) => {
      const audio = document.createElement('audio');
      audio.preload = 'metadata';
      
      audio.onloadedmetadata = () => {
        window.URL.revokeObjectURL(audio.src);
        resolve(audio.duration);
      };
      
      audio.onerror = () => {
        reject(new Error('Failed to load audio metadata'));
      };
      
      audio.src = URL.createObjectURL(file);
    });
  },

  formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
};
