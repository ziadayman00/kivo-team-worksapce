import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Check, ChevronDown, Plus } from 'lucide-react';

export interface WorkspaceItem {
  id: string;
  name: string;
  slug: string;
  role: string;
}

interface WorkspaceSwitcherProps {
  currentWorkspaceSlug?: string;
  accessibleWorkspaces: WorkspaceItem[];
  currentRole?: string;
}

export function WorkspaceSwitcher({
  currentWorkspaceSlug,
  accessibleWorkspaces,
  currentRole,
}: WorkspaceSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const currentWorkspace = accessibleWorkspaces.find((w) => w.slug === currentWorkspaceSlug);
  const displayName = currentWorkspace?.name ?? 'Select Workspace';
  const displayRole = currentRole ?? currentWorkspace?.role;

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (slug: string) => {
    setIsOpen(false);
    if (slug !== currentWorkspaceSlug) {
      navigate(`/workspaces/${encodeURIComponent(slug)}`);
    }
  };

  const getRoleBadgeClass = (role?: string) => {
    switch (role) {
      case 'OWNER':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/30';
      case 'ADMIN':
        return 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30';
      default:
        return 'bg-zinc-800 text-zinc-400 border border-zinc-700';
    }
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Switcher Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Switch workspace"
        className="flex items-center gap-2.5 rounded-xl border border-white/[0.08] bg-zinc-900/80 px-3 py-1.5 text-xs text-white transition hover:border-white/[0.2] hover:bg-zinc-800/80 focus:outline-none focus:ring-1 focus:ring-emerald-500"
      >
        <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/20 border border-emerald-500/30 font-bold text-emerald-300 text-[11px] font-mono">
          {displayName.charAt(0).toUpperCase()}
        </div>

        <div className="flex items-center gap-2">
          <span className="font-semibold text-zinc-100 max-w-[140px] sm:max-w-[180px] truncate">
            {displayName}
          </span>

          {displayRole && (
            <span
              className={`rounded px-1.5 py-0.5 text-[10px] font-mono font-medium ${getRoleBadgeClass(
                displayRole,
              )}`}
            >
              {displayRole}
            </span>
          )}
        </div>

        <ChevronDown
          className={`h-3.5 w-3.5 text-zinc-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          className="absolute left-0 mt-2 w-72 origin-top-left rounded-xl border border-white/[0.1] bg-[#0c0d13] p-1.5 shadow-2xl backdrop-blur-xl z-50 animate-fadeIn"
        >
          {/* Header */}
          <div className="px-3 py-2 text-[10px] font-mono text-zinc-500 uppercase tracking-wider flex items-center justify-between border-b border-white/[0.06] mb-1">
            <span>Accessible Workspaces</span>
            <span className="text-emerald-400 font-semibold">{accessibleWorkspaces.length}</span>
          </div>

          {/* List of accessible workspaces */}
          <div className="max-h-60 overflow-y-auto space-y-1">
            {accessibleWorkspaces.map((ws) => {
              const isActive = ws.slug === currentWorkspaceSlug;
              return (
                <button
                  key={ws.id}
                  type="button"
                  role="menuitem"
                  onClick={() => handleSelect(ws.slug)}
                  className={`w-full flex items-center justify-between rounded-lg px-3 py-2 text-left text-xs transition ${
                    isActive
                      ? 'bg-emerald-500/10 text-emerald-300 font-semibold border border-emerald-500/20'
                      : 'text-zinc-300 hover:bg-zinc-800/60 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <div className="flex h-5 w-5 items-center justify-center rounded bg-zinc-800 text-[10px] font-mono font-bold text-zinc-300">
                      {ws.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="truncate">
                      <div className="truncate font-medium">{ws.name}</div>
                      <div className="text-[10px] font-mono text-zinc-500 truncate">/{ws.slug}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                    <span
                      className={`rounded px-1.5 py-0.5 text-[9px] font-mono ${getRoleBadgeClass(
                        ws.role,
                      )}`}
                    >
                      {ws.role}
                    </span>
                    {isActive && <Check className="h-3.5 w-3.5 text-emerald-400" />}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer Action: Create New Workspace */}
          <div className="mt-1 pt-1 border-t border-white/[0.06]">
            <Link
              to="/create-workspace"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-mono text-emerald-400 hover:bg-emerald-500/10 transition"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create New Workspace</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
