import { useEffect, useState } from 'react'
import Sidebar from './components/Sidebar'
import Home from './components/Home'
import ExamPage from './components/ExamPage'
import Exercises from './components/Exercises'
import { lessons } from './content'
import { useProgress, useTheme } from './progress'

function useRoute() {
  const read = () => window.location.hash.replace(/^#\/?/, '')
  const [route, setRoute] = useState(read)
  useEffect(() => {
    const on = () => { setRoute(read()); window.scrollTo({ top: 0 }) }
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  return route
}

function Lesson({ lesson, index, progress, markDone, setEx, setExam }) {
  const prev = lessons[index - 1]
  const next = lessons[index + 1]
  const Body = lesson.Body
  const done = progress.done[lesson.id]

  useEffect(() => { document.title = `${lesson.title} · Aprende PSP` }, [lesson])

  return (
    <article className="mx-auto max-w-3xl px-4 pb-24 pt-8 sm:px-8">
      <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
        <span className="rounded-md bg-accent-soft px-2 py-1 font-bold text-accent">Lección {index + 1} de {lessons.length}</span>
        <span className="text-muted">{lesson.block.num} · {lesson.block.title}</span>
      </div>
      <h1 className="mt-4 font-display text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">{lesson.title}</h1>
      <div className="mt-3 flex flex-wrap gap-2 font-mono text-xs text-muted">
        <span className="rounded border border-line px-2 py-1">⏱ {lesson.minutes} min</span>
        {!lesson.exam && lesson.exercises.length > 0 && (
          <a href="#ejercicios" onClick={(e) => { e.preventDefault(); document.getElementById('ejercicios')?.scrollIntoView() }}
            className="rounded border border-line px-2 py-1 hover:border-accent">✎ {lesson.exercises.length} ejercicios ↓</a>
        )}
      </div>

      <div className="prose-psp mt-6">
        {lesson.exam ? <ExamPage progress={progress} setExam={setExam} /> : <Body />}
      </div>

      {!lesson.exam && <Exercises items={lesson.exercises} progress={progress} setEx={setEx} />}

      <div className="mt-12 flex flex-col gap-3 border-t border-line pt-6 sm:flex-row sm:items-center">
        <button onClick={() => markDone(lesson.id, !done)}
          className={`rounded-lg border px-4 py-2 text-sm font-semibold ${done ? 'border-ok bg-ok-soft text-ok' : 'border-line-strong bg-elevated'}`}>
          {done ? '✓ Completada' : 'Marcar como completada'}
        </button>
        <div className="flex flex-1 gap-3 sm:justify-end">
          {prev && <a href={`#${prev.id}`} className="flex-1 rounded-lg border border-line-strong bg-elevated px-4 py-2 text-sm sm:flex-none">← {prev.title}</a>}
          {next && (
            <a href={`#${next.id}`} onClick={() => markDone(lesson.id, true)}
              className="flex-1 rounded-lg bg-accent px-4 py-2 text-right text-sm font-semibold text-accent-fg sm:flex-none">
              {next.title} →
            </a>
          )}
        </div>
      </div>
    </article>
  )
}

export default function App() {
  const route = useRoute()
  const { progress, markDone, setEx, setExam, reset } = useProgress()
  const [dark, setDark] = useTheme()
  const [menu, setMenu] = useState(false)
  const [armed, setArmed] = useState(false) // confirmación en dos clics (sin confirm())

  const index = lessons.findIndex((l) => l.id === route)
  const lesson = index >= 0 ? lessons[index] : null
  const doneCount = lessons.filter((l) => progress.done[l.id]).length
  const pct = Math.round((doneCount / lessons.length) * 100)

  useEffect(() => { if (!lesson) document.title = 'Aprende PSP · Hilos y sockets en Java' }, [lesson])

  return (
    <div className="min-h-screen">
      {/* Barra superior */}
      <header className="fixed inset-x-0 top-0 z-30 h-14 border-b border-line bg-bg/90 backdrop-blur lg:left-72">
        <div className="flex h-full items-center gap-3 px-4">
          <button className="rounded-md border border-line-strong px-2 py-1 font-mono text-sm lg:hidden" onClick={() => setMenu(!menu)} aria-label="Abrir índice">☰</button>
          <a href="#" className="font-display text-lg font-extrabold lg:hidden">Aprende PSP</a>
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden items-center gap-2 font-mono text-xs text-muted sm:flex">
              <span>{doneCount}/{lessons.length}</span>
              <div className="h-1.5 w-32 overflow-hidden rounded-full bg-line">
                <div className="h-full bg-accent transition-all" style={{ width: `${pct}%` }} />
              </div>
              <span>{pct}%</span>
            </div>
            <button onClick={() => { if (armed) { reset(); setArmed(false) } else { setArmed(true); setTimeout(() => setArmed(false), 3000) } }}
              className={`hidden rounded-md border px-2 py-1 font-mono text-xs sm:block ${armed ? 'border-ko text-ko' : 'border-line-strong text-muted hover:text-fg'}`}>
              {armed ? '¿borrar progreso? pulsa otra vez' : 'reiniciar'}
            </button>
            <button onClick={() => setDark(!dark)} className="rounded-md border border-line-strong px-2 py-1 font-mono text-sm" aria-label="Cambiar tema">
              {dark ? '☀' : '☾'}
            </button>
          </div>
        </div>
        {/* Progreso en móvil */}
        <div className="h-0.5 bg-line sm:hidden"><div className="h-full bg-accent" style={{ width: `${pct}%` }} /></div>
      </header>

      {/* Índice lateral */}
      <aside className={`fixed bottom-0 left-0 top-14 z-20 w-72 border-r border-line bg-bg transition-transform lg:top-0 lg:translate-x-0 ${menu ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar current={route} progress={progress} onNavigate={() => setMenu(false)} />
      </aside>
      {menu && <div className="fixed inset-0 z-10 bg-black/40 lg:hidden" onClick={() => setMenu(false)} />}

      <main className="pt-14 lg:pl-72">
        {lesson
          ? <Lesson key={lesson.id} lesson={lesson} index={index} progress={progress} markDone={markDone} setEx={setEx} setExam={setExam} />
          : <Home progress={progress} />}
      </main>
    </div>
  )
}
