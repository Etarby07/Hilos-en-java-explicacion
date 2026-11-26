import { useEffect, useState } from 'react'
import { Exercise } from './Exercises'
import { examQuestions } from '../content'

const POINTS = { ok: 1, partial: 0.5, ko: 0 }

export default function ExamPage({ progress, setExam }) {
  const [start] = useState(() => Date.now())
  const [now, setNow] = useState(Date.now())
  const [round, setRound] = useState(0) // para reiniciar los textos al repetir

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  const answered = examQuestions.filter((q) => progress.exam[q.id])
  const score = answered.reduce((s, q) => s + POINTS[progress.exam[q.id]], 0)
  const grade = (score / examQuestions.length) * 10
  const secs = Math.floor((now - start) / 1000)
  const mmss = `${String(Math.floor(secs / 60)).padStart(2, '0')}:${String(secs % 60).padStart(2, '0')}`

  const restart = () => {
    examQuestions.forEach((q) => setExam(q.id, undefined))
    setRound((r) => r + 1)
    window.scrollTo({ top: 0 })
  }

  return (
    <>
      <div className="sticky top-14 z-10 -mx-4 mb-6 flex flex-wrap items-center gap-3 border-b border-line bg-bg/95 px-4 py-3 font-mono text-sm backdrop-blur sm:-mx-8 sm:px-8">
        <span>⏱ {mmss} <span className="text-faint">/ ~25:00</span></span>
        <span className="text-muted">Respondidas {answered.length}/{examQuestions.length}</span>
        <span className="ml-auto font-bold text-accent">Nota provisional: {grade.toFixed(1)}</span>
      </div>

      <p className="prose-psp">
        Diez preguntas <strong>nuevas</strong> (variantes que no han salido en las lecciones). Para las de redactar, escribe la respuesta, compárala con la modelo y puntúate con honestidad:
        <strong> Bien = 1</strong>, <strong>A medias = 0,5</strong>, <strong>Fallo = 0</strong>.
      </p>

      <div className="mt-8 space-y-10">
        {examQuestions.map((q, i) => (
          <div key={`${q.id}-${round}`} className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
            <div className="mb-3 flex items-center gap-2">
              <span className="rounded-md bg-accent px-2 py-0.5 font-mono text-xs font-bold text-accent-fg">Pregunta {i + 1}</span>
              <span className="font-mono text-xs text-muted">{q.topic}</span>
            </div>
            <Exercise ex={q} result={progress.exam[q.id]} onResult={(r) => setExam(q.id, r)} />
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-2xl border-2 border-accent bg-accent-soft p-6 text-center">
        <div className="font-mono text-sm text-muted">Resultado ({answered.length}/{examQuestions.length} respondidas · {mmss})</div>
        <div className="mt-1 font-display text-5xl font-extrabold text-accent">{grade.toFixed(1)}</div>
        <p className="mt-2 text-[15px]">
          {answered.length < examQuestions.length ? 'Te quedan preguntas por responder.'
            : grade >= 9 ? 'Listo para el 10. Repasa solo la checklist antes de entrar.'
            : grade >= 7 ? 'Muy bien. Vuelve a las lecciones de las preguntas que fallaste.'
            : 'Repasa los bloques 1 y 2 con calma y repite el simulacro.'}
        </p>
        <button onClick={restart} className="mt-4 rounded-lg border border-line-strong bg-elevated px-4 py-2 text-sm font-semibold">Repetir simulacro</button>
      </div>
    </>
  )
}
