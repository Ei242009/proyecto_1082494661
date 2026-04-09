'use client';

import { motion } from 'framer-motion';
import AnimatedText from './AnimatedText';

interface HolaMundoProps {
  title: string;
  subtitle: string;
  description: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8 },
  },
};

export default function HolaMundo({ title, subtitle, description }: HolaMundoProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen flex flex-col items-center justify-center px-4 text-center"
    >
      {/* Título con animación typewriter y glow */}
      <motion.div
        variants={itemVariants}
        className="mb-6"
      >
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-primary glow-text">
          <AnimatedText text={title} />
        </h1>
      </motion.div>

      {/* Línea separadora animada */}
      <motion.div
        variants={itemVariants}
        className="w-24 h-1 bg-accent rounded-full mb-8"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
      />

      {/* Subtítulo */}
      <motion.h2
        variants={itemVariants}
        className="text-xl md:text-2xl lg:text-3xl font-light text-muted mb-6"
      >
        {subtitle}
      </motion.h2>

      {/* Descripción */}
      <motion.p
        variants={itemVariants}
        className="text-base md:text-lg max-w-2xl leading-relaxed"
      >
        {description}
      </motion.p>
    </motion.div>
  );
}