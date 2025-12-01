// components/navbar.jsx
import React from 'react';
// Tema hook'unu import ediyoruz
import { useTheme } from '../context/ThemeContext'; 

const navbar = () => {
    // Tema durumunu ve değiştirme fonksiyonunu al
    const { theme, toggleTheme } = useTheme();

    return (
        <header className="navbar-container">
            <div className="navbar-brand">
                {/* Logo ve İsim */}
                <div className="logo-placeholder"></div>
                <span className="system-name">Enterprise Ticket System</span>
            </div>
            
            <nav className="navbar-links">
                {/* Gezinti Linkleri (Welcome Page tasarımındaki: Login, Hakkımızda) */}
                <a href="/login" className="nav-link">Login</a>
                <a href="/about" className="nav-link">Hakkımızda</a>
            </nav>

            {/* Tema Değiştirme Butonu / Switch */}
            <div className="theme-toggle-switch">
                <span className="sun-icon">☀️</span>
                <label className="switch">
                    {/* Input'un checked durumu, temaya göre belirlenir. */}
                    <input 
                        type="checkbox" 
                        checked={theme === 'dark'} 
                        onChange={toggleTheme} 
                    />
                    <span className="slider round"></span>
                </label>
                <span className="moon-icon">🌙</span>
            </div>
        </header>
    );
};

export default navbar;