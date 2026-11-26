import CodeBlock from '../components/CodeBlock'
import { C, Callout, Model, Mk, Section, Trace } from '../components/ui'

/* ───────────────────────── Código del PDF ───────────────────────── */

export const CONTADOR = `
public class Ejercicio1_ContadorSinSync {

    static int contador = 0;

    static void incrementar() {
        contador++;
    }

    public static void main(String[] args) throws InterruptedException {
        Runnable tarea = () -> {
            for (int i = 0; i < 100_000; i++) {
                incrementar();
            }
        };

        Thread h1 = new Thread(tarea);
        Thread h2 = new Thread(tarea);
        h1.start();
        h2.start();
        h1.join();
        h2.join();

        System.out.println("Esperado: 200000");
        System.out.println("Obtenido: " + contador);
    }
}`

const MAIN = `
public class Main {

    static int resultado = 0;

    static class Hilo extends Thread {
        private int cantidad;

        public Hilo(int cantidad) {
            this.cantidad = cantidad;
        }

        @Override
        public void run() {
            for (int i = 0; i < cantidad; i++) {
                resultado = resultado + 1;
            }
            System.out.println(getName() + " ha terminado");
        }
    }

    public static void main(String[] args) throws InterruptedException {
        Hilo h1 = new Hilo(20000);
        Hilo h2 = new Hilo(30000);
        Hilo h3 = new Hilo(50000);

        h1.start();
        h2.start();
        h3.start();

        h1.join();
        h2.join();
        h3.join();

        System.out.println("Resultado final: " + resultado);
    }
}`

const SYNCRO = `
public class MainSyncro {

    static int resultado = 0;

    // Método sincronizado
    public static synchronized void incrementar() {
        resultado++;
    }

    static class Hilo extends Thread {
        private int cantidad;

        public Hilo(int cantidad) {
            this.cantidad = cantidad;
        }

        @Override
        public void run() {
            for (int i = 0; i < cantidad; i++) {
                incrementar();
            }
            System.out.println(getName() + " ha terminado");
        }
    }

    public static void main(String[] args) throws InterruptedException {
        Hilo h1 = new Hilo(2000);
        Hilo h2 = new Hilo(3000);
        Hilo h3 = new Hilo(5000);
        h1.start(); h2.start(); h3.start();
        h1.join();  h2.join();  h3.join();
        System.out.println("Resultado final: " + resultado);
    }
}`

const LOCK = `
public class MainLock {

    static int resultado = 0;

    // Objeto compartido que utilizaremos como bloqueo
    static final Object lock = new Object();

    static class Hilo extends Thread {
        private int cantidad;
        public Hilo(int cantidad) {
            this.cantidad = cantidad;
        }

        @Override
        public void run() {
            for (int i = 0; i < cantidad; i++) {
                synchronized (lock) {
                    resultado++;
                }
            }
            System.out.println(getName() + " ha terminado");
        }
    }

    public static void main(String[] args) throws InterruptedException {
        Hilo h1 = new Hilo(2000);
        Hilo h2 = new Hilo(3000);
        Hilo h3 = new Hilo(5000);
        h1.start(); h2.start(); h3.start();
        h1.join();  h2.join();  h3.join();
        System.out.println("Resultado final: " + resultado);
    }
}`

const SEMAPHORE = `
import java.util.concurrent.Semaphore;

public class MainSemaphore {

    static int resultado = 0;

    // Creamos un semáforo con un único permiso
    static Semaphore mutex = new Semaphore(1);

    static class Hilo extends Thread {
        private int cantidad;

        public Hilo(int cantidad) {
            this.cantidad = cantidad;
        }

        @Override
        public void run() {
            try {
                for (int i = 0; i < cantidad; i++) {
                    mutex.acquire();
                    try {
                        resultado++;
                    } finally {
                        mutex.release();
                    }
                }
                System.out.println(getName() + " ha terminado");
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }
    }

    public static void main(String[] args) throws InterruptedException {
        Hilo h1 = new Hilo(2000);
        Hilo h2 = new Hilo(3000);
        Hilo h3 = new Hilo(5000);
        h1.start(); h2.start(); h3.start();
        h1.join();  h2.join();  h3.join();
        System.out.println("Resultado final: " + resultado);
    }
}`

/* ───────────────────────── 1.1 Hilos ───────────────────────── */

function Hilos() {
  return (
    <>
      <p>
        Todo el examen gira alrededor de una idea: <Mk>varios hilos tocando la misma variable a la vez</Mk>.
        Antes de ver cómo se rompe, hay que tener claro qué comparten los hilos y qué no.
      </p>

      <Section n={1} title="Proceso vs hilo">
        <table>
          <thead><tr><th></th><th>Proceso</th><th>Hilo (thread)</th></tr></thead>
          <tbody>
            <tr><td>Memoria</td><td>Propia, aislada de otros procesos</td><td><strong>Comparte el heap</strong> con los demás hilos del proceso</td></tr>
            <tr><td>Pila (variables locales)</td><td>—</td><td><strong>Propia</strong> para cada hilo</td></tr>
            <tr><td>Coste de crear</td><td>Alto</td><td>Bajo</td></tr>
            <tr><td>Comunicación</td><td>Sockets, ficheros, pipes…</td><td>Directamente por variables compartidas (y ahí está el peligro)</td></tr>
          </tbody>
        </table>
        <Callout type="tip">
          <p>
            En el PDF, <C>static int contador</C> y <C>static int resultado</C> viven en el heap y los ven <strong>todos</strong> los hilos: son <strong>estado mutable compartido</strong>.
            En cambio, la <C>i</C> del <C>for</C> es una variable local: cada hilo tiene la suya en su pila, y nunca da problemas.
          </p>
        </Callout>
      </Section>

      <Section n={2} title="Concurrencia no es paralelismo">
        <p>
          <strong>Concurrencia</strong> es <em>estructurar</em> el programa en tareas que avanzan de forma independiente e intercalada.
          <strong> Paralelismo</strong> es <em>ejecutar</em> varias cosas en el mismo instante, en núcleos distintos.
          Con un solo núcleo puede haber concurrencia (el planificador va alternando hilos) pero no paralelismo.
        </p>
        <Callout type="book" title="100 cosas · Rob Pike">
          <p>
            Pike lo resume así: la concurrencia consiste en <em>gestionar</em> muchas cosas a la vez, y el paralelismo en <em>hacer</em> muchas cosas a la vez.
            También advierte que el estado mutable compartido es la fuente clásica de bugs: si dos hilos leen <C>counter = 5</C> a la vez, los dos escriben 6.
            Esa es, literalmente, la pregunta del contador del examen.
          </p>
        </Callout>
        <p>
          Para el examen da igual cuántos núcleos tenga la máquina: <Mk>la condición de carrera aparece en los dos casos</Mk>, porque el planificador puede quitarle la CPU a un hilo entre dos instrucciones cualesquiera.
        </p>
      </Section>

      <Section n={3} title="Crear, arrancar y esperar hilos">
        <CodeBlock title="Las dos formas del PDF" code={`
// 1) Runnable con lambda (Ejercicio1_ContadorSinSync)
Runnable tarea = () -> { /* ... */ };
Thread h1 = new Thread(tarea);

// 2) Heredar de Thread (Main, MainSyncro, MainLock, EJ3...)
static class Hilo extends Thread {
    @Override
    public void run() { /* ... */ }
}

h1.start();   // crea un hilo NUEVO que ejecuta run()
h1.join();    // el hilo actual (main) espera a que h1 termine`} hl={[11, 12]} />
        <ul>
          <li><C>start()</C> pide a la JVM un hilo nuevo que ejecutará <C>run()</C> en paralelo con <C>main</C>.</li>
          <li>Llamar a <C>run()</C> a mano <strong>no crea ningún hilo</strong>: es una llamada normal que se ejecuta en <C>main</C>, de forma secuencial. Es una pregunta trampa clásica.</li>
          <li><C>join()</C> bloquea al hilo que lo llama hasta que el otro termina. Sin los <C>join()</C>, <C>main</C> imprimiría el resultado <strong>antes</strong> de que los hilos acaben.</li>
          <li><C>getName()</C> devuelve <C>Thread-0</C>, <C>Thread-1</C>… según el orden de creación, <strong>no</strong> el orden en que terminan.</li>
        </ul>
      </Section>

      <Section n={4} title="Estados de un hilo">
        <table>
          <thead><tr><th>Estado</th><th>Cuándo</th></tr></thead>
          <tbody>
            <tr><td><C>NEW</C></td><td>Creado con <C>new</C>, todavía sin <C>start()</C></td></tr>
            <tr><td><C>RUNNABLE</C></td><td>Ejecutándose o listo para ejecutarse</td></tr>
            <tr><td><C>BLOCKED</C></td><td>Esperando para entrar en un <C>synchronized</C> cuyo lock tiene otro hilo</td></tr>
            <tr><td><C>WAITING</C></td><td>En <C>wait()</C> o <C>join()</C> sin tiempo, hasta que alguien le avise</td></tr>
            <tr><td><C>TIMED_WAITING</C></td><td><C>sleep(ms)</C>, <C>wait(ms)</C>, <C>join(ms)</C></td></tr>
            <tr><td><C>TERMINATED</C></td><td>Ha terminado <C>run()</C></td></tr>
          </tbody>
        </table>
        <Callout type="exam">
          <p>Usa estos nombres exactos al explicar un bloqueo: «el hilo queda en estado <strong>BLOCKED</strong> esperando el monitor» o «queda en <strong>WAITING</strong> en el wait set de lock». Suenan precisos y suman puntos.</p>
        </Callout>
      </Section>

      <Section n={5} title="No determinismo">
        <p>
          Con hilos, el orden de ejecución lo decide el planificador del sistema operativo. Si ejecutas el mismo programa dos veces, los
          <C>Thread-X ha terminado</C> pueden salir en distinto orden. Cuando te pregunten «¿qué imprime?», di qué parte es
          <strong> segura</strong> y qué parte <strong>puede variar</strong>.
        </p>
      </Section>
    </>
  )
}

/* ───────────────────────── 1.2 Carrera ───────────────────────── */

function Carrera() {
  return (
    <>
      <p>
        Este es el ejercicio estrella. Dos hilos incrementan 100.000 veces cada uno la misma variable.
        Lo lógico sería esperar 200.000, pero <Mk>casi siempre sale menos, y un número distinto en cada ejecución</Mk>.
      </p>
      <CodeBlock title="Ejercicio1_ContadorSinSync.java" code={CONTADOR} err={[6]} notes={{ 6: 'no es atómico' }} />

      <Section n={1} title="Por qué contador++ no es atómico">
        <p>Una sola línea de Java son <strong>tres</strong> operaciones a nivel de máquina (en bytecode: <C>getstatic</C>, <C>iadd</C>, <C>putstatic</C>):</p>
        <ol>
          <li><strong>Leer</strong> el valor de <C>contador</C> de memoria.</li>
          <li><strong>Sumar</strong> 1 en un registro.</li>
          <li><strong>Escribir</strong> el resultado en memoria.</li>
        </ol>
        <p>Este patrón se llama <strong>lectura-modificación-escritura</strong>. Si el planificador cambia de hilo entre el paso 1 y el 3, se pierde un incremento:</p>
        <Trace head={['t', 'Hilo h1', 'Hilo h2', 'contador en memoria']} bad={[3]} rows={[
          ['1', 'lee 41', '', '41'],
          ['2', '', 'lee 41', '41'],
          ['3', 'suma → 42, escribe 42', '', '42'],
          ['4', '', 'suma → 42, escribe 42', '42  ⚠ debería ser 43'],
        ]} />
        <p>
          Hubo dos incrementos y el contador solo subió uno: es una <strong>actualización perdida</strong> (<em>lost update</em>).
          Como pasa miles de veces en 200.000 iteraciones, el resultado final queda por debajo de lo esperado.
        </p>
      </Section>

      <Section n={2} title="Vocabulario que tienes que usar">
        <ul>
          <li><strong>Condición de carrera</strong> (<em>race condition</em>): el resultado depende del orden en que se intercalan los hilos.</li>
          <li><strong>Sección crítica</strong>: el trozo de código que accede al recurso compartido (aquí, <C>contador++</C>).</li>
          <li><strong>Exclusión mutua</strong>: garantizar que solo un hilo a la vez ejecuta la sección crítica.</li>
          <li><strong>Operación atómica</strong>: indivisible, ningún otro hilo puede ver un estado intermedio.</li>
        </ul>
      </Section>

      <Section n={3} title="La versión Main (3 hilos)">
        <CodeBlock title="Main.java" code={MAIN} err={[15]} hl={[30, 31, 32]} />
        <ul>
          <li><C>resultado = resultado + 1</C> es <strong>exactamente</strong> lo mismo que <C>resultado++</C>: lectura, suma y escritura. No es atómico.</li>
          <li>Lo esperado es 20.000 + 30.000 + 50.000 = <strong>100.000</strong>. Lo que se obtiene es un valor <strong>menor o igual</strong>, distinto en cada ejecución.</li>
          <li>Las tres líneas <C>Thread-0/1/2 ha terminado</C> salen en un orden no determinista (normalmente termina antes el que tiene menos trabajo, pero no está garantizado). <C>Resultado final</C> sale <strong>siempre al final</strong>, gracias a los <C>join()</C>.</li>
        </ul>
        <Callout type="warn" title="Que salga bien no demuestra nada">
          <p>
            Con cantidades pequeñas (2.000) a veces sale el resultado exacto: un hilo termina antes de que el siguiente arranque.
            Eso <strong>no</strong> significa que el código sea correcto, solo que esa vez no se pisaron. Una condición de carrera es un bug <em>latente</em>.
          </p>
        </Callout>
      </Section>

      <Section n={4} title="Cómo se arregla">
        <p>Hay que convertir la sección crítica en <strong>exclusión mutua</strong>. Las tres formas del PDF, de menor a mayor control, están en las tres lecciones siguientes:</p>
        <ol>
          <li><C>synchronized</C> en el método (<C>MainSyncro</C>).</li>
          <li>Bloque <C>synchronized (lock)</C> (<C>MainLock</C>).</li>
          <li><C>Semaphore(1)</C> con <C>acquire</C> / <C>release</C> (<C>MainSemaphore</C>).</li>
        </ol>
        <p>Alternativa sin bloqueos, por si la mencionas como extra: <C>AtomicInteger</C> con <C>incrementAndGet()</C>, que hace la operación de forma atómica.</p>
        <Callout type="trap" title="Trampa: volatile NO lo arregla">
          <p>
            <C>volatile</C> garantiza <strong>visibilidad</strong>: cada lectura va a memoria principal. Pero <C>contador++</C> sigue siendo tres pasos, así que dos hilos pueden seguir leyendo el mismo valor.
            <C>volatile</C> no da <strong>atomicidad</strong>.
          </p>
        </Callout>
      </Section>

      <Model>
        <p>
          Imprime «Esperado: 200000» y un «Obtenido» <strong>menor o igual a 200000</strong>, distinto en cada ejecución.
          <C>contador</C> es una variable <C>static</C> compartida por los dos hilos y <C>contador++</C> no es atómica: son tres operaciones (leer, sumar, escribir).
          Si un hilo lee el valor y, antes de escribirlo, el otro hilo lee el mismo valor, los dos escriben el mismo resultado y se pierde un incremento.
          Es una <strong>condición de carrera</strong> sobre una <strong>sección crítica</strong> sin exclusión mutua.
          Se soluciona sincronizando el acceso (<C>synchronized</C>, un lock o un <C>Semaphore(1)</C>), o usando <C>AtomicInteger</C>.
        </p>
      </Model>

      <Callout type="book" title="100 cosas · Rich Harris y Kernighan">
        <p>
          Harris insiste en que el problema no es mutar, sino <strong>mutar sin poder rastrearlo</strong>: cuando cualquiera puede modificar una variable, para saber su valor tienes que entender el programa entero.
          Kernighan añade que depurar es el doble de difícil que escribir el código. Con condiciones de carrera es aún peor: el fallo no se reproduce a voluntad.
          Por eso la regla es <strong>proteger por diseño</strong>, no por haberlo probado una vez.
        </p>
      </Callout>
    </>
  )
}

/* ───────────────────────── 1.3 synchronized método ───────────────────────── */

function SyncMetodo() {
  return (
    <>
      <p>La primera solución: marcar como <C>synchronized</C> el método que toca la variable compartida.</p>
      <CodeBlock title="MainSyncro.java" code={SYNCRO} ok={[6, 7, 8]} />

      <Section n={1} title="Qué hace synchronized">
        <p>
          En Java, <strong>cada objeto tiene un monitor</strong> (un lock intrínseco). Antes de entrar en un método o bloque <C>synchronized</C>, el hilo tiene que <strong>adquirir</strong> ese monitor.
          Si otro hilo ya lo tiene, se queda en <strong>BLOCKED</strong> hasta que se libere. Al salir del método, el monitor se libera <strong>automáticamente</strong>, incluso si salta una excepción.
        </p>
        <p>Resultado de <C>MainSyncro</C>: siempre <strong>«Resultado final: 10000»</strong> (2000 + 3000 + 5000). Antes, las tres líneas «ha terminado», en cualquier orden.</p>
      </Section>

      <Section n={2} title="¿Qué monitor bloquea? Class vs this">
        <table>
          <thead><tr><th>Declaración</th><th>Monitor que se adquiere</th></tr></thead>
          <tbody>
            <tr><td><C>static synchronized void m()</C></td><td>El objeto <C>Class</C>: <C>MainSyncro.class</C>. Hay <strong>uno solo</strong> en toda la JVM.</td></tr>
            <tr><td><C>synchronized void m()</C></td><td><C>this</C>: la instancia concreta sobre la que se llama.</td></tr>
            <tr><td><C>synchronized (obj) {'{ }'}</C></td><td>El objeto <C>obj</C> que tú elijas.</td></tr>
          </tbody>
        </table>
        <p>
          En <C>MainSyncro</C>, <C>incrementar()</C> es <C>static synchronized</C>, así que los tres hilos compiten por el mismo monitor (<C>MainSyncro.class</C>) y hay exclusión mutua real.
        </p>
      </Section>

      <Section n={3} title="La trampa: synchronized sobre this con varias instancias">
        <CodeBlock title="Variante trampa ✗" code={`
static class Hilo extends Thread {
    private int cantidad;

    // synchronized de INSTANCIA dentro de Hilo
    public synchronized void incrementar() {
        resultado++;          // resultado sigue siendo static (compartido)
    }

    @Override
    public void run() {
        for (int i = 0; i < cantidad; i++) incrementar();
    }
}`} err={[5]} />
        <p>
          Cada hilo es un objeto <C>Hilo</C> distinto, así que cada uno se sincroniza sobre <strong>su propio</strong> <C>this</C>.
          Son tres monitores distintos y nadie espera a nadie: <Mk>la carrera sigue ahí y el resultado vuelve a ser menor de 10000</Mk>.
          Para que haya exclusión mutua, todos los hilos tienen que sincronizarse sobre <strong>el mismo objeto</strong>.
        </p>
      </Section>

      <Section n={4} title="Detalles que pueden preguntar">
        <ul>
          <li><strong>Reentrante:</strong> un hilo que ya tiene un monitor puede volver a entrar en otro <C>synchronized</C> sobre el mismo objeto sin bloquearse.</li>
          <li><strong>Visibilidad:</strong> al soltar el monitor, los cambios se publican en memoria. El siguiente hilo que lo adquiera los verá.</li>
          <li><strong>Coste:</strong> aquí se adquiere y se libera el lock 10.000 veces. Es correcto, pero cuanto más pequeña es la sección crítica, más concurrencia permites.</li>
          <li>Un método <C>static synchronized</C> y otro <C>synchronized</C> de instancia de la misma clase <strong>no</strong> se excluyen entre sí, porque usan monitores distintos.</li>
        </ul>
      </Section>
    </>
  )
}

/* ───────────────────────── 1.4 synchronized(lock) ───────────────────────── */

function SyncLock() {
  return (
    <>
      <p>La segunda solución: un bloque <C>synchronized</C> sobre un objeto creado <em>solo</em> para usarlo como cerrojo.</p>
      <CodeBlock title="MainLock.java" code={LOCK} hl={[6]} ok={[17, 18, 19]} />

      <Section n={1} title="Por qué static final Object lock = new Object()">
        <table>
          <thead><tr><th>Palabra</th><th>Por qué</th></tr></thead>
          <tbody>
            <tr><td><C>static</C></td><td>Hay <strong>un único</strong> objeto <C>lock</C> compartido por todas las instancias de <C>Hilo</C>. Sin <C>static</C> (y declarado dentro de <C>Hilo</C>), cada hilo tendría su propio lock y no habría exclusión.</td></tr>
            <tr><td><C>final</C></td><td>La referencia no se puede reasignar. Si alguien hiciera <C>lock = new Object()</C> a mitad de ejecución, unos hilos se sincronizarían sobre el objeto viejo y otros sobre el nuevo.</td></tr>
            <tr><td><C>Object</C></td><td>Basta un objeto cualquiera: lo que importa es su monitor, no su contenido. Es un objeto <strong>dedicado</strong>: ningún código externo lo usa para otra cosa.</td></tr>
          </tbody>
        </table>
      </Section>

      <Section n={2} title="Bloque vs método">
        <ul>
          <li>El bloque permite proteger <strong>solo</strong> la sección crítica (<C>resultado++</C>) y elegir explícitamente el monitor.</li>
          <li>El resultado es idéntico al de <C>MainSyncro</C>: <strong>«Resultado final: 10000»</strong>.</li>
          <li>Este patrón (<C>lock</C> + <C>synchronized</C>) es la base del Bloque 2: <C>wait()</C> y <C>notify()</C> se llaman sobre ese mismo <C>lock</C>.</li>
        </ul>
      </Section>

      <Section n={3} title="Malos objetos para sincronizar">
        <CodeBlock title="Variantes trampa ✗" code={`
synchronized (new Object()) {   // un objeto NUEVO en cada iteración
    resultado++;                // → nadie comparte monitor: NO hay exclusión
}

Integer contador = 0;
synchronized (contador) {       // contador++ crea OTRO Integer (autoboxing)
    contador++;                 // → el monitor cambia: NO hay exclusión
}

synchronized ("lock") { }       // literal String: compartido en TODA la JVM
                                // → otro código ajeno podría bloquearlo`} err={[1, 6, 10]} />
        <Callout type="exam">
          <p>Regla para el folio: <strong>todos los hilos deben sincronizarse sobre la misma instancia, y esa instancia no debe cambiar</strong>. Si ves un <C>new</C> dentro del <C>synchronized(...)</C>, o un lock sin <C>static</C> en una clase de la que se crean varios hilos, no hay exclusión mutua.</p>
        </Callout>
      </Section>
    </>
  )
}

/* ───────────────────────── 1.5 Semaphore ───────────────────────── */

function Semaforo() {
  return (
    <>
      <p>La tercera solución usa <C>java.util.concurrent.Semaphore</C>: un contador de <strong>permisos</strong>.</p>
      <CodeBlock title="MainSemaphore.java" code={SEMAPHORE} hl={[8]} ok={[21, 22, 23, 24, 25, 26]} />

      <Section n={1} title="Cómo funciona">
        <ul>
          <li><C>new Semaphore(1)</C>: un único permiso, lo que equivale a un <strong>mutex</strong> (semáforo binario).</li>
          <li><C>acquire()</C>: si hay permisos, coge uno (el contador baja a 0). Si no hay, el hilo <strong>se bloquea</strong> hasta que alguien libere uno.</li>
          <li><C>release()</C>: devuelve un permiso (el contador sube) y despierta a un hilo que estuviera esperando.</li>
          <li><C>acquire()</C> lanza <C>InterruptedException</C> (checked), por eso todo va dentro de <C>try / catch</C>.</li>
        </ul>
        <p>Resultado: tres «ha terminado» en cualquier orden y <strong>«Resultado final: 10000»</strong>.</p>
      </Section>

      <Section n={2} title="Por qué release() va en finally">
        <p>
          Con <C>synchronized</C>, la JVM suelta el monitor automáticamente al salir, haya o no excepción. <Mk>Con un semáforo no: si no llamas a release(), el permiso se pierde para siempre.</Mk>
        </p>
        <CodeBlock title="Variante trampa ✗" code={`
mutex.acquire();
resultado++;          // si aquí salta una excepción...
mutex.release();      // ...esta línea no se ejecuta nunca`} err={[3]} />
        <p>
          El semáforo se queda a 0 y el resto de hilos se bloquea en <C>acquire()</C> para siempre. El programa se cuelga sin terminar (bloqueo indefinido).
          El <C>finally</C> garantiza que <C>release()</C> se ejecuta pase lo que pase.
        </p>
        <Callout type="tip" title="¿Y por qué acquire() va FUERA del try interno?">
          <p>
            Si <C>acquire()</C> lanza <C>InterruptedException</C>, el hilo <strong>no</strong> ha conseguido el permiso. Si estuviera dentro del <C>try</C>, el <C>finally</C> haría un <C>release()</C> de un permiso que nunca cogió.
            El semáforo pasaría a tener 2 permisos y se rompería la exclusión mutua. Por eso el patrón correcto es <C>acquire(); try {'{ … }'} finally {'{ release(); }'}</C>.
          </p>
        </Callout>
      </Section>

      <Section n={3} title="Semaphore vs synchronized">
        <table>
          <thead><tr><th></th><th>synchronized</th><th>Semaphore</th></tr></thead>
          <tbody>
            <tr><td>Liberación</td><td>Automática al salir</td><td>Manual: <C>release()</C> en <C>finally</C></td></tr>
            <tr><td>Dueño</td><td>Solo el hilo que lo tiene puede soltarlo</td><td><strong>Sin dueño</strong>: cualquier hilo puede hacer <C>release()</C></td></tr>
            <tr><td>Cuántos a la vez</td><td>Siempre 1</td><td>N permisos: <C>new Semaphore(3)</C> deja entrar a 3 (por ejemplo, un pool de conexiones)</td></tr>
            <tr><td>Memoria</td><td>—</td><td><strong>Recuerda</strong> los permisos: un <C>release()</C> previo no se pierde (a diferencia de <C>notify()</C>)</td></tr>
          </tbody>
        </table>
      </Section>

      <Section n={4} title="Variantes con el número de permisos">
        <ul>
          <li><C>new Semaphore(0)</C>: el primer <C>acquire()</C> se bloquea para siempre, porque nadie ha hecho <C>release()</C> antes. El programa se cuelga y no imprime ningún «ha terminado».</li>
          <li><C>new Semaphore(2)</C>: dos hilos pueden estar a la vez en <C>resultado++</C>. Vuelve la condición de carrera y el resultado puede ser menor de 10000.</li>
        </ul>
        <Callout type="exam">
          <p>
            En el <C>catch</C>, <C>Thread.currentThread().interrupt()</C> <strong>restaura el flag de interrupción</strong>, porque al capturar la excepción se borra.
            Así el código que viene después sabe que el hilo fue interrumpido. Es la forma correcta de tratar <C>InterruptedException</C> en lugar de ignorarla.
          </p>
        </Callout>
      </Section>
    </>
  )
}

/* ───────────────────────── Ejercicios ───────────────────────── */

const exHilos = [
  {
    id: 'b1-hilos-run', kind: 'choice',
    prompt: <p>Cambiamos el <C>main</C> de <C>Ejercicio1_ContadorSinSync</C> así. ¿Qué imprime?</p>,
    code: `
Thread h1 = new Thread(tarea);
Thread h2 = new Thread(tarea);
h1.run();
h2.run();
System.out.println("Obtenido: " + contador);`,
    codeProps: { err: [3, 4] },
    options: [
      { t: 'Un valor menor que 200000, distinto en cada ejecución', why: 'Eso pasaría con start(). Con run() no hay concurrencia.' },
      { t: 'Siempre 200000', ok: true, why: 'run() se ejecuta en el hilo main, primero entero h1 y luego h2: secuencial, sin carrera.' },
      { t: 'Lanza IllegalThreadStateException', why: 'Eso pasa si llamas a start() dos veces sobre el mismo hilo.' },
    ],
    model: <p>Siempre <strong>200000</strong>. Llamar a <C>run()</C> directamente no crea un hilo nuevo: ejecuta el método en el hilo <C>main</C>, de forma secuencial. Primero termina <C>h1.run()</C> y después empieza <C>h2.run()</C>, así que no hay acceso concurrente ni condición de carrera. Para ejecutar en paralelo hay que llamar a <C>start()</C>.</p>,
  },
  {
    id: 'b1-hilos-join', kind: 'choice',
    prompt: <p>Si en <C>Ejercicio1_ContadorSinSync</C> quitamos <C>h1.join()</C> y <C>h2.join()</C>, ¿qué se imprime en «Obtenido»?</p>,
    options: [
      { t: '200000, porque los hilos terminan muy rápido', why: 'main no espera a nadie: imprime en cuanto llega a esa línea.' },
      { t: 'Normalmente 0 o un valor parcial muy bajo: main imprime antes de que los hilos terminen', ok: true },
      { t: 'No compila: join() es obligatorio', why: 'join() es opcional; sin él simplemente no se espera.' },
    ],
    model: <p>Sin <C>join()</C>, el hilo <C>main</C> no espera a que terminen <C>h1</C> y <C>h2</C>: imprime en cuanto llega a <C>println</C>. Normalmente sale <strong>0 o un valor parcial</strong>, porque los hilos acaban de empezar. <C>join()</C> bloquea al hilo llamante hasta que el otro termina.</p>,
  },
  {
    id: 'b1-hilos-write', kind: 'write',
    prompt: <p>Explica qué variables de <C>Ejercicio1_ContadorSinSync</C> comparten los hilos y cuáles no, y por qué eso importa.</p>,
    model: <p>Los hilos de un proceso comparten el <strong>heap</strong>: <C>static int contador</C> es una sola variable que ven y modifican los dos hilos, así que es <strong>estado mutable compartido</strong> y requiere sincronización. Cada hilo tiene su propia <strong>pila</strong>, por lo que la variable local <C>i</C> del <C>for</C> es independiente en cada hilo y no da problemas. La lambda <C>tarea</C> es la misma para los dos hilos, pero no tiene estado propio: lo compartido es <C>contador</C>.</p>,
  },
]

const exCarrera = [
  {
    id: 'b1-carrera-main', kind: 'choice',
    prompt: <p>¿Qué valor puede imprimir <C>Main</C> en «Resultado final»?</p>,
    options: [
      { t: 'Exactamente 100000', why: 'Solo si tienes suerte, y no está garantizado.' },
      { t: 'Cualquier valor ≤ 100000, normalmente menor y distinto en cada ejecución', ok: true },
      { t: 'Más de 100000, porque se suman incrementos de más', why: 'Una carrera solo puede PERDER incrementos, nunca añadir.' },
    ],
    model: <p>Un valor <strong>menor o igual a 100000</strong> (20000 + 30000 + 50000), normalmente menor y distinto en cada ejecución. <C>resultado = resultado + 1</C> no es atómica (leer, sumar, escribir). Al intercalarse los hilos se producen <strong>actualizaciones perdidas</strong>. Nunca puede pasar de 100000, porque cada hilo hace como máximo sus incrementos.</p>,
  },
  {
    id: 'b1-carrera-volatile', kind: 'choice',
    prompt: <p>Un compañero propone declarar <C>static volatile int contador</C>. ¿Se arregla?</p>,
    options: [
      { t: 'Sí: volatile hace que todos vean el valor actualizado', why: 'Visibilidad sí, atomicidad no.' },
      { t: 'No: volatile da visibilidad pero contador++ sigue sin ser atómico', ok: true },
      { t: 'No compila: volatile no se puede usar con static', why: 'Sí se puede.' },
    ],
    model: <p><strong>No.</strong> <C>volatile</C> garantiza que las lecturas y escrituras van a memoria principal (<strong>visibilidad</strong>), pero <C>contador++</C> sigue siendo lectura, suma y escritura. Dos hilos pueden leer el mismo valor y escribir lo mismo. Hace falta exclusión mutua (<C>synchronized</C>, lock, <C>Semaphore</C>) o una operación atómica (<C>AtomicInteger.incrementAndGet()</C>).</p>,
  },
  {
    id: 'b1-carrera-write', kind: 'write',
    prompt: <p>Pregunta típica de examen: «Explica por qué <C>Ejercicio1_ContadorSinSync</C> no imprime 200000 y cómo lo solucionarías».</p>,
    model: <p><C>contador</C> es una variable <C>static</C> compartida por <C>h1</C> y <C>h2</C>. <C>contador++</C> no es atómica: se compone de leer el valor, sumarle 1 y escribirlo. Si el planificador cambia de hilo entre la lectura y la escritura, los dos hilos leen el mismo valor y escriben el mismo resultado, perdiendo un incremento. Es una <strong>condición de carrera</strong> en una <strong>sección crítica</strong> sin <strong>exclusión mutua</strong>, y el resultado es ≤ 200000 y no determinista. Solución: hacer <C>incrementar()</C> <C>static synchronized</C>, envolver <C>contador++</C> en <C>synchronized(lock)</C> con un <C>static final Object lock</C>, usar un <C>Semaphore(1)</C> con <C>release()</C> en <C>finally</C>, o usar <C>AtomicInteger</C>.</p>,
  },
]

const exSync = [
  {
    id: 'b1-sync-this', kind: 'choice',
    prompt: <p>En <C>MainSyncro</C> movemos el método dentro de <C>Hilo</C> como <C>public synchronized void incrementar()</C> (sin <C>static</C>). <C>resultado</C> sigue siendo <C>static</C>. ¿Qué pasa?</p>,
    options: [
      { t: 'Sigue dando 10000: el método sigue siendo synchronized', why: 'Pero cada hilo bloquea un monitor distinto.' },
      { t: 'Puede dar menos de 10000: cada hilo se sincroniza sobre su propio this', ok: true },
      { t: 'Deadlock: los tres hilos se bloquean entre sí', why: 'Al contrario: nadie bloquea a nadie.' },
    ],
    model: <p>Puede dar <strong>menos de 10000</strong>. Un método <C>synchronized</C> de instancia adquiere el monitor de <C>this</C>. Como cada hilo es un objeto <C>Hilo</C> distinto, cada uno bloquea un monitor diferente y no hay exclusión mutua sobre <C>resultado</C>, que sí es compartido. La condición de carrera sigue. Para arreglarlo, el método debe ser <C>static synchronized</C> (monitor <C>MainSyncro.class</C>, único) o sincronizar sobre un lock común.</p>,
  },
  {
    id: 'b1-sync-write', kind: 'write',
    prompt: <p>¿Qué monitor adquiere <C>public static synchronized void incrementar()</C> y por qué con él <C>MainSyncro</C> siempre imprime 10000?</p>,
    model: <p>Un método <C>static synchronized</C> adquiere el monitor del objeto <C>Class</C> de la clase, <C>MainSyncro.class</C>, que es único en la JVM. Los tres hilos compiten por ese mismo monitor: solo uno puede ejecutar <C>incrementar()</C> a la vez y los demás quedan en <strong>BLOCKED</strong>. Así <C>resultado++</C> se ejecuta en <strong>exclusión mutua</strong>, no se pierde ningún incremento y el resultado es 2000 + 3000 + 5000 = 10000. Además, al liberar el monitor se garantiza la visibilidad del valor actualizado.</p>,
  },
]

const exLock = [
  {
    id: 'b1-lock-nostatic', kind: 'choice',
    prompt: <p>En <C>MainLock</C> declaramos el lock <strong>dentro</strong> de la clase <C>Hilo</C>, así: <C>private final Object lock = new Object();</C>. ¿Resultado?</p>,
    options: [
      { t: 'Siempre 10000', why: 'Cada instancia de Hilo crea su propio Object.' },
      { t: 'Puede ser menor de 10000: hay tres locks distintos', ok: true },
      { t: 'No compila: un lock tiene que ser static', why: 'Compila; el error es lógico, no de compilación.' },
    ],
    model: <p>Puede ser <strong>menor de 10000</strong>. Sin <C>static</C>, cada objeto <C>Hilo</C> crea su propio <C>lock</C>. Los tres hilos se sincronizan sobre objetos distintos, nadie espera a nadie y <C>resultado++</C> vuelve a tener condición de carrera. El lock tiene que ser <strong>único y compartido</strong> (<C>static final</C>, o el mismo objeto pasado a todos los hilos).</p>,
  },
  {
    id: 'b1-lock-write', kind: 'write',
    prompt: <p>Justifica cada palabra de <C>static final Object lock = new Object();</C></p>,
    model: <p><C>static</C>: hay un único objeto lock compartido por todas las instancias de <C>Hilo</C>, así que todos los hilos compiten por el mismo monitor. <C>final</C>: la referencia no puede reasignarse; si cambiara, unos hilos se sincronizarían sobre el objeto viejo y otros sobre el nuevo, rompiendo la exclusión mutua. <C>Object</C>: basta cualquier objeto, porque solo se usa su monitor intrínseco. Al ser un objeto dedicado, ningún código externo puede bloquearlo por accidente.</p>,
  },
]

const exSem = [
  {
    id: 'b1-sem-0', kind: 'choice',
    prompt: <p>¿Qué pasa si en <C>MainSemaphore</C> se crea el semáforo con <C>new Semaphore(0)</C>?</p>,
    options: [
      { t: 'Funciona igual pero más lento', why: 'Sin permisos, nadie pasa del acquire.' },
      { t: 'Los tres hilos se bloquean en acquire() para siempre y el programa no termina', ok: true },
      { t: 'Lanza IllegalArgumentException', why: '0 es un valor válido (se usa para señalizar).' },
    ],
    model: <p>Con 0 permisos, el primer <C>acquire()</C> de cada hilo se bloquea, porque no hay permiso disponible y nadie va a hacer <C>release()</C> (solo se hace después de adquirir). Los tres hilos quedan bloqueados indefinidamente, <C>main</C> se queda en <C>h1.join()</C> y el programa <strong>nunca termina</strong> ni imprime nada.</p>,
  },
  {
    id: 'b1-sem-finally', kind: 'write',
    prompt: <p>Explica por qué en <C>MainSemaphore</C> <C>release()</C> está en un <C>finally</C>, y qué pasaría sin él si <C>resultado++</C> lanzara una excepción.</p>,
    model: <p>A diferencia de <C>synchronized</C>, un semáforo no libera el permiso automáticamente: hay que llamar a <C>release()</C>. Poniéndolo en <C>finally</C> se garantiza que el permiso se devuelve aunque la sección crítica lance una excepción. Sin <C>finally</C>, si saltara una excepción entre <C>acquire()</C> y <C>release()</C>, el permiso se perdería: el semáforo quedaría a 0 y el resto de hilos se bloquearía para siempre en <C>acquire()</C>, y el programa se colgaría. <C>acquire()</C> va fuera del <C>try</C> porque, si falla, no se ha obtenido permiso y no hay que liberarlo.</p>,
  },
  {
    id: 'b1-sem-2', kind: 'choice',
    prompt: <p>¿Y con <C>new Semaphore(2)</C>?</p>,
    options: [
      { t: 'Va más rápido y da 10000', why: 'Dos hilos a la vez en la sección crítica = carrera.' },
      { t: 'Dos hilos pueden ejecutar resultado++ a la vez: puede dar menos de 10000', ok: true },
      { t: 'Se bloquea', why: 'Con 2 permisos siempre hay sitio para alguien.' },
    ],
    model: <p>Con 2 permisos, <strong>dos hilos</strong> pueden estar dentro de la sección crítica a la vez: ya no es exclusión mutua. <C>resultado++</C> puede volver a perder incrementos y el resultado puede ser <strong>menor de 10000</strong>. Para exclusión mutua, el semáforo tiene que ser binario: <C>Semaphore(1)</C>.</p>,
  },
]

export const lessonsB1 = [
  { id: 'hilos', title: 'Hilos: concurrencia vs paralelismo', minutes: 5, Body: Hilos, exercises: exHilos },
  { id: 'carrera', title: 'La condición de carrera: contador++', minutes: 6, Body: Carrera, exercises: exCarrera },
  { id: 'sync-metodo', title: 'synchronized en el método', minutes: 4, Body: SyncMetodo, exercises: exSync },
  { id: 'sync-lock', title: 'Bloque synchronized (lock)', minutes: 3, Body: SyncLock, exercises: exLock },
  { id: 'semaforo', title: 'Semaphore: acquire, release y finally', minutes: 5, Body: Semaforo, exercises: exSem },
]
