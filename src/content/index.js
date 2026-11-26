import { Calentamiento } from './b0'
import { lessonsB1 } from './b1'
import { lessonsB2 } from './b2'
import { lessonsB3 } from './b3'
import { lessonsB4 } from './b4'
import { examQuestions } from './exam'

export const blocks = [
  { id: 'b0', num: '00', title: 'Antes de empezar', weight: null, lessons: [
    { id: 'calentamiento', title: 'Calentamiento visual (vídeo)', minutes: 12, Body: Calentamiento, exercises: [] },
  ] },
  { id: 'b1', num: '01', title: 'Concurrencia y carreras', weight: '≈80% junto al bloque 2', lessons: lessonsB1 },
  { id: 'b2', num: '02', title: 'wait / notify y trampas', weight: null, lessons: lessonsB2 },
  { id: 'b3', num: '03', title: 'Sockets TCP', weight: '≈20%', lessons: lessonsB3 },
  { id: 'b4', num: '04', title: 'Supervivencia', weight: null, lessons: [
    ...lessonsB4,
    { id: 'simulacro', title: 'Simulacro de examen', minutes: 15, exam: true, exercises: examQuestions },
  ] },
]

// Lista plana con referencias al bloque, para la navegación anterior/siguiente
export const lessons = blocks.flatMap((b) => b.lessons.map((l) => ({ ...l, block: b })))

export const totalMinutes = lessons.reduce((s, l) => s + l.minutes, 0)
export const totalExercises = lessons.filter((l) => !l.exam).reduce((s, l) => s + l.exercises.length, 0)

export { examQuestions }
