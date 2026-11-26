import { blocks, totalExercises, totalMinutes, examQuestions } from '../content'

export default function Home({ progress }) {
  const first = blocks[0].lessons[0].id
  const lessonMinutes = totalMinutes - 12 - 15 // sin vídeo ni simulacro
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-8">
      <span className="rounded-md bg-accent-soft px-2 py-1 font-mono text-xs font-bold text-accent">Programación de Servicios y Procesos · Java</span>
      <h1 className="mt-4 font-display text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
        Hilos, monitores y sockets<br />para sacar un 10 en papel.
      </h1>
      <p className="mt-4 text-lg text-muted">
        Todo el código que ha visto la clase, explicado línea a línea: <strong className="text-fg">qué hace, cómo funciona por dentro y por qué falla</strong>.
        Con ejercicios en formato examen, un simulador del monitor y respuestas modelo listas para escribir en el folio.
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <a href={`#${first}`} className="rounded-lg bg-accent px-5 py-2.5 font-semibold text-accent-fg">Empezar →</a>
        <a href="#guia" className="rounded-lg border border-line-strong bg-elevated px-5 py-2.5 font-semibold">Checklist del examen</a>
        <a href="#simulacro" className="rounded-lg border border-line-strong bg-elevated px-5 py-2.5 font-semibold">★ Simulacro</a>
      </div>

      <div className="mt-8 grid grid-cols-3 gap-3 font-mono">
        {[[`~${lessonMinutes}′`, 'de lecciones (+12′ vídeo, +15′ simulacro)'], [totalExercises, 'ejercicios'], [examQuestions.length, 'preguntas de simulacro']].map(([n, l]) => (
          <div key={l} className="rounded-xl border border-line bg-elevated p-4">
            <div className="text-2xl font-bold text-accent">{n}</div>
            <div className="text-xs text-muted">{l}</div>
          </div>
        ))}
      </div>

      <h2 className="mt-12 font-display text-2xl font-extrabold">Ruta</h2>
      <div className="mt-4 space-y-3">
        {blocks.map((b) => {
          const mins = b.lessons.reduce((s, l) => s + l.minutes, 0)
          const done = b.lessons.filter((l) => progress.done[l.id]).length
          return (
            <a key={b.id} href={`#${b.lessons[0].id}`} className="flex items-center gap-4 rounded-xl border border-line bg-elevated p-4 transition hover:border-accent">
              <span className="rounded-md bg-accent px-2 py-1 font-mono text-sm font-bold text-accent-fg">{b.num}</span>
              <div className="flex-1">
                <div className="font-semibold">{b.title}</div>
                <div className="font-mono text-xs text-muted">{b.lessons.length} lecciones · {mins} min{b.weight ? ` · ${b.weight}` : ''}</div>
              </div>
              <span className="font-mono text-xs text-faint">{done}/{b.lessons.length}</span>
            </a>
          )
        })}
      </div>

      <p className="mt-10 text-sm text-faint">
        El progreso se guarda solo en este navegador. Fuentes: el código de clase (PSP.pdf) y criterios de calidad del libro «100 cosas que todo programador debería saber».
      </p>
    </div>
  )
}
