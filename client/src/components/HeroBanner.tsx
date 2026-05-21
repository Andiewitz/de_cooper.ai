// client/src/components/HeroBanner.tsx
import React from "react";
import { motion } from "framer-motion";
import styles from "./HeroBanner.module.css";

interface HeroBannerProps {
  name?: string;
}

const HeroBanner: React.FC<HeroBannerProps> = ({ name }) => {
  return (
    <motion.section
      className={styles.banner}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <h1 className={styles.title}>Welcome{name ? `, ${name}` : ""}!</h1>
      <p className={styles.subtitle}>Start your scientific journey with Dr. Sheldon Cooper as your (reluctant) guide.</p>
    </motion.section>
  );
};

export default HeroBanner;
