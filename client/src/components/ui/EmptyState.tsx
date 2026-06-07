import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import styles from './EmptyState.module.css';

interface EmptyStateAction {
  label: string;
  to?: string;
  onClick?: () => void;
  primary?: boolean;
}

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  actions?: EmptyStateAction[];
}

export function EmptyState({ icon, title, description, actions = [] }: EmptyStateProps) {
  return (
    <motion.div
      className={styles.wrapper}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className={styles.iconRing}>
        <span className={styles.icon}>{icon}</span>
      </div>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.description}>{description}</p>
      {actions.length > 0 && (
        <div className={styles.actions}>
          {actions.map((action) =>
            action.to ? (
              <Link
                key={action.label}
                to={action.to}
                className={action.primary ? styles.primaryBtn : styles.secondaryBtn}
              >
                {action.label}
              </Link>
            ) : (
              <button
                key={action.label}
                type="button"
                className={action.primary ? styles.primaryBtn : styles.secondaryBtn}
                onClick={action.onClick}
              >
                {action.label}
              </button>
            ),
          )}
        </div>
      )}
    </motion.div>
  );
}
