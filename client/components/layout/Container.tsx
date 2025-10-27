import React from 'react';
import styles from './Container.module.scss';

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
}

export const Container: React.FC<ContainerProps> = ({ 
  children, 
  className = '',
  fullWidth = false 
}) => {
  return (
    <div className={`${styles.container} ${fullWidth ? styles.fullWidth : ''} ${className}`}>
      {children}
    </div>
  );
};