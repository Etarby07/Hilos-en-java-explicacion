import { C } from '../components/ui'

// Simulacro: variantes nuevas (no repetidas de las lecciones). 1 punto cada una.
export const examQuestions = [
  {
    id: 'ex-1', kind: 'choice', topic: 'Carrera',
    prompt: <p>Se intenta arreglar <C>Main</C> así. ¿Qué imprime «Resultado final»?</p>,
    file: 'Main (variante)',
    code: `
static int resultado = 0;

static class Hilo extends Thread {
    private int cantidad;
    public Hilo(int cantidad) { this.cantidad = cantidad; }

    @Override
    public void run() {
        for (int i = 0; i < cantidad; i++) {
            synchronized (this) {
                resultado++;
            }
        }
    }
}
// main: new Hilo(20000), new Hilo(30000), new Hilo(50000) + start + join`,
    codeProps: { err: [10] },
    options: [
      { t: 'Siempre 100000', why: 'this es distinto en cada hilo.' },
      { t: 'Un valor ≤ 100000, normalmente menor', ok: true },
      { t: 'Se queda bloqueado (deadlock)', why: 'Nadie compite por el mismo monitor.' },
    ],
    model: <p>Un valor <strong>≤ 100000</strong>, normalmente menor. <C>synchronized (this)</C> dentro de <C>run()</C> usa el monitor de cada objeto <C>Hilo</C>, y como hay tres instancias distintas no hay exclusión mutua: cada hilo bloquea su propio monitor. <C>resultado++</C> sigue con condición de carrera. Hay que sincronizar sobre un objeto común (<C>static final Object lock</C>) o usar un método <C>static synchronized</C>.</p>,
  },
  {
    id: 'ex-2', kind: 'write', topic: 'wait/notify',
    prompt: <p>Ahora es <C>main</C> quien hace <C>Thread.sleep(500)</C> antes de su <C>synchronized (lock) {'{ lock.notify(); }'}</C>, y el esperador entra directamente en <C>synchronized (lock) {'{ lock.wait(); }'}</C> sin dormir. ¿Funciona? ¿Es correcto?</p>,
    model: <p><strong>En la práctica suele funcionar</strong>: el esperador entra primero, llama a <C>wait()</C> (libera el lock y queda WAITING en el Wait Set) y, a los 500 ms, <C>main</C> adquiere el lock y su <C>notify()</C> lo despierta. Pero <strong>no es correcto</strong>: depende de los tiempos. Si por planificación el esperador tardase más de 500 ms en llegar al <C>wait()</C>, la notificación se perdería (Wait Set vacío) y quedaría bloqueado para siempre. Además, sin condición un despertar espurio le haría continuar sin motivo. La solución robusta es una variable de condición: <C>while (!listo) lock.wait();</C> y <C>listo = true; lock.notify();</C> dentro del <C>synchronized</C>.</p>,
  },
  {
    id: 'ex-3', kind: 'choice', topic: 'wait/notify',
    prompt: <p>Hilo esperador y hilo <C>main</C>. ¿Qué imprime el esperador?</p>,
    code: `
// esperador
synchronized (lock) {
    if (!listo) {
        lock.wait();
    }
    System.out.println("Continúo, listo = " + listo);
}

// main (después de que el esperador esté en wait)
synchronized (lock) {
    lock.notifyAll();
}`,
    codeProps: { err: [3, 11] },
    options: [
      { t: 'Nada: vuelve a dormirse', why: 'Con if no vuelve a comprobar la condición.' },
      { t: '«Continúo, listo = false»', ok: true },
      { t: '«Continúo, listo = true»', why: 'Nadie ha puesto listo a true.' },
    ],
    model: <p>Imprime <strong>«Continúo, listo = false»</strong>. <C>notifyAll()</C> despierta al esperador y, como la espera está en un <C>if</C> y no en un <C>while</C>, no re-comprueba la condición y continúa aunque <C>listo</C> siga siendo false. Hay dos errores: el notificador no actualiza la condición antes de notificar, y el esperador usa <C>if</C>. Con <C>while</C> se volvería a dormir (como en Ejercicio8). Lo correcto es <C>listo = true</C> antes del <C>notifyAll()</C> y <C>while (!listo)</C>.</p>,
  },
  {
    id: 'ex-4', kind: 'write', topic: 'Semaphore',
    prompt: <p>¿Qué riesgo tiene esta versión de <C>MainSemaphore</C>?</p>,
    code: `
try {
    mutex.acquire();
    resultado++;
} catch (InterruptedException e) {
    Thread.currentThread().interrupt();
} finally {
    mutex.release();
}`,
    codeProps: { err: [2, 7] },
    model: <p>El <C>acquire()</C> está <strong>dentro</strong> del <C>try</C> cuyo <C>finally</C> hace <C>release()</C>. Si el hilo es interrumpido mientras espera en <C>acquire()</C>, se lanza <C>InterruptedException</C> <strong>sin haber obtenido el permiso</strong>, pero el <C>finally</C> ejecuta igualmente <C>release()</C>. El semáforo ganaría un permiso de más (pasaría a 2): dos hilos podrían entrar a la vez en la sección crítica y se rompería la exclusión mutua. El patrón correcto es <C>acquire()</C> fuera y <C>try {'{ resultado++; }'} finally {'{ release(); }'}</C> justo después.</p>,
  },
  {
    id: 'ex-5', kind: 'choice', topic: 'Turnos',
    prompt: <p>En el <C>EJ3</C> de dos hilos (si / no), se cambia la inicialización a <C>static boolean turno = false;</C>. ¿Qué pasa?</p>,
    options: [
      { t: 'Deadlock: ninguno puede empezar', why: 'turno = false significa que le toca a Hilo2.' },
      { t: 'Empieza por «no» y alterna: no, si, no, si…', ok: true },
      { t: 'Igual que antes: empieza por «si»', why: 'Hilo1 espera mientras !turno.' },
    ],
    model: <p>Empieza por <strong>«no»</strong>. Con <C>turno == false</C>, Hilo1 queda esperando en <C>while (!turno)</C> y Hilo2 puede imprimir. Después alternan: no, si, no, si… 100 veces cada uno, y terminan los dos sin bloqueo, porque el último «si» lo imprime Hilo1 tras el último «no».</p>,
  },
  {
    id: 'ex-6', kind: 'write', topic: 'Turnos',
    prompt: <p>Explica la salida del <C>EJ3</C> de tres hilos (<C>EstadoCompartido</C>, Hilo1 «si», Hilo2 «no», Hilo3 «depende») y por qué usa <C>notifyAll()</C>.</p>,
    model: <p>La salida es el ciclo «si, depende, no, depende» repetido 100 veces: 100 «si», 100 «no» y 200 «depende», y después los tres «ha terminado». Los tres hilos comparten una instancia de <C>EstadoCompartido</C> con <C>turno</C> (0 = Hilo1, 1 = Hilo2, 2 = Hilo3) y su <C>lock</C>. Cada uno espera con <C>while (turno != suyo) lock.wait()</C>, imprime, cambia el turno (Hilo1 y Hilo2 lo ponen a 2; Hilo3 alterna entre 1 y 0 con <C>despuesDeSi</C>) y avisa. Se usa <C>notifyAll()</C> porque, con tres hilos, en el Wait Set puede haber dos y solo uno es el correcto. <C>notify()</C> podría despertar al equivocado, que volvería a dormirse sin avisar, y los tres quedarían esperando (deadlock). Con <C>notifyAll()</C> todos re-comprueban su <C>while</C> y el correcto avanza.</p>,
  },
  {
    id: 'ex-7', kind: 'choice', topic: 'Sockets',
    prompt: <p>El cliente envía con <C>salida.print(msg); salida.flush();</C> (<C>print</C>, no <C>println</C>) y el servidor lee con <C>in.readLine()</C>. ¿Qué pasa?</p>,
    options: [
      { t: 'Funciona: flush() envía los datos', why: 'Se envían, pero sin salto de línea.' },
      { t: 'El servidor se queda bloqueado en readLine() porque nunca llega el salto de línea', ok: true },
      { t: 'readLine() devuelve null', why: 'null es solo cuando el otro cierra la conexión.' },
    ],
    model: <p>Los bytes del mensaje sí llegan (gracias a <C>flush()</C>), pero <C>readLine()</C> solo devuelve cuando recibe un <strong>fin de línea</strong>. Como <C>print()</C> no lo añade, el servidor se queda bloqueado esperando el resto de la línea. Mientras tanto el cliente espera la respuesta en su <C>readLine()</C>: los dos quedan bloqueados. Hay que usar <C>println()</C>.</p>,
  },
  {
    id: 'ex-8', kind: 'write', topic: 'Sockets',
    prompt: <p>Se elimina la línea <C>hash += "asd"</C> del cliente, pero en el servidor se borra <C>out.flush()</C>. Describe qué ocurre cuando el cliente envía su primer mensaje.</p>,
    model: <p>El cliente envía mensaje y hash correctos (con <C>flush</C>) y se bloquea en <C>entrada.readLine()</C>. El servidor lee las dos líneas, el hash coincide, el usuario del servidor escribe una respuesta y <C>out.println(serverMsg)</C> la deja en el buffer del <C>BufferedWriter</C>, pero sin <C>flush()</C> no se envía. El servidor vuelve a <C>in.readLine()</C> y se bloquea. Resultado: el cliente espera la respuesta y el servidor espera el siguiente mensaje, y ambos quedan bloqueados indefinidamente sin ningún error. Solución: <C>out.flush()</C> tras el <C>println</C>, o crear el <C>PrintWriter</C> con autoFlush.</p>,
  },
  {
    id: 'ex-9', kind: 'choice', topic: 'Sockets',
    prompt: <p>El servidor se crea con <C>new ServerSocket(4242, 10, InetAddress.getByName("127.0.0.1"))</C> y un cliente en <strong>otro ordenador</strong> de la misma red se conecta a la IP del servidor. ¿Qué pasa?</p>,
    options: [
      { t: 'Conecta sin problema', why: '127.0.0.1 es la interfaz local (loopback).' },
      { t: 'El cliente no puede conectar: el servidor solo escucha en loopback', ok: true },
      { t: 'El servidor lanza BindException', why: '127.0.0.1 siempre existe; el bind funciona.' },
    ],
    model: <p>El servidor solo escucha en la interfaz <strong>loopback</strong> (127.0.0.1), que únicamente es accesible desde la propia máquina. Las conexiones que llegan por la interfaz de red (wifi/ethernet) no tienen a nadie escuchando en ese puerto, así que el cliente remoto recibe <C>ConnectException</C> (Connection refused) y el servidor sigue esperando en <C>accept()</C>. Para aceptar conexiones de la red hay que enlazar a <C>0.0.0.0</C> (todas las interfaces) o a la IP concreta de la red. El backlog 10 limita la cola de conexiones pendientes.</p>,
  },
  {
    id: 'ex-10', kind: 'write', topic: 'Deadlock',
    prompt: <p>Clásico de examen. ¿Qué puede pasar al ejecutar estos dos hilos a la vez?</p>,
    code: `
// Hilo A
synchronized (lockA) {
    Thread.sleep(100);
    synchronized (lockB) {
        System.out.println("A tiene los dos");
    }
}

// Hilo B
synchronized (lockB) {
    Thread.sleep(100);
    synchronized (lockA) {
        System.out.println("B tiene los dos");
    }
}`,
    codeProps: { err: [4, 12] },
    model: <p>Se produce un <strong>deadlock (interbloqueo)</strong>. El hilo A adquiere <C>lockA</C> y el B adquiere <C>lockB</C>. Durante el <C>sleep(100)</C>, que no suelta el lock, cada uno mantiene el suyo. Después A intenta coger <C>lockB</C> (lo tiene B) y queda BLOCKED, y B intenta coger <C>lockA</C> (lo tiene A) y también queda BLOCKED. Cada uno espera un recurso que tiene el otro: <strong>espera circular</strong>. No se imprime nada y el programa nunca termina. Solución: adquirir los locks <strong>siempre en el mismo orden</strong> en todos los hilos (primero <C>lockA</C>, luego <C>lockB</C>), o usar un único lock.</p>,
  },
]
