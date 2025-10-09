'use client';

import { motion, useInView, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useEffect, useRef } from 'react';

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  delay?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

/**
 * Animates a number counting up when it becomes visible
 */
export function AnimatedNumber({
  value,
  duration = 2,
  delay = 0,
  className = '',
  prefix = '',
  suffix = '',
  decimals = 0,
}: AnimatedNumberProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    damping: 50,
    stiffness: 100,
  });

  const displayValue = useTransform(springValue, (latest) => {
    return prefix + latest.toFixed(decimals) + suffix;
  });

  useEffect(() => {
    if (isInView) {
      const timeout = setTimeout(() => {
        motionValue.set(value);
      }, delay * 1000);

      return () => clearTimeout(timeout);
    }
  }, [isInView, value, delay, motionValue]);

  return (
    <span ref={ref} className={className}>
      <motion.span>{displayValue}</motion.span>
    </span>
  );
}

interface AnimatedStatProps {
  value: string;
  label: string;
  delay?: number;
  className?: string;
  valueClassName?: string;
  labelClassName?: string;
}

/**
 * Animated stat display with label
 */
export function AnimatedStat({
  value,
  label,
  delay = 0,
  className = '',
  valueClassName = '',
  labelClassName = '',
}: AnimatedStatProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={
        isInView
          ? {
              opacity: 1,
              scale: 1,
              transition: {
                duration: 0.6,
                delay,
                ease: [0.25, 0.4, 0.25, 1],
              },
            }
          : { opacity: 0, scale: 0.8 }
      }
      className={className}
    >
      <div className={valueClassName}>{value}</div>
      <div className={labelClassName}>{label}</div>
    </motion.div>
  );
}
