import React from 'react';
import { Calendar, Mail, Tag, Globe } from 'lucide-react';
import { Lead } from '../../types';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { STATUS_COLORS, SOURCE_COLORS, formatDate, getInitials } from '../../utils';

interface LeadDetailModalProps {
  lead: Lead | null;
  onClose: () => void;
}

export const LeadDetailModal: React.FC<LeadDetailModalProps> = ({ lead, onClose }) => {
  if (!lead) return null;

  return (
    <Modal isOpen={!!lead} onClose={onClose} title="Lead Details" size="md">
      <div className="space-y-5">
        {/* Avatar + name */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-700 dark:text-brand-400 text-xl font-bold">
            {getInitials(lead.name)}
          </div>
          <div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{lead.name}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
              <Mail className="w-4 h-4" /> {lead.email}
            </p>
          </div>
        </div>

        {/* Badges */}
        <div className="flex gap-2">
          <Badge className={STATUS_COLORS[lead.status]}>{lead.status}</Badge>
          <Badge className={SOURCE_COLORS[lead.source]}>{lead.source}</Badge>
        </div>

        {/* Details */}
        <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mb-1">
              <Tag className="w-3.5 h-3.5" /> Status
            </p>
            <p className="text-sm font-medium text-slate-900 dark:text-white">{lead.status}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mb-1">
              <Globe className="w-3.5 h-3.5" /> Source
            </p>
            <p className="text-sm font-medium text-slate-900 dark:text-white">{lead.source}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mb-1">
              <Calendar className="w-3.5 h-3.5" /> Created
            </p>
            <p className="text-sm font-medium text-slate-900 dark:text-white">
              {formatDate(lead.createdAt)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mb-1">
              <Calendar className="w-3.5 h-3.5" /> Updated
            </p>
            <p className="text-sm font-medium text-slate-900 dark:text-white">
              {formatDate(lead.updatedAt)}
            </p>
          </div>
        </div>

        {lead.notes && (
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Notes
            </p>
            <p className="text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 rounded-xl p-3 leading-relaxed">
              {lead.notes}
            </p>
          </div>
        )}

        {typeof lead.createdBy === 'object' && (
          <div className="text-xs text-slate-400 dark:text-slate-500 border-t border-slate-200 dark:border-slate-700 pt-3">
            Created by{' '}
            <span className="font-medium text-slate-600 dark:text-slate-300">
              {lead.createdBy.name}
            </span>
          </div>
        )}
      </div>
    </Modal>
  );
};
