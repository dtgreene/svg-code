import { cn } from 'src/lib/utils';

export const SidebarSection = ({ label, className, children }) => (
  <div className={cn('even:bg-background px-4 py-8', className)}>
    {label && <div className="mb-6 text-lg last:mb-0">{label}</div>}
    {children && <div className="flex flex-col gap-4">{children}</div>}
  </div>
);
