import { useState } from 'react'
import CodeBlock from './CodeBlock'
import { Model } from './ui'

const RESULT_LABEL = { ok: 'Bien', partial: 'A medias', ko: 'Fallo' }
const RESULT_CLS = { ok: 'bg-ok text-white', partial: 'bg-amber-500 text-black', ko: 'bg-ko text-white' }

function Choice({ ex, result, onResult }) {
  const [picked, setPicked] = useState(null)
  const answered = picked !== null
  return (
    <div>
      <div className="space-y-2">
        {ex.options.map((o, i) => {
          const state = !answered ? 'border-line-strong bg-elevated hover:border-accent'
            : o.ok ? 'border-2 border-ok bg-ok-soft'
            : i === picked ? 'border-2 border-ko bg-ko-soft'
            : 'border-line-strong bg-elevated opacity-60'
          return (
            <button
              key={i}
              disabled={answered}
              onClick={() => { setPicked(i); onResult(o.ok ? 'ok' : 'ko') }}
              className={`block w-full rounded-lg border px-4 py-2.5 text-left transition disabled:cursor-default ${state}`}
            >
              <span className="mr-2 font-mono text-xs font-bold text-faint">{String.fromCharCode(65 + i)}</span>
              {o.t}
              {answered && (o.ok || i === picked) && o.why && <div className="mt-1 text-sm text-muted">{o.why}</div>}
            </button>
          )
        })}
      </div>
      {answered && (
        <>
          <Model>{ex.model}</Model>
          <button onClick={() => setPicked(null)} className="text-sm text-muted underline">Reintentar</button>
        </>
      )}
      {!answered && result && <p className="mt-3 text-sm text-faint">Ya lo respondiste antes ({RESULT_LABEL[result]}).</p>}
    </div>
  )
}

function Write({ ex, result, onResult }) {
  const [text, setText] = useState('')
  const [shown, setShown] = useState(false)
  return (
    <div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={4}
        placeholder="Escribe aquí tu respuesta como si fuera el folio del examen…"
        className="w-full rounded-lg border border-line-strong bg-elevated p-3 font-sans text-[15px] outline-none focus:border-accent"
      />
      {!shown ? (
        <button onClick={() => setShown(true)} className="mt-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-fg">
          Ver respuesta modelo
        </button>
      ) : (
        <>
          <Model>{ex.model}</Model>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-muted">¿Cómo te ha salido?</span>
            {['ok', 'partial', 'ko'].map((r) => (
              <button key={r} onClick={() => onResult(r)}
                className={`rounded-md border border-line-strong px-3 py-1 ${result === r ? RESULT_CLS[r] : 'bg-elevated'}`}>
                {RESULT_LABEL[r]}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export function Exercise({ ex, result, onResult, index }) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-wider text-accent">
        {ex.kind === 'choice' ? 'Predice / diagnostica' : 'Redacta como en el examen'}
        {index != null && <span className="text-faint">· {index}</span>}
      </div>
      <div className="prose-psp [&>p:first-child]:mt-0">{ex.prompt}</div>
      {ex.code && <CodeBlock code={ex.code} title={ex.file} {...(ex.codeProps || {})} />}
      {ex.kind === 'choice'
        ? <Choice ex={ex} result={result} onResult={onResult} />
        : <Write ex={ex} result={result} onResult={onResult} />}
    </div>
  )
}

// Bloque de ejercicios con pestañas, al final de cada lección (estilo aprenderust)
export default function Exercises({ items, progress, setEx }) {
  const [tab, setTab] = useState(0)
  if (!items?.length) return null
  const ex = items[tab]
  return (
    <section id="ejercicios" className="mt-14 scroll-mt-20 rounded-2xl border border-line bg-surface p-5 sm:p-6">
      <h2 className="mb-4 font-display text-2xl font-extrabold">Ejercicios</h2>
      <div role="tablist" className="mb-5 flex flex-wrap gap-2">
        {items.map((it, i) => {
          const r = progress.ex[it.id]
          return (
            <button key={it.id} role="tab" aria-selected={tab === i} onClick={() => setTab(i)}
              className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-semibold ${tab === i ? 'border-accent bg-accent text-accent-fg' : 'border-line-strong bg-elevated'}`}>
              Ejercicio {i + 1}
              {r && <span className={`h-2 w-2 rounded-full ${r === 'ok' ? 'bg-ok' : r === 'partial' ? 'bg-amber-500' : 'bg-ko'}`} />}
            </button>
          )
        })}
      </div>
      <Exercise key={ex.id} ex={ex} result={progress.ex[ex.id]} onResult={(r) => setEx(ex.id, r)} />
    </section>
  )
}
