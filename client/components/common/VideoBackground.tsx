"use client";

import { useEffect, useRef, useState } from 'react';
import styles from './VideoBackground.module.scss';

interface VideoBackgroundProps {
  src: string;
  srcLowQuality?: string;
  poster?: string;
  className?: string;
  mobileImage?: string;
}

export default function VideoBackground({ 
  src, 
  srcLowQuality,
  poster, 
  className = '',
  mobileImage 
}: VideoBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [videoSrc, setVideoSrc] = useState(src);
  const [connectionSpeed, setConnectionSpeed] = useState<'fast' | 'slow' | 'unknown'>('unknown');

  useEffect(() => {
    const checkConnectionSpeed = async () => {
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        
        if (connection.effectiveType) {
          if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
            setConnectionSpeed('slow');
            if (srcLowQuality) setVideoSrc(srcLowQuality);
          } else {
            setConnectionSpeed('fast');
          }
        }
        
        if (connection.downlink && connection.downlink < 1.5) {
          setConnectionSpeed('slow');
          if (srcLowQuality) setVideoSrc(srcLowQuality);
        }
      } else {
        const testImage = new Image();
        const startTime = Date.now();
        
        testImage.onload = () => {
          const loadTime = Date.now() - startTime;

          if (loadTime > 2000 && srcLowQuality) {
            setConnectionSpeed('slow');
            setVideoSrc(srcLowQuality);
          } else {
            setConnectionSpeed('fast');
          }
        };
        
        testImage.src = poster || '/images/main-bg.png?t=' + Date.now();
      }
    };

    checkConnectionSpeed();
  }, [src, srcLowQuality, poster]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768 || 
        /iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
      });
    }
  }, [isLoaded]);

  return (
    <div className={`${styles.videoContainer} ${className}`}>
      {poster && !isLoaded && (
        <div
          className={styles.posterImage}
          style={{ backgroundImage: `url(${poster})` }}
        />
      )}

      <video
        ref={videoRef}
        className={styles.video}
        muted
        loop
        playsInline
        autoPlay
        poster={poster}
        onLoadedData={() => setIsLoaded(true)}
      >
        <source src={videoSrc} type="video/mp4" />
        {videoSrc.replace('.mp4', '.webm') && (
          <source src={videoSrc.replace('.mp4', '.webm')} type="video/webm" />
        )}
      </video>
      <div className={styles.overlay} />
    </div>
  );
}