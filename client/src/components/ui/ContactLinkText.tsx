import { useMemo } from 'react';
import { parseContactLinkText } from '@/lib/contactLinkText';
import styles from './ContactLinkText.module.css';

type ContactLinkTextTag = 'p' | 'span' | 'div';

interface ContactLinkTextProps {
  text: string;
  className?: string;
  as?: ContactLinkTextTag;
}

export function ContactLinkText({ text, className, as: Tag = 'span' }: ContactLinkTextProps) {
  const parts = useMemo(() => parseContactLinkText(text), [text]);

  return (
    <Tag className={className}>
      {parts.map((part, index) => {
        if (part.type === 'text') {
          return <span key={index}>{part.value}</span>;
        }

        if (part.type === 'telegram') {
          return (
            <a
              key={index}
              href={`https://t.me/${part.username}`}
              className={styles.contactLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              {part.display}
            </a>
          );
        }

        return (
          <a key={index} href={`tel:${part.tel}`} className={styles.contactLink}>
            {part.display}
          </a>
        );
      })}
    </Tag>
  );
}
