// client/src/components/TopicCard.tsx
import React from "react";
import { motion } from "framer-motion";
import styles from "./TopicCard.module.css";

export interface TopicCardProps {
  id: string;
  title: string;
  description: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  onClick: () => void;
}

const TopicCard: React.FC<TopicCardProps> = ({ id, title, description, Icon, onClick }) => {
  return (
    <motion.button
      layoutId={id}
      whileHover={{ scale: 1.03, y: -4 }}
      className={styles.card}
      onClick={onClick}
    >
      <div className={styles.iconWrapper}>
        <Icon className={styles.icon} />
      </div>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.description}>{description}</p>
    </motion.button>
  );
};

export default TopicCard;
