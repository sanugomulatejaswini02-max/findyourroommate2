import React from 'react';
import { motion, useInView, type Variants } from 'framer-motion';
import { fadeIn, slideUp, slideLeft, slideRight, scaleIn, stagger, itemSlideUp } from '@/lib/animations';

interface AnimatedSectionProps {
  children: React.ReactNode;
  variants?: Variants;
  className?: string;
  once?: boolean;
}

export const FadeIn: React.FC<AnimatedSectionProps> = ({ children, className, once = true }) => {
  const ref = React.useRef(null);
  const inView = useInView(ref, { once, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      className={className}
      variants={fadeIn}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
    >
      {children}
    </motion.div>
  );
};

export const SlideUp: React.FC<AnimatedSectionProps> = ({ children, className, once = true }) => {
  const ref = React.useRef(null);
  const inView = useInView(ref, { once, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      className={className}
      variants={slideUp}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
    >
      {children}
    </motion.div>
  );
};

export const SlideLeft: React.FC<AnimatedSectionProps> = ({ children, className, once = true }) => {
  const ref = React.useRef(null);
  const inView = useInView(ref, { once, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      className={className}
      variants={slideLeft}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
    >
      {children}
    </motion.div>
  );
};

export const SlideRight: React.FC<AnimatedSectionProps> = ({ children, className, once = true }) => {
  const ref = React.useRef(null);
  const inView = useInView(ref, { once, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      className={className}
      variants={slideRight}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
    >
      {children}
    </motion.div>
  );
};

export const ScaleIn: React.FC<AnimatedSectionProps> = ({ children, className, once = true }) => {
  const ref = React.useRef(null);
  const inView = useInView(ref, { once, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      className={className}
      variants={scaleIn}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
    >
      {children}
    </motion.div>
  );
};

interface StaggerGridProps {
  children: React.ReactNode;
  className?: string;
  once?: boolean;
}

export const StaggerGrid: React.FC<StaggerGridProps> = ({ children, className, once = true }) => {
  const ref = React.useRef(null);
  const inView = useInView(ref, { once, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      className={className}
      variants={stagger}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
    >
      {React.Children.map(children, (child) => (
        <motion.div variants={itemSlideUp}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};
