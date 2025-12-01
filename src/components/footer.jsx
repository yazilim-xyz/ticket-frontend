// components/footer.jsx

import React from 'react';

const Footer = () => {
    const currentYear = new Date().getFullYear();
    
    return (
        <footer className="footer-container">
            <p>© {currentYear} Enterprise Ticket System. Tüm hakları saklıdır</p>
        </footer>
    );
};

export default Footer;