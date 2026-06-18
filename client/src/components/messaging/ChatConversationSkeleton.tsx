import styles from './ChatConversationSkeleton.module.css';

export function ChatConversationSkeleton() {
  return (
    <div className={styles.shell} aria-busy="true" aria-label="Loading conversation">
      <span className={styles.loader} />
    </div>
  );
}
