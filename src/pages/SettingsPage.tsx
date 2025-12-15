import React, { useState, useEffect, useRef } from "react";
import { settingsMockApi, UserSettings } from "../services/settingsMockApi";
import { 
  Camera, Check, AlertCircle, Eye, EyeOff, 
  User, Lock, Shield, Loader2, X, Smartphone
} from "lucide-react";
import Sidebar from "../components/layouts/Sidebar";
import { useTheme } from "../context/ThemeContext";

const SettingsPage: React.FC = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneCode, setPhoneCode] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
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
    loadSettings();
  }, []);

  useEffect(() => {
    // Calculate password strength
    let strength = 0;
    if (newPassword.length >= 6) strength++;
    if (newPassword.length >= 10) strength++;
    if (/[A-Z]/.test(newPassword)) strength++;
    if (/[0-9]/.test(newPassword)) strength++;
    if (/[^A-Za-z0-9]/.test(newPassword)) strength++;
    setPasswordStrength(strength);
  }, [newPassword]);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const user = await settingsMockApi.getUserSettings();
      setUserSettings(user);
      
      setFirstName(user.firstName);
      setLastName(user.lastName);
      setEmail(user.email);
      setPhoneCode(user.phoneCode);
      setPhoneNumber(user.phoneNumber);
    } catch (error) {
      console.error("Settings load error:", error);
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setSaveMessage({ type, text });
    setTimeout(() => setSaveMessage(null), 3000);
  };

  const handleSaveDetails = async () => {
    setSaving(true);
    try {
      await settingsMockApi.updateUserSettings({
        firstName,
        lastName,
        email,
        phoneCode,
        phoneNumber
      });
      showMessage('success', 'Profile updated successfully!');
    } catch (error) {
      showMessage('error', 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      showMessage('error', 'Please fill all password fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      showMessage('error', 'Passwords do not match');
      return;
    }

    setSaving(true);
    try {
      const result = await settingsMockApi.changePassword({
        currentPassword,
        newPassword,
        confirmPassword
      });
      
      if (result.success) {
        showMessage('success', result.message);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        showMessage('error', result.message);
      }
    } catch (error) {
      showMessage('error', 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const newImageUrl = await settingsMockApi.updateProfileImage(file);
      setUserSettings(prev => prev ? { ...prev, profileImage: newImageUrl } : null);
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

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
  ] as const;

  if (loading) {
    return (
      <div className={`flex h-screen ${isDarkMode ? "bg-gray-900" : "bg-gray-50"}`}>
        <Sidebar isDarkMode={isDarkMode} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-teal-600 animate-spin mx-auto" />
            <p className={`mt-4 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Loading settings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex h-screen ${isDarkMode ? "bg-gray-900" : "bg-gray-50"} transition-colors duration-300`}>
      <Sidebar isDarkMode={isDarkMode} />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className={`text-3xl font-bold ${isDarkMode ? "text-gray-100" : "text-gray-900"}`}>
                Settings
              </h1>
              <p className={`mt-1 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                Manage your account settings and preferences
              </p>
            </div>
            
            {/* Dark Mode Toggle - AiChatBotPage style */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <svg className={`w-5 h-5 transition-colors ${isDarkMode ? 'text-gray-600' : 'text-yellow-500'}`} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
                {!isDarkMode && (
                  <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
              
              <button onClick={toggleTheme} className="relative w-14 h-7 rounded-full transition-colors duration-300 bg-cyan-500" aria-label="Toggle theme">
                <span className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${isDarkMode ? 'translate-x-7' : 'translate-x-0'}`} />
              </button>
              
              <div className="relative">
                <svg className={`w-5 h-5 transition-colors ${isDarkMode ? 'text-blue-400' : 'text-gray-800'}`} fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
                {isDarkMode && (
                  <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Toast Message */}
          <div
            className={`fixed top-4 right-4 z-50 transition-all duration-300 ${
              saveMessage ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
            }`}
          >
            {saveMessage && (
              <div className={`px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 ${
                saveMessage.type === 'success' 
                  ? "bg-green-500 text-white"
                  : "bg-red-500 text-white"
              }`}>
                {saveMessage.type === 'success' ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <AlertCircle className="w-5 h-5" />
                )}
                <span className="font-medium">{saveMessage.text}</span>
                <button onClick={() => setSaveMessage(null)} className="ml-2 hover:opacity-70">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Profile Card - Sol Panel */}
            <div className="lg:col-span-1">
              <div className={`${isDarkMode ? "bg-gray-800" : "bg-white"} rounded-2xl p-6 shadow-sm sticky top-8`}>
                {/* Profile Image */}
                <div className="text-center mb-6">
                  <div className="relative inline-block">
                    <div className="relative">
                      <img
                        src={userSettings?.profileImage}
                        alt="Profile"
                        className="w-28 h-28 rounded-full object-cover ring-4 ring-teal-500/20"
                      />
                      {uploadingImage && (
                        <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                          <Loader2 className="w-6 h-6 text-white animate-spin" />
                        </div>
                      )}
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 w-9 h-9 bg-teal-600 hover:bg-teal-700 rounded-full flex items-center justify-center transition-all shadow-lg hover:scale-110"
                    >
                      <Camera className="w-4 h-4 text-white" />
                    </button>
                  </div>
                  <h3 className={`text-lg font-bold mt-4 ${isDarkMode ? "text-gray-100" : "text-gray-900"}`}>
                    {firstName} {lastName}
                  </h3>
                  <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                    @{userSettings?.username}
                  </p>
                </div>

                {/* Navigation Tabs */}
                <nav className="space-y-1">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                          activeTab === tab.id
                            ? "bg-teal-600 text-white shadow-md"
                            : isDarkMode
                              ? "text-gray-300 hover:bg-gray-700"
                              : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{tab.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Settings Content - Sağ Panel */}
            <div className="lg:col-span-3 space-y-6">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className={`${isDarkMode ? "bg-gray-800" : "bg-white"} rounded-2xl p-6 shadow-sm animate-fadeIn`}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-teal-600/10 flex items-center justify-center">
                      <User className="w-5 h-5 text-teal-600" />
                    </div>
                    <div>
                      <h2 className={`text-xl font-bold ${isDarkMode ? "text-gray-100" : "text-gray-900"}`}>
                        Personal Information
                      </h2>
                      <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                        Update your personal details
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className={`block text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                        First Name
                      </label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className={`w-full px-4 py-3 rounded-xl border-2 transition-all ${
                          isDarkMode 
                            ? "bg-gray-700/50 border-gray-600 text-gray-100 focus:border-teal-500" 
                            : "bg-gray-50 border-gray-200 text-gray-800 focus:border-teal-500"
                        } focus:outline-none focus:ring-2 focus:ring-teal-500/20`}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className={`block text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className={`w-full px-4 py-3 rounded-xl border-2 transition-all ${
                          isDarkMode 
                            ? "bg-gray-700/50 border-gray-600 text-gray-100 focus:border-teal-500" 
                            : "bg-gray-50 border-gray-200 text-gray-800 focus:border-teal-500"
                        } focus:outline-none focus:ring-2 focus:ring-teal-500/20`}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className={`block text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`w-full px-4 py-3 rounded-xl border-2 transition-all ${
                          isDarkMode 
                            ? "bg-gray-700/50 border-gray-600 text-gray-100 focus:border-teal-500" 
                            : "bg-gray-50 border-gray-200 text-gray-800 focus:border-teal-500"
                        } focus:outline-none focus:ring-2 focus:ring-teal-500/20`}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className={`block text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                        Phone Number
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={phoneCode}
                          onChange={(e) => setPhoneCode(e.target.value)}
                          className={`w-20 px-3 py-3 rounded-xl border-2 text-center transition-all ${
                            isDarkMode 
                              ? "bg-gray-700/50 border-gray-600 text-gray-100 focus:border-teal-500" 
                              : "bg-gray-50 border-gray-200 text-gray-800 focus:border-teal-500"
                          } focus:outline-none focus:ring-2 focus:ring-teal-500/20`}
                        />
                        <input
                          type="text"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          className={`flex-1 px-4 py-3 rounded-xl border-2 transition-all ${
                            isDarkMode 
                              ? "bg-gray-700/50 border-gray-600 text-gray-100 focus:border-teal-500" 
                              : "bg-gray-50 border-gray-200 text-gray-800 focus:border-teal-500"
                          } focus:outline-none focus:ring-2 focus:ring-teal-500/20`}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                    <button
                      onClick={handleSaveDetails}
                      disabled={saving}
                      className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-medium transition-all hover:shadow-lg hover:shadow-teal-500/25"
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
                          Current Password
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
                            New Password
                          </label>
                          <div className="relative">
                            <input
                              type={showNewPassword ? "text" : "password"}
                              placeholder="Enter new password"
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
                            Confirm Password
                          </label>
                          <div className="relative">
                            <input
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="Confirm new password"
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
                        </div>
                      )}
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                      <button
                        onClick={handleChangePassword}
                        disabled={saving || !currentPassword || !newPassword || !confirmPassword}
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

                  {/* Two-Factor Authentication */}
                  <div className={`${isDarkMode ? "bg-gray-800" : "bg-white"} rounded-2xl p-6 shadow-sm`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                          <Smartphone className="w-5 h-5 text-purple-500" />
                        </div>
                        <div>
                          <h3 className={`font-semibold ${isDarkMode ? "text-gray-100" : "text-gray-900"}`}>
                            Two-Factor Authentication
                          </h3>
                          <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                            Add an extra layer of security to your account
                          </p>
                        </div>
                      </div>
                      <button className="px-4 py-2 rounded-xl bg-purple-500/10 text-purple-500 hover:bg-purple-500/20 font-medium transition-colors">
                        Enable
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
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