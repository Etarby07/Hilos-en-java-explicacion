import { useEffect, useState } from 'react'
import CodeBlock from './CodeBlock'

// Cada escenario: hilos (con su código) y una lista de instantáneas (pasos).
// where: 'out' (fuera del monitor) | 'entry' (Entry Set, BLOCKED) | 'owner' | 'wait' (Wait Set) | 'done'
const H2_TURNOS = `
for (int i = 0; i < 100; i++) {
    synchronized (lock) {
        while (turno) {          // ¿NO es mi turno?
            lock.wait();
        }
        System.out.println(mensaje); // "no"
        turno = true;
        lock.notifyAll();
    }
}`

const SCENARIOS = [
  {
    id: 'turnos',
    name: 'Turnos «si / no» (EJ3, 2 hilos)',
    threads: [
      { id: 'H1', color: 'var(--t1)', title: 'Hilo1 → "si"', code: `
for (int i = 0; i < 100; i++) {
    synchronized (lock) {
        while (!turno) {         // ¿NO es mi turno?
            lock.wait();
        }
        System.out.println(mensaje); // "si"
        turno = false;
        lock.notifyAll();
    }
}` },
      { id: 'H2', color: 'var(--t2)', title: 'Hilo2 → "no"', code: H2_TURNOS },
    ],
    steps: [
      { pc: { H1: 1, H2: 1 }, where: { H1: 'out', H2: 'out' }, vars: { turno: 'true' }, out: [], note: 'Arrancan h1 y h2. turno = true, así que le toca a H1 («si»). El monitor de lock está libre.' },
      { pc: { H1: 2, H2: 2 }, where: { H1: 'entry', H2: 'owner' }, vars: { turno: 'true' }, out: [], note: 'Los dos llegan a synchronized(lock) casi a la vez. El planificador deja pasar a H2, que pasa a ser el dueño del monitor. H1 no puede entrar: va al Entry Set en estado BLOCKED.' },
      { pc: { H1: 2, H2: 3 }, where: { H1: 'entry', H2: 'owner' }, vars: { turno: 'true' }, out: [], note: 'H2 comprueba su condición: while (turno) es true, así que NO es su turno.' },
      { pc: { H1: 2, H2: 4 }, where: { H1: 'entry', H2: 'wait' }, vars: { turno: 'true' }, out: [], note: 'H2 llama a lock.wait(): SUELTA el monitor y se va al Wait Set (WAITING). Esa es la diferencia con sleep(), que se duerme sin soltar el lock.' },
      { pc: { H1: 3, H2: 4 }, where: { H1: 'owner', H2: 'wait' }, vars: { turno: 'true' }, out: [], note: 'Con el monitor libre, H1 sale del Entry Set y se convierte en el dueño (RUNNABLE). while (!turno) es false, así que no espera.' },
      { pc: { H1: 6, H2: 4 }, where: { H1: 'owner', H2: 'wait' }, vars: { turno: 'true' }, out: ['si'], note: 'H1 imprime «si».' },
      { pc: { H1: 7, H2: 4 }, where: { H1: 'owner', H2: 'wait' }, vars: { turno: 'false' }, out: ['si'], note: 'H1 cambia el estado compartido ANTES de notificar: turno = false. Ahora le toca a H2.' },
      { pc: { H1: 8, H2: 4 }, where: { H1: 'owner', H2: 'entry' }, vars: { turno: 'false' }, out: ['si'], note: 'notifyAll() saca a H2 del Wait Set y lo pasa al Entry Set (BLOCKED). H2 todavía NO se ejecuta, porque H1 sigue dentro del synchronized y conserva el lock.' },
      { pc: { H1: 2, H2: 4 }, where: { H1: 'entry', H2: 'owner' }, vars: { turno: 'false' }, out: ['si'], note: 'H1 sale del bloque (libera el lock) y, en la siguiente vuelta del for, intenta entrar otra vez: BLOCKED. H2 recupera el lock y continúa justo después de wait(), en la línea 4.' },
      { pc: { H1: 2, H2: 3 }, where: { H1: 'entry', H2: 'owner' }, vars: { turno: 'false' }, out: ['si'], note: 'Por esto se usa WHILE: al volver de wait(), H2 RE-COMPRUEBA la condición. turno es false, así que ahora sí es su turno.' },
      { pc: { H1: 2, H2: 6 }, where: { H1: 'entry', H2: 'owner' }, vars: { turno: 'false' }, out: ['si', 'no'], note: 'H2 imprime «no».' },
      { pc: { H1: 2, H2: 8 }, where: { H1: 'entry', H2: 'owner' }, vars: { turno: 'true' }, out: ['si', 'no'], note: 'turno = true y notifyAll(). Esta vez el Wait Set está vacío (H1 está en el Entry Set, no esperando), así que la notificación no tiene ningún efecto. Y no pasa nada, porque H1 no la necesita.' },
      { pc: { H1: 3, H2: 2 }, where: { H1: 'owner', H2: 'entry' }, vars: { turno: 'true' }, out: ['si', 'no'], note: 'H2 libera el lock y H1 entra. Si H2 hubiera vuelto a ganar, su while (turno) le habría mandado al Wait Set. El orden sale siempre bien, gane quien gane el lock.' },
      { pc: { H1: 10, H2: 10 }, where: { H1: 'done', H2: 'done' }, vars: { turno: 'true' }, out: ['si', 'no', 'si', 'no', '… (100 veces cada uno)', 'Thread-0 ha terminado', 'Thread-1 ha terminado'], note: 'Resultado: «si» y «no» alternados 100 veces cada uno. El orden final de los «ha terminado» puede variar.' },
    ],
  },
  {
    id: 'perdido',
    name: 'Notificación perdida (Ejercicio4)',
    threads: [
      { id: 'main', color: 'var(--t4)', title: 'main', code: `
esperador.start();
synchronized (lock) {
    lock.notify();
    System.out.println("[Main] notify() enviado");
}
esperador.join(2000);
if (esperador.isAlive()) { /* BLOQUEADO */ System.exit(1); }` },
      { id: 'E', color: 'var(--t2)', title: 'esperador', code: `
Thread.sleep(500); // llega tarde al wait
synchronized (lock) {
    System.out.println("[Esperador] Voy a esperar...");
    lock.wait();
    System.out.println("[Esperador] ¡Me han despertado!");
}` },
    ],
    steps: [
      { pc: { main: 1, E: 1 }, where: { main: 'out', E: 'out' }, st: { E: 'TIMED_WAITING' }, vars: {}, out: [], note: 'main arranca al esperador, que se pone a dormir 500 ms (TIMED_WAITING) antes de llegar al synchronized.' },
      { pc: { main: 2, E: 1 }, where: { main: 'owner', E: 'out' }, st: { E: 'TIMED_WAITING' }, vars: {}, out: [], note: 'main entra en el monitor de lock sin competencia.' },
      { pc: { main: 3, E: 1 }, where: { main: 'owner', E: 'out' }, st: { E: 'TIMED_WAITING' }, vars: {}, out: [], note: 'main hace notify() con el Wait Set VACÍO, así que no hace nada. Java no guarda la notificación para más tarde (un semáforo sí guarda sus permisos).' },
      { pc: { main: 6, E: 1 }, where: { main: 'out', E: 'out' }, st: { main: 'TIMED_WAITING', E: 'TIMED_WAITING' }, vars: {}, out: ['[Main] notify() enviado (nadie escuchaba todavía)'], note: 'main sale del monitor y espera en join(2000) un máximo de 2 s (TIMED_WAITING).' },
      { pc: { main: 6, E: 3 }, where: { main: 'out', E: 'owner' }, st: { main: 'TIMED_WAITING' }, vars: {}, out: ['[Main] notify() enviado (nadie escuchaba todavía)', '[Esperador] Voy a esperar...'], note: 'El esperador se despierta del sleep, entra en el monitor e imprime su mensaje.' },
      { pc: { main: 6, E: 4 }, where: { main: 'out', E: 'wait' }, st: { main: 'TIMED_WAITING' }, vars: {}, out: ['[Main] notify() enviado (nadie escuchaba todavía)', '[Esperador] Voy a esperar...'], note: 'wait() lo lleva al Wait Set (WAITING). El único notify() del programa ya se ejecutó, así que nadie lo va a despertar NUNCA.' },
      { pc: { main: 7, E: 4 }, where: { main: 'done', E: 'wait' }, vars: {}, out: ['[Main] notify() enviado (nadie escuchaba todavía)', '[Esperador] Voy a esperar...', '[Main] El esperador sigue BLOQUEADO: notificación perdida.'], note: 'join(2000) expira, isAlive() devuelve true, main imprime el aviso y System.exit(1) mata la JVM. Arreglo: una variable de condición (boolean listo) que se comprueba con while ANTES de llamar a wait().' },
    ],
  },
  {
    id: 'notifyall',
    name: '3 hilos: notify() vs notifyAll()',
    threads: [
      { id: 'H1', color: 'var(--t1)', title: 'Hilo1 (turno 0) → "si"', code: `
synchronized (estado.lock) {
    while (estado.turno != 0) {
        estado.lock.wait();
    }
    System.out.println("si");
    estado.turno = 2;
    estado.lock.notify(); // ⚠ notify()
}` },
      { id: 'H2', color: 'var(--t2)', title: 'Hilo2 (turno 1) → "no"', code: `
synchronized (estado.lock) {
    while (estado.turno != 1) {
        estado.lock.wait();
    }
    System.out.println("no");
    estado.turno = 2;
    estado.lock.notify(); // ⚠ notify()
}` },
      { id: 'H3', color: 'var(--t3)', title: 'Hilo3 (turno 2) → "depende"', code: `
synchronized (estado.lock) {
    while (estado.turno != 2) {
        estado.lock.wait();
    }
    System.out.println("depende");
    estado.turno = despuesDeSi ? 1 : 0;
    estado.lock.notify(); // ⚠ notify()
}` },
    ],
    steps: [
      { pc: { H1: 2, H2: 3, H3: 3 }, where: { H1: 'owner', H2: 'wait', H3: 'wait' }, vars: { turno: '0' }, out: [], note: 'Punto de partida: H2 y H3 llegaron primero, su condición era falsa y están en el Wait Set. H1 tiene el lock y turno = 0. Esta versión usa notify() en lugar de notifyAll().' },
      { pc: { H1: 6, H2: 3, H3: 3 }, where: { H1: 'owner', H2: 'wait', H3: 'wait' }, vars: { turno: '2' }, out: ['si'], note: 'H1 imprime «si» y pone turno = 2, que es el turno de H3.' },
      { pc: { H1: 7, H2: 3, H3: 3 }, where: { H1: 'owner', H2: 'entry', H3: 'wait' }, vars: { turno: '2' }, out: ['si'], note: 'notify() despierta a UN solo hilo, y tú no eliges cuál. Mala suerte: despierta a H2, pero el turno es de H3.' },
      { pc: { H1: 1, H2: 2, H3: 3 }, where: { H1: 'entry', H2: 'owner', H3: 'wait' }, vars: { turno: '2' }, out: ['si'], note: 'H1 suelta el lock y vuelve a intentar entrar. H2 recupera el lock y re-comprueba: turno != 1, así que sigue sin ser su turno.' },
      { pc: { H1: 1, H2: 3, H3: 3 }, where: { H1: 'entry', H2: 'wait', H3: 'wait' }, vars: { turno: '2' }, out: ['si'], note: 'H2 vuelve a dormirse (bien hecho, gracias al while), pero NO avisa a nadie. H3, el único que podía avanzar, sigue en el Wait Set.' },
      { pc: { H1: 3, H2: 3, H3: 3 }, where: { H1: 'wait', H2: 'wait', H3: 'wait' }, vars: { turno: '2' }, out: ['si'], note: 'H1 entra, turno != 0, así que también hace wait(). Los TRES hilos están en el Wait Set y no queda nadie para llamar a notify(). DEADLOCK: el programa se cuelga para siempre, sin excepción ni error.' },
      { pc: { H1: 7, H2: 3, H3: 3 }, where: { H1: 'owner', H2: 'entry', H3: 'entry' }, vars: { turno: '2' }, out: ['si'], note: 'Rebobinamos al paso 3, pero ahora con notifyAll() (como en el PDF): se despiertan H2 Y H3 y los dos pasan al Entry Set.' },
      { pc: { H1: 1, H2: 3, H3: 2 }, where: { H1: 'entry', H2: 'wait', H3: 'owner' }, vars: { turno: '2' }, out: ['si'], note: 'Cada uno re-comprueba su while. Si H2 entra antes, vuelve a dormirse. H3 ve turno == 2 y continúa. El hilo correcto nunca se queda sin despertar.' },
      { pc: { H1: 1, H2: 3, H3: 6 }, where: { H1: 'entry', H2: 'wait', H3: 'owner' }, vars: { turno: '1' }, out: ['si', 'depende'], note: 'H3 imprime «depende» y como despuesDeSi era true pone turno = 1 (le toca a H2). Su notifyAll() despertará a todos otra vez. Secuencia final: si, depende, no, depende, si, depende…' },
    ],
  },
]

const ZONE_STATE = { out: 'RUNNABLE', entry: 'BLOCKED', owner: 'RUNNABLE', wait: 'WAITING', done: 'TERMINATED' }

function Chip({ t, state }) {
  return (
    <div className="pop flex items-center gap-2 rounded-lg border-2 bg-elevated px-2.5 py-1.5 shadow-sm" style={{ borderColor: t.color }}>
      <span className="h-2.5 w-2.5 rounded-full" style={{ background: t.color }} />
      <span className="font-mono text-sm font-bold">{t.id}</span>
      <span className="font-mono text-[10px] text-muted">{state}</span>
    </div>
  )
}

function Zone({ title, sub, threads, step, highlight }) {
  return (
    <div className={`flex min-h-[110px] flex-col rounded-xl border-2 border-dashed p-3 ${highlight ? 'border-accent bg-accent-soft' : 'border-line-strong bg-surface'}`}>
      <div className="font-mono text-[11px] font-bold uppercase tracking-wider">{title}</div>
      <div className="mb-2 text-xs text-muted">{sub}</div>
      <div className="flex flex-wrap gap-2">
        {threads.map((t) => <Chip key={t.id} t={t} state={step.st?.[t.id] || ZONE_STATE[step.where[t.id]]} />)}
      </div>
    </div>
  )
}

export default function MonitorSim() {
  const [sid, setSid] = useState(0)
  const [i, setI] = useState(0)
  const sc = SCENARIOS[sid]
  const step = sc.steps[i]
  const last = sc.steps.length - 1
  const inZone = (z) => sc.threads.filter((t) => step.where[t.id] === z)

  useEffect(() => {
    const onKey = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return
      if (e.key === 'ArrowRight') setI((x) => Math.min(x + 1, last))
      if (e.key === 'ArrowLeft') setI((x) => Math.max(x - 1, 0))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [last])

  return (
    <div className="not-prose my-6 rounded-2xl border border-line bg-elevated p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap gap-2">
        {SCENARIOS.map((s, k) => (
          <button key={s.id} onClick={() => { setSid(k); setI(0) }}
            className={`rounded-lg border px-3 py-1.5 text-sm font-semibold ${k === sid ? 'border-accent bg-accent text-accent-fg' : 'border-line-strong bg-surface'}`}>
            {s.name}
          </button>
        ))}
      </div>

      {/* Monitor */}
      <div className="grid gap-3 md:grid-cols-[1fr_1.1fr_1fr]">
        <Zone title="Entry Set" sub="Quieren el lock → BLOCKED" threads={inZone('entry')} step={step} />
        <div className="flex flex-col gap-3">
          <Zone title="🔒 Dueño del monitor" sub={inZone('owner').length ? 'Ejecuta dentro del synchronized' : 'Lock libre'} threads={inZone('owner')} step={step} highlight />
          <Zone title="Fuera del monitor" sub="Código normal · sleep · join · terminado" threads={[...inZone('out'), ...inZone('done')]} step={step} />
        </div>
        <Zone title="Wait Set" sub="Hicieron wait() → WAITING (sin lock)" threads={inZone('wait')} step={step} />
      </div>

      {/* Explicación + controles */}
      <div className="mt-4 rounded-xl border border-line bg-surface p-4">
        <div className="mb-1 font-mono text-[11px] font-bold uppercase tracking-wider text-accent">Paso {i + 1} / {sc.steps.length}</div>
        <p className="min-h-[3.5rem] text-[15px] leading-relaxed">{step.note}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button onClick={() => setI(0)} className="rounded-lg border border-line-strong bg-elevated px-3 py-1.5 text-sm">↺ Reiniciar</button>
          <button disabled={i === 0} onClick={() => setI(i - 1)} className="rounded-lg border border-line-strong bg-elevated px-3 py-1.5 text-sm disabled:opacity-40">← Anterior</button>
          <button disabled={i === last} onClick={() => setI(i + 1)} className="rounded-lg bg-accent px-4 py-1.5 text-sm font-semibold text-accent-fg disabled:opacity-40">Siguiente →</button>
          <span className="ml-auto hidden text-xs text-faint sm:inline">También con las flechas ← →</span>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-line">
          <div className="h-full bg-accent transition-all" style={{ width: `${((i + 1) / sc.steps.length) * 100}%` }} />
        </div>
      </div>

      {/* Código por hilo */}
      <div className={`mt-2 grid gap-x-3 ${sc.threads.length === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-2'}`}>
        {sc.threads.map((t) => (
          <CodeBlock key={t.id} compact title={t.title} code={t.code}
            hl={step.where[t.id] === 'done' ? [] : [step.pc[t.id]]}
            tags={step.where[t.id] === 'done' ? {} : { [step.pc[t.id]]: [{ label: t.id, color: t.color }] }} />
        ))}
      </div>

      {/* Variables y consola */}
      <div className="grid gap-3 sm:grid-cols-[180px_1fr]">
        <div className="rounded-xl border border-line bg-surface p-3">
          <div className="mb-1 font-mono text-[11px] font-bold uppercase tracking-wider text-muted">Estado compartido</div>
          {Object.keys(step.vars).length === 0
            ? <div className="font-mono text-sm text-faint">—</div>
            : Object.entries(step.vars).map(([k, v]) => <div key={k} className="font-mono text-sm">{k} = <b className="text-accent">{v}</b></div>)}
        </div>
        <div className="rounded-xl p-3 font-mono text-[13px]" style={{ background: 'var(--code-bg)', color: 'var(--code-fg)' }}>
          <div className="mb-1 text-[11px] uppercase tracking-wider" style={{ color: '#a8a29e' }}>Consola</div>
          {step.out.length === 0 ? <span style={{ color: '#57534e' }}>(vacía)</span> : step.out.map((l, k) => <div key={k}>{l}</div>)}
        </div>
      </div>
    </div>
  )
}
