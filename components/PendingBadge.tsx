export default function PendingBadge({ count }: { count: number }) {
  if (count <= 0) return null;

  return (
    <span className="absolute -right-1.5 -top-1.5 inline-flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full bg-neg px-1 font-mono text-[10px] font-bold text-white ring-2 ring-paper-2">
      {count > 99 ? '99+' : count}
    </span>
  );
}
