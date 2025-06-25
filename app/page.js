'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { FaUserMd, FaHeartbeat, FaFileMedical, FaCalendarCheck, FaImage } from 'react-icons/fa';

const features = [
  {
    icon: FaUserMd,
    title: 'Patient Management',
    description: 'Easily manage patient information, search records, and track medical history.',
    link: '/patients'
  },
  {
    icon: FaHeartbeat,
    title: 'Medical Records',
    description: 'Track diseases, treatments, and maintain comprehensive health records.',
    link: '/medical-records'
  },
  {
    icon: FaCalendarCheck,
    title: 'Checkup Schedule',
    description: 'Schedule and manage patient checkups with procedure tracking.',
    link: '/checkups'
  },
  {
    icon: FaFileMedical,
    title: 'Prescriptions',
    description: 'Create and manage patient prescriptions with medicine details.',
    link: '/prescriptions'
  },
  {
    icon: FaImage,
    title: 'Medical Imaging',
    description: 'Store and view patient medical images from checkups.',
    link: '/images'
  }
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background py-12 px-6">
      <main>
        {/* Hero section */}
        <div className="max-w-6xl mx-auto mb-20">
          <motion.div 
            className="flex flex-col md:flex-row items-center justify-between gap-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex-1">
              <motion.h1 
                className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.8 }}
              >
                ADPC Medical System
              </motion.h1>
              <motion.p 
                className="text-xl mb-8 text-foreground/80"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.8 }}
              >
                Complete patient management platform with electronic medical records, 
                checkup scheduling, and prescription tracking.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <Link href="/patients" className="clay-button flex items-center justify-center w-full md:w-auto">
                  Get Started
                </Link>
              </motion.div>
            </div>
            
            {/* 3D decorative element */}
            <motion.div
              className="flex-1 flex justify-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.6, type: 'spring' }}
            >
              <div className="w-64 h-64 rounded-full" style={{
                background: 'linear-gradient(135deg, var(--primary-light), var(--accent-light))',
                boxShadow: 'var(--shadow-lg)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div className="absolute inset-3 rounded-full bg-background opacity-40"></div>
                <div className="absolute bottom-6 left-6 right-6 h-1/3 rounded-full bg-white opacity-30"></div>
              </div>
            </motion.div>
          </motion.div>
        </div>
        
        {/* Features section */}
        <div className="max-w-6xl mx-auto">
          <motion.h2 
            className="text-3xl font-bold mb-12 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            Key Features
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                className="clay-card p-6 flex flex-col items-center text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" 
                  style={{ 
                    background: 'linear-gradient(135deg, var(--primary-light), var(--accent-light))',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <feature.icon size={32} className="text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-foreground/70 mb-4">{feature.description}</p>
                <Link 
                  href={feature.link} 
                  className="text-primary-light font-medium hover:text-primary transition-colors"
                >
                  Learn more
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
