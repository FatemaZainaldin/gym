export type ConfirmActionType = 'delete' | 'deactivate' | 'suspend' | 'activate' | 'custom';

export interface ConfirmDialogData {
    // --- Core ---
    action: ConfirmActionType;
    itemName?: string;               // e.g. "John Doe" → "Are you sure you want to delete John Doe?"

    // --- Overrides (optional — auto-populated from action if omitted) ---
    title?: string;
    message?: string;
    confirmLabel?: string;

    // --- Reason field ---
    showReason?: boolean;            // show the textarea
    reasonRequired?: boolean;        // make it required
    reasonLabel?: string;            // default: 'Reason'
    reasonPlaceholder?: string;

    // --- Acknowledge checkbox ---
    requireAcknowledge?: boolean;    // show "I understand" checkbox — for irreversible actions
    acknowledgeLabel?: string;       // default: 'I understand this action cannot be undone'
}

export interface ConfirmDialogResult {
    confirmed: boolean;
    reason?: string;
}