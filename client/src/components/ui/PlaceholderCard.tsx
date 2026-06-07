import styles from './PlaceholderCard.module.css';

interface PlaceholderCardProps {
  message: string;
}

export function PlaceholderCard({ message }: PlaceholderCardProps) {
  return (
    <div className={styles.card}>
      <p>{message}</p>
    </div>
  );
}
