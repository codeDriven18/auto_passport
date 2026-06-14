import { motion } from 'framer-motion';
import { OpportunityCard, type OpportunityCardProps } from '@/components/jobs/OpportunityCard';

interface JobCardProps extends Omit<OpportunityCardProps, 'variant'> {
  index?: number;
  onClick?: () => void;
  onSaveToggle?: (e: React.MouseEvent) => void;
  onQuickApply?: (e: React.MouseEvent) => void;
}

export function JobCard({
  job,
  index = 0,
  onClick,
  saved,
  applied,
  onSaveToggle,
  onQuickApply,
  applying,
}: JobCardProps) {
  return (
    <motion.div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.99 }}
    >
      <OpportunityCard
        job={job}
        variant="discover"
        saved={saved}
        applied={applied}
        applying={applying}
        onLearnMore={onClick}
        onSave={onSaveToggle}
        onApply={onQuickApply}
      />
    </motion.div>
  );
}

export { formatSalary } from '@/lib/jobFormat';
