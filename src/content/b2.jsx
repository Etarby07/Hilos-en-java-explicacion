import CodeBlock from '../components/CodeBlock'
import MonitorSim from '../components/MonitorSim'
import { C, Callout, Model, Mk, Section, Trace } from '../components/ui'

/* ───────────────────────── Código del PDF ───────────────────────── */

export const EJ3_WAIT = `
public class Ejercicio3_WaitSinSynchronized {

    static final Object lock = new Object();

    public static void main(String[] args) throws InterruptedException {
        System.out.println("Llamando a notify() sin synchronized...");
        lock.notify(); // <-- IllegalMonitorStateException

        System.out.println("Llamando a wait() sin synchronized...");
        lock.wait(); // <-- IllegalMonitorStateException (no se llega aquí)
    }
}`

export const EJ4 = `
public class Ejercicio4_NotifyPerdido {

    static final Object lock = new Object();

    public static void main(String[] args) throws InterruptedException {
        Thread esperador = new Thread(() -> {
            try {
                Thread.sleep(500); // llega tarde al wait
                synchronized (lock) {
                    System.out.println("[Esperador] Voy a esperar...");
                    lock.wait();
                    System.out.println("[Esperador] ¡Me han despertado!");
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        });
        esperador.start();

        synchronized (lock) {
            lock.notify();
            System.out.println("[Main] notify() enviado (nadie escuchaba todavía)");
        }

        esperador.join(2000);
        if (esperador.isAlive()) {
            System.out.println("[Main] El esperador sigue BLOQUEADO: notificación perdida.");
            System.exit(1);
        }
    }
}`

export const EJ6 = `
public class Ejercicio6_NotifyEnOtroObjeto {

    static final Object lockA = new Object();
    static final Object lockB = new Object();

    public static void main(String[] args) throws InterruptedException {
        Thread esperador = new Thread(() -> {
            synchronized (lockA) {
                try {
                    System.out.println("[Esperador] Espero en lockA...");
                    lockA.wait();
                    System.out.println("[Esperador] ¡Despertado!");
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            }
        });
        esperador.start();

        Thread.sleep(500);

        synchronized (lockB) {
            lockB.notify();
            System.out.println("[Main] notify() sobre lockB");
        }

        esperador.join(2000);
        if (esperador.isAlive()) {
            System.out.println("[Main] El esperador sigue BLOQUEADO en lockA.");
            System.exit(1);
        }
    }
}`

export const EJ8 = `
public class Ejercicio8_CondicionNoActualizada {

    static final Object lock = new Object();
    static boolean listo = false;

    public static void main(String[] args) throws InterruptedException {
        Thread esperador = new Thread(() -> {
            synchronized (lock) {
                try {
                    while (!listo) {
                        System.out.println("[Esperador] condición falsa, espero...");
                        lock.wait();
                    }
                    System.out.println("[Esperador] ¡Puedo continuar!");
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            }
        });
        esperador.start();

        Thread.sleep(500);

        synchronized (lock) {
            lock.notify();
            System.out.println("[Main] notify() enviado");
        }

        esperador.join(2000);
        if (esperador.isAlive()) {
            System.out.println("[Main] El esperador sigue BLOQUEADO.");
            System.exit(1);
        }
    }
}`

export const EJ8B = `
public class Ejercicio8b_CondicionNoActualizada {

    static final Object lock = new Object();
    static boolean listo = false;

    public static void main(String[] args) throws InterruptedException {

        Thread esperador = new Thread(() -> {
            synchronized (lock) {
                try {
                    Thread.sleep(1000);
                    while (!listo) {
                        System.out.println("[Esperador] condición falsa, espero...");
                        lock.wait();
                    }
                    System.out.println("[Esperador] ¡Puedo continuar!");
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            }
        });

        esperador.start();

        System.out.println("[Main] Fuera del synchronized");

        synchronized (lock) {
            System.out.println("[Main] Dentro del synchronized");
            listo = true;
            lock.notify();
            System.out.println("[Main] notify() enviado");
        }

        esperador.join(2000);
        while (esperador.isAlive()) {
            System.out.println("[Main] El esperador sigue BLOQUEADO.");
        }
    }
}`

const EJ3_2H = `
public class EJ3 {

    static boolean turno = true;

    // Objeto compartido que utilizaremos como bloqueo
    static final Object lock = new Object();

    static class Hilo1 extends Thread {
        private String mensaje;

        public Hilo1(String mensaje) {
            this.mensaje = mensaje;
        }

        @Override
        public void run() {
            for (int i = 0; i < 100; i++) {
                synchronized (lock) {
                    try {
                        while (!turno) {
                            lock.wait();
                        }
                        System.out.println(mensaje);
                        turno = false;
                        lock.notifyAll();
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                    }
                }
            }
            System.out.println(getName() + " ha terminado");
        }
    }

    static class Hilo2 extends Thread {
        private String mensaje;

        public Hilo2(String mensaje) {
            this.mensaje = mensaje;
        }

        @Override
        public void run() {
            for (int i = 0; i < 100; i++) {
                synchronized (lock) {
                    try {
                        while (turno) {
                            lock.wait();
                        }
                        System.out.println(mensaje);
                        turno = true;
                        lock.notifyAll();
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                    }
                }
            }
            System.out.println(getName() + " ha terminado");
        }
    }

    public static void main(String[] args) throws InterruptedException {
        Hilo1 h1 = new Hilo1("si");
        Hilo2 h2 = new Hilo2("no");
        h1.start();
        h2.start();
        h1.join();
        h2.join();
    }
}`

const EJ3_3H = `
public class EstadoCompartido {
    int turno = 0;
    final Object lock = new Object();
}

public class EJ3 {
    public static void main(String[] args) throws InterruptedException {
        EstadoCompartido estado = new EstadoCompartido();

        Hilo1 h1 = new Hilo1("si", estado);
        Hilo2 h2 = new Hilo2("no", estado);
        Hilo3 h3 = new Hilo3(estado);

        h1.start(); h2.start(); h3.start();
        h1.join();  h2.join();  h3.join();
    }
}`

const HILO1_3H = `
public class Hilo1 extends Thread {
    private String mensaje;
    private EstadoCompartido estado;

    public Hilo1(String mensaje, EstadoCompartido estado) {
        this.mensaje = mensaje;
        this.estado = estado;
    }

    @Override
    public void run() {
        for (int i = 0; i < 100; i++) {
            synchronized (estado.lock) {
                try {
                    while (estado.turno != 0) {
                        estado.lock.wait();
                    }
                    System.out.println(mensaje);
                    estado.turno = 2;
                    estado.lock.notifyAll();
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    return;
                }
            }
        }
        System.out.println(getName() + " ha terminado");
    }
}
// Hilo2 es idéntico salvo: while (estado.turno != 1)  →  estado.turno = 2`

const HILO3_3H = `
public class Hilo3 extends Thread {
    private EstadoCompartido estado;
    private boolean despuesDeSi = true;

    public Hilo3(EstadoCompartido estado) {
        this.estado = estado;
    }

    @Override
    public void run() {
        for (int i = 0; i < 200; i++) {
            synchronized (estado.lock) {
                try {
                    while (estado.turno != 2) {
                        estado.lock.wait();
                    }
                    System.out.println("depende");

                    if (despuesDeSi) {
                        estado.turno = 1;
                    } else {
                        estado.turno = 0;
                    }
                    despuesDeSi = !despuesDeSi;

                    estado.lock.notifyAll();
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    return;
                }
            }
        }
        System.out.println(getName() + " ha terminado");
    }
}`

/* ───────────────────────── 2.1 Monitor ───────────────────────── */

function Monitor() {
  return (
    <>
      <p>
        <C>synchronized</C> sirve para que los hilos <strong>no se pisen</strong>. <C>wait()</C> y <C>notify()</C> sirven para que se <strong>coordinen</strong>:
        «espera hasta que se cumpla X» y «oye, ya ha cambiado X». Para entender los fallos del PDF necesitas esta imagen del monitor.
      </p>

      <Section n={1} title="Las tres zonas de un monitor">
        <ul>
          <li><strong>Dueño (owner):</strong> el único hilo que tiene el lock y ejecuta dentro del <C>synchronized</C>.</li>
          <li><strong>Entry Set:</strong> hilos que <strong>quieren</strong> entrar y esperan a que el lock quede libre. Estado <C>BLOCKED</C>.</li>
          <li><strong>Wait Set:</strong> hilos que estaban dentro, llamaron a <C>wait()</C> y esperan un aviso. Estado <C>WAITING</C>. <Mk>No tienen el lock.</Mk></li>
        </ul>
      </Section>

      <Section n={2} title="Las reglas (memorízalas)">
        <ol>
          <li><C>obj.wait()</C>, <C>obj.notify()</C> y <C>obj.notifyAll()</C> <strong>solo</strong> se pueden llamar teniendo el monitor de <C>obj</C>, es decir, dentro de <C>synchronized (obj)</C>. Si no, saltará <C>IllegalMonitorStateException</C>.</li>
          <li><C>wait()</C> <strong>suelta el lock</strong> y mete al hilo en el Wait Set.</li>
          <li><C>notify()</C> mueve <strong>un</strong> hilo cualquiera (no eliges cuál) del Wait Set al Entry Set. <C>notifyAll()</C> los mueve <strong>todos</strong>.</li>
          <li><C>notify()</C> <strong>no suelta el lock</strong>: el despertado no avanza hasta que el que notifica sale del <C>synchronized</C>.</li>
          <li>El despertado tiene que <strong>volver a adquirir el lock</strong> y continúa justo después de su <C>wait()</C>.</li>
          <li>Si nadie está en el Wait Set, <C>notify()</C> <strong>no hace nada y no se guarda</strong>.</li>
          <li>Un hilo puede despertar de <C>wait()</C> sin que nadie le avise (<strong>despertar espurio</strong>). Por eso la condición se comprueba siempre en un <C>while</C>.</li>
        </ol>
        <CodeBlock title="El patrón correcto (siempre igual)" code={`
// El que ESPERA
synchronized (lock) {
    while (!condicion) {     // while, nunca if
        lock.wait();         // suelta el lock y espera
    }
    // aquí la condición es cierta y tengo el lock
}

// El que AVISA
synchronized (lock) {
    condicion = true;        // 1º cambia el estado
    lock.notifyAll();        // 2º avisa
}`} ok={[3, 4, 11, 12]} />
      </Section>

      <Section n={3} title="Simulador: avanza paso a paso">
        <p>Elige un escenario y pulsa <strong>Siguiente</strong>. Observa cuándo un hilo pasa a BLOCKED (Entry Set) y cuándo a WAITING (Wait Set).</p>
        <MonitorSim />
      </Section>

      <Section n={4} title="wait() vs sleep()">
        <table>
          <thead><tr><th></th><th><C>wait()</C></th><th><C>Thread.sleep(ms)</C></th></tr></thead>
          <tbody>
            <tr><td>¿Suelta el lock?</td><td><strong>Sí</strong></td><td><strong>No</strong>: duerme con el lock cogido</td></tr>
            <tr><td>¿Dónde se llama?</td><td>Dentro de <C>synchronized(obj)</C></td><td>En cualquier sitio</td></tr>
            <tr><td>¿Quién la define?</td><td><C>Object</C></td><td><C>Thread</C> (método estático)</td></tr>
            <tr><td>Despierta por…</td><td><C>notify</C>/<C>notifyAll</C>, interrupción o timeout</td><td>Fin del tiempo o interrupción</td></tr>
            <tr><td>Estado</td><td><C>WAITING</C> (o <C>TIMED_WAITING</C> con ms)</td><td><C>TIMED_WAITING</C></td></tr>
          </tbody>
        </table>
      </Section>
    </>
  )
}

/* ───────────────────────── 2.2 IllegalMonitorStateException ───────────────────────── */

function SinSync() {
  return (
    <>
      <CodeBlock title="Ejercicio3_WaitSinSynchronized.java" code={EJ3_WAIT} err={[7]} hl={[10]} />
      <Section n={1} title="Qué pasa">
        <p>Salida:</p>
        <CodeBlock lang="SALIDA" code={`
Llamando a notify() sin synchronized...
Exception in thread "main" java.lang.IllegalMonitorStateException: current thread is not owner
    at java.base/java.lang.Object.notify(Native Method)
    at Ejercicio3_WaitSinSynchronized.main(...)`} err={[2]} />
        <ul>
          <li>El hilo <C>main</C> llama a <C>lock.notify()</C> <strong>sin tener el monitor de lock</strong>, porque no está dentro de <C>synchronized (lock)</C>.</li>
          <li>Java exige que el hilo sea dueño del monitor del objeto, así que lanza <C>IllegalMonitorStateException</C> en la línea 7.</li>
          <li>La excepción no se captura: termina el hilo <C>main</C> y el programa. <Mk>La línea de wait() no se llega a ejecutar</Mk> (y también lanzaría la misma excepción).</li>
        </ul>
      </Section>
      <Section n={2} title="Detalles para el examen">
        <ul>
          <li><strong>Compila perfectamente</strong>: es un error en <strong>tiempo de ejecución</strong>. <C>IllegalMonitorStateException</C> es una <C>RuntimeException</C> (unchecked).</li>
          <li>El <C>throws InterruptedException</C> del <C>main</C> está por <C>wait()</C>, que lanza esa excepción checked. No tiene nada que ver con el fallo.</li>
          <li>¿Por qué existe esta regla? <C>wait</C>/<C>notify</C> se usan para esperar un <strong>cambio de estado compartido</strong>, y ese estado solo se puede comprobar y modificar de forma segura teniendo el lock. Sin lock, la comprobación de la condición y el <C>wait()</C> podrían intercalarse con el <C>notify()</C> de otro hilo y perderlo.</li>
        </ul>
        <Callout type="trap">
          <p><C>synchronized (otroObjeto) {'{ lock.notify(); }'}</C> también lanza <C>IllegalMonitorStateException</C>: tener <em>un</em> lock no basta, tiene que ser el monitor <strong>del mismo objeto</strong> sobre el que llamas a <C>wait</C>/<C>notify</C>.</p>
        </Callout>
      </Section>
    </>
  )
}

/* ───────────────────────── 2.3 Notify perdido ───────────────────────── */

function Perdido() {
  return (
    <>
      <CodeBlock title="Ejercicio4_NotifyPerdido.java" code={EJ4} hl={[8]} err={[11, 21]} />
      <Section n={1} title="Traza">
        <Trace head={['t', 'main', 'esperador']} bad={[2, 4]} rows={[
          ['0 ms', 'esperador.start()', 'sleep(500) → TIMED_WAITING'],
          ['~0 ms', 'entra en synchronized(lock)', 'durmiendo'],
          ['~0 ms', 'lock.notify(): Wait Set vacío → se pierde', 'durmiendo'],
          ['~0 ms', 'imprime, sale, join(2000)', 'durmiendo'],
          ['500 ms', 'esperando en join', 'entra, imprime, lock.wait() → WAITING para siempre'],
          ['2000 ms', 'isAlive() = true → imprime y System.exit(1)', 'sigue WAITING'],
        ]} />
        <CodeBlock lang="SALIDA" code={`
[Main] notify() enviado (nadie escuchaba todavía)
[Esperador] Voy a esperar...
[Main] El esperador sigue BLOQUEADO: notificación perdida.`} />
      </Section>
      <Section n={2} title="Por qué">
        <p>
          <Mk>notify() no tiene memoria.</Mk> Si cuando se llama no hay nadie en el Wait Set, no hace nada y la notificación desaparece.
          El esperador llega tarde (el <C>sleep(500)</C> lo garantiza en la práctica), hace <C>wait()</C> y nadie volverá a avisarle.
          Se queda en <C>WAITING</C> indefinidamente. Solo termina porque <C>main</C> llama a <C>System.exit(1)</C>.
        </p>
        <p>Además, <C>wait()</C> se llama <strong>sin comprobar ninguna condición</strong>: el hilo espera «a ciegas», sin saber si lo que esperaba ya ha ocurrido.</p>
      </Section>
      <Section n={3} title="La solución: una variable de condición">
        <CodeBlock title="Corregido ✓" code={`
static boolean listo = false;

// esperador
synchronized (lock) {
    while (!listo) {      // si ya avisaron, NO espera
        lock.wait();
    }
    System.out.println("[Esperador] ¡Me han despertado!");
}

// main
synchronized (lock) {
    listo = true;         // el aviso queda "guardado" en el estado
    lock.notify();
}`} ok={[5, 13]} />
        <p>Ahora da igual quién llegue primero: si el aviso ya se dio, <C>listo</C> es <C>true</C> y el esperador ni siquiera entra en <C>wait()</C>. El estado compartido hace de «memoria» del aviso, que es justo lo que le falta a <C>notify()</C>.</p>
      </Section>
    </>
  )
}

/* ───────────────────────── 2.4 Monitor equivocado ───────────────────────── */

function OtroObjeto() {
  return (
    <>
      <CodeBlock title="Ejercicio6_NotifyEnOtroObjeto.java" code={EJ6} err={[11, 23]} notes={{ 11: 'espera en A', 23: 'avisa en B' }} />
      <Section n={1} title="Qué pasa">
        <CodeBlock lang="SALIDA" code={`
[Esperador] Espero en lockA...
[Main] notify() sobre lockB
[Main] El esperador sigue BLOQUEADO en lockA.`} />
        <ul>
          <li><strong>No hay excepción</strong>: <C>lockB.notify()</C> se llama dentro de <C>synchronized (lockB)</C>, lo cual es legal. Del mismo modo, <C>lockA.wait()</C> está dentro de <C>synchronized (lockA)</C>.</li>
          <li>Cada objeto tiene <strong>su propio Wait Set</strong>. El esperador está en el de <C>lockA</C>, y el <C>notify()</C> se hace sobre <C>lockB</C>, cuyo Wait Set está vacío. Se pierde.</li>
          <li>El esperador se queda en <C>WAITING</C> sobre <C>lockA</C> para siempre. Tras 2 s, <C>main</C> lo detecta y sale con <C>System.exit(1)</C>.</li>
        </ul>
        <Callout type="exam" title="Vocabulario preciso">
          <p>
            Técnicamente no es un <em>deadlock</em> (no hay dos hilos esperándose mutuamente). Es una <strong>espera indefinida</strong>: un hilo bloqueado en <C>wait()</C> que nunca recibirá un <C>notify()</C> sobre el mismo monitor.
            Si lo llamas deadlock no pasa nada grave, pero matizarlo da puntos.
          </p>
        </Callout>
      </Section>
      <Section n={2} title="Regla de oro">
        <p><Mk>El objeto de synchronized(X), X.wait() y X.notify() tiene que ser siempre el mismo X.</Mk> Solución: <C>synchronized (lockA) {'{ lockA.notify(); }'}</C>, mejor aún con una condición, como en el ejercicio anterior.</p>
      </Section>
    </>
  )
}

/* ───────────────────────── 2.5 Condición no actualizada ───────────────────────── */

function CondNoAct() {
  return (
    <>
      <CodeBlock title="Ejercicio8_CondicionNoActualizada.java" code={EJ8} ok={[10]} err={[25]} notes={{ 25: '¿y listo = true?' }} />
      <Section n={1} title="Qué pasa">
        <CodeBlock lang="SALIDA" code={`
[Esperador] condición falsa, espero...
[Main] notify() enviado
[Esperador] condición falsa, espero...
[Main] El esperador sigue BLOQUEADO.`} hl={[3]} />
        <ol>
          <li>El esperador entra, ve <C>listo == false</C>, imprime y hace <C>wait()</C> (suelta el lock).</li>
          <li><C>main</C> (tras 500 ms) entra y hace <C>notify()</C>: esta vez <strong>sí</strong> hay alguien en el Wait Set y lo despierta. Imprime «notify() enviado» antes de soltar el lock.</li>
          <li>El esperador recupera el lock, vuelve al <C>while</C> y <strong>re-comprueba</strong> la condición: <C>listo</C> sigue siendo <C>false</C>, porque nadie la cambió.</li>
          <li>Imprime <strong>otra vez</strong> «condición falsa, espero...» y vuelve a <C>wait()</C>. No queda nadie para avisarle.</li>
          <li>Tras 2 s de <C>join</C>, <C>main</C> imprime «BLOQUEADO» y llama a <C>System.exit(1)</C>.</li>
        </ol>
      </Section>
      <Section n={2} title="La lección">
        <p>
          El <C>while</C> hace exactamente lo que debe: <strong>no se fía del aviso, se fía del estado</strong>. El fallo está en el que notifica, que avisa sin cambiar la condición.
          <Mk>notify() significa «mira la condición otra vez», no «continúa».</Mk>
        </p>
        <CodeBlock title="Arreglo ✓" code={`
synchronized (lock) {
    listo = true;         // ← faltaba esto, ANTES de notify y DENTRO del synchronized
    lock.notify();
}`} ok={[2]} />
        <Callout type="tip" title="¿Y con if en vez de while?">
          <p>Con <C>if (!listo) lock.wait();</C> el esperador saldría del <C>wait</C>, <strong>no</strong> re-comprobaría la condición e imprimiría «¡Puedo continuar!» aunque <C>listo</C> sea <C>false</C>. El programa «funciona», pero con una condición falsa: es un bug silencioso, todavía peor.</p>
        </Callout>
      </Section>
    </>
  )
}

/* ───────────────────────── 2.6 Ejercicio 8b ───────────────────────── */

function Ej8b() {
  return (
    <>
      <p>Este es el ejercicio más enrevesado del PDF. Primero el código <strong>tal cual aparece</strong> y después las dos variantes trampa (llaves vacías) que pueden ponerte.</p>
      <CodeBlock title="Ejercicio8b_CondicionNoActualizada.java (versión del PDF)" code={EJ8B} hl={[11]} ok={[29, 30]} err={[35, 36]} />

      <Section n={1} title="La versión del PDF funciona (y aquí está lo interesante)">
        <p>Aquí <C>main</C> <strong>sí</strong> pone <C>listo = true</C> antes de <C>notify()</C>, así que el esperador acaba siempre. Pero el orden de la salida depende de quién coja el lock primero:</p>
        <Trace head={['Caso A: el esperador coge el lock primero', 'Caso B: main coge el lock primero']} rows={[
          ['[Main] Fuera del synchronized', '[Main] Fuera del synchronized'],
          ['(esperador duerme 1 s CON el lock → main queda BLOCKED)', '[Main] Dentro del synchronized'],
          ['[Esperador] condición falsa, espero...  (wait suelta el lock)', '[Main] notify() enviado   ← nadie espera, se pierde… y da igual'],
          ['[Main] Dentro del synchronized', '(esperador entra, duerme 1 s, listo ya es true → no entra en el while)'],
          ['[Main] notify() enviado', '[Esperador] ¡Puedo continuar!'],
          ['[Esperador] ¡Puedo continuar!', ''],
        ]} />
        <ul>
          <li><C>Thread.sleep(1000)</C> dentro de <C>synchronized</C> <strong>no suelta el lock</strong>. En el caso A, <C>main</C> se queda en <C>BLOCKED</C> en su <C>synchronized</C> durante ~1 s.</li>
          <li>En el caso B el <C>notify()</C> se pierde, pero <Mk>no importa porque la condición quedó guardada en listo</Mk>. Es justo la solución del Ejercicio 4.</li>
          <li>El <C>while (esperador.isAlive())</C> final no imprime nada, porque cuando acaba el <C>join(2000)</C> el esperador ya ha terminado. Pero es una <strong>espera activa</strong> (<em>busy waiting</em>): si el hilo siguiera vivo, imprimiría «BLOQUEADO» sin parar y consumiría el 100% de una CPU. Lo correcto sería un <C>if</C>, como en los otros ejercicios.</li>
          <li><C>listo</C> no es <C>volatile</C>, pero aquí no hace falta: se lee y se escribe siempre dentro de <C>synchronized (lock)</C>, que garantiza la visibilidad.</li>
        </ul>
      </Section>

      <Section n={2} title="Variante trampa A: while vacío antes del wait()">
        <CodeBlock title="Esperador con el while vacío ✗" code={`
synchronized (lock) {
    try {
        Thread.sleep(1000);
        while (!listo) { }          // ← llaves vacías
        System.out.println("[Esperador] condición falsa, espero...");
        lock.wait();                // ← ya NO está dentro del while
        System.out.println("[Esperador] ¡Puedo continuar!");
    } catch (InterruptedException e) { ... }
}`} err={[4, 6]} />
        <ul>
          <li><strong>Si el esperador coge el lock primero:</strong> gira en <C>while (!listo) {'{ }'}</C> <strong>con el lock cogido</strong>. <C>main</C> está <C>BLOCKED</C> esperando ese lock para poner <C>listo = true</C>, cosa que nunca podrá hacer. El esperador gasta el 100% de CPU (espera activa) y <C>main</C> no avanza: <Mk>el programa se cuelga para siempre</Mk>. Solo se imprime «[Main] Fuera del synchronized».</li>
          <li><strong>Si <C>main</C> coge el lock primero:</strong> pone <C>listo = true</C> y hace <C>notify()</C> (que se pierde). El esperador sale del bucle vacío al instante y ejecuta <C>lock.wait()</C> <strong>incondicionalmente</strong>: espera un aviso que ya pasó. Se queda en <C>WAITING</C>, el <C>join(2000)</C> expira y el <C>while (isAlive())</C> imprime «BLOQUEADO» en bucle infinito.</li>
          <li>En los dos casos se cuelga. La moraleja: <strong>el wait() tiene que ir DENTRO del while</strong>, y nunca se hace espera activa con el lock cogido.</li>
        </ul>
      </Section>

      <Section n={3} title="Variante trampa B: synchronized vacío en main">
        <CodeBlock title="main con el synchronized vacío ✗" code={`
synchronized (lock) {
    System.out.println("[Main] Dentro del synchronized");
}                                // ← se cierra aquí
listo = true;
lock.notify();                   // ← FUERA del synchronized
System.out.println("[Main] notify() enviado");`} err={[5]} />
        <ul>
          <li><C>lock.notify()</C> se ejecuta sin tener el monitor, así que <strong><C>IllegalMonitorStateException</C></strong> en <C>main</C>. «notify() enviado» no se imprime.</li>
          <li>El hilo <C>main</C> muere con la excepción, pero <Mk>el programa NO termina</Mk>: el esperador (hilo no daemon) sigue vivo. Si ya estaba en <C>wait()</C>, se queda en <C>WAITING</C> para siempre, porque el aviso nunca llegó. La JVM se queda colgada.</li>
          <li>Además, <C>listo = true</C> se escribe fuera del <C>synchronized</C> y sin <C>volatile</C>: no hay garantía de visibilidad para el otro hilo.</li>
        </ul>
        <Callout type="exam">
          <p>Si te dan un código con llaves raras, <strong>reindéntalo en el folio</strong> siguiendo las llaves reales, no la sangría. Después aplica la checklist: ¿el <C>wait</C>/<C>notify</C> está dentro de un <C>synchronized</C> del mismo objeto? ¿El <C>wait</C> está dentro del <C>while</C>? ¿La condición cambia antes del <C>notify</C>?</p>
        </Callout>
      </Section>
    </>
  )
}

/* ───────────────────────── 2.7 Turnos 2 hilos ───────────────────────── */

function Turnos2() {
  return (
    <>
      <p>Ahora un uso <strong>correcto</strong> de todo lo anterior: dos hilos que se alternan estrictamente. Es una <strong>máquina de estados</strong> con un único estado compartido, <C>turno</C>.</p>
      <CodeBlock title="EJ3.java (2 hilos)" code={EJ3_2H} hl={[3, 6]} ok={[20, 21, 22, 24, 25, 47, 48, 49, 51, 52]} />

      <Section n={1} title="Cómo funciona">
        <ul>
          <li><C>turno == true</C> significa «le toca a Hilo1 ("si")». <C>turno == false</C>, «le toca a Hilo2 ("no")».</li>
          <li>Cada hilo, en cada vuelta: coge el lock, <strong>espera mientras no sea su turno</strong>, imprime, <strong>cede el turno</strong> y avisa con <C>notifyAll()</C>.</li>
          <li>Como <C>turno</C> empieza en <C>true</C>, el primero en imprimir es siempre <C>"si"</C>, aunque <C>h2</C> coja el lock antes (se dormiría en su <C>while</C>).</li>
        </ul>
        <CodeBlock lang="SALIDA" code={`
si
no
si
no
... (100 "si" y 100 "no", alternados estrictamente)
Thread-0 ha terminado
Thread-1 ha terminado`} />
        <p>
          Las 200 líneas alternan siempre. Lo único que puede variar es el orden de los dos «ha terminado». Lo habitual es que salga primero Thread-0, pero después de imprimir el último «no» los dos hilos salen del bucle casi a la vez y nada lo garantiza.
        </p>
      </Section>

      <Section n={2} title="¿Por qué while y no if?">
        <ul>
          <li>Al despertar de <C>wait()</C>, el hilo <strong>no sabe</strong> si la condición es cierta: puede haber sido un <strong>despertar espurio</strong>, o puede que otro hilo haya cambiado el estado entre el <C>notify</C> y el momento en que él recupera el lock.</li>
          <li>Con <C>while</C>, al despertar <strong>vuelve a comprobar</strong> y, si no es su turno, se duerme otra vez. Con <C>if</C> seguiría adelante a ciegas e imprimiría fuera de turno.</li>
          <li>Con 2 hilos el <C>if</C> «suele» funcionar, pero no es correcto. Con 3 hilos falla seguro (lo verás en la siguiente lección).</li>
        </ul>
      </Section>

      <Section n={3} title="Detalles finos">
        <ul>
          <li>Aquí bastaría con <C>notify()</C> (solo hay otro hilo que despertar), pero <C>notifyAll()</C> es la opción segura y no cuesta nada.</li>
          <li><strong>Orden:</strong> primero <C>turno = false</C> y después <C>notifyAll()</C>. Aunque estén al revés funcionaría, porque el despertado no avanza hasta que se suelta el lock. Aun así, la norma es «cambia el estado y luego avisa».</li>
          <li>El <C>catch</C> de esta versión <strong>no</strong> tiene <C>return</C>: si interrumpieran al hilo, restauraría el flag y seguiría el <C>for</C>. El siguiente <C>wait()</C> lanzaría otra vez la excepción en cuanto llegase, saltándose vueltas. La versión de 3 hilos sí hace <C>return</C>, que es lo correcto.</li>
        </ul>
        <Callout type="trap" title="Trampa del PDF: código duplicado">
          <p>
            En el PDF aparece un fragmento suelto que empieza con <C>static class Hilo1 extends Thread</C> fuera de cualquier clase, y una cabecera de <C>EJ3</C> repetida y sin cerrar.
            Si te dan ese trozo tal cual, <strong>no compila</strong>: una clase de nivel superior no puede ser <C>static</C> («modifier static not allowed here»), y <C>lock</C> y <C>turno</C> no existirían fuera de <C>EJ3</C>.
          </p>
        </Callout>
      </Section>
    </>
  )
}

/* ───────────────────────── 2.8 Turnos 3 hilos ───────────────────────── */

function Turnos3() {
  return (
    <>
      <p>La misma idea con tres hilos y un estado de tres valores. Aquí <C>notifyAll()</C> pasa de recomendable a <strong>obligatorio</strong>.</p>
      <CodeBlock title="EstadoCompartido.java + EJ3.java" code={EJ3_3H} hl={[2, 3, 8]} />
      <CodeBlock title="Hilo1.java (Hilo2 igual con turno 1)" code={HILO1_3H} ok={[15, 16, 17, 19, 20]} hl={[23]} />
      <CodeBlock title="Hilo3.java" code={HILO3_3H} ok={[14, 15, 16, 19, 20, 21, 22, 23, 24, 26]} hl={[11]} />

      <Section n={1} title="La máquina de estados">
        <Trace head={['turno', 'Le toca a', 'Imprime', 'Deja turno en']} rows={[
          ['0', 'Hilo1', 'si', '2'],
          ['2', 'Hilo3 (despuesDeSi = true)', 'depende', '1'],
          ['1', 'Hilo2', 'no', '2'],
          ['2', 'Hilo3 (despuesDeSi = false)', 'depende', '0'],
        ]} />
        <CodeBlock lang="SALIDA" code={`
si
depende
no
depende
si
depende
... (100 veces el ciclo: 400 líneas)
Thread-0 ha terminado
Thread-1 ha terminado
Thread-2 ha terminado`} />
        <ul>
          <li><strong>Cuentas:</strong> Hilo1 imprime 100 «si», Hilo2 100 «no» y Hilo3 <strong>200</strong> «depende» (uno después de cada si y de cada no). Por eso su <C>for</C> llega a 200. <Mk>Si los números no cuadraran, algún hilo se quedaría para siempre en wait() al final</Mk>.</li>
          <li><C>despuesDeSi</C> es un campo <strong>privado</strong> de <C>Hilo3</C>: solo lo toca ese hilo, así que no es estado compartido y no necesita protección.</li>
          <li><C>EstadoCompartido</C> agrupa el estado (<C>turno</C>) y su <C>lock</C> en <strong>un solo objeto</strong> que se pasa a los tres hilos por el constructor. Ya no hace falta <C>static</C>: lo que comparten es la <strong>misma instancia</strong>.</li>
          <li>Los tres «ha terminado» suelen salir en orden 0, 1, 2, pero no está garantizado.</li>
        </ul>
      </Section>

      <Section n={2} title="¿Por qué notifyAll() y no notify()?">
        <p>
          Con 3 hilos, cuando uno cambia el turno, en el Wait Set puede haber <strong>dos</strong> hilos, y solo uno de ellos es el correcto.
          <C>notify()</C> despierta a uno <strong>al azar</strong>. Si despierta al equivocado, este re-comprueba su <C>while</C>, vuelve a dormirse <strong>sin avisar a nadie</strong> y el correcto se queda esperando.
          Al final los tres acaban en el Wait Set y el programa se cuelga (<strong>deadlock</strong> por señal perdida).
        </p>
        <p><C>notifyAll()</C> despierta a todos. Cada uno re-comprueba su condición en el <C>while</C>: el correcto continúa y los demás vuelven a dormir. <Mk>notifyAll() + while es la combinación que nunca falla.</Mk></p>
        <p>Pruébalo en el simulador de la lección «Monitor, estados y wait/notify», escenario «3 hilos: notify() vs notifyAll()».</p>
      </Section>

      <Callout type="book" title="100 cosas · nombres que revelan intención">
        <p>
          Phil Karlton bromeaba con que nombrar las cosas es uno de los dos problemas difíciles de la informática. Aquí, <C>turno = 0/1/2</C> son <strong>números mágicos</strong>: hay que leer los tres hilos para saber qué significa cada uno.
          Con un <C>enum Turno {'{ SI, NO, DEPENDE }'}</C>, <C>while (estado.turno != Turno.SI)</C> se leería solo.
          En el examen no hace falta reescribirlo, pero comentarlo en una línea demuestra criterio.
        </p>
      </Callout>
    </>
  )
}

/* ───────────────────────── Ejercicios ───────────────────────── */

const exMonitor = [
  {
    id: 'b2-mon-sleep', kind: 'choice',
    prompt: <p>Un hilo hace <C>Thread.sleep(1000)</C> dentro de <C>synchronized (lock)</C>. Mientras duerme, ¿puede otro hilo entrar en <C>synchronized (lock)</C>?</p>,
    options: [
      { t: 'Sí, sleep suelta el lock como wait', why: 'Esa es justo la diferencia: sleep NO lo suelta.' },
      { t: 'No: sleep no suelta el lock y el otro queda BLOCKED', ok: true },
      { t: 'Lanza IllegalMonitorStateException', why: 'sleep se puede llamar en cualquier sitio.' },
    ],
    model: <p>No. <C>Thread.sleep()</C> duerme al hilo <strong>sin liberar</strong> los monitores que tiene. El otro hilo queda en estado <C>BLOCKED</C> en el Entry Set hasta que el primero salga del <C>synchronized</C> o llame a <C>lock.wait()</C>, que sí libera el lock. Pasa exactamente esto en <C>Ejercicio8b</C>.</p>,
  },
  {
    id: 'b2-mon-notify', kind: 'choice',
    prompt: <p>El hilo A hace <C>lock.notify()</C> y después sigue ejecutando 3 líneas más dentro del mismo <C>synchronized (lock)</C>. ¿Cuándo continúa el hilo B que estaba en <C>wait()</C>?</p>,
    options: [
      { t: 'Inmediatamente después del notify()', why: 'notify no suelta el lock.' },
      { t: 'Cuando A sale del synchronized y B consigue readquirir el lock', ok: true },
      { t: 'Nunca: hay que llamar a notifyAll()', why: 'notify despierta a uno; si solo está B, es él.' },
    ],
    model: <p><C>notify()</C> solo mueve a B del Wait Set al Entry Set (pasa de WAITING a BLOCKED). B no puede continuar hasta que A <strong>libere el monitor</strong> al salir del <C>synchronized</C> y B lo <strong>vuelva a adquirir</strong>. Entonces continúa en la instrucción siguiente a su <C>wait()</C>.</p>,
  },
  {
    id: 'b2-mon-write', kind: 'write',
    prompt: <p>Explica la diferencia entre los estados <C>BLOCKED</C> y <C>WAITING</C> en relación con un monitor.</p>,
    model: <p><strong>BLOCKED</strong>: el hilo quiere entrar en un <C>synchronized</C> (o volver a él tras un <C>notify</C>) y el monitor lo tiene otro hilo. Está en el <strong>Entry Set</strong> y continuará en cuanto el lock quede libre y lo consiga. <strong>WAITING</strong>: el hilo estaba dentro del <C>synchronized</C>, llamó a <C>wait()</C>, <strong>liberó el lock</strong> y está en el <strong>Wait Set</strong>. No competirá por el lock hasta que otro hilo llame a <C>notify()</C>/<C>notifyAll()</C> sobre el mismo objeto (o sea interrumpido). Después pasa a BLOCKED hasta readquirir el monitor.</p>,
  },
]

const exSinSync = [
  {
    id: 'b2-ims-otro', kind: 'choice',
    prompt: <p>¿Qué pasa con este código?</p>,
    code: `
static final Object lock = new Object();
static final Object otro = new Object();

public static void main(String[] args) {
    synchronized (otro) {
        lock.notify();
    }
}`,
    codeProps: { err: [6] },
    options: [
      { t: 'Funciona: notify() está dentro de un synchronized', why: 'Pero del objeto equivocado.' },
      { t: 'IllegalMonitorStateException: el hilo tiene el monitor de otro, no el de lock', ok: true },
      { t: 'No compila', why: 'Compila; el error es en ejecución.' },
    ],
    model: <p>Lanza <C>IllegalMonitorStateException</C> en <C>lock.notify()</C>. Para llamar a <C>notify()</C> sobre <C>lock</C>, el hilo tiene que ser dueño del monitor <strong>de lock</strong>. Está dentro de <C>synchronized (otro)</C>, que le da el monitor de <C>otro</C>, no el de <C>lock</C>. Compila sin problemas: es un error en tiempo de ejecución.</p>,
  },
  {
    id: 'b2-ims-write', kind: 'write',
    prompt: <p>¿Qué imprime <C>Ejercicio3_WaitSinSynchronized</C> y por qué?</p>,
    model: <p>Imprime «Llamando a notify() sin synchronized...» y lanza <C>IllegalMonitorStateException</C> (current thread is not owner) en <C>lock.notify()</C>, porque el hilo <C>main</C> no tiene el monitor de <C>lock</C>: no está dentro de <C>synchronized (lock)</C>. La excepción no se captura y termina el programa, así que nunca se imprime la segunda línea ni se llega a <C>lock.wait()</C> (que también la lanzaría). Es un error en tiempo de ejecución, no de compilación. Solución: llamar a <C>wait</C>/<C>notify</C> siempre dentro de <C>synchronized</C> sobre el mismo objeto.</p>,
  },
]

const exPerdido = [
  {
    id: 'b2-perdido-sinsleep', kind: 'choice',
    prompt: <p>En <C>Ejercicio4_NotifyPerdido</C> quitamos el <C>Thread.sleep(500)</C> del esperador. ¿Se arregla?</p>,
    options: [
      { t: 'Sí, siempre funciona', why: 'Sigue habiendo carrera: depende de quién entre antes.' },
      { t: 'A veces funciona y a veces no: depende de qué hilo coja el lock primero', ok: true },
      { t: 'No, siempre se bloquea', why: 'Si el esperador entra primero, sí recibe el notify.' },
    ],
    model: <p><strong>No se arregla, solo cambia la probabilidad.</strong> Si el esperador entra antes en el <C>synchronized</C> y llega a <C>wait()</C>, recibe el <C>notify()</C> y termina. Si <C>main</C> entra antes, la notificación se pierde igual. Es una condición de carrera. La solución correcta es una variable de condición (<C>listo</C>) comprobada con <C>while</C> antes de <C>wait()</C> y puesta a <C>true</C> antes de <C>notify()</C>.</p>,
  },
  {
    id: 'b2-perdido-write', kind: 'write',
    prompt: <p>Explica qué ocurre en <C>Ejercicio4_NotifyPerdido</C> y propón una solución.</p>,
    model: <p>El esperador duerme 500 ms antes de entrar en el <C>synchronized</C>. Mientras tanto, <C>main</C> entra y llama a <C>lock.notify()</C> con el Wait Set vacío. <C>notify()</C> no tiene memoria, así que la notificación se <strong>pierde</strong>. Cuando el esperador llega, llama a <C>lock.wait()</C> y queda en estado WAITING indefinidamente, porque nadie volverá a notificar. <C>join(2000)</C> expira, <C>isAlive()</C> es true y <C>main</C> imprime «sigue BLOQUEADO» y llama a <C>System.exit(1)</C>. Solución: usar una variable de condición compartida (<C>boolean listo</C>) protegida por el lock. El esperador hace <C>while (!listo) lock.wait();</C> y <C>main</C> hace <C>listo = true; lock.notify();</C> dentro del <C>synchronized</C>. Así, si el aviso llega antes, el esperador no espera.</p>,
  },
]

const exOtro = [
  {
    id: 'b2-otro-cruzado', kind: 'choice',
    prompt: <p>En <C>Ejercicio6</C>, <C>main</C> se cambia a <C>synchronized (lockB) {'{ lockA.notify(); }'}</C>. ¿Qué pasa?</p>,
    options: [
      { t: 'El esperador despierta, porque notify es sobre lockA', why: 'Para llamar a lockA.notify() hay que tener el monitor de lockA.' },
      { t: 'IllegalMonitorStateException en main', ok: true },
      { t: 'Igual que antes: el esperador sigue bloqueado sin excepción', why: 'Ahora sí hay excepción.' },
    ],
    model: <p><C>IllegalMonitorStateException</C>: <C>main</C> tiene el monitor de <C>lockB</C> pero llama a <C>notify()</C> sobre <C>lockA</C>. Además, el esperador sigue en WAITING sobre <C>lockA</C>, y como <C>main</C> muere con la excepción no llega a hacer <C>join</C> ni <C>System.exit</C>. El programa se queda colgado por el hilo esperador, que no es daemon.</p>,
  },
  {
    id: 'b2-otro-write', kind: 'write',
    prompt: <p>¿Por qué <C>Ejercicio6_NotifyEnOtroObjeto</C> no lanza excepción y sin embargo el esperador nunca despierta?</p>,
    model: <p>No hay excepción porque cada llamada se hace teniendo el monitor de su objeto: <C>lockA.wait()</C> dentro de <C>synchronized (lockA)</C> y <C>lockB.notify()</C> dentro de <C>synchronized (lockB)</C>. Pero cada objeto tiene su propio Wait Set: el esperador está en el de <C>lockA</C> y la notificación se envía al de <C>lockB</C>, que está vacío, así que se pierde. El esperador queda en WAITING indefinidamente sobre <C>lockA</C>, y <C>main</C> lo detecta tras <C>join(2000)</C>, imprime el aviso y sale con <C>System.exit(1)</C>. Solución: notificar sobre el mismo objeto en el que se espera (<C>synchronized (lockA) {'{ lockA.notify(); }'}</C>).</p>,
  },
]

const exCond = [
  {
    id: 'b2-cond-veces', kind: 'choice',
    prompt: <p>En <C>Ejercicio8_CondicionNoActualizada</C>, ¿cuántas veces se imprime «[Esperador] condición falsa, espero...»?</p>,
    options: [
      { t: 'Una', why: 'El notify sí lo despierta, y entonces vuelve a evaluar el while.' },
      { t: 'Dos: antes del primer wait y al re-comprobar tras el notify', ok: true },
      { t: 'Infinitas, en bucle', why: 'Tras el segundo wait nadie lo vuelve a despertar.' },
    ],
    model: <p><strong>Dos veces.</strong> La primera al entrar (<C>listo</C> es false). Después <C>main</C> hace <C>notify()</C> y lo despierta. Al recuperar el lock, el esperador vuelve al <C>while</C>, <C>listo</C> sigue siendo false porque <C>main</C> nunca lo cambió, imprime otra vez y vuelve a <C>wait()</C>. Ya no hay más notificaciones, así que queda bloqueado. <C>main</C> imprime «sigue BLOQUEADO» y sale con <C>exit(1)</C>.</p>,
  },
  {
    id: 'b2-cond-write', kind: 'write',
    prompt: <p>Explica el fallo de <C>Ejercicio8_CondicionNoActualizada</C> y por qué el <C>while</C> no es el culpable.</p>,
    model: <p><C>main</C> llama a <C>lock.notify()</C> pero no modifica la condición <C>listo</C>, que sigue en false. El <C>notify()</C> despierta al esperador, que al readquirir el lock re-evalúa <C>while (!listo)</C>, la encuentra falsa y vuelve a <C>wait()</C>. Como no hay más notificaciones, queda en WAITING indefinidamente. El <C>while</C> hace bien su trabajo: <C>notify()</C> solo indica «revisa la condición» y el esperador debe fiarse del estado, no del aviso. El error está en el notificador. Solución: <C>listo = true;</C> antes de <C>lock.notify()</C> y dentro del <C>synchronized</C>.</p>,
  },
]

const ex8b = [
  {
    id: 'b2-8b-pdf', kind: 'choice',
    prompt: <p>Con el código de <C>Ejercicio8b</C> <strong>tal como está en el PDF</strong>, ¿cuál es el resultado final?</p>,
    options: [
      { t: 'El esperador queda bloqueado para siempre', why: 'main sí pone listo = true antes del notify.' },
      { t: 'IllegalMonitorStateException', why: 'Todos los wait/notify están dentro de synchronized(lock).' },
      { t: 'Termina bien: el esperador imprime «¡Puedo continuar!» (la línea «condición falsa» puede salir o no)', ok: true },
    ],
    model: <p>Termina correctamente. <C>main</C> pone <C>listo = true</C> y hace <C>notify()</C> dentro de <C>synchronized (lock)</C>. Si el esperador coge antes el lock, duerme 1 s con él (<C>sleep</C> no lo suelta, así que <C>main</C> queda BLOCKED), imprime «condición falsa», hace <C>wait()</C> y es despertado con la condición ya cierta. Si <C>main</C> entra primero, el <C>notify</C> se pierde, pero el esperador encuentra <C>listo == true</C> y no espera. El <C>while (isAlive())</C> final no imprime nada porque el hilo ya ha terminado, aunque es una espera activa mal planteada.</p>,
  },
  {
    id: 'b2-8b-varA', kind: 'write',
    prompt: <p>Variante trampa: en el esperador aparece <C>while (!listo) {'{ }'}</C> (vacío) y debajo <C>lock.wait();</C>. Explica qué pasa si el esperador consigue el lock antes que <C>main</C>.</p>,
    model: <p>El esperador entra en <C>synchronized (lock)</C>, duerme 1 s con el lock cogido y luego entra en <C>while (!listo) {'{ }'}</C>, un bucle vacío de <strong>espera activa</strong> que <strong>no libera el lock</strong> (no hay <C>wait()</C> dentro). <C>main</C> está en estado BLOCKED intentando entrar en <C>synchronized (lock)</C> para poner <C>listo = true</C>, y nunca lo conseguirá. El esperador consume CPU indefinidamente y <C>main</C> no avanza: el programa se cuelga y solo imprime «[Main] Fuera del synchronized». El <C>lock.wait()</C> debe ir dentro del cuerpo del <C>while</C>.</p>,
  },
  {
    id: 'b2-8b-varB', kind: 'choice',
    prompt: <p>Variante trampa: en <C>main</C> el bloque es <C>synchronized (lock) {'{ }'}</C> (vacío) y <C>listo = true; lock.notify();</C> quedan <strong>fuera</strong>. ¿Qué pasa?</p>,
    options: [
      { t: 'Funciona igual: listo ya es true', why: 'notify() fuera de synchronized es ilegal.' },
      { t: 'IllegalMonitorStateException en main y el programa se queda colgado por el esperador', ok: true },
      { t: 'Error de compilación', why: 'Compila; falla en ejecución.' },
    ],
    model: <p><C>lock.notify()</C> se ejecuta sin tener el monitor, así que salta <C>IllegalMonitorStateException</C> en <C>main</C>, que termina con la traza de error. El esperador, que estaba en <C>wait()</C>, nunca recibe el aviso y queda en WAITING. Al ser un hilo no daemon, la JVM no termina: el programa se queda colgado. Además, <C>listo</C> se escribe fuera del <C>synchronized</C> y sin <C>volatile</C>, sin garantía de visibilidad.</p>,
  },
]

const exTurnos2 = [
  {
    id: 'b2-t2-sinnotify', kind: 'choice',
    prompt: <p>En el <C>EJ3</C> de 2 hilos, borramos <C>lock.notifyAll()</C> de <C>Hilo2</C>. ¿Qué pasa?</p>,
    options: [
      { t: 'Sigue alternando, porque Hilo1 nunca espera', why: 'Hilo1 hace wait cuando turno es false.' },
      { t: 'Se puede colgar tras pocas líneas: Hilo1 queda en el Wait Set sin que nadie le despierte', ok: true },
      { t: 'IllegalMonitorStateException', why: 'Quitar un notify no provoca excepciones.' },
    ],
    model: <p>Se cuelga, normalmente tras «si», «no». Hilo1 imprime «si», pone <C>turno = false</C> y, en su siguiente vuelta, hace <C>wait()</C>. Hilo2 imprime «no» y pone <C>turno = true</C>, pero <strong>no notifica</strong>: Hilo1 sigue en el Wait Set aunque ya es su turno. Hilo2 vuelve, ve <C>turno == true</C> y también hace <C>wait()</C>. Los dos quedan en WAITING y nadie los despertará: el programa se queda bloqueado.</p>,
  },
  {
    id: 'b2-t2-while', kind: 'write',
    prompt: <p>¿Por qué en <C>EJ3</C> la espera se escribe <C>while (!turno) lock.wait();</C> y no <C>if (!turno) lock.wait();</C>?</p>,
    model: <p>Porque cuando un hilo vuelve de <C>wait()</C> no está garantizado que la condición sea cierta. Puede ser un <strong>despertar espurio</strong> (la JVM permite despertar sin notify), o el estado puede haber cambiado entre el <C>notifyAll()</C> y el momento en que el hilo readquiere el lock. <C>notifyAll()</C> despierta a todos, incluidos los que no les toca. Con <C>while</C>, el hilo <strong>re-comprueba la condición</strong> tras despertar y, si no es su turno, vuelve a esperar. Con <C>if</C> continuaría sin comprobar e imprimiría fuera de turno, rompiendo la alternancia.</p>,
  },
]

const exTurnos3 = [
  {
    id: 'b2-t3-notify', kind: 'choice',
    prompt: <p>En la versión de 3 hilos cambiamos todos los <C>notifyAll()</C> por <C>notify()</C>. ¿Qué pasa?</p>,
    options: [
      { t: 'Funciona igual pero más eficiente', why: 'notify despierta a uno al azar, que puede ser el equivocado.' },
      { t: 'Puede quedarse bloqueado: si notify despierta al hilo equivocado, vuelve a dormir y nadie avisa al correcto', ok: true },
      { t: 'Imprime los mensajes desordenados', why: 'El while impide imprimir fuera de turno: el problema es otro.' },
    ],
    model: <p>Puede producirse un <strong>bloqueo</strong>. Con tres hilos, al cambiar el turno puede haber dos hilos en el Wait Set y <C>notify()</C> despierta solo a uno, arbitrario. Si despierta al que no le toca, este re-evalúa su <C>while</C>, vuelve a <C>wait()</C> sin notificar a nadie, y el hilo correcto sigue esperando. Los tres acaban en WAITING y el programa se cuelga. <C>notifyAll()</C> despierta a todos y cada uno re-comprueba su condición, así que el correcto siempre avanza.</p>,
  },
  {
    id: 'b2-t3-cuentas', kind: 'choice',
    prompt: <p>¿Y si el <C>for</C> de <C>Hilo3</C> fuera de 100 vueltas en lugar de 200?</p>,
    options: [
      { t: 'Imprime 100 si, 100 no y 100 depende', why: 'Tras el último depende no habrá nadie que ponga turno = 2.' },
      { t: 'Hilo3 termina a mitad y Hilo1 y Hilo2 se quedan esperando: el programa no termina', ok: true },
      { t: 'Excepción al acabar Hilo3', why: 'No hay excepción, solo espera infinita.' },
    ],
    model: <p>Hilo3 hace sus 100 «depende» (tras 50 «si» y 50 «no») y termina. El último «depende» deja <C>turno = 0</C>: Hilo1 imprime «si» y pone <C>turno = 2</C>, pero ya no hay Hilo3 para pasarlo a 1 o 0. Hilo1 y Hilo2 quedan en <C>wait()</C> indefinidamente, <C>main</C> se queda en <C>h1.join()</C> y el programa no termina. El número de iteraciones de cada hilo tiene que cuadrar con la máquina de estados.</p>,
  },
  {
    id: 'b2-t3-write', kind: 'write',
    prompt: <p>Describe la salida del <C>EJ3</C> de 3 hilos y explica el papel de <C>EstadoCompartido</C>.</p>,
    model: <p>Imprime el ciclo «si, depende, no, depende» repetido 100 veces (400 líneas: 100 «si», 100 «no», 200 «depende») y después los tres «ha terminado». <C>EstadoCompartido</C> encapsula el estado compartido (<C>turno</C>: 0 = Hilo1, 1 = Hilo2, 2 = Hilo3) y el objeto <C>lock</C> que lo protege. Se crea una única instancia en <C>main</C> y se pasa a los tres hilos por el constructor, así todos sincronizan sobre el mismo monitor sin variables <C>static</C>. Cada hilo espera con <C>while (turno != suyo) wait()</C>, imprime, cambia el turno y hace <C>notifyAll()</C>. Es necesario <C>notifyAll()</C> porque con más de dos hilos <C>notify()</C> podría despertar al hilo equivocado y provocar un bloqueo.</p>,
  },
]

export const lessonsB2 = [
  { id: 'monitor', title: 'Monitor, estados y wait/notify', minutes: 6, Body: Monitor, exercises: exMonitor },
  { id: 'sin-synchronized', title: 'IllegalMonitorStateException', minutes: 3, Body: SinSync, exercises: exSinSync },
  { id: 'notify-perdido', title: 'Notificación perdida', minutes: 3, Body: Perdido, exercises: exPerdido },
  { id: 'monitor-equivocado', title: 'Monitor equivocado (lockA / lockB)', minutes: 3, Body: OtroObjeto, exercises: exOtro },
  { id: 'condicion', title: 'Condición no actualizada', minutes: 3, Body: CondNoAct, exercises: exCond },
  { id: 'ejercicio-8b', title: 'Ejercicio 8b y trampas de llaves', minutes: 5, Body: Ej8b, exercises: ex8b },
  { id: 'turnos-2', title: 'Turnos con 2 hilos (si / no)', minutes: 4, Body: Turnos2, exercises: exTurnos2 },
  { id: 'turnos-3', title: 'Turnos con 3 hilos y notifyAll()', minutes: 5, Body: Turnos3, exercises: exTurnos3 },
]
