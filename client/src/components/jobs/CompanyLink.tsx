import { Link } from 'react-router-dom';

export function companyPath(slug?: string) {
  return slug ? `/companies/${slug}` : '#';
}

interface CompanyLinkProps {
  name: string;
  slug?: string;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
}

export function CompanyLink({ name, slug, className, onClick }: CompanyLinkProps) {
  if (!slug) {
    return <span className={className}>{name}</span>;
  }

  return (
    <Link
      to={companyPath(slug)}
      className={className}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(e);
      }}
    >
      {name}
    </Link>
  );
}
