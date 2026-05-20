import React, { useState } from 'react';
import { Edit2, Trash2, Eye, ChevronUp} from 'lucide-react';
import { Lead } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { STATUS_COLORS, SOURCE_COLORS, formatDate, getInitials } from '../../utils';
import { useDeleteLead } from '../../hooks/useLeads';
import { useAuthStore } from '../../store/authStore';

interface LeadTableProps {
  leads: Lead[];
  onEdit: (lead: Lead) => void;
  onView: (lead: Lead) => void;
}

export const LeadTable: React.FC<LeadTableProps> = ({ leads, onEdit, onView }) => {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { mutate: deleteLead, isPending } = useDeleteLead();
  const { user } = useAuthStore();

  const handleDelete = () => {
    if (deleteId) {
      deleteLead(deleteId, { onSuccess: () => setDeleteId(null) });
    }
  };

  if (leads.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
          <ChevronUp className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-slate-900 dark:text-white font-medium mb-1">No leads found</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Try adjusting your filters or create a new lead.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
              {['Lead', 'Status', 'Source', 'Created', 'Actions'].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {leads.map((lead) => (
              <tr
                key={lead._id}
                className="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-700 dark:text-brand-400 text-xs font-semibold flex-shrink-0">
                      {getInitials(lead.name)}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{lead.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{lead.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge className={STATUS_COLORS[lead.status]}>{lead.status}</Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge className={SOURCE_COLORS[lead.source]}>{lead.source}</Badge>
                </td>
                <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                  {formatDate(lead.createdAt)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" onClick={() => onView(lead)} icon={<Eye className="w-4 h-4" />} />
                    <Button variant="ghost" size="sm" onClick={() => onEdit(lead)} icon={<Edit2 className="w-4 h-4" />} />
                    {(user?.role === 'admin' ||
                      (typeof lead.createdBy === 'object' && lead.createdBy._id === user?.id)) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        onClick={() => setDeleteId(lead._id)}
                        icon={<Trash2 className="w-4 h-4" />}
                      />
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {leads.map((lead) => (
          <div key={lead._id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-700 dark:text-brand-400 text-sm font-semibold flex-shrink-0">
                  {getInitials(lead.name)}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-slate-900 dark:text-white truncate">{lead.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{lead.email}</p>
                </div>
              </div>
              <Badge className={STATUS_COLORS[lead.status]}>{lead.status}</Badge>
            </div>
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-2">
                <Badge className={SOURCE_COLORS[lead.source]}>{lead.source}</Badge>
                <span className="text-xs text-slate-400">{formatDate(lead.createdAt)}</span>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={() => onView(lead)} icon={<Eye className="w-4 h-4" />} />
                <Button variant="ghost" size="sm" onClick={() => onEdit(lead)} icon={<Edit2 className="w-4 h-4" />} />
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500"
                  onClick={() => setDeleteId(lead._id)}
                  icon={<Trash2 className="w-4 h-4" />}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Lead"
        message="Are you sure you want to delete this lead? This action cannot be undone."
        loading={isPending}
      />
    </>
  );
};
