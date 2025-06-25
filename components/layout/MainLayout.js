'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  FaUserAlt, 
  FaNotesMedical, 
  FaStethoscope, 
  FaPrescriptionBottleAlt, 
  FaImage, 
  FaHome 
} from 'react-icons/fa';

const navItems = [
  { name: 'Home', path: '/', icon: FaHome },
  { name: 'Patients', path: '/patients', icon: FaUserAlt },
  { name: 'Medical Records', path: '/medical-records', icon: FaNotesMedical },
  { name: 'Checkups', path: '/checkups', icon: FaStethoscope },
  { name: 'Prescriptions', path: '/prescriptions', icon: FaPrescriptionBottleAlt },
  { name: 'Images', path: '/images', icon: FaImage },
];

export default function MainLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const currentPath = usePathname();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <motion.div 
        className="h-full" 
        initial={{ width: '250px' }}
        animate={{ width: isSidebarOpen ? '250px' : '80px' }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        <div className="h-full bg-white p-4 relative" style={{
          borderRadius: '0 var(--radius-md) var(--radius-md) 0',
          boxShadow: 'var(--shadow-md)'
        }}>
          {/* Logo and toggle */}
          <div className="flex items-center justify-between mb-8">
            {isSidebarOpen && (
              <motion.h1 
                className="text-2xl font-bold text-primary"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                ADPC Medical
              </motion.h1>
            )}
            <button 
              onClick={toggleSidebar}
              className="clay-button !p-2 flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {isSidebarOpen ? (
                  <>
                    <path d="M15 18l-6-6 6-6" />
                  </>
                ) : (
                  <>
                    <path d="M9 18l6-6-6-6" />
                  </>
                )}
              </svg>
            </button>
          </div>
          
          {/* Navigation links */}
          <nav className="space-y-2">
            {navItems.map((item) => {
              const isActive = currentPath === item.path;
              
              return (
                <Link href={item.path} key={item.name}>
                  <motion.div
                    className={`flex items-center p-3 rounded-xl transition-all
                    ${isActive 
                      ? 'text-primary font-semibold' 
                      : 'text-foreground hover:text-primary'}`}
                    style={{
                      boxShadow: isActive ? 'var(--shadow-inset)' : 'none',
                      backgroundColor: isActive ? 'rgba(124, 101, 218, 0.05)' : 'transparent'
                    }}
                    whileHover={{
                      x: 5,
                      transition: { duration: 0.2 }
                    }}
                  >
                    <item.icon size={24} className="flex-shrink-0" />
                    
                    {isSidebarOpen && (
                      <motion.span 
                        className="ml-3"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </motion.div>
                </Link>
              );
            })}
          </nav>
          
          {/* Bottom credit */}
          {isSidebarOpen && (
            <motion.div 
              className="absolute bottom-4 left-4 right-4 text-center text-xs text-gray-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              &copy; {new Date().getFullYear()} ADPC Medical System
            </motion.div>
          )}
        </div>
      </motion.div>
      
      {/* Main content */}
      <motion.div 
        className="flex-1 p-6 overflow-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </motion.div>
    </div>
  );
}
