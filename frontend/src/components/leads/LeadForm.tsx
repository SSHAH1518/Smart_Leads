import React, { useState } from 'react';
import { Lead, LeadFormData, LeadSource, LeadStatus } from '../../types';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { LEAD_SOURCES, LEAD_STATUSES } from '../../utils';

interface LeadFormProps {
  initialData?: Partial<Lead>;
  onSubmit: (data: LeadFormData) => void;
  onCancel: () => void;
  loading?: boolean;
  mode: 'create' | 'edit';
}

interface FormErrors {
  name?: string;
  email?: string;
  source?: string;
}

export const LeadForm: React.FC<LeadFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  loading,
  mode,
}) => {
  const [form, setForm] = useState<LeadFormData>({
    name: initialData?.name ?? '',
    email: initialData?.email ?? '',
    status: initialData?.status ?? 'New',
    source: initialData?.source ?? 'Website',
    notes: initialData?.notes ?? '',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const validate = (): boolean => {
    const errs: FormErrors = {};
    if (!form.name.trim() || form.name.length < 2) errs.name = 'Name must be at least 2 characters';
    if (!form.email.trim() || !/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Valid email required';
    if (!form.source) errs.source = 'Source is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) onSubmit(form);
  };

  const set = (key: keyof LeadFormData, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Full Name"
        value={form.name}
        onChange={(e) => set('name', e.target.value)}
        error={errors.name}
        placeholder="e.g. Rahul Sharma"
        required
      />
      <Input
        label="Email Address"
        type="email"
        value={form.email}
        onChange={(e) => set('email', e.target.value)}
        error={errors.email}
        placeholder="rahul@example.com"
        required
      />
      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Status"
          value={form.status}
          onChange={(e) => set('status', e.target.value as LeadStatus)}
          options={LEAD_STATUSES.map((s) => ({ value: s, label: s }))}
        />
        <Select
          label="Source"
          value={form.source}
          onChange={(e) => set('source', e.target.value as LeadSource)}
          options={LEAD_SOURCES.map((s) => ({ value: s, label: s }))}
          error={errors.source}
        />
      </div>
      <div className="space-y-1">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Notes <span className="text-slate-400 font-normal">(optional)</span>
        </label>
        <textarea
          value={form.notes}
          onChange={(e) => set('notes', e.target.value)}
          rows={3}
          maxLength={500}
          placeholder="Additional notes about this lead..."
          className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none transition-colors"
        />
        <p className="text-xs text-slate-400 text-right">{form.notes?.length ?? 0}/500</p>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          {mode === 'create' ? 'Create Lead' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
};
