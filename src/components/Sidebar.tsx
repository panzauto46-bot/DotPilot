import {
  LayoutDashboard,
  Bot,
  Compass,
  Vault,
  PieChart,
  ChevronLeft,
  ChevronRight,
  Lock,
} from 'lucide-react';
import { Page } from '../types';
import { cn } from '../utils/cn';

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  collapsed: boolean;
  onToggle: () => void;
  walletConnected: boolean;
}

const navItems: { page: Page; label: string; icon: React.ReactNode }[] = [
  { page: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { page: 'assistant', label: 'AI Assistant', icon: <Bot size={20} /> },
  { page: 'strategies', label: 'Strategies', icon: <Compass size={20} /> },
  { page: 'vault', label: 'Vault', icon: <Vault size={20} /> },
  { page: 'portfolio', label: 'Portfolio', icon: <PieChart size={20} /> },
];

const lockedPages: Page[] = ['assistant', 'strategies', 'vault', 'portfolio'];

export function Sidebar({
  currentPage,
  onNavigate,
  collapsed,
  onToggle,
  walletConnected,
}: SidebarProps) {
  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-full bg-surface-800 border-r border-surface-600 z-40 flex flex-col transition-all duration-300',
        collapsed ? 'w-16' : 'w-56'
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 h-16 border-b border-surface-600 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-dot-pink to-dot-purple flex items-center justify-center text-white font-bold text-sm shrink-0">
          D
        </div>
        {!collapsed && (
          <div className="animate-fade-in">
            <span className="text-white font-bold text-lg">Dot</span>
            <span className="text-dot-pink font-bold text-lg">Pilot</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1">
        {navItems.map(({ page, label, icon }) => {
          const isLocked = !walletConnected && lockedPages.includes(page);
          const isActive = currentPage === page;

          return (
            <button
              key={page}
              onClick={() => onNavigate(page)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group',
                isActive
                  ? 'bg-dot-pink/15 text-dot-pink'
                  : isLocked
                    ? 'text-surface-400 hover:bg-surface-700/70'
                    : 'text-surface-200 hover:bg-surface-700 hover:text-white'
              )}
              title={
                collapsed
                  ? isLocked
                    ? `${label} - connect wallet to unlock`
                    : label
                  : undefined
              }
            >
              <span
                className={cn(
                  'shrink-0 transition-colors',
                  isActive
                    ? 'text-dot-pink'
                    : isLocked
                      ? 'text-surface-400'
                      : 'text-surface-300 group-hover:text-white'
                )}
              >
                {icon}
              </span>
              {!collapsed && (
                <span className="text-sm font-medium truncate animate-fade-in">{label}</span>
              )}
              {!collapsed && isLocked && (
                <span className="ml-auto inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.18em] text-surface-400">
                  <Lock size={10} />
                  Locked
                </span>
              )}
              {isActive && !collapsed && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-dot-pink animate-fade-in" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Collapse button */}
      <div className="px-2 pb-4">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-surface-300 hover:text-white hover:bg-surface-700 transition-colors"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          {!collapsed && <span className="text-xs">Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
