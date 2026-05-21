// src/app/core/toast/toast.model.ts
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id:       string;
  type:     ToastType;
  message:  string;
  duration: number;   // ms; 0 = persist until dismissed
}