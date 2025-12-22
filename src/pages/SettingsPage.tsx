import React, { useState, useEffect, useRef } from "react";
import { settingsApi, UpdateProfileDTO, ChangePasswordDTO } from "../services/settingsApi";
import { 
  Camera, Check, AlertCircle, Eye, EyeOff, 
  User, Lock, Shield, Loader2, X
} from "lucide-react";
import Sidebar from "../components/layouts/Sidebar";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

const SettingsPage: React.FC = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states - Profile (Backend name/surname kullanıyor)
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [profileImage, setProfileImage] = useState<string>("");
  const [username, setUsername] = useState("");

  // Form states - Password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Password visibility states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Password strength
  const [passwordStrength, setPasswordStrength] = useState(0);

  useEffect(() => {
    loadUserData();
  }, [user]);

  useEffect(() => {
    // Calculate password strength
    let strength = 0;
    if (newPassword.length >= 8) strength++;  // Backend min 8 karakter istiyor
    if (newPassword.length >= 12) strength++;
    if (/[A-Z]/.test(newPassword)) strength++;
    if (/[0-9]/.test(newPassword)) strength++;
    if (/[^A-Za-z0-9]/.test(newPassword)) strength++;
    setPasswordStrength(strength);
  }, [newPassword]);

  const loadUserData = () => {
    setLoading(true);
    try {
      // AuthContext'ten veya localStorage'dan kullanıcı bilgilerini al
      const currentUser = user || settingsApi.getCurrentUser();
      
      if (currentUser) {
        // Backend name/surname kullanıyor
        setName((currentUser as any).name || (currentUser as any).Name || "");
        setSurname((currentUser as any).surname || (currentUser as any).Surname || "");
        setEmail(currentUser.email || "");
        setPhoneNumber((currentUser as any).phoneNumber || "");
        setProfileImage((currentUser as any).profileImage || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200");
        setUsername(currentUser.email?.split('@')[0] || "user");
      }
    } catch (error) {
      console.error("Settings load error:", error);
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setSaveMessage({ type, text });
    setTimeout(() => setSaveMessage(null), 4000);
  };

  const handleSaveDetails = async () => {
    // Validation
    if (!name.trim() || !surname.trim() || !email.trim()) {
      showMessage('error', 'Name, surname and email are required');
      return;
    }

    if (name.length < 2 || name.length > 50) {
      showMessage('error', 'Name must be between 2-50 characters');
      return;
    }

    if (surname.length < 2 || surname.length > 50) {
      showMessage('error', 'Surname must be between 2-50 characters');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showMessage('error', 'Please enter a valid email address');
      return;
    }

    setSaving(true);
    try {
      // Backend DTO'ya uyumlu data
      const updateData: UpdateProfileDTO = {
        name: name.trim(),
        surname: surname.trim(),
        email: email.trim(),
        phoneNumber: phoneNumber?.trim() || undefined
      };

      const response = await settingsApi.updateProfile(updateData);
      
      // AuthContext'i güncelle
      updateUser({
        name: response.name,
        surname: response.surname,
        email: response.email,
        phoneNumber: response.phoneNumber
      } as any);

      // localStorage'ı da güncelle
      settingsApi.updateLocalUser({
        name: response.name,
        surname: response.surname,
        email: response.email,
        phoneNumber: response.phoneNumber
      });

      showMessage('success', response.message || 'Profile updated successfully!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save changes';
      showMessage('error', errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      showMessage('error', 'Please fill all password fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      showMessage('error', 'Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      showMessage('error', 'Password must be at least 8 characters');
      return;
    }

    setSaving(true);
    try {
      // Backend DTO'ya uyumlu data - confirmPassword dahil!
      const passwordData: ChangePasswordDTO = {
        oldPassword: currentPassword,
        newPassword: newPassword,
        confirmPassword: confirmPassword  // Backend bu alanı istiyor!
      };

      await settingsApi.changePassword(passwordData);
      
      showMessage('success', 'Password changed successfully!');
      
      // Clear form
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to change password';
      showMessage('error', errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      // Şimdilik sadece lokal preview - backend'de profil resmi endpoint'i eklenince güncellenecek
      const imageUrl = URL.createObjectURL(file);
      setProfileImage(imageUrl);
      showMessage('success', 'Profile photo updated!');
    } catch (error) {
      showMessage('error', 'Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 1) return 'bg-red-500';
    if (passwordStrength <= 2) return 'bg-orange-500';
    if (passwordStrength <= 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 1) return 'Weak';
    if (passwordStrength <= 2) return 'Fair';
    if (passwordStrength <= 3) return 'Good';
    return 'Strong';
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex ${isDarkMode ? "bg-gray-900" : "bg-gray-50"}`}>
        <Sidebar isDarkMode={isDarkMode} />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className={`w-8 h-8 animate-spin ${isDarkMode ? "text-teal-400" : "text-teal-600"}`} />
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex ${isDarkMode ? "bg-gray-900" : "bg-gray-50"}`}>
      <Sidebar isDarkMode={isDarkMode} />
      
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-6 lg:p-8">
          {/* Header with Theme Toggle */}
          <div className="mb-8 relative">
            {/* Dark/Light Mode Toggle - Sağ Üst */}
            <div className="absolute top-0 right-0 flex items-center gap-2">
              {/* Sun Icon with Tick */}
              <div className="relative">
                <svg
                  className={`w-5 h-5 transition-colors ${isDarkMode ? 'text-gray-600' : 'text-yellow-500'}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                    clipRule="evenodd"
                  />
                </svg>
                {!isDarkMode && (
                  <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full flex items-center justify-center">
                    <svg
                      className="w-2.5 h-2.5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={3}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Switch Toggle */}
              <button
                onClick={toggleTheme}
                className="relative w-14 h-7 rounded-full transition-colors duration-300 bg-cyan-500"
                aria-label="Toggle theme"
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                    isDarkMode ? 'translate-x-7' : 'translate-x-0'
                  }`}
                />
              </button>

              {/* Moon Icon with Tick */}
              <div className="relative">
                <svg
                  className={`w-5 h-5 transition-colors ${isDarkMode ? 'text-blue-400' : 'text-gray-800'}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
                {isDarkMode && (
                  <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full flex items-center justify-center">
                    <svg
                      className="w-2.5 h-2.5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={3}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
            </div>

            <h1 className={`text-3xl font-bold ${isDarkMode ? "text-gray-100" : "text-gray-900"}`}>
              Settings
            </h1>
            <p className={`mt-2 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
              Manage your account settings and preferences
            </p>
          </div>

          {/* Toast Notification */}
          {saveMessage && (
            <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg animate-fadeIn ${
              saveMessage.type === 'success' 
                ? 'bg-green-500 text-white' 
                : 'bg-red-500 text-white'
            }`}>
              {saveMessage.type === 'success' ? (
                <Check className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              <span className="font-medium">{saveMessage.text}</span>
              <button 
                onClick={() => setSaveMessage(null)}
                className="ml-2 hover:opacity-80"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${
                activeTab === 'profile'
                  ? 'bg-teal-600 text-white shadow-lg shadow-teal-500/25'
                  : isDarkMode 
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                    : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              <User className="w-4 h-4" />
              Profile
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${
                activeTab === 'security'
                  ? 'bg-teal-600 text-white shadow-lg shadow-teal-500/25'
                  : isDarkMode 
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                    : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Shield className="w-4 h-4" />
              Security
            </button>
          </div>

          {/* Content */}
          <div className="space-y-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6 animate-fadeIn">
                {/* Profile Photo Section */}
                <div className={`${isDarkMode ? "bg-gray-800" : "bg-white"} rounded-2xl p-6 shadow-sm`}>
                  <h2 className={`text-xl font-bold mb-6 ${isDarkMode ? "text-gray-100" : "text-gray-900"}`}>
                    Profile Photo
                  </h2>
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <img
                        src={profileImage}
                        alt="Profile"
                        className="w-24 h-24 rounded-2xl object-cover border-4 border-teal-500/20"
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingImage}
                        className="absolute -bottom-2 -right-2 bg-teal-600 hover:bg-teal-700 text-white p-2 rounded-xl shadow-lg transition-all"
                      >
                        {uploadingImage ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Camera className="w-4 h-4" />
                        )}
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </div>
                    <div>
                      <h3 className={`font-semibold text-lg ${isDarkMode ? "text-gray-100" : "text-gray-900"}`}>
                        {name && surname ? `${name} ${surname}` : "User Name"}
                      </h3>
                      <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                        @{username}
                      </p>
                      <p className={`text-sm ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
                        {email}
                      </p>
                      <p className={`text-xs mt-2 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
                        JPG, PNG or GIF. Max 2MB.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Personal Info Section */}
                <div className={`${isDarkMode ? "bg-gray-800" : "bg-white"} rounded-2xl p-6 shadow-sm`}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center">
                      <User className="w-5 h-5 text-teal-500" />
                    </div>
                    <div>
                      <h2 className={`text-xl font-bold ${isDarkMode ? "text-gray-100" : "text-gray-900"}`}>
                        Personal Information
                      </h2>
                      <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                        Update your basic profile information
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className={`block text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Enter your first name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={`w-full px-4 py-3 rounded-xl border-2 transition-all ${
                          isDarkMode 
                            ? "bg-gray-700/50 border-gray-600 text-gray-100 placeholder-gray-500 focus:border-teal-500" 
                            : "bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400 focus:border-teal-500"
                        } focus:outline-none focus:ring-2 focus:ring-teal-500/20`}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className={`block text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                        Last Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Enter your last name"
                        value={surname}
                        onChange={(e) => setSurname(e.target.value)}
                        className={`w-full px-4 py-3 rounded-xl border-2 transition-all ${
                          isDarkMode 
                            ? "bg-gray-700/50 border-gray-600 text-gray-100 placeholder-gray-500 focus:border-teal-500" 
                            : "bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400 focus:border-teal-500"
                        } focus:outline-none focus:ring-2 focus:ring-teal-500/20`}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className={`block text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        placeholder="email@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`w-full px-4 py-3 rounded-xl border-2 transition-all ${
                          isDarkMode 
                            ? "bg-gray-700/50 border-gray-600 text-gray-100 placeholder-gray-500 focus:border-teal-500" 
                            : "bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400 focus:border-teal-500"
                        } focus:outline-none focus:ring-2 focus:ring-teal-500/20`}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className={`block text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                        Phone
                      </label>
                      <input
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className={`w-full px-4 py-3 rounded-xl border-2 transition-all ${
                          isDarkMode 
                            ? "bg-gray-700/50 border-gray-600 text-gray-100 placeholder-gray-500 focus:border-teal-500" 
                            : "bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400 focus:border-teal-500"
                        } focus:outline-none focus:ring-2 focus:ring-teal-500/20`}
                      />
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                    <button
                      onClick={handleSaveDetails}
                      disabled={saving}
                      className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-medium transition-all hover:shadow-lg hover:shadow-teal-500/25"
                    >
                      {saving ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Check className="w-5 h-5" />
                      )}
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-6 animate-fadeIn">
                {/* Password Change */}
                <div className={`${isDarkMode ? "bg-gray-800" : "bg-white"} rounded-2xl p-6 shadow-sm`}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                      <Lock className="w-5 h-5 text-orange-500" />
                    </div>
                    <div>
                      <h2 className={`text-xl font-bold ${isDarkMode ? "text-gray-100" : "text-gray-900"}`}>
                        Change Password
                      </h2>
                      <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                        Ensure your account is using a strong password
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className={`block text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                        Current Password <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? "text" : "password"}
                          placeholder="Enter current password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className={`w-full px-4 py-3 pr-12 rounded-xl border-2 transition-all ${
                            isDarkMode 
                              ? "bg-gray-700/50 border-gray-600 text-gray-100 placeholder-gray-500 focus:border-teal-500" 
                              : "bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400 focus:border-teal-500"
                          } focus:outline-none focus:ring-2 focus:ring-teal-500/20`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className={`absolute right-4 top-1/2 -translate-y-1/2 ${isDarkMode ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-700"}`}
                        >
                          {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className={`block text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                          New Password <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type={showNewPassword ? "text" : "password"}
                            placeholder="At least 8 characters"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className={`w-full px-4 py-3 pr-12 rounded-xl border-2 transition-all ${
                              isDarkMode 
                                ? "bg-gray-700/50 border-gray-600 text-gray-100 placeholder-gray-500 focus:border-teal-500" 
                                : "bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400 focus:border-teal-500"
                            } focus:outline-none focus:ring-2 focus:ring-teal-500/20`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className={`absolute right-4 top-1/2 -translate-y-1/2 ${isDarkMode ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-700"}`}
                          >
                            {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className={`block text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                          Confirm Password <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm your new password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className={`w-full px-4 py-3 pr-12 rounded-xl border-2 transition-all ${
                              isDarkMode 
                                ? "bg-gray-700/50 border-gray-600 text-gray-100 placeholder-gray-500 focus:border-teal-500" 
                                : "bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400 focus:border-teal-500"
                            } focus:outline-none focus:ring-2 focus:ring-teal-500/20`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className={`absolute right-4 top-1/2 -translate-y-1/2 ${isDarkMode ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-700"}`}
                          >
                            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Password Strength Indicator */}
                    {newPassword && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className={isDarkMode ? "text-gray-400" : "text-gray-500"}>Password Strength</span>
                          <span className={`font-medium ${
                            passwordStrength <= 1 ? "text-red-500" :
                            passwordStrength <= 2 ? "text-orange-500" :
                            passwordStrength <= 3 ? "text-yellow-500" : "text-green-500"
                          }`}>
                            {getPasswordStrengthText()}
                          </span>
                        </div>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((level) => (
                            <div
                              key={level}
                              className={`h-1.5 flex-1 rounded-full transition-colors ${
                                level <= passwordStrength ? getPasswordStrengthColor() : isDarkMode ? "bg-gray-700" : "bg-gray-200"
                              }`}
                            />
                          ))}
                        </div>
                        <ul className={`text-xs space-y-1 mt-2 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
                          <li className={newPassword.length >= 8 ? "text-green-500" : ""}>
                            • At least 8 characters
                          </li>
                          <li className={/[A-Z]/.test(newPassword) ? "text-green-500" : ""}>
                            • At least 1 uppercase letter
                          </li>
                          <li className={/[0-9]/.test(newPassword) ? "text-green-500" : ""}>
                            • At least 1 number
                          </li>
                          <li className={/[^A-Za-z0-9]/.test(newPassword) ? "text-green-500" : ""}>
                            • At least 1 special character
                          </li>
                        </ul>
                      </div>
                    )}

                    {/* Password Match Indicator */}
                    {confirmPassword && (
                      <div className={`flex items-center gap-2 text-sm ${
                        newPassword === confirmPassword ? "text-green-500" : "text-red-500"
                      }`}>
                        {newPassword === confirmPassword ? (
                          <>
                            <Check className="w-4 h-4" />
                            <span>Passwords match</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-4 h-4" />
                            <span>Passwords do not match</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                    <button
                      onClick={handleChangePassword}
                      disabled={saving || !currentPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword}
                      className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-medium transition-all hover:shadow-lg hover:shadow-teal-500/25"
                    >
                      {saving ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Shield className="w-5 h-5" />
                      )}
                      Update Password
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CSS Animation */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default SettingsPage;