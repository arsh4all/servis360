'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ArrowRight } from 'lucide-react';
import { getSuggestions, getHighlightSegments, TOP_CATEGORIES, type SearchSuggestion } from '@/lib/search-mappings';
import { cn } from '@/lib/utils';

interface SmartSearchProps {
  placeholder?: string;
  className?: string;
  /** 'standalone' renders its own Search button.
   *  'embedded'   renders only the input+dropdown (parent owns the button). */
  variant?: 'standalone' | 'embedded';
  /** Called when the parent needs to know the current query value (embedded mode) */
  onQueryChange?: (q: string) => void;
  onSubmit?: (query: string) => void;
}

export function SmartSearch({
  placeholder = 'What do you need help with? (e.g. ironing, fixing a door)',
  className,
  variant = 'standalone',
  onQueryChange,
  onSubmit,
}: SmartSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [noMatch, setNoMatch] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Update suggestions as user types
  const handleChange = useCallback((val: string) => {
    setQuery(val);
    onQueryChange?.(val);
    setActiveIdx(-1);

    if (val.trim().length < 2) {
      setSuggestions([]);
      setNoMatch(false);
      setOpen(false);
      return;
    }

    const results = getSuggestions(val);
    setSuggestions(results);
    setNoMatch(results.length === 0);
    setOpen(true);
  }, [onQueryChange]);

  function navigate(href: string) {
    setOpen(false);
    router.push(href);
  }

  function handleSelect(s: SearchSuggestion) {
    setQuery(s.label);
    navigate(s.href);
  }

  function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    setOpen(false);

    if (activeIdx >= 0 && suggestions[activeIdx]) {
      handleSelect(suggestions[activeIdx]);
      return;
    }

    if (onSubmit) {
      onSubmit(query);
      return;
    }

    if (query.trim()) {
      const first = getSuggestions(query)[0];
      navigate(first ? first.href : `/services?q=${encodeURIComponent(query.trim())}`);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    const total = noMatch ? TOP_CATEGORIES.length : suggestions.length;
    if (!open || total === 0) {
      if (e.key === 'Enter') handleSubmit();
      return;
    }
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx((i) => Math.min(i + 1, total - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIdx((i) => Math.max(i - 1, -1)); }
    else if (e.key === 'Enter') { e.preventDefault(); handleSubmit(); }
    else if (e.key === 'Escape') { setOpen(false); setActiveIdx(-1); }
  }

  const dropdownItems: SearchSuggestion[] = noMatch ? TOP_CATEGORIES : suggestions;

  const input = (
    <input
      ref={inputRef}
      type="text"
      value={query}
      placeholder={placeholder}
      onChange={(e) => handleChange(e.target.value)}
      onKeyDown={handleKeyDown}
      onFocus={() => { if (query.trim().length >= 2) setOpen(true); }}
      className="flex-1 text-[#0F172A] placeholder:text-[#94A3B8] outline-none text-sm bg-transparent min-w-0"
      autoComplete="off"
    />
  );

  const dropdown = open && dropdownItems.length > 0 && (
    <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl border border-[#E2E8F0] shadow-xl overflow-hidden z-50 animate-fade-in">
      {noMatch && (
        <div className="px-4 pt-3 pb-2 border-b border-[#F1F5F9]">
          <p className="text-xs text-[#64748B]">No exact match — try browsing categories</p>
        </div>
      )}
      {dropdownItems.map((s, i) => (
        <button
          key={s.href + i}
          type="button"
          onMouseDown={(e) => { e.preventDefault(); handleSelect(s); }}
          onMouseEnter={() => setActiveIdx(i)}
          className={cn(
            'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors',
            i === activeIdx ? 'bg-[#FFFBEB]' : 'hover:bg-[#F8FAFC]',
            i < dropdownItems.length - 1 && 'border-b border-[#F1F5F9]'
          )}
        >
          <span className="text-lg shrink-0">{s.icon}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#0F172A] truncate">
              {getHighlightSegments(s.label, query).map((seg, j) => (
                <span key={j} className={seg.highlight ? 'text-[#FACC15] bg-[#FFFBEB] rounded' : ''}>
                  {seg.text}
                </span>
              ))}
            </p>
            <p className="text-xs text-[#64748B]">{s.category}</p>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-[#94A3B8] shrink-0" />
        </button>
      ))}
    </div>
  );

  if (variant === 'embedded') {
    return (
      <div ref={containerRef} className={cn('relative flex items-center gap-2 flex-1', className)}>
        <Search className="w-5 h-5 text-[#64748B] shrink-0" />
        {input}
        {dropdown}
      </div>
    );
  }

  // Standalone: full search bar with button
  return (
    <div ref={containerRef} className={cn('relative max-w-2xl', className)}>
      <form onSubmit={handleSubmit}>
        <div className="flex items-center bg-white border border-[#E2E8F0] rounded-2xl shadow-sm px-4 py-3 gap-3 focus-within:ring-2 focus-within:ring-[#FACC15] focus-within:border-transparent transition-all">
          <Search className="w-5 h-5 text-[#94A3B8] shrink-0" />
          {input}
          <button
            type="submit"
            className="shrink-0 bg-[#0F172A] text-white text-sm font-semibold px-5 py-2 rounded-xl hover:bg-[#1E293B] transition-colors"
          >
            Search
          </button>
        </div>
      </form>
      {dropdown}
    </div>
  );
}
