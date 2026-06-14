import { stripHtml } from '@/lib/jobCardMeta';

export interface JobDescriptionSections {
  summary: string;
  requirements: string[];
}

const SECTION_HEADERS = /^(requirements?|qualifications?|must have|nice to have|skills?|responsibilities?|about)\s*:?\s*$/i;

function normalizeLines(text: string): string[] {
  return text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function isBulletLine(line: string): boolean {
  return /^([•*\-–]|\d+[.)])\s+/.test(line);
}

function cleanBullet(line: string): string {
  return line.replace(/^([•*\-–]|\d+[.)])\s+/, '').trim();
}

export function parseJobDescriptionSections(description: string): JobDescriptionSections {
  const plain = stripHtml(description);
  if (!plain) return { summary: '', requirements: [] };

  const lines = normalizeLines(plain);
  const requirements: string[] = [];
  const summaryLines: string[] = [];
  let inRequirements = false;

  for (const line of lines) {
    if (SECTION_HEADERS.test(line)) {
      inRequirements = /^requirements?|qualifications?|must have|skills?/i.test(line);
      continue;
    }

    if (isBulletLine(line)) {
      const item = cleanBullet(line);
      if (item) requirements.push(item);
      continue;
    }

    if (inRequirements && line.length < 120) {
      requirements.push(line);
      continue;
    }

    if (!inRequirements) {
      summaryLines.push(line);
    }
  }

  if (requirements.length === 0) {
    for (const line of lines) {
      if (isBulletLine(line)) {
        const item = cleanBullet(line);
        if (item) requirements.push(item);
      }
    }
  }

  return {
    summary: summaryLines.join(' ').trim(),
    requirements: requirements.slice(0, 12),
  };
}
