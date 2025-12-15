import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import logo from '../assets/logo.png'; 
import { Users } from 'lucide-react';

const AboutUsPage: React.FC = () => {
    const navigate = useNavigate();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsMounted(true);
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    const contentClasses = `transition-opacity duration-1000 ease-in ${
        isMounted ? 'opacity-100' : 'opacity-0'
    }`;
    
    const handleHomeClick = () => {
        navigate('/'); 
    };

    const teamMembers = [
        { name: "Türker Kıvılcım", initials: "TK" },
        { name: "Beyzanur Aslan", initials: "BA" },
        { name: "Vedat Tatlı", initials: "VT" },
        { name: "Yelda Delidoğan", initials: "YD" },
        { name: "Furkan Mete Çalışkan", initials: "FMÇ" },
        { name: "Nisa Öztürk", initials: "NÖ" },
        { name: "Ezgi Yücel", initials: "EY" },
        { name: "Beyda Ertek", initials: "BE" },
        { name: "Özge Nur Kök", initials: "ÖNK" },
    ];

    const getGradient = (index: number) => {
        const gradients = [
            "from-teal-500 to-cyan-600",
            "from-cyan-500 to-blue-600",
            "from-blue-500 to-indigo-600",
            "from-indigo-500 to-purple-600",
            "from-purple-500 to-pink-600",
            "from-pink-500 to-rose-600",
            "from-rose-500 to-orange-600",
            "from-orange-500 to-amber-600",
            "from-amber-500 to-teal-600",
        ];
        return gradients[index % gradients.length];
    };

    return (
        <div className="min-h-screen w-full bg-gray-950 relative overflow-hidden text-white font-sans">
            
            <div className="absolute inset-0 bg-gradient-to-b from-gray-950 to-black/90 opacity-90"></div>
            
            <div className="relative z-10">

                {/* header */}
                <header className={`p-4 flex justify-between items-center ${contentClasses}`}>
                    
                    <div className="flex items-center space-x-2 cursor-pointer" onClick={handleHomeClick}>
                        <img 
                            src={logo} 
                            alt="Enterprise Ticket System Logo" 
                            className="w-10 h-10 object-contain"
                        />
                        <div className="flex flex-col leading-none">
                            <span className="text-teal-500 text-lg font-normal">Enterprise</span>
                            <span className="text-teal-500 text-lg font-normal -mt-1">Ticket System</span>
                        </div>
                    </div>

                    <nav className="flex items-center space-x-4">
                        <button
                            onClick={handleHomeClick}
                            className="text-white text-base font-normal hover:text-teal-400 transition hover:underline cursor-pointer"
                        >
                            Home
                        </button>
                    </nav>
                </header>
                
                <hr className="border-t border-transparent" />

                {/* içerik Kısmı */}
                <main className={`pt-20 pb-16 flex flex-col items-center justify-center text-center ${contentClasses}`}>
                    <div className="max-w-5xl mx-auto p-8">
                        
                        <h1 className="text-4xl md:text-5xl font-bold mb-8 text-teal-400 italic">
                            About Us
                        </h1>
                        
                        <p className="text-lg font-light mb-8 text-zinc-300 leading-relaxed">
                            Enterprise Ticket System is designed to help organizations manage their support processes on a centralized, fast, and transparent platform. We aim to eliminate complexity, allowing teams to focus solely on resolution.
                        </p>

                        <div className="mb-8">
                            <h2 className="text-2xl font-semibold mb-3 text-white italic">Our Mission</h2>
                            <p className="text-base font-normal text-zinc-400 leading-relaxed">
                                Our mission is to simplify the management of support requests, even in the most complex enterprise environments, and maximize team efficiency. We are committed to providing the fastest and most organized solutions every time.
                            </p>
                        </div>
                        
                        <div className="mb-12">
                            <h2 className="text-2xl font-semibold mb-3 text-white italic">Our Values</h2>
                            <ul className="text-left text-base font-normal text-zinc-400 leading-relaxed list-disc list-inside space-y-1 w-fit mx-auto">
                                <li>Transparency and Accountability</li>
                                <li>Speed and Solution-Focus</li>
                                <li>User-Friendly Design</li>
                                <li>Continuous Improvement</li>
                            </ul>
                        </div>

                        {/* Development Team Section */}
                        <div className="mt-16">
                            <div className="flex items-center justify-center gap-3 mb-8">
                                <Users className="w-7 h-7 text-teal-400" />
                                <h2 className="text-2xl font-semibold text-white italic">Development Team</h2>
                            </div>
                            
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                                {teamMembers.map((member, index) => (
                                    <div
                                        key={member.name}
                                        className="group relative bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-4 
                                                   hover:border-teal-500/50 hover:bg-gray-800/50 transition-all duration-300
                                                   hover:scale-105 hover:shadow-lg hover:shadow-teal-500/10"
                                        style={{ 
                                            animationDelay: `${index * 100}ms`,
                                        }}
                                    >
                                        {/* Avatar */}
                                        <div className={`w-14 h-14 mx-auto mb-3 rounded-full bg-gradient-to-br ${getGradient(index)} 
                                                        flex items-center justify-center shadow-lg
                                                        group-hover:scale-110 transition-transform duration-300`}>
                                            <span className="text-white font-bold text-sm">
                                                {member.initials}
                                            </span>
                                        </div>
                                        
                                        {/* Name */}
                                        <p className="text-sm font-medium text-zinc-200 group-hover:text-teal-300 transition-colors duration-300">
                                            {member.name}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </main>

                {/* footer */}
                <footer className={`w-full bg-gray-950/70 py-4 ${contentClasses} delay-500`}>
                    <p className="text-center text-sm opacity-60 text-white font-semibold">
                        © 2025 Enterprise Ticket System. All rights reserved.
                    </p>
                </footer>
            </div>
        </div>
    );
};

export default AboutUsPage;