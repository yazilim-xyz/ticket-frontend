// components/hero.jsx

import React from 'react';

const hero = () => {
    return (
        <section className="hero-section">
            <div className="hero-content">
                <h1>Hoş Geldiniz</h1>
                <p>Tüm kurumsal destek talepleriniz için en hızlı ve en organize çözüm.</p>
                
                {}
                <a href="/login" className="cta-button">
                    Giriş Yap
                </a>
            </div>

            <div className="feature-cards-container">
                {}
                <FeatureCard 
                    title="Merkezi Yönetim" 
                    description="Tüm destek taleplerini, sorunları ve görevleri tek bir panel üzerinden görüntüleyin. Karmaşayı ortadan kaldırın." 
                />
                <FeatureCard 
                    title="Hızlı Çözüm ve Takip" 
                    description="Talepleri anında ilgili ekiplere atayın, önceliklendirin ve çözüm süreçlerini canlı olarak takip edin." 
                />
                <FeatureCard 
                    title="Gelişmiş Raporlama" 
                    description="Ekibinizin performansını, çözüm sürelerini ve en sık karşılaşılan sorunları kolayca analiz edin." 
                />
            </div>
        </section>
    );
};

const FeatureCard = ({ title, description }) => (
    <div className="feature-card">
        <h3>{title}</h3>
        <p>{description}</p>
    </div>
);

export default hero;