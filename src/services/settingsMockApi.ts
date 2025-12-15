// settingsMockApi.ts

export interface UserSettings {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneCode: string;
  phoneNumber: string;
  profileImage: string;
  username: string;
}

export interface PasswordChange {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface SystemSettings {
  language: string;
  dateFormat: string;
  timeFormat: string;
}

// Mock veri
let mockUserSettings: UserSettings = {
  id: "user_001",
  firstName: "Pepito Rodrick",
  lastName: "Coronel Sifuentes",
  email: "pepito.c.sifuentes@uni.pe",
  phoneCode: "+51",
  phoneNumber: "969 123 456",
  profileImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200",
  username: "User-Name"
};

let mockSystemSettings: SystemSettings = {
  language: "English",
  dateFormat: "MM/DD/YYYY",
  timeFormat: "12h (am/pm)"
};

export const settingsMockApi = {
  // Kullanıcı ayarlarını getir
  getUserSettings: async (): Promise<UserSettings> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return { ...mockUserSettings };
  },

  // Kullanıcı ayarlarını güncelle
  updateUserSettings: async (settings: Partial<UserSettings>): Promise<UserSettings> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    mockUserSettings = { ...mockUserSettings, ...settings };
    return { ...mockUserSettings };
  },

  // Şifre değiştir
  changePassword: async (passwords: PasswordChange): Promise<{ success: boolean; message: string }> => {
    await new Promise(resolve => setTimeout(resolve, 700));
    
    // Mock validasyon
    if (passwords.currentPassword !== "oldpass123") {
      return { success: false, message: "Current password is incorrect" };
    }
    
    if (passwords.newPassword !== passwords.confirmPassword) {
      return { success: false, message: "Passwords do not match" };
    }
    
    if (passwords.newPassword.length < 6) {
      return { success: false, message: "Password must be at least 6 characters" };
    }
    
    return { success: true, message: "Password changed successfully" };
  },

  // Sistem ayarlarını getir
  getSystemSettings: async (): Promise<SystemSettings> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return { ...mockSystemSettings };
  },

  // Sistem ayarlarını güncelle
  updateSystemSettings: async (settings: Partial<SystemSettings>): Promise<SystemSettings> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    mockSystemSettings = { ...mockSystemSettings, ...settings };
    return { ...mockSystemSettings };
  },

  // Profil fotoğrafını güncelle
  updateProfileImage: async (imageFile: File): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    // Gerçek uygulamada burada dosya yükleme işlemi yapılır
    const mockImageUrl = URL.createObjectURL(imageFile);
    mockUserSettings.profileImage = mockImageUrl;
    return mockImageUrl;
  }
};