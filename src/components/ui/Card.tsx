import React from 'react';
import { motion } from 'framer-motion';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface CardProps {
  title?: string;
  subtitle?: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: boolean;
}

const Card: React.FC<CardProps> = ({ 
  title, 
  subtitle, 
  icon: Icon, 
  children, 
  className = '', 
  hover = true,
  gradient = false 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={hover ? { scale: 1.02 } : undefined}
      className={`
        ${gradient 
          ? 'bg-gradient-to-br from-gray-800 to-gray-900' 
          : 'bg-gray-800/50 backdrop-blur-lg'
        }
        border border-gray-700/50 rounded-xl p-6 shadow-lg
        hover:border-teal-500/30 hover:shadow-xl hover:shadow-teal-500/10 
        transition-all duration-300
        ${className}
      `}
    >
      {(title || subtitle || Icon) && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            {Icon && (
              <div className="p-2 bg-gradient-to-r from-teal-500 to-purple-600 rounded-lg">
                <Icon className="w-5 h-5 text-white" />
              </div>
            )}
            <div>
              {title && <h3 className="text-lg font-semibold text-white">{title}</h3>}
              {subtitle && <p className="text-sm text-gray-400">{subtitle}</p>}
            </div>
          </div>
        </div>
      )}
      {children}
    </motion.div>
  );
};

export default Card;