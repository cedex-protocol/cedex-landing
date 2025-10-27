import React from 'react';
import styles from './Section.module.scss';

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  paddingTop?: 'none' | 'small' | 'medium' | 'large' | string;
  paddingBottom?: 'none' | 'small' | 'medium' | 'large' | string;
  background?: 'transparent' | 'dark' | 'gradient';
}

export const Section: React.FC<SectionProps> = ({ 
  children, 
  className = '',
  id,
  paddingTop = 'medium',
  paddingBottom = 'medium',
  background = 'transparent'
}) => {
  const isCustomPaddingTop = !['none', 'small', 'medium', 'large'].includes(paddingTop);
  const isCustomPaddingBottom = !['none', 'small', 'medium', 'large'].includes(paddingBottom);
  
  const classes = [
    styles.section,
    !isCustomPaddingTop && styles[`pt-${paddingTop}`],
    !isCustomPaddingBottom && styles[`pb-${paddingBottom}`],
    styles[`bg-${background}`],
    className
  ].filter(Boolean).join(' ');

  const customStyles: React.CSSProperties = {
    ...(isCustomPaddingTop && { paddingTop }),
    ...(isCustomPaddingBottom && { paddingBottom })
  };

  return (
    <section id={id} className={classes} style={customStyles}>
      {children}
    </section>
  );
};