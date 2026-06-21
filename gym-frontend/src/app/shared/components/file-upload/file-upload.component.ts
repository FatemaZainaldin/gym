import {
  Component, Input, forwardRef, signal, computed, ChangeDetectionStrategy, inject
} from '@angular/core';
import {
  ControlValueAccessor, NG_VALUE_ACCESSOR, NG_VALIDATORS,
  AbstractControl, ValidationErrors, Validator, ReactiveFormsModule
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

export interface UploadedFile {
  file: File;
  preview?: string;       // base64 for images
  url?: string;           // returned from server after upload
  progress: number;       // 0-100
  status: 'pending' | 'uploading' | 'done' | 'error';
  error?: string;
}

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './file-upload.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FileUploadComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => FileUploadComponent),
      multi: true,
    },
  ],
})
export class FileUploadComponent implements ControlValueAccessor, Validator {

  // ── Inputs ───────────────────────────────────────────────────────────────
  @Input() multiple = false;
  @Input() accept = 'image/*';
  @Input() maxSizeMb = 5;
  @Input() maxFiles = 5;
  @Input() uploadUrl = '';          // if provided, auto-uploads to this endpoint
  @Input() hints: string[] = [];
  @Input() showImageGrid = true;

  // ── State ────────────────────────────────────────────────────────────────
  files = signal<UploadedFile[]>([]);
  isDragging = signal(false);
  touched = false;

  private http = inject(HttpClient);
  private onChange: (v: any) => void = () => { };
  private onTouched: () => void = () => { };

  // ── Computed ─────────────────────────────────────────────────────────────
  doneCount = computed(() => this.files().filter(f => f.status === 'done').length);
  errorCount = computed(() => this.files().filter(f => f.status === 'error').length);
  uploadingCount = computed(() => this.files().filter(f => f.status === 'uploading').length);

  hasErrors = computed(() =>
    this.files().some(f => f.status === 'error')
  );

  errorMessage = computed(() => {
    const err = this.files().find(f => f.status === 'error');
    return err?.error ?? '';
  });

  get isImageMode() {
    return this.accept.includes('image');
  }

  get acceptLabel() {
    const map: Record<string, string> = {
      'image/*': 'PNG, JPG, SVG, WEBP',
      '.pdf,.doc,.docx': 'PDF, DOC, DOCX',
      'image/*,.pdf': 'Images, PDF',
      '*': 'Any file',
    };
    return map[this.accept] ?? this.accept;
  }

  // ── Drag events ──────────────────────────────────────────────────────────
  onDragOver(e: DragEvent) {
    e.preventDefault();
    this.isDragging.set(true);
  }

  onDragLeave() {
    this.isDragging.set(false);
  }

  onDrop(e: DragEvent) {
    e.preventDefault();
    this.isDragging.set(false);
    const files = Array.from(e.dataTransfer?.files ?? []);
    this.processFiles(files);
  }

  onFileSelected(e: Event) {
    const input = e.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    this.processFiles(files);
    input.value = '';
  }

  // ── Core ─────────────────────────────────────────────────────────────────
  processFiles(incoming: File[]) {
    this.markTouched();

    if (!this.multiple) {
      // Single — replace
      const file = incoming[0];
      if (!file) return;
      const entry = this.buildEntry(file);
      this.files.set([entry]);
      this.loadPreview(entry, 0);
      if (this.uploadUrl) this.upload(entry, 0);
      else this.emit();
      return;
    }

    // Multi — append up to maxFiles
    const current = this.files();
    const slots = this.maxFiles - current.length;
    if (slots <= 0) return;

    const toAdd = incoming.slice(0, slots).map(f => this.buildEntry(f));
    this.files.update(prev => [...prev, ...toAdd]);

    toAdd.forEach((entry, i) => {
      const idx = current.length + i;
      this.loadPreview(entry, idx);
      if (this.uploadUrl) this.upload(entry, idx);
    });

    if (!this.uploadUrl) this.emit();
  }

  private buildEntry(file: File): UploadedFile {
    const error = this.validate_file(file);
    return {
      file,
      progress: 0,
      status: error ? 'error' : 'pending',
      error,
    };
  }

  private validate_file(file: File): string | undefined {
    if (file.size > this.maxSizeMb * 1024 * 1024) {
      return `File too large (${this.formatSize(file.size)} — max ${this.maxSizeMb}MB)`;
    }
    if (this.accept && this.accept !== '*') {
      const types = this.accept.split(',').map(s => s.trim());
      const ok = types.some(t => {
        if (t.startsWith('.')) return file.name.toLowerCase().endsWith(t);
        if (t.endsWith('/*')) return file.type.startsWith(t.replace('/*', '/'));
        return file.type === t;
      });
      if (!ok) return `File type not allowed (${file.type || file.name})`;
    }
    return undefined;
  }

  private loadPreview(entry: UploadedFile, idx: number) {
    if (!entry.file.type.startsWith('image/') || entry.status === 'error') return;
    const reader = new FileReader();
    reader.onload = e => {
      this.files.update(prev => {
        const updated = [...prev];
        if (updated[idx]) updated[idx] = { ...updated[idx], preview: e.target?.result as string };
        return updated;
      });
    };
    reader.readAsDataURL(entry.file);
  }

  private upload(entry: UploadedFile, idx: number) {
    if (entry.status === 'error') return;

    const form = new FormData();
    form.append('file', entry.file);

    this.files.update(prev => {
      const updated = [...prev];
      if (updated[idx]) updated[idx] = { ...updated[idx], status: 'uploading', progress: 0 };
      return updated;
    });

    this.http.post<{ url: string }>(this.uploadUrl, form, {
      reportProgress: true,
      observe: 'events',
    }).subscribe({
      next: (event: any) => {
        if (event.type === 1 && event.total) {
          // Upload progress
          const progress = Math.round(100 * event.loaded / event.total);
          this.files.update(prev => {
            const updated = [...prev];
            if (updated[idx]) updated[idx] = { ...updated[idx], progress };
            return updated;
          });
        }
        if (event.type === 4) {
          // Response
          const url = event.body?.url ?? '';
          this.files.update(prev => {
            const updated = [...prev];
            if (updated[idx]) updated[idx] = { ...updated[idx], status: 'done', progress: 100, url };
            return updated;
          });
          this.emit();
        }
      },
      error: (err) => {
        this.files.update(prev => {
          const updated = [...prev];
          if (updated[idx]) updated[idx] = { ...updated[idx], status: 'error', error: err?.error?.message ?? 'Upload failed' };
          return updated;
        });
      }
    });
  }

  removeFile(idx: number, e: Event) {
    e.stopPropagation();
    this.files.update(prev => prev.filter((_, i) => i !== idx));
    this.emit();
  }

  clearAll() {
    this.files.set([]);
    this.emit();
  }

  private emit() {
    const done = this.files().filter(f => f.status === 'done' || (!this.uploadUrl && f.status === 'pending'));
    if (!this.multiple) {
      const f = done[0];
      this.onChange(this.uploadUrl ? (f?.url ?? null) : (f?.file ?? null));
    } else {
      this.onChange(this.uploadUrl
        ? done.map(f => f.url).filter(Boolean)
        : done.map(f => f.file)
      );
    }
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  formatSize(bytes: number): string {
    if (bytes < 1024) return bytes + 'B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + 'KB';
    return (bytes / 1048576).toFixed(1) + 'MB';
  }

  private markTouched() {
    if (!this.touched) {
      this.touched = true;
      this.onTouched();
    }
  }

  // ── ControlValueAccessor ──────────────────────────────────────────────────
  writeValue(v: any): void {
    // Accept pre-loaded URL string (e.g. edit mode)
    if (!v) { this.files.set([]); return; }
    if (typeof v === 'string') {
      // Already uploaded URL — show as done
      this.files.set([{ file: new File([], v.split('/').pop() ?? 'file'), url: v, progress: 100, status: 'done' }]);
    }
  }

  registerOnChange(fn: any) { this.onChange = fn; }
  registerOnTouched(fn: any) { this.onTouched = fn; }
  setDisabledState(disabled: boolean) { }

  // ── Validator ─────────────────────────────────────────────────────────────
  validate(control: AbstractControl): ValidationErrors | null {
    if (this.hasErrors()) return { fileUpload: this.errorMessage() };
    return null;
  }
}