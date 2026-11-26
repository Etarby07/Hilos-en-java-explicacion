import { useCallback, useEffect, useState } from 'react'

// Progreso local (solo en este navegador). Todo acceso a localStorage va protegido.
const KEY = 'psp-progress-v1'

function load() {
  try {
    const raw = localStorage.getItem(KEY)
    const data = raw ? JSON.parse(raw) : null
    return { done: data?.done || {}, ex: data?.ex || {}, exam: data?.exam || {} }
  } catch {
    return { done: {}, ex: {}, exam: {} }
  }
}

function save(p) {
  try { localStorage.setItem(KEY, JSON.stringify(p)) } catch { /* modo privado */ }
}

export function useProgress() {
  const [progress, setProgress] = useState(load)
  useEffect(() => save(progress), [progress])

  const markDone = useCallback((id, value = true) =>
    setProgress((p) => ({ ...p, done: { ...p.done, [id]: value } })), [])

  // result: 'ok' | 'ko' | 'partial'
  const setEx = useCallback((id, result) =>
    setProgress((p) => ({ ...p, ex: { ...p.ex, [id]: result } })), [])

  const setExam = useCallback((id, result) =>
    setProgress((p) => ({ ...p, exam: { ...p.exam, [id]: result } })), [])

  const reset = useCallback(() => setProgress({ done: {}, ex: {}, exam: {} }), [])

  return { progress, markDone, setEx, setExam, reset }
}

export function useTheme() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'))
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    try { localStorage.setItem('psp-theme', dark ? 'dark' : 'light') } catch { /* nada */ }
  }, [dark])
  return [dark, setDark]
}
