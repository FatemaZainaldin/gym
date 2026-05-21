// toast.service.ts
import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslocoService } from '@jsverse/transloco';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

@Injectable({ providedIn: 'root' })
export class ToastService {
    private snackBar = inject(MatSnackBar);
    private transloco = inject(TranslocoService);

    success(message: string) { this.open(message, 'success'); }
    error(message: string) { this.open(message, 'error'); }
    warning(message: string) { this.open(message, 'warning'); }
    info(message: string) { this.open(message, 'info'); }

    showMessage(message: { en: string; ar: string }, type: ToastType = 'success') {
        const lang = this.transloco.getActiveLang();
        this.open(lang === 'ar' ? message.ar : message.en, type);
    } 

    private open(message: string, type: ToastType) {
        this.snackBar.open(message, '✕', {
            duration: type === 'error' ? 0 : 4000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: [`${type}`],
        });
    }
}