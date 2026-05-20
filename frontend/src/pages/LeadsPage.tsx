import React, { useState, useCallback } from 'react';
import { Plus, Download } from 'lucide-react';
import { Lead, LeadFilters, LeadFormData } from '../types';
import { useLeads, useCreateLead, useUpdateLead, useExportCSV } from '../hooks/useLeads';
import { useDebounce } from '../hooks/useDebounce';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Spinner } from '../components/ui/Spinner';
import { LeadTable } from '../components/leads/LeadTable';
import { LeadForm } from '../components/leads/LeadForm';
import { LeadFiltersBar } from '../components/leads/LeadFilters';
import { LeadDetailModal } from '../components/leads/LeadDetailModal';
import { Pagination } from '../components/leads/Pagination';

export const LeadsPage: React.FC = () => {
  const [filters, setFilters] = useState<LeadFilters>({ sort: 'latest', page: 1 });
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 400);

  const [createOpen, setCreateOpen] = useState(false);
  const [editLead, setEditLead] = useState<Lead | null>(null);
  const [viewLead, setViewLead] = useState<Lead | null>(null);

  const activeFilters: LeadFilters = { ...filters, search: debouncedSearch || undefined };

  const { data, isLoading, isFetching } = useLeads(activeFilters);
  const { mutate: createLead, isPending: creating } = useCreateLead();
  const { mutate: updateLead, isPending: updating } = useUpdateLead();
  const { mutate: exportCSV, isPending: exporting } = useExportCSV();

  const handleFilterChange = useCallback((key: keyof LeadFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value || undefined, page: 1 }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({ sort: 'latest', page: 1 });
    setSearchInput('');
  }, []);

  const handleCreate = (data: LeadFormData) => {
    createLead(data, { onSuccess: () => setCreateOpen(false) });
  };

  const handleUpdate = (data: LeadFormData) => {
    if (!editLead) return;
    updateLead({ id: editLead._id, data }, { onSuccess: () => setEditLead(null) });
  };

  return (
    <div className="space-y-5 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Leads</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
            {data?.meta.totalDocs ?? 0} total leads
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            icon={<Download className="w-4 h-4" />}
            onClick={() => exportCSV()}
            loading={exporting}
          >
            Export CSV
          </Button>
          <Button
            size="sm"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setCreateOpen(true)}
          >
            Add Lead
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
        <LeadFiltersBar
          filters={filters}
          searchInput={searchInput}
          onSearchChange={setSearchInput}
          onFilterChange={handleFilterChange}
          onClear={handleClearFilters}
        />
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Spinner size="lg" />
          </div>
        ) : (
          <div className={`transition-opacity duration-200 ${isFetching ? 'opacity-60' : 'opacity-100'}`}>
            <div className="p-4 sm:p-6">
              <LeadTable
                leads={data?.leads ?? []}
                onEdit={setEditLead}
                onView={setViewLead}
              />
            </div>
            {data?.meta && (
              <div className="px-4 sm:px-6 pb-5 border-t border-slate-200 dark:border-slate-800 pt-4">
                <Pagination
                  meta={data.meta}
                  onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Add New Lead">
        <LeadForm
          mode="create"
          onSubmit={handleCreate}
          onCancel={() => setCreateOpen(false)}
          loading={creating}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editLead} onClose={() => setEditLead(null)} title="Edit Lead">
        {editLead && (
          <LeadForm
            mode="edit"
            initialData={editLead}
            onSubmit={handleUpdate}
            onCancel={() => setEditLead(null)}
            loading={updating}
          />
        )}
      </Modal>

      {/* View Modal */}
      <LeadDetailModal lead={viewLead} onClose={() => setViewLead(null)} />
    </div>
  );
};
