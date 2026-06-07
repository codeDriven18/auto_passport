import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { JobCategory } from '@/models/enums';
import type { JobQuery } from '@/models/job';

export function useJobFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const search = searchParams.get('search') ?? '';
  const page = Number(searchParams.get('page') ?? 1);
  const sortBy = searchParams.get('sortBy') ?? 'createdAt';
  const sortOrder = searchParams.get('sortOrder') ?? 'desc';
  const category = searchParams.get('category');
  const city = searchParams.get('city') ?? '';
  const isRemote = searchParams.get('isRemote');
  const salaryMin = searchParams.get('salaryMin') ?? '';
  const selectedTags = searchParams.get('tags') ?? '';

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (category) count++;
    if (city) count++;
    if (isRemote) count++;
    if (salaryMin) count++;
    if (selectedTags) count++;
    return count;
  }, [category, city, isRemote, salaryMin, selectedTags]);

  const query: JobQuery = useMemo(() => ({
    search: search || undefined,
    page,
    sortBy,
    sortOrder,
    category: category !== null && category !== '' ? Number(category) as JobCategory : undefined,
    city: city || undefined,
    isRemote: isRemote === 'true' ? true : isRemote === 'false' ? false : undefined,
    salaryMin: salaryMin ? Number(salaryMin) : undefined,
    tags: selectedTags || undefined,
  }), [search, page, sortBy, sortOrder, category, city, isRemote, salaryMin, selectedTags]);

  const updateParams = (updates: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams);
    for (const [k, v] of Object.entries(updates)) {
      if (v === null || v === '') next.delete(k);
      else next.set(k, v);
    }
    setSearchParams(next);
  };

  return {
    search, page, sortBy, sortOrder, category, city, isRemote, salaryMin, selectedTags,
    activeFilterCount, query, updateParams,
  };
}
