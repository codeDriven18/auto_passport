export interface SourceIngestionStatusDisplay {
  statusLabel: string;
  errorLabel?: string;
  hasError: boolean;
}

export function summarizeIngestionError(raw?: string | null): string | undefined {
  if (!raw?.trim()) return undefined;

  const lower = raw.toLowerCase();
  if (lower.includes('not found') && lower.includes('model')) return 'Gemini Model Not Found';
  if (lower.includes('apikey') || lower.includes('api key')) return 'Gemini API Key Missing';
  if (lower.includes('gemini api error 401') || lower.includes('unauthorized')) return 'Gemini Authentication Failed';
  if (lower.includes('gemini')) return 'Gemini Extraction Failed';
  if (lower.includes('invalid ai response')) return 'Invalid AI Response';
  if (lower.includes('persistence')) return 'Candidate Persistence Failed';

  const firstLine = raw.split(/\r?\n/)[0]?.trim() ?? raw;
  if (firstLine.length <= 80) return firstLine;
  return `${firstLine.slice(0, 77)}…`;
}

export function getSourceIngestionStatusDisplay(
  lastSyncStatus?: string | null,
  lastIngestionError?: string | null,
): SourceIngestionStatusDisplay {
  if (!lastIngestionError?.trim()) {
    return {
      statusLabel: shortenStatus(lastSyncStatus) ?? 'OK',
      hasError: false,
    };
  }

  const errorLabel = summarizeIngestionError(lastIngestionError);
  const statusLabel = isExtractionFailure(lastSyncStatus, lastIngestionError)
    ? 'Extraction Failed'
    : shortenStatus(lastSyncStatus) ?? 'Failed';

  return {
    statusLabel,
    errorLabel,
    hasError: true,
  };
}

function isExtractionFailure(lastSyncStatus?: string | null, lastIngestionError?: string | null): boolean {
  const status = lastSyncStatus?.toLowerCase() ?? '';
  const error = lastIngestionError?.toLowerCase() ?? '';
  return status.includes('extract') || error.includes('gemini') || error.includes('ai response');
}

function shortenStatus(value?: string | null): string | undefined {
  if (!value?.trim()) return undefined;
  const trimmed = value.trim();
  if (trimmed.length <= 48) return trimmed;
  return `${trimmed.slice(0, 45)}…`;
}
