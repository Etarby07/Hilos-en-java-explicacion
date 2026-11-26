import { useState } from 'react'
import { Callout, Section, C } from '../components/ui'

const VIDEO = 'LJ_HY0AKZnM'

// Dentro de un iframe (p. ej. al compartirla en claude.ai) los vídeos incrustados están bloqueados:
// ahí solo se muestran los enlaces a YouTube.
const canEmbed = (() => { try { return window.self === window.top } catch { return false } })()

const CLIPS = [
  {
    from: '3:02:35', to: '3:11:30', start: 10955, end: 11490, dur: '≈ 9 min',
    title: 'Lectures 55, 56 y 57: fundamentos de hilos',
    take: [
      'Qué es un hilo y en qué se diferencia de un proceso (los hilos comparten la memoria del proceso).',
      'Que start() crea un hilo nuevo y que run() llamado a mano NO lo crea.',
      'Que el orden de ejecución lo decide el planificador: no es determinista.',
    ],
    must: true,
  },
  {
    from: '3:23:55', to: '3:26:45', start: 12235, end: 12405, dur: '≈ 3 min',
    title: 'El caso real del contador (condición de carrera)',
    take: [
      'Fíjate en que el resultado sale MENOR de lo esperado y cambia en cada ejecución.',
      'Es exactamente el Ejercicio1_ContadorSinSync del PDF: contador++ no es atómico.',
    ],
  },
]

function Clip({ c }) {
  const [open, setOpen] = useState(false)
  const link = `https://youtu.be/${VIDEO}?t=${c.start}`
  return (
    <div className="rounded-2xl border border-line bg-elevated p-5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-md bg-accent px-2 py-0.5 font-mono text-xs font-bold text-accent-fg">{c.from} – {c.to}</span>
        <span className="font-mono text-xs text-muted">{c.dur}</span>
        {c.must && <span className="rounded-md border border-ko px-2 py-0.5 font-mono text-[11px] font-bold text-ko">IMPRESCINDIBLE</span>}
      </div>
      <h3 className="mt-3 font-display text-xl font-extrabold">{c.title}</h3>
      <div className="mt-2 text-sm font-semibold text-muted">Qué tienes que sacar de aquí:</div>
      <ul className="mt-1 list-disc space-y-1 pl-5 text-[15px]">
        {c.take.map((t) => <li key={t}>{t}</li>)}
      </ul>
      <div className="mt-4 flex flex-wrap gap-2">
        <a href={link} target="_blank" rel="noreferrer" className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-fg no-underline">
          ▶ Abrir en YouTube en {c.from}
        </a>
        {canEmbed && (
          <button onClick={() => setOpen(!open)} className="rounded-lg border border-line-strong bg-surface px-4 py-2 text-sm font-semibold">
            {open ? 'Ocultar vídeo' : 'Ver aquí (solo este tramo)'}
          </button>
        )}
      </div>
      {open && (
        <div className="mt-4 aspect-video overflow-hidden rounded-xl border border-line">
          <iframe
            className="h-full w-full"
            src={`https://www.youtube-nocookie.com/embed/${VIDEO}?start=${c.start}&end=${c.end}&rel=0`}
            title={c.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}
    </div>
  )
}

export function Calentamiento() {
  return (
    <>
      <p>
        Antes de leer código, son <strong>12 minutos de vídeo</strong> que te dan la imagen mental de lo que vas a analizar.
        La ruta rápida tiene dos tramos. Velocidad recomendada: <C>1.25x</C>.
      </p>
      <Section n={1} title="Ruta rápida (~12 min)">
        <div className="not-prose grid gap-4">
          {CLIPS.map((c) => <Clip key={c.start} c={c} />)}
        </div>
      </Section>
      <Callout type="tip" title="Si no tienes tiempo">
        <p>
          Salta el vídeo. Todo lo que explica está en el Bloque 1, con el código del PDF.
          Pero el segundo tramo (3 min) merece la pena: <strong>ver</strong> cómo falla el contador se te queda mejor que leerlo.
        </p>
      </Callout>
      <Section n={2} title="Cómo usar esta web">
        <ul>
          <li><strong>Bloque 1 (≈ 80% del examen):</strong> condiciones de carrera, <C>synchronized</C>, <C>lock</C> y <C>Semaphore</C>.</li>
          <li><strong>Bloque 2:</strong> <C>wait</C> / <C>notify</C> / <C>notifyAll</C> y los fallos típicos del PDF, uno a uno. Incluye un simulador del monitor.</li>
          <li><strong>Bloque 3 (≈ 20%):</strong> sockets TCP, <C>flush()</C>, SHA-256 y los bugs escondidos en <C>Cliente</C> y <C>Server</C>.</li>
          <li><strong>Bloque 4:</strong> checklist para tener delante del folio, y <strong>simulacro de examen</strong>.</li>
        </ul>
        <p>
          Cada lección acaba con ejercicios en formato examen. Escribe tu respuesta <em>antes</em> de mirar la respuesta modelo,
          que está redactada con el vocabulario que espera el profesor.
        </p>
      </Section>
    </>
  )
}
