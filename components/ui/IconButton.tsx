interface IconButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  title: string;
  className?: string;
  disabled?: boolean;
}

export function IconButton({
  onClick,
  children,
  title,
  className = "",
  disabled = false,
}: IconButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={`p-1.5 rounded text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-zinc-500 ${className}`}
    >
      {children}
    </button>
  );
}
