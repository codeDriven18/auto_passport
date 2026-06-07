import { JobCategory } from '@/models/enums';

export function formatSalary(min?: number, max?: number, category?: JobCategory) {
  if (!min && !max) return 'Salary not listed';
  const suffix = category === JobCategory.Gig ? '/hr' : '/mo';
  if (min && max) return `€${min.toLocaleString()}–${max.toLocaleString()}${suffix}`;
  if (min) return `From €${min.toLocaleString()}${suffix}`;
  return `Up to €${max!.toLocaleString()}${suffix}`;
}

export function truncateText(text: string, maxLength: number) {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trim()}…`;
}
