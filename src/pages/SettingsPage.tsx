import React, { useState, useEffect } from "react";
import { settingsApi, UpdateProfileDTO, ChangePasswordDTO } from "../services/settingsApi";
import { 
  Check, AlertCircle, Eye, EyeOff, 
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

  // Form states - Profile (Backend Name/Surname kullanıyor - büyük harfle)
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [role, setRole] = useState("");

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
    let strength = 0;
    if (newPassword.length >= 8) strength++;
    if (newPassword.length >= 12) strength++;
    if (/[A-Z]/.test(newPassword)) strength++;
    if (/[0-9]/.test(newPassword)) strength++;
    if (/[^A-Za-z0-9]/.test(newPassword)) strength++;
    setPasswordStrength(strength);
  }, [newPassword]);

  const loadUserData = () => {
    setLoading(true);
    try {
      const currentUser = user || settingsApi.getCurrentUser();
      
      if (currentUser) {
        // Backend Name/Surname büyük harfle gönderiyor
        setName((currentUser as any).Name || (currentUser as any).name || "");
        setSurname((currentUser as any).Surname || (currentUser as any).surname || "");
        setEmail(currentUser.email || "");
        setPhoneNumber((currentUser as any).phoneNumber || "");
        setRole((currentUser as any).role || "USER");
      }
    } catch (error) {
      console.error("Settings load error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Get initials from name and surname
  const getInitials = () => {
    const firstInitial = name ? name.charAt(0).toUpperCase() : "";
    const lastInitial = surname ? surname.charAt(0).toUpperCase() : "";
    return firstInitial + lastInitial || "U";
  };

  // Get full name
  const getFullName = () => {
    if (name && surname) return `${name} ${surname}`;
    if (name) return name;
    if (surname) return surname;
    return "User";
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setSaveMessage({ type, text });
    setTimeout(() => setSaveMessage(null), 4000);
  };

  const handleSaveDetails = async () => {
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
      const updateData: UpdateProfileDTO = {
        name: name.trim(),
        surname: surname.trim(),
        email: email.trim(),
        phoneNumber: phoneNumber?.trim() || undefined
      };

      const response = await settingsApi.updateProfile(updateData);
      
      // AuthContext'i güncelle (büyük harfli field'lar)
      updateUser({
        Name: response.name,
        Surname: response.surname,
        email: response.email,
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
      const passwordData: ChangePasswordDTO = {
        oldPassword: currentPassword,
        newPassword: newPassword,
        confirmPassword: confirmPassword
      };

      await settingsApi.changePassword(passwordData);
      
      showMessage('success', 'Password changed successfully!');
      
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
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className={`px-8 py-6 border-b ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <h1 className="text-cyan-800 text-2xl font-semibold font-['Inter'] leading-9">
              Settings
            </h1>

            {/* Theme Toggle */}
            <div className="flex items-center gap-2">
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
                    <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>

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
                    <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
          </div>
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

        {/* Content */}
        <div className="p-8">
          {/* Single Card Container */}
          <div className={`rounded-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} overflow-hidden`}>
            
            {/* Profile Header */}
            <div className={`px-8 py-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center gap-5">
                {/* Avatar with Initials */}
                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold text-white bg-gradient-to-br from-teal-500 to-cyan-600 shadow-lg`}>
                  {getInitials()}
                </div>
                
                {/* User Info */}
                <div className="flex-1">
                  <h2 className={`text-xl font-bold ${isDarkMode ? "text-gray-100" : "text-gray-900"}`}>
                    {getFullName()}
                  </h2>
                  <p className={`text-sm mt-0.5 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                    {email}
                  </p>
                  <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${
                    role === 'ADMIN' 
                      ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' 
                      : 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400'
                  }`}>
                    {role}
                  </span>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className={`px-8 py-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex gap-1">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all ${
                    activeTab === 'profile'
                      ? 'bg-teal-600 text-white'
                      : isDarkMode 
                        ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <User className="w-4 h-4" />
                  Profile
                </button>
                <button
                  onClick={() => setActiveTab('security')}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all ${
                    activeTab === 'security'
                      ? 'bg-teal-600 text-white'
                      : isDarkMode 
                        ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  Security
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="px-8 py-6">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="animate-fadeIn">
                  <div className="mb-6">
                    <h3 className={`text-lg font-semibold ${isDarkMode ? "text-gray-100" : "text-gray-900"}`}>
                      Personal Information
                    </h3>
                    <p className={`text-sm mt-1 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                      Update your personal details here
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        placeholder="+90 (555) 000-0000"
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

                  <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 flex justify-end">
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
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div className="animate-fadeIn">
                  <div className="mb-6">
                    <h3 className={`text-lg font-semibold ${isDarkMode ? "text-gray-100" : "text-gray-900"}`}>
                      Change Password
                    </h3>
                    <p className={`text-sm mt-1 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                      Ensure your account is using a strong password
                    </p>
                  </div>

                  <div className="space-y-6 max-w-2xl">
                    {/* Current Password */}
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

                    {/* New Password Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      <div className="space-y-3">
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
                              className={`h-2 flex-1 rounded-full transition-colors ${
                                level <= passwordStrength ? getPasswordStrengthColor() : isDarkMode ? "bg-gray-700" : "bg-gray-200"
                              }`}
                            />
                          ))}
                        </div>
                        <ul className={`text-xs space-y-1 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
                          <li className={newPassword.length >= 8 ? "text-green-500" : ""}>
                            {newPassword.length >= 8 ? "✓" : "○"} At least 8 characters
                          </li>
                          <li className={/[A-Z]/.test(newPassword) ? "text-green-500" : ""}>
                            {/[A-Z]/.test(newPassword) ? "✓" : "○"} At least 1 uppercase letter
                          </li>
                          <li className={/[0-9]/.test(newPassword) ? "text-green-500" : ""}>
                            {/[0-9]/.test(newPassword) ? "✓" : "○"} At least 1 number
                          </li>
                          <li className={/[^A-Za-z0-9]/.test(newPassword) ? "text-green-500" : ""}>
                            {/[^A-Za-z0-9]/.test(newPassword) ? "✓" : "○"} At least 1 special character
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

                  <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                    <button
                      onClick={handleChangePassword}
                      disabled={saving || !currentPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword}
                      className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-medium transition-all hover:shadow-lg hover:shadow-teal-500/25"
                    >
                      {saving ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Lock className="w-5 h-5" />
                      )}
                      Update Password
                    </button>
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