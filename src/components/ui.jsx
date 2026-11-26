// Piezas de contenido reutilizables para las lecciones

export const C = ({ children }) => <code className="ic">{children}</code>
export const Mk = ({ children }) => <mark className="mk bg-transparent text-inherit">{children}</mark>

export function Section({ n, title, children, id }) {
  return (
    <section id={id} className="mt-12 scroll-mt-20 first:mt-6">
      <h2 className="mb-3 flex items-center gap-3 font-display text-2xl font-extrabold tracking-tight">
        {n && <span className="rounded-md bg-accent px-2 py-0.5 font-mono text-xs font-bold text-accent-fg">{String(n).padStart(2, '0')}</span>}
        {title}
      </h2>
      {children}
    </section>
  )
}

const CALLOUTS = {
  tip: { label: 'Clave', cls: 'border-info bg-info-soft', head: 'text-info' },
  warn: { label: 'Cuidado', cls: 'border-ko bg-ko-soft', head: 'text-ko' },
  exam: { label: 'Para escribir en el examen', cls: 'border-ok bg-ok-soft', head: 'text-ok' },
  book: { label: '100 cosas · buenas prácticas', cls: 'border-accent bg-accent-soft', head: 'text-accent' },
  trap: { label: 'Variante trampa', cls: 'border-ko bg-ko-soft', head: 'text-ko' },
}

export function Callout({ type = 'tip', title, children }) {
  const c = CALLOUTS[type]
  return (
    <div className={`my-5 rounded-r-lg border-l-4 px-4 py-3 ${c.cls}`}>
      <div className={`mb-1 font-mono text-[11px] font-bold uppercase tracking-wider ${c.head}`}>{title || c.label}</div>
      <div className="[&>p]:my-1.5 [&>ul]:my-1.5">{children}</div>
    </div>
  )
}

// Respuesta modelo: el texto que conviene escribir en el folio
export function Model({ children }) {
  return (
    <div className="my-4 rounded-lg border border-ok/40 bg-ok-soft px-4 py-3">
      <div className="mb-1 font-mono text-[11px] font-bold uppercase tracking-wider text-ok">Respuesta modelo</div>
      <div className="[&>p]:my-1.5 [&>ul]:my-1.5 [&>ol]:my-1.5">{children}</div>
    </div>
  )
}

// Tabla de intercalado de hilos: rows = [[paso, h1, h2, valor]]
export function Trace({ head, rows, bad = [] }) {
  return (
    <div className="thin-scroll my-5 overflow-x-auto">
      <table className="w-full border-collapse font-mono text-[13px]">
        <thead>
          <tr>{head.map((h) => <th key={h} className="border border-line-strong bg-surface px-2 py-1.5 text-left">{h}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className={bad.includes(i) ? 'bg-ko-soft' : ''}>
              {r.map((cell, j) => <td key={j} className="border border-line-strong px-2 py-1.5">{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function Pill({ children, color = 'var(--accent)' }) {
  return <span className="inline-block rounded-full border px-2 py-0.5 font-mono text-[11px] font-semibold" style={{ borderColor: color, color }}>{children}</span>
}
