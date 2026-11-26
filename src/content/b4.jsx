import { C, Callout, Mk, Section } from '../components/ui'

const CHECKS = [
  {
    t: '¿Hay synchronized antes de wait() / notify()?',
    d: <>Si <C>wait</C>/<C>notify</C>/<C>notifyAll</C> no están dentro de un <C>synchronized</C>, saltará <strong>IllegalMonitorStateException</strong> en tiempo de ejecución (compila bien).</>,
  },
  {
    t: '¿Es el MISMO objeto en synchronized(X) y en X.wait() / X.notify()?',
    d: <><C>synchronized(A)</C> + <C>B.notify()</C> lanza IllegalMonitorStateException. Esperar en A y notificar en B (cada una con su lock) produce una espera indefinida, sin excepción.</>,
  },
  {
    t: '¿La espera usa while (condición) y no if?',
    d: <>Con <C>if</C>, tras un despertar espurio o un <C>notifyAll</C> a quien no le toca, el hilo sigue sin re-comprobar. ¿El <C>wait()</C> está <strong>dentro</strong> del cuerpo del while? Ojo con las llaves vacías.</>,
  },
  {
    t: '¿La condición cambia ANTES del notify()? ¿Más de 2 hilos → notifyAll()?',
    d: <>Notificar sin cambiar el estado hace que el despertado vuelva a dormirse. Con 3 o más hilos y condiciones distintas, <C>notify()</C> puede despertar al equivocado y provocar un deadlock.</>,
  },
  {
    t: '¿Hay estado compartido sin protección? ¿Es atómica la operación?',
    d: <><C>x++</C>, <C>x = x + 1</C> y «comprobar y luego actuar» no son atómicas. <C>volatile</C> no basta. ¿El lock es <C>static final</C> y único, o cada hilo tiene el suyo?</>,
  },
  {
    t: 'Semaphore: ¿release() en finally? ¿Cuántos permisos?',
    d: <><C>Semaphore(0)</C> bloquea, <C>Semaphore(2)</C> deja entrar a dos a la vez y rompe la exclusión mutua. Sin <C>finally</C>, una excepción pierde el permiso para siempre.</>,
  },
  {
    t: '¿Hay join()? ¿Los bucles cuadran?',
    d: <>Sin <C>join()</C>, <C>main</C> imprime antes de que acaben los hilos. En máquinas de turnos, si las iteraciones no cuadran, algún hilo se queda en <C>wait()</C> al final.</>,
  },
  {
    t: 'Sockets: ¿flush() tras escribir? ¿Coinciden println() y readLine()?',
    d: <>Sin <C>flush()</C>, los datos se quedan en el buffer y los dos lados se bloquean en <C>readLine()</C>. Si los dos leen a la vez, o uno no responde (hash con «asd»), se produce un bloqueo mutuo.</>,
  },
  {
    t: 'Sockets: ¿se controla readLine() == null? ¿Hay salida con BYE en ambos lados?',
    d: <><C>null</C> = el otro cerró. Usarlo sin comprobar provoca NullPointerException. El servidor del PDF no gestiona BYE.</>,
  },
  {
    t: 'Sockets: ¿cierre ordenado en finally?',
    d: <>Primero los streams y después el socket (de fuera hacia dentro). Cuidado con los <C>null</C>, con los <C>assert</C> desactivados y con <C>System.exit</C>, que se salta el <C>finally</C>. Lo ideal es try-with-resources.</>,
  },
]

function Checklist() {
  return (
    <ol className="not-prose my-5 space-y-3">
      {CHECKS.map((c, i) => (
        <li key={i} className="flex gap-3 rounded-xl border border-line bg-elevated p-4">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent font-mono text-sm font-bold text-accent-fg">{i + 1}</span>
          <div>
            <div className="font-semibold">{c.t}</div>
            <div className="mt-1 text-[15px] text-muted">{c.d}</div>
          </div>
        </li>
      ))}
    </ol>
  )
}

function Guia() {
  return (
    <>
      <p>Esto es lo que tienes que llevar en la cabeza mañana. Léelo justo antes de entrar al examen.</p>

      <Section n={1} title="Checklist delante del folio">
        <p>Ante cualquier fragmento de código, recórrelo de arriba abajo con estas preguntas:</p>
        <Checklist />
      </Section>

      <Section n={2} title="Plantilla de respuesta (4 frases)">
        <ol>
          <li><strong>Qué hace / qué imprime:</strong> la salida concreta, separando lo seguro de lo que puede variar («imprime X; el orden de los "ha terminado" puede variar»).</li>
          <li><strong>Cómo funciona por dentro:</strong> qué hilo tiene el monitor, quién está en BLOCKED o WAITING, qué hace cada <C>wait</C>/<C>notify</C>.</li>
          <li><strong>Por qué falla:</strong> nombra el fenómeno (condición de carrera, notificación perdida, IllegalMonitorStateException, espera indefinida, deadlock, bloqueo mutuo en <C>readLine</C>…) y señala la <strong>línea exacta</strong>.</li>
          <li><strong>Cómo se arregla:</strong> el cambio mínimo, con código si cabe en una línea.</li>
        </ol>
        <Callout type="exam" title="Ejemplo aplicado">
          <p>«Imprime "Esperado: 200000" y un valor obtenido menor o igual, distinto en cada ejecución. Los dos hilos ejecutan <C>contador++</C> sobre una variable static compartida. Esa operación no es atómica (leer, sumar, escribir), así que se producen actualizaciones perdidas: es una condición de carrera en la línea 6. Se soluciona haciendo <C>incrementar()</C> <C>static synchronized</C>.»</p>
        </Callout>
      </Section>

      <Section n={3} title="Vocabulario exacto">
        <table>
          <thead><tr><th>Término</th><th>Definición de una línea</th></tr></thead>
          <tbody>
            <tr><td>Condición de carrera</td><td>El resultado depende del intercalado no determinista de los hilos.</td></tr>
            <tr><td>Sección crítica</td><td>Código que accede a un recurso compartido y debe ejecutarse en exclusión mutua.</td></tr>
            <tr><td>Exclusión mutua</td><td>Como mucho un hilo a la vez dentro de la sección crítica.</td></tr>
            <tr><td>Monitor</td><td>El lock intrínseco de cada objeto, con su Entry Set y su Wait Set.</td></tr>
            <tr><td>Deadlock (interbloqueo)</td><td>Varios hilos se esperan mutuamente y ninguno puede avanzar.</td></tr>
            <tr><td>Espera indefinida</td><td>Un hilo espera algo (un notify) que nunca ocurrirá.</td></tr>
            <tr><td>Espera activa (busy waiting)</td><td>Esperar en un bucle que consume CPU en lugar de bloquearse.</td></tr>
            <tr><td>Notificación perdida</td><td>Un <C>notify()</C> sin nadie en el Wait Set, que no se guarda.</td></tr>
            <tr><td>Despertar espurio</td><td>Salir de <C>wait()</C> sin notify. Por eso se usa <C>while</C>.</td></tr>
            <tr><td>Llamada bloqueante</td><td><C>accept()</C>, <C>readLine()</C>, <C>acquire()</C>, <C>join()</C>, <C>wait()</C>: detienen el hilo hasta que ocurre algo.</td></tr>
          </tbody>
        </table>
      </Section>

      <Section n={4} title="Gestión del tiempo en el examen">
        <ul>
          <li>Lee <strong>todo</strong> el código antes de escribir. Marca en el folio cada <C>synchronized</C>, <C>wait</C>, <C>notify</C>, <C>flush</C> y <C>readLine</C>.</li>
          <li>Si hay llaves raras, <strong>reindenta</strong> mentalmente siguiendo las llaves, no la sangría.</li>
          <li>Haz una mini-traza (una tabla de 3 o 4 filas, como las de esta web) cuando haya dos hilos y un lock: casi siempre es lo que convence al corrector.</li>
          <li>Responde lo que se pregunta (qué hace / por qué falla) y añade la solución en una línea, aunque no la pidan.</li>
        </ul>
        <Callout type="book" title="100 cosas · Dijkstra: la simplicidad es requisito de la fiabilidad">
          <p>
            Todos los bugs del temario salen de complicar la coordinación: dos locks, un aviso sin estado, llaves que no cierran donde parece.
            Las soluciones son siempre la misma idea simple: <Mk>un lock, un estado compartido, while + wait, cambiar el estado y luego notifyAll</Mk>. En sockets: <Mk>println + flush, readLine comprobando null, cerrar en finally</Mk>.
          </p>
        </Callout>
      </Section>

      <Section n={5} title="Ahora: simulacro">
        <p>Haz el <strong>Simulacro de examen</strong> (siguiente página): preguntas mezcladas de todo el temario, en formato folio. Al final verás tu nota.</p>
      </Section>
    </>
  )
}

export const lessonsB4 = [
  { id: 'guia', title: 'Checklist y estrategia para el folio', minutes: 5, Body: Guia, exercises: [] },
]
