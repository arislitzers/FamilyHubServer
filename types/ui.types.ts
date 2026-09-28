export type Theme = 'light' | 'dark' | 'system';

export interface NavItem {
  label: string;
  href: string;
  icon: string;
}

export type ToastVariant = 'default' | 'success' | 'destructive' | 'warning';

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
}
