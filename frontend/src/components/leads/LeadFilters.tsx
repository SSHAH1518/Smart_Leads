import React from 'react';
import { Search, X } from 'lucide-react';
import { LeadFilters as FiltersType, LeadSource, LeadStatus } from '../../types';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { LEAD_SOURCES, LEAD_STATUSES } from '../../utils';

interface LeadFiltersProps {
  filters: FiltersType;
  searchInput: string;
  onSearchChange: (value: string) => void;
  onFilterChange: (key: keyof FiltersType, value: string) => void;
  onClear: () => void;
}

export const LeadFiltersBar: React.FC<LeadFiltersProps> = ({
  filters,
  searchInput,
  onSearchChange,
  onFilterChange,
  onClear,
}) => {
  const hasActiveFilters = filters.status || filters.source || filters.search || (filters.sort && filters.sort !== 'latest');

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="flex-1 min-w-0">
        <Input
          placeholder="Search by name or email..."
          value={searchInput}
          onChange={(e) => onSearchChange(e.target.value)}
          icon={<Search className="w-4 h-4" />}
        />
      </div>
      <div className="flex gap-2 flex-wrap">
        <Select
          value={filters.status ?? ''}
          onChange={(e) => onFilterChange('status', e.target.value as LeadStatus)}
          options={LEAD_STATUSES.map((s) => ({ value: s, label: s }))}
          placeholder="All Statuses"
          className="w-36"
        />
        <Select
          value={filters.source ?? ''}
          onChange={(e) => onFilterChange('source', e.target.value as LeadSource)}
          options={LEAD_SOURCES.map((s) => ({ value: s, label: s }))}
          placeholder="All Sources"
          className="w-36"
        />
        <Select
          value={filters.sort ?? 'latest'}
          onChange={(e) => onFilterChange('sort', e.target.value)}
          options={[
            { value: 'latest', label: 'Latest First' },
            { value: 'oldest', label: 'Oldest First' },
          ]}
          className="w-36"
        />
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onClear} icon={<X className="w-4 h-4" />}>
            Clear
          </Button>
        )}
      </div>
    </div>
  );
};
