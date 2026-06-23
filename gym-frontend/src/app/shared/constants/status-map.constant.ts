import { StatusConfig } from '@/app/shared/components/smart-table/smart-table.types';

export const STATUS_MAP: Record<string, StatusConfig> = {
  // ── Active / Enabled ──────────────────────────────
  active:   { label: 'Active',   classes: 'bg-green-100 text-green-700'   },
  enabled:  { label: 'Enabled',  classes: 'bg-green-100 text-green-700'   },

  // ── Inactive / Disabled ───────────────────────────
  inactive: { label: 'Inactive', classes: 'bg-gray-100 text-gray-500'     },
  disabled: { label: 'Disabled', classes: 'bg-gray-100 text-gray-500'     },

  // ── Pending / Trial ───────────────────────────────
  pending:  { label: 'Pending',  classes: 'bg-amber-100 text-amber-700'   },
  trial:    { label: 'Trial',    classes: 'bg-amber-100 text-amber-700'   },

  // ── Suspended / Blocked ───────────────────────────
  suspended: { label: 'Suspended', classes: 'bg-red-100 text-red-600'     },
  blocked:   { label: 'Blocked',   classes: 'bg-red-100 text-red-600'     },

  // ── Draft / Archived ──────────────────────────────
  draft:    { label: 'Draft',    classes: 'bg-slate-100 text-slate-500'   },
  archived: { label: 'Archived', classes: 'bg-slate-100 text-slate-500'   },

  // ── Expired ───────────────────────────────────────
  expired:  { label: 'Expired',  classes: 'bg-orange-100 text-orange-600' },

  // ── Approved / Rejected ───────────────────────────
  approved: { label: 'Approved', classes: 'bg-teal-100 text-teal-700'     },
  rejected: { label: 'Rejected', classes: 'bg-red-100 text-red-600'       },

  // ── Paid / Unpaid / Refunded ──────────────────────
  paid:     { label: 'Paid',     classes: 'bg-green-100 text-green-700'   },
  unpaid:   { label: 'Unpaid',   classes: 'bg-red-100 text-red-600'       },
  refunded: { label: 'Refunded', classes: 'bg-purple-100 text-purple-600' },
};