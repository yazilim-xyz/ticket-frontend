// settingsApi.ts - Backend Integration (Fixed)

const API_BASE_URL = 'http://localhost:8081';

// Get token from localStorage
const getAuthToken = (): string | null => {
  const token = sessionStorage.getItem('accessToken');
  return token;
};

// Headers for API requests
const getAuthHeaders = (): HeadersInit => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Interfaces - Matching Backend DTOs
export interface UserProfile {
  id: number;
  email: string;
  name: string;      // Backend uses "name"
  surname: string;   // Backend uses "surname"
  phoneNumber?: string;
  profileImage?: string;
  role: string;
}

// Matching Backend UpdateProfileDTO
export interface UpdateProfileDTO {
  name: string;           // Backend: @NotBlank
  surname: string;        // Backend: @NotBlank
  email: string;          // Backend: @NotBlank @Email
  phoneNumber?: string;   // Backend: optional
}

// Matching Backend UpdateProfileResponseDTO
export interface UpdateProfileResponseDTO {
  id: number;
  name: string;
  surname: string;
  email: string;
  phoneNumber: string;
  message: string;
}

// Matching Backend ChangePasswordDTO
export interface ChangePasswordDTO {
  oldPassword: string;      // Backend: @NotBlank
  newPassword: string;      // Backend: @NotBlank @Size(min=8)
  confirmPassword: string;  // Backend: @NotBlank - THIS FIELD IS REQUIRED!
}

// API Error Handler
const handleApiError = async (response: Response): Promise<never> => {
  let errorMessage = 'An error occurred';
  
  try {
    const errorData = await response.json();
    // Catch backend validation errors
    if (errorData.errors && Array.isArray(errorData.errors)) {
      errorMessage = errorData.errors.join(', ');
    } else if (errorData.message) {
      errorMessage = errorData.message;
    } else if (errorData.error) {
      errorMessage = errorData.error;
    } else {
      errorMessage = `Error: ${response.status}`;
    }
  } catch {
    errorMessage = `Error: ${response.status} ${response.statusText}`;
  }
  
  throw new Error(errorMessage);
};

export const settingsApi = {
  // Update profile - PATCH /api/users/profile
  updateProfile: async (profileData: UpdateProfileDTO): Promise<UpdateProfileResponseDTO> => {
    const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(profileData)
    });

    if (!response.ok) {
      await handleApiError(response);
    }

    return response.json();
  },

  // Change password - POST /api/users/change-password
  changePassword: async (passwordData: ChangePasswordDTO): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/users/change-password`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(passwordData)
    });

    if (!response.ok) {
      await handleApiError(response);
    }

    // Backend returns 204 No Content
    return;
  },

  // Get current user info (from AuthContext or localStorage)
  getCurrentUser: (): UserProfile | null => {
    const userStr = sessionStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  },

  // Save user info to localStorage
  updateLocalUser: (userData: Partial<UserProfile>): void => {
    const currentUser = settingsApi.getCurrentUser();
    if (currentUser) {
      const updatedUser = { ...currentUser, ...userData };
      sessionStorage.setItem('user', JSON.stringify(updatedUser));
    }
  }
};

export default settingsApi;