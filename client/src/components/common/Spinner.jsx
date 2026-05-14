export default function Spinner({ size = 'md', className = '' }) {
  const sizes = { xs: 'w-3 h-3 border', sm: 'w-4 h-4 border', md: 'w-7 h-7 border-2', lg: 'w-10 h-10 border-2', xl: 'w-14 h-14 border-[3px]' };
  return (
    <span className={`inline-block ${sizes[size]} border-surface-200 border-t-primary-600 rounded-full animate-spin ${className}`} />
  );
}

export function PageSpinner({ label = 'Loading…' }) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <Spinner size="xl" />
      <p className="text-sm text-ink-muted font-medium">{label}</p>
    </div>
  );
}

export function Overlay() {
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <Spinner size="xl" />
    </div>
  );
}
