import { blocks } from '../content'

export default function Sidebar({ current, progress, onNavigate }) {
  return (
    <nav className="thin-scroll h-full overflow-y-auto px-3 py-5 font-mono text-[13px]">
      <a href="#" onClick={onNavigate} className="mb-5 flex items-center gap-2 px-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-sm font-bold text-accent-fg">{'{}'}</span>
        <span className="font-display text-lg font-extrabold tracking-tight text-fg">Aprende PSP</span>
      </a>
      {blocks.map((b) => {
        const done = b.lessons.filter((l) => progress.done[l.id]).length
        const active = b.lessons.some((l) => l.id === current)
        return (
          <div key={b.id} className="mb-4">
            <div className={`mb-1 flex items-center gap-2 px-2 text-[11px] font-bold uppercase tracking-wider ${active ? 'text-accent' : 'text-muted'}`}>
              <span className={`rounded px-1.5 py-0.5 ${active ? 'bg-accent text-accent-fg' : 'bg-surface'}`}>{b.num}</span>
              <span className="flex-1 truncate">{b.title}</span>
              <span className="text-faint">{done}/{b.lessons.length}</span>
            </div>
            <ul>
              {b.lessons.map((l) => {
                const isCur = l.id === current
                const isDone = progress.done[l.id]
                return (
                  <li key={l.id}>
                    <a
                      href={`#${l.id}`}
                      onClick={onNavigate}
                      className={`flex items-start gap-2 rounded-md px-2 py-1.5 leading-snug ${isCur ? 'bg-accent-soft font-semibold text-accent' : 'text-fg hover:bg-surface'}`}
                    >
                      <span className={`mt-[3px] flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border text-[9px] ${isDone ? 'border-ok bg-ok text-white' : 'border-line-strong'}`}>
                        {isDone ? '✓' : ''}
                      </span>
                      <span className={`flex-1 ${l.exam ? 'text-accent' : ''}`}>{l.exam ? '★ ' : ''}{l.title}</span>
                      <span className="shrink-0 text-[11px] text-faint">{l.minutes}′</span>
                    </a>
                  </li>
                )
              })}
            </ul>
          </div>
        )
      })}
    </nav>
  )
}
