import CodeBlock from '../components/CodeBlock'
import { C, Callout, Model, Mk, Section, Trace } from '../components/ui'

/* ───────────────────────── Código del PDF ───────────────────────── */

export const SERVER = `
package com.rroyo.pspud1;

import java.io.*;
import java.net.InetAddress;
import java.net.ServerSocket;
import java.net.Socket;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Scanner;

public class Server {

    private static final int PORT = 4242;
    private final ServerSocket server;

    public Server() throws IOException {
        server = new ServerSocket(PORT, 1000, InetAddress.getByName("0.0.0.0"));
    }

    public void init() throws IOException {
        System.out.println("Server initialized");

        Socket connection = null;
        BufferedReader in = null;
        PrintWriter out = null;

        try {
            MessageDigest m = MessageDigest.getInstance("SHA-256");

            connection = server.accept();
            System.out.println("CONNECTION ACCEPTED: " + connection);

            in = new BufferedReader(
                    new InputStreamReader(connection.getInputStream()));

            out = new PrintWriter(
                    new BufferedWriter(
                            new OutputStreamWriter(connection.getOutputStream())));

            Scanner stdin = new Scanner(System.in);

            boolean send = true;
            while (send) {
                String str = in.readLine();
                String hash = in.readLine();
                System.out.println("CLIENT: " + str);
                System.out.println("Hash: " + hash);

                m.update(str.getBytes());
                String hex = "";
                byte[] digest = m.digest();
                for (byte b : digest) {
                    String h = Integer.toHexString(b & 0xFF);
                    if (h.length() == 1) hex += "0";
                    hex += h;
                }

                if (hex.equals(hash)) {
                    System.out.print("-> ");
                    String serverMsg = stdin.nextLine();
                    out.println(serverMsg);
                    out.flush();
                } else {
                    System.err.println("Error al recibir el mensaje");
                }
            }
            stdin.close();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException(e);
        } finally {
            assert connection != null;
            assert in != null;
            assert out != null;
            connection.close();
            in.close();
            out.close();
        }
    }
}`

export const CLIENTE = `
package com.rroyo.pspud1;

import java.io.*;
import java.net.Socket;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Scanner;

public class Cliente {

    public static final String serverIp = "10.227.2.56";

    public static void main(String[] args) {

        Socket cliente = null;
        BufferedReader entrada = null;
        PrintWriter salida = null;

        try {
            cliente = new Socket(serverIp, 4242);

            entrada = new BufferedReader(new InputStreamReader(cliente.getInputStream()));

            salida = new PrintWriter(new BufferedWriter(new
                    OutputStreamWriter(cliente.getOutputStream())));

            System.out.println("CONECTADO");

            Scanner stdin = new Scanner(System.in);
            MessageDigest m = MessageDigest.getInstance("SHA-256");
            // Ahora a ver que hace mi cliente

            boolean enviando = true;

            while (enviando) {
                System.out.println("Escribe tu mensaje: ");
                String msg = stdin.nextLine();
                String hash = "";
                m.update(msg.getBytes());

                byte[] digest = m.digest();
                for (byte b : digest) {
                    String h = Integer.toHexString(b & 0xFF);
                    if (h.length() == 1) hash += "0";
                    hash += h;
                }
                hash += "asd";

                salida.println(msg);
                salida.println(hash);
                salida.flush();

                String respuesta = entrada.readLine();
                System.out.println("Servidor dice: " + respuesta);

                enviando = !msg.equals("BYE");
            }
            stdin.close();

        } catch (IOException e) {
            System.err.println("No se puede conectar!!");
            System.exit(-1);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException(e);
        } finally {
            salida.close();
            try {
                entrada.close();
                cliente.close();
            } catch (IOException e) {
                e.printStackTrace();
                System.exit(-1);
            }
        }

        System.out.println("Conexión finalizada, Saliendo...");
    }
}`

/* ───────────────────────── 3.1 Conexión ───────────────────────── */

function Conexion() {
  return (
    <>
      <p>
        Esta parte es el ~20% del examen. El PDF tiene un servidor (<C>Server</C>) y un cliente (<C>Cliente</C>) que se intercambian mensajes por <strong>TCP</strong>,
        acompañando cada mensaje de su hash SHA-256 para comprobar la integridad. Empezamos por cómo se establece la conexión.
      </p>
      <CodeBlock title="Server.java (constructor)" code={`
private static final int PORT = 4242;
private final ServerSocket server;

public Server() throws IOException {
    server = new ServerSocket(PORT, 1000, InetAddress.getByName("0.0.0.0"));
}`} hl={[5]} />

      <Section n={1} title="new ServerSocket(puerto, backlog, dirección)">
        <table>
          <thead><tr><th>Parámetro</th><th>En el PDF</th><th>Significado</th></tr></thead>
          <tbody>
            <tr><td>Puerto</td><td><C>4242</C></td><td>Número (0–65535) que identifica el servicio dentro de la máquina. Por debajo de 1024 son puertos reservados.</td></tr>
            <tr><td>Backlog</td><td><C>1000</C></td><td>Tamaño máximo de la <strong>cola de conexiones pendientes</strong>: clientes que ya han conectado pero que el servidor todavía no ha aceptado con <C>accept()</C>. Si la cola está llena, se rechazan.</td></tr>
            <tr><td>bindAddr</td><td><C>0.0.0.0</C></td><td>Interfaz de red en la que escucha. <C>0.0.0.0</C> = <strong>todas</strong> (wifi, ethernet, localhost). Una IP concreta, como <C>192.168.1.148</C>, = solo esa interfaz.</td></tr>
          </tbody>
        </table>
        <Callout type="trap" title="Variante: ServerSocket(PORT, 10, InetAddress.getByName(&quot;192.168.1.148&quot;))">
          <ul>
            <li>Backlog de 10: como mucho 10 clientes esperando a ser aceptados.</li>
            <li>Solo acepta conexiones que lleguen por la interfaz con esa IP. Un cliente que use <C>localhost</C> <strong>no</strong> conectaría.</li>
            <li>Si esa IP no pertenece a la máquina, el constructor lanza <C>BindException</C> («Cannot assign requested address»).</li>
          </ul>
        </Callout>
        <ul>
          <li>Si el puerto ya está ocupado (por ejemplo, el servidor se lanza dos veces), se produce <C>BindException: Address already in use</C>.</li>
          <li>El constructor declara <C>throws IOException</C> porque crear el socket puede fallar.</li>
        </ul>
      </Section>

      <Section n={2} title="accept(): la llamada bloqueante">
        <CodeBlock code={`
connection = server.accept();     // el hilo se queda AQUÍ hasta que conecte un cliente
System.out.println("CONNECTION ACCEPTED: " + connection);`} hl={[1]} />
        <ul>
          <li><C>accept()</C> <strong>bloquea</strong> el hilo hasta que llega un cliente. Entonces devuelve un <C>Socket</C> <strong>nuevo</strong>, dedicado a esa conexión.</li>
          <li>El <C>ServerSocket</C> solo sirve para <em>escuchar</em>. La conversación va por el <C>Socket</C> devuelto.</li>
          <li>Este servidor llama a <C>accept()</C> <strong>una sola vez</strong>: atiende a un único cliente. Un segundo cliente se quedaría en la cola del backlog sin ser atendido. Para atender a varios: <C>accept()</C> dentro de un bucle y <strong>un hilo por cliente</strong>. Aquí se unen las dos partes del temario.</li>
        </ul>
      </Section>

      <Section n={3} title="Lado cliente: new Socket(ip, puerto)">
        <CodeBlock title="Cliente.java" code={`
public static final String serverIp = "10.227.2.56";
// ...
cliente = new Socket(serverIp, 4242);`} hl={[3]} />
        <ul>
          <li>El constructor hace la conexión TCP (el <em>three-way handshake</em>). Cuando termina, el servidor sale de su <C>accept()</C>.</li>
          <li>El puerto tiene que coincidir con el del servidor (4242) y la IP tiene que ser la del servidor <strong>en esa red</strong>.</li>
          <li><strong>Orden:</strong> primero se arranca el servidor y después el cliente. Si no hay nadie escuchando, salta <C>ConnectException: Connection refused</C>. El cliente lo captura como <C>IOException</C> e imprime «No se puede conectar!!».</li>
        </ul>
        <Trace head={['Servidor', 'Cliente']} rows={[
          ['new ServerSocket(4242, …) → escucha', ''],
          ['accept() → BLOQUEADO', ''],
          ['', 'new Socket(ip, 4242) → conecta'],
          ['accept() devuelve connection', '«CONECTADO»'],
          ['in.readLine() → BLOQUEADO esperando datos', 'stdin.nextLine() → espera al usuario'],
        ]} />
      </Section>

      <Callout type="book" title="100 cosas · Joel Spolsky: las abstracciones tienen fugas">
        <p>
          Spolsky pone TCP como ejemplo de abstracción con fugas: te promete una conexión fiable, «como leer un fichero», pero cuando hay latencia, cortes o firewalls, la red se nota.
          En el examen: <C>readLine()</C> parece una lectura normal, pero <strong>puede bloquearse indefinidamente</strong> si el otro extremo no envía nada. Esa «fuga» es la que provoca los bloqueos de la lección de bugs.
        </p>
      </Callout>
    </>
  )
}

/* ───────────────────────── 3.2 Streams ───────────────────────── */

function Streams() {
  return (
    <>
      <p>Un socket solo da <strong>bytes</strong> crudos. Para trabajar con <strong>líneas de texto</strong>, el PDF envuelve los streams en capas, como muñecas rusas.</p>

      <Section n={1} title="La cadena de lectura">
        <CodeBlock code={`
in = new BufferedReader(                         // 3. buffer + readLine()
        new InputStreamReader(                   // 2. bytes → caracteres
            connection.getInputStream()));       // 1. bytes del socket`} />
        <ol>
          <li><C>getInputStream()</C>: bytes que llegan por la red.</li>
          <li><C>InputStreamReader</C>: <strong>decodifica</strong> bytes a caracteres (usa un <em>charset</em>).</li>
          <li><C>BufferedReader</C>: añade un buffer y el método <C>readLine()</C>, que <strong>bloquea</strong> hasta recibir un salto de línea completo. Devuelve la línea sin el <C>\n</C>, o <C>null</C> si el otro extremo cerró la conexión.</li>
        </ol>
      </Section>

      <Section n={2} title="La cadena de escritura">
        <CodeBlock code={`
out = new PrintWriter(                           // 4. println(), print()...
        new BufferedWriter(                      // 3. buffer (acumula)
            new OutputStreamWriter(              // 2. caracteres → bytes
                connection.getOutputStream()))); // 1. bytes al socket`} />
        <ul>
          <li><C>OutputStreamWriter</C> <strong>codifica</strong> los caracteres a bytes.</li>
          <li><C>BufferedWriter</C> <strong>acumula</strong> lo escrito en memoria (8 KB por defecto) y no lo envía hasta que el buffer se llena o se hace <C>flush()</C>.</li>
          <li><C>PrintWriter</C> da <C>println()</C>, que escribe el texto más el salto de línea, justo lo que necesita el <C>readLine()</C> del otro lado.</li>
        </ul>
      </Section>

      <Section n={3} title="flush(): la pregunta que más cae">
        <CodeBlock code={`
salida.println(msg);
salida.println(hash);
salida.flush();          // ← sin esto, los datos se quedan en el BufferedWriter
String respuesta = entrada.readLine();`} hl={[3]} />
        <p>Si se olvida el <C>flush()</C>:</p>
        <ol>
          <li><C>println()</C> escribe en el buffer <strong>en memoria</strong>; nada sale por la red (los mensajes son mucho más pequeños que 8 KB).</li>
          <li>El cliente pasa a <C>entrada.readLine()</C> y se <strong>bloquea</strong> esperando la respuesta.</li>
          <li>El servidor está bloqueado en <C>in.readLine()</C> esperando un mensaje que nunca le llega.</li>
          <li><Mk>Los dos procesos se quedan bloqueados esperando al otro, para siempre</Mk>. Es un bloqueo mutuo (deadlock distribuido), sin ningún error ni excepción.</li>
        </ol>
        <Callout type="tip" title="Alternativas a flush() manual">
          <ul>
            <li><C>new PrintWriter(outputStream, true)</C>: el <C>true</C> activa <strong>autoFlush</strong>, que hace <C>flush()</C> en cada <C>println()</C>.</li>
            <li><C>close()</C> también hace flush, pero cierra el stream y con él la conexión.</li>
          </ul>
        </Callout>
      </Section>

      <Section n={4} title="El protocolo tiene que cuadrar">
        <p>Cliente y servidor tienen que estar de acuerdo en <strong>quién habla y cuántas líneas</strong>:</p>
        <Trace head={['Paso', 'Cliente', 'Servidor']} rows={[
          ['1', 'println(msg)', 'str = readLine()'],
          ['2', 'println(hash) + flush()', 'hash = readLine()'],
          ['3', 'respuesta = readLine()  (espera)', 'println(serverMsg) + flush()'],
        ]} />
        <ul>
          <li>Si los dos hacen <C>readLine()</C> a la vez, ninguno escribe y se bloquean mutuamente.</li>
          <li>Si uno envía 1 línea y el otro espera 2, el segundo <C>readLine()</C> se queda colgado.</li>
          <li><C>PrintWriter</C> <strong>nunca lanza IOException</strong>: si la conexión se rompe, falla en silencio. Hay que consultar <C>checkError()</C>.</li>
        </ul>
        <Callout type="book" title="100 cosas · Ilya Grigorik: entiende la red">
          <p>
            Grigorik insiste en que hoy el cuello de botella es la <strong>latencia</strong> (el ida y vuelta, o <em>round trip</em>), no el ancho de banda.
            Este protocolo es estrictamente pregunta-respuesta: cada mensaje cuesta, como mínimo, un viaje de ida y vuelta, y mientras tanto los dos lados están bloqueados.
            Por eso el <C>flush()</C> va <strong>después</strong> de las dos líneas (mensaje y hash): se envían juntas en un único envío, no en dos.
          </p>
        </Callout>
      </Section>
    </>
  )
}

/* ───────────────────────── 3.3 SHA-256 ───────────────────────── */

function Hash() {
  return (
    <>
      <p>Cada mensaje viaja con su <strong>hash SHA-256</strong>. El receptor lo recalcula y, si coincide, sabe que el mensaje no se ha alterado por el camino.</p>
      <CodeBlock title="Cálculo del hash (igual en cliente y servidor)" code={`
MessageDigest m = MessageDigest.getInstance("SHA-256");

m.update(msg.getBytes());          // 1. le das los bytes del mensaje
byte[] digest = m.digest();        // 2. calcula: 32 bytes (256 bits) y se RESETEA

String hash = "";
for (byte b : digest) {
    String h = Integer.toHexString(b & 0xFF);   // 3. byte → hex (00..ff)
    if (h.length() == 1) hash += "0";           // 4. padding: "5" → "05"
    hash += h;
}
// hash = 64 caracteres hexadecimales`} hl={[8, 9]} />

      <Section n={1} title="Paso a paso">
        <ul>
          <li><C>getInstance("SHA-256")</C> puede lanzar <C>NoSuchAlgorithmException</C> (checked), por eso los dos programas la capturan.</li>
          <li><C>update()</C> va acumulando bytes. <C>digest()</C> termina el cálculo, devuelve los 32 bytes y <strong>reinicia</strong> el objeto. Por eso se puede reutilizar <C>m</C> en cada vuelta del bucle.</li>
          <li>Resultado: <strong>32 bytes = 64 caracteres hexadecimales</strong>.</li>
        </ul>
      </Section>

      <Section n={2} title="¿Por qué b & 0xFF?">
        <p>
          En Java, <C>byte</C> tiene <strong>signo</strong>: va de −128 a 127. Al pasar un byte a <C>Integer.toHexString(int)</C>, se promociona a <C>int</C> <strong>conservando el signo</strong> (extensión de signo):
        </p>
        <Trace head={['byte b', 'toHexString(b)', 'toHexString(b & 0xFF)']} bad={[0]} rows={[
          ['-1  (0xFF)', '"ffffffff"  ✗ 8 caracteres', '"ff"  ✓'],
          ['-128 (0x80)', '"ffffff80"  ✗', '"80"  ✓'],
          ['5', '"5"', '"5" → con padding "05"'],
        ]} />
        <p><C>& 0xFF</C> se queda solo con los 8 bits bajos y da un valor de 0 a 255: el byte tratado <strong>sin signo</strong>.</p>
      </Section>

      <Section n={3} title="¿Por qué el padding con «0»?">
        <p>
          <C>toHexString(5)</C> devuelve <C>"5"</C>, no <C>"05"</C>. Sin el padding, los bytes menores de 16 ocuparían 1 carácter en vez de 2. El hash tendría longitud variable y no coincidiría con un SHA-256 estándar.
          Con el <C>if (h.length() == 1)</C>, cada byte ocupa <strong>siempre</strong> 2 caracteres.
        </p>
      </Section>

      <Section n={4} title="Qué garantiza (y qué no)">
        <table>
          <thead><tr><th>Propiedad</th><th>¿La da?</th><th>Por qué</th></tr></thead>
          <tbody>
            <tr><td><strong>Integridad</strong></td><td>Sí (frente a errores)</td><td>Si cambia un solo bit del mensaje, el hash cambia por completo.</td></tr>
            <tr><td>Confidencialidad</td><td><strong>No</strong></td><td>El mensaje viaja <strong>en claro</strong>. Un hash no es cifrado.</td></tr>
            <tr><td>Autenticidad</td><td><strong>No</strong></td><td>Un atacante puede cambiar el mensaje y recalcular su hash. Haría falta un HMAC (hash con clave secreta) o una firma.</td></tr>
          </tbody>
        </table>
        <Callout type="warn" title="Detalle fino: getBytes() sin charset">
          <p>
            <C>getBytes()</C> usa la codificación por defecto de cada máquina. Si cliente y servidor tienen codificaciones distintas (Windows con Java antiguo y Linux, por ejemplo), un mensaje con tildes o «ñ» produciría <strong>bytes distintos y hashes distintos</strong> aunque el texto sea el mismo.
            Lo robusto es <C>getBytes(StandardCharsets.UTF_8)</C> en los dos lados.
          </p>
        </Callout>
        <p>Mejoras de estilo: concatenar <C>String</C> con <C>+=</C> en un bucle crea un objeto nuevo en cada vuelta. Mejor un <C>StringBuilder</C>, o en Java 17+ <C>HexFormat.of().formatHex(digest)</C>.</p>
      </Section>
    </>
  )
}

/* ───────────────────────── 3.4 Bugs ───────────────────────── */

function Bugs() {
  return (
    <>
      <p>Aquí está el oro del examen: el código del PDF tiene varios fallos, uno de ellos <strong>deliberado</strong>. Vamos uno a uno.</p>
      <CodeBlock title="Cliente.java" code={CLIENTE} err={[47]} hl={[53, 56]} notes={{ 47: '¡corrompe el hash!' }} />
      <CodeBlock title="Server.java" code={SERVER} err={[71, 72, 73, 74, 75, 76]} hl={[44, 45, 49, 58]} />

      <Section n={1} title="Bug 1: hash += &quot;asd&quot; (el deliberado)">
        <ol>
          <li>El cliente calcula bien el SHA-256 (64 caracteres hex) y después le <strong>añade «asd»</strong>: envía 67 caracteres que no son un hash válido.</li>
          <li>El servidor recalcula el hash del mensaje y obtiene los 64 caracteres correctos. <C>hex.equals(hash)</C> es <strong>siempre false</strong>.</li>
          <li>El servidor imprime <C>"Error al recibir el mensaje"</C> por <C>System.err</C> y <strong>no responde nada</strong> al cliente.</li>
          <li>El cliente está bloqueado en <C>entrada.readLine()</C> esperando una respuesta que nunca llega.</li>
          <li>El servidor vuelve al principio del <C>while</C> y se bloquea en <C>in.readLine()</C>.</li>
        </ol>
        <p><Mk>Los dos procesos quedan bloqueados en readLine() a la vez: un bloqueo mutuo.</Mk> El cliente se queda colgado tras su primer mensaje y nunca imprime «Servidor dice».</p>
        <Model>
          <p>
            La línea <C>hash += "asd";</C> corrompe el hash antes de enviarlo. El servidor recalcula el SHA-256 del mensaje y, al compararlo con el recibido, <C>hex.equals(hash)</C> da siempre false.
            Por eso imprime «Error al recibir el mensaje» en la salida de error y no envía ninguna respuesta. El cliente queda bloqueado indefinidamente en <C>entrada.readLine()</C> esperando la respuesta,
            y el servidor vuelve a bloquearse en <C>in.readLine()</C> esperando el siguiente mensaje: ambos procesos quedan bloqueados esperando al otro.
            Solución: eliminar esa línea y, además, que el servidor responda siempre (por ejemplo «ERROR: hash incorrecto») para no romper el protocolo pregunta-respuesta.
          </p>
        </Model>
      </Section>

      <Section n={2} title="Bug 2: el BYE y el cierre de la conexión">
        <ul>
          <li>El cliente sale del bucle con <C>enviando = !msg.equals("BYE")</C>, pero <strong>después</strong> de enviar BYE y esperar la respuesta. Si el servidor no responde (bug 1), nunca llega a salir.</li>
          <li>El servidor <strong>no conoce el BYE</strong>: <C>send</C> nunca pasa a <C>false</C>, así que el bucle es infinito.</li>
          <li>Cuando el cliente cierra, <C>in.readLine()</C> devuelve <C>null</C> y <C>str.getBytes()</C> lanza <strong><C>NullPointerException</C></strong>. Esa es la forma «real» en que acaba el servidor.</li>
          <li><C>equals("BYE")</C> distingue mayúsculas y minúsculas: «bye» no cierra.</li>
        </ul>
        <CodeBlock title="Bucle del servidor corregido ✓" code={`
while (true) {
    String str = in.readLine();
    if (str == null || str.equalsIgnoreCase("BYE")) break;   // cerró o se despide
    String hash = in.readLine();
    // ... comprobar hash ...
    out.println(hex.equals(hash) ? respuesta : "ERROR: hash incorrecto");
    out.flush();                                             // responder SIEMPRE
}`} ok={[3, 6, 7]} />
      </Section>

      <Section n={3} title="Bug 3 (variante trampa): la llave mal puesta">
        <p>Si en el examen el <C>while</C> del cliente aparece cerrado justo después de leer el mensaje:</p>
        <CodeBlock title="Variante con la llave mal puesta ✗" code={`
while (enviando) {
    System.out.println("Escribe tu mensaje: ");
    String msg = stdin.nextLine();
}                                   // ← la llave cierra el bucle aquí
String hash = "";
m.update(msg.getBytes());           // ← msg ya no existe en este ámbito
// ...
enviando = !msg.equals("BYE");`} err={[4, 6, 8]} />
        <ul>
          <li><strong>Error de compilación:</strong> <C>msg</C> está declarada <strong>dentro</strong> del bloque del <C>while</C>. Fuera de las llaves no existe (<em>cannot find symbol</em>). Es un error de <strong>ámbito</strong> (<em>scope</em>).</li>
          <li>Aunque <C>msg</C> se declarase fuera para que compile, el bucle sería <strong>infinito</strong>: <C>enviando</C> nunca cambia dentro del <C>while</C>, así que pediría mensajes sin enviar ninguno.</li>
          <li><strong>Intención lógica:</strong> todo el ciclo (leer, calcular el hash, enviar, esperar respuesta, comprobar BYE) tiene que ir <strong>dentro</strong> del <C>while</C>, como en el código correcto de arriba.</li>
        </ul>
      </Section>

      <Section n={4} title="Bug 4: el cierre de recursos en finally">
        <p><strong>Server:</strong></p>
        <ul>
          <li>Cierra en orden <strong>al revés</strong>: primero <C>connection</C> y después <C>in</C>/<C>out</C>. El orden correcto es <strong>de fuera hacia dentro</strong>: primero los streams (así <C>out</C> hace su último flush) y por último el socket.</li>
          <li>Los <C>assert</C> <strong>están desactivados por defecto</strong> (solo funcionan con <C>java -ea</C>). Si <C>accept()</C> fallara, <C>connection</C> sería <C>null</C> y <C>connection.close()</C> lanzaría <C>NullPointerException</C> dentro del <C>finally</C>.</li>
          <li>El <C>ServerSocket</C> nunca se cierra: el puerto queda ocupado hasta que muere el proceso.</li>
        </ul>
        <p><strong>Cliente:</strong></p>
        <ul>
          <li>Si <C>new Socket(...)</C> falla, el <C>catch (IOException)</C> llama a <C>System.exit(-1)</C>. <Mk>System.exit detiene la JVM y el finally NO se ejecuta.</Mk></li>
          <li>Si no existiera ese <C>exit</C>, <C>salida</C> sería <C>null</C> y <C>salida.close()</C> lanzaría <C>NullPointerException</C>.</li>
          <li>«Conexión finalizada, Saliendo...» solo se imprime si todo acaba bien.</li>
        </ul>
        <CodeBlock title="La forma moderna: try-with-resources ✓" code={`
try (Socket cliente = new Socket(SERVER_IP, PORT);
     BufferedReader entrada = new BufferedReader(new InputStreamReader(cliente.getInputStream()));
     PrintWriter salida = new PrintWriter(cliente.getOutputStream(), true)) {   // autoFlush
    // ... bucle ...
}   // se cierran SOLOS, en orden inverso a como se abrieron, aunque haya excepción`} ok={[1, 2, 3, 5]} />
      </Section>

      <Section n={5} title="Bugs menores que suman puntos">
        <ul>
          <li><C>stdin.close()</C> cierra <C>System.in</C> para todo el programa.</li>
          <li>La IP <C>10.227.2.56</C> está fija en el código (<em>hardcodeada</em>): solo funciona en la red de clase. Sería mejor recibirla como argumento.</li>
          <li><C>System.err</C> y <C>System.out</C> son flujos distintos: en consola los mensajes pueden salir desordenados entre sí.</li>
        </ul>
        <Callout type="book" title="100 cosas · nombres que revelan intención">
          <p>
            En el PDF conviven <C>m</C>, <C>str</C>, <C>h</C>, <C>send</C> y <C>enviando</C>: nombres de una letra y mezcla de inglés y español.
            <C>serverIp</C> es una constante y por convención debería llamarse <C>SERVER_IP</C>. Un nombre como <C>sha256</C> en vez de <C>m</C>, o <C>hashRecibido</C> frente a <C>hashCalculado</C>, habría hecho evidente el bug de <C>"asd"</C> al leer el código.
          </p>
        </Callout>
      </Section>
    </>
  )
}

/* ───────────────────────── Ejercicios ───────────────────────── */

const exConexion = [
  {
    id: 'b3-con-backlog', kind: 'choice',
    prompt: <p>En <C>new ServerSocket(4242, 1000, InetAddress.getByName("0.0.0.0"))</C>, ¿qué significa el 1000?</p>,
    options: [
      { t: 'Número máximo de clientes conectados a la vez', why: 'No: es la cola de los que todavía NO se han aceptado.' },
      { t: 'Tamaño máximo de la cola de conexiones pendientes de accept()', ok: true },
      { t: 'Timeout en milisegundos de accept()', why: 'El timeout se configura con setSoTimeout().' },
    ],
    model: <p>Es el <strong>backlog</strong>: la longitud máxima de la cola de conexiones entrantes que se han establecido pero que el servidor todavía no ha aceptado con <C>accept()</C>. Si la cola se llena, las nuevas conexiones se rechazan. No limita los clientes ya aceptados. <C>0.0.0.0</C> indica que escucha en todas las interfaces de red.</p>,
  },
  {
    id: 'b3-con-orden', kind: 'choice',
    prompt: <p>Se ejecuta <C>Cliente</C> sin haber arrancado <C>Server</C>. ¿Qué se ve?</p>,
    options: [
      { t: 'El cliente espera hasta que arranque el servidor', why: 'new Socket no espera: falla al momento.' },
      { t: '«No se puede conectar!!» y el programa termina con código -1', ok: true },
      { t: 'NullPointerException en el finally', why: 'System.exit(-1) detiene la JVM antes de que se ejecute el finally.' },
    ],
    model: <p><C>new Socket(serverIp, 4242)</C> lanza <C>ConnectException</C> (Connection refused), que es una <C>IOException</C>. El <C>catch</C> imprime «No se puede conectar!!» y llama a <C>System.exit(-1)</C>, que detiene la JVM <strong>sin ejecutar el finally</strong>. Por eso no llega a producirse el <C>NullPointerException</C> de <C>salida.close()</C> con <C>salida == null</C>.</p>,
  },
  {
    id: 'b3-con-write', kind: 'write',
    prompt: <p>Explica qué hace <C>server.accept()</C> y por qué este servidor solo puede atender a un cliente.</p>,
    model: <p><C>accept()</C> es una llamada <strong>bloqueante</strong>: el hilo se detiene hasta que un cliente establece una conexión TCP con el puerto. Entonces devuelve un nuevo <C>Socket</C> que representa esa conexión, y por él se hace toda la comunicación (el <C>ServerSocket</C> solo escucha). En <C>Server.init()</C>, <C>accept()</C> se llama una sola vez, fuera de cualquier bucle. Tras aceptar al primer cliente, el servidor se queda en su bucle de lectura con ese socket, y otros clientes quedarían en la cola del backlog sin ser atendidos. Para varios clientes habría que llamar a <C>accept()</C> en un bucle y atender cada conexión en un hilo distinto.</p>,
  },
]

const exStreams = [
  {
    id: 'b3-st-flush', kind: 'choice',
    prompt: <p>En el cliente se borra <C>salida.flush();</C>. ¿Qué pasa al enviar el primer mensaje?</p>,
    options: [
      { t: 'Se envía igual, porque println ya incluye salto de línea', why: 'println escribe en el buffer, no en la red.' },
      { t: 'Cliente y servidor quedan bloqueados en readLine() esperando al otro', ok: true },
      { t: 'IOException: buffer lleno', why: 'El buffer es de 8 KB; un mensaje corto cabe de sobra.' },
    ],
    model: <p>Sin <C>flush()</C>, el mensaje y el hash se quedan en el buffer del <C>BufferedWriter</C> y no se envían por el socket. El cliente pasa a <C>entrada.readLine()</C> y se bloquea esperando la respuesta, y el servidor sigue bloqueado en <C>in.readLine()</C> esperando un mensaje que no llega. Ambos quedan bloqueados indefinidamente, sin ninguna excepción. Solución: <C>flush()</C> tras escribir, o <C>PrintWriter</C> con autoFlush (<C>new PrintWriter(os, true)</C>).</p>,
  },
  {
    id: 'b3-st-null', kind: 'choice',
    prompt: <p>¿Qué devuelve <C>in.readLine()</C> en el servidor cuando el cliente cierra la conexión?</p>,
    options: [
      { t: 'Una cadena vacía ""', why: 'La cadena vacía es una línea en blanco que sí se envió.' },
      { t: 'null', ok: true },
      { t: 'Lanza EOFException', why: 'readLine señala el fin del stream con null, no con excepción.' },
    ],
    model: <p>Devuelve <C>null</C>: es la señal de fin de stream. En <C>Server</C>, la siguiente línea, <C>m.update(str.getBytes())</C>, lanzaría <C>NullPointerException</C>. Siempre hay que comprobar <C>if (str == null)</C> antes de usar lo leído.</p>,
  },
  {
    id: 'b3-st-write', kind: 'write',
    prompt: <p>Explica la función de cada clase en <C>new PrintWriter(new BufferedWriter(new OutputStreamWriter(socket.getOutputStream())))</C>.</p>,
    model: <p><C>socket.getOutputStream()</C> da el flujo de <strong>bytes</strong> que salen por la conexión TCP. <C>OutputStreamWriter</C> convierte los <strong>caracteres</strong> en bytes según una codificación. <C>BufferedWriter</C> añade un <strong>buffer</strong> que acumula lo escrito y lo envía en bloque, lo que es más eficiente, pero obliga a hacer <C>flush()</C> para que los datos salgan. <C>PrintWriter</C> ofrece métodos cómodos como <C>println()</C>, que añade el salto de línea que necesita el <C>readLine()</C> del receptor. Además, nunca lanza <C>IOException</C> (se consulta con <C>checkError()</C>).</p>,
  },
]

const exHash = [
  {
    id: 'b3-hash-ff', kind: 'choice',
    prompt: <p>Si se quita <C>& 0xFF</C> y se usa <C>Integer.toHexString(b)</C>, ¿qué pasa con los bytes negativos?</p>,
    options: [
      { t: 'Nada, toHexString ya los trata sin signo', why: 'Recibe un int: el byte se extiende con signo.' },
      { t: 'Salen como "ffffffXX" (8 caracteres) y el hash deja de ser correcto', ok: true },
      { t: 'Lanza NumberFormatException', why: 'No hay ningún parseo.' },
    ],
    model: <p>El <C>byte</C> se promociona a <C>int</C> con <strong>extensión de signo</strong>: −1 pasa a 0xFFFFFFFF y <C>toHexString</C> devuelve <C>"ffffffff"</C>. Cada byte negativo aportaría 8 caracteres en vez de 2 y el hash no sería el SHA-256 hexadecimal estándar (64 caracteres). <C>b & 0xFF</C> conserva solo los 8 bits bajos, con un valor entre 0 y 255.</p>,
  },
  {
    id: 'b3-hash-write', kind: 'write',
    prompt: <p>¿Qué garantiza enviar el hash SHA-256 junto al mensaje? ¿Protege contra un atacante?</p>,
    model: <p>Garantiza la <strong>integridad</strong> frente a alteraciones accidentales: el receptor recalcula el hash del mensaje recibido y, si no coincide con el enviado, sabe que el mensaje (o el hash) ha cambiado. No da <strong>confidencialidad</strong>, porque el mensaje viaja en claro (un hash no cifra), ni <strong>autenticidad</strong>: un atacante que intercepte la comunicación puede modificar el mensaje y recalcular su hash, ya que el algoritmo es público. Para eso haría falta un HMAC con clave compartida o una firma digital, y TLS para cifrar.</p>,
  },
]

const exBugs = [
  {
    id: 'b3-bug-asd', kind: 'write',
    prompt: <p>Pregunta de examen: «Se ejecutan <C>Server</C> y <C>Cliente</C>. El usuario del cliente escribe <C>hola</C>. Describe qué ocurre en cada programa».</p>,
    model: <p>El cliente calcula el SHA-256 de «hola» y le concatena «asd» (<C>hash += "asd"</C>), con lo que el hash queda corrupto. Envía «hola» y el hash corrupto, hace <C>flush()</C> y se bloquea en <C>entrada.readLine()</C> esperando la respuesta. El servidor lee las dos líneas, imprime «CLIENT: hola» y el hash recibido, recalcula el SHA-256 y <C>hex.equals(hash)</C> da false. Imprime «Error al recibir el mensaje» en <C>System.err</C> y no responde. Vuelve al inicio del <C>while</C> y se bloquea en <C>in.readLine()</C>. Ambos procesos quedan bloqueados indefinidamente esperando datos del otro (bloqueo mutuo): el cliente nunca muestra «Servidor dice». Solución: eliminar la línea <C>hash += "asd"</C> y hacer que el servidor responda siempre, también en caso de error.</p>,
  },
  {
    id: 'b3-bug-exit', kind: 'choice',
    prompt: <p>En <C>Cliente</C>, si falla la conexión, ¿se ejecuta el bloque <C>finally</C>?</p>,
    options: [
      { t: 'Sí, finally se ejecuta siempre', why: 'Excepto si la JVM se detiene con System.exit.' },
      { t: 'No: System.exit(-1) en el catch detiene la JVM antes del finally', ok: true },
      { t: 'Sí, y lanza NullPointerException', why: 'Pasaría si no hubiera System.exit.' },
    ],
    model: <p><strong>No.</strong> <C>finally</C> se ejecuta siempre <em>salvo</em> que la JVM se detenga: <C>System.exit(-1)</C> termina el proceso inmediatamente. Si no estuviera ese <C>exit</C>, el <C>finally</C> haría <C>salida.close()</C> con <C>salida == null</C> y lanzaría <C>NullPointerException</C>. Habría que comprobar <C>null</C> o usar try-with-resources.</p>,
  },
  {
    id: 'b3-bug-llave', kind: 'choice',
    prompt: <p>En el examen el <C>while (enviando)</C> del cliente se cierra justo después de <C>String msg = stdin.nextLine();</C>. ¿Qué pasa?</p>,
    options: [
      { t: 'Bucle infinito pidiendo mensajes', why: 'Antes de eso, ni siquiera compila.' },
      { t: 'Error de compilación: msg no existe fuera del bloque del while', ok: true },
      { t: 'Envía un único mensaje y termina', why: 'No llega a compilar.' },
    ],
    model: <p><strong>No compila</strong>: <C>msg</C> se declara dentro del bloque del <C>while</C>, y su ámbito termina en la llave de cierre. Las líneas posteriores (<C>m.update(msg.getBytes())</C>, <C>salida.println(msg)</C>, <C>msg.equals("BYE")</C>) dan <em>cannot find symbol</em>. Aunque se declarase fuera, el bucle sería infinito, porque <C>enviando</C> no se modifica dentro, y no se enviaría nada. Todo el ciclo leer-hash-enviar-recibir debe estar dentro del <C>while</C>.</p>,
  },
  {
    id: 'b3-bug-orden', kind: 'write',
    prompt: <p>¿Qué problemas tiene el <C>finally</C> de <C>Server</C>?</p>,
    model: <p>(1) Cierra en orden inverso al recomendado: primero el <C>Socket</C> y después los streams. Debería cerrar primero <C>out</C> (que hace flush) e <C>in</C>, y por último <C>connection</C>, de fuera hacia dentro. (2) Los <C>assert</C> están desactivados por defecto (requieren <C>-ea</C>), así que no evitan un <C>NullPointerException</C> si <C>accept()</C> falló y <C>connection</C> es <C>null</C>. (3) Nunca se cierra el <C>ServerSocket</C>, y el puerto queda ocupado. (4) Si un <C>close()</C> lanza una excepción, los siguientes no se ejecutan. La solución más limpia es try-with-resources, que cierra todo automáticamente en orden inverso.</p>,
  },
]

export const lessonsB3 = [
  { id: 'conexion', title: 'ServerSocket, accept() y Socket', minutes: 4, Body: Conexion, exercises: exConexion },
  { id: 'streams', title: 'Streams, buffering y flush()', minutes: 4, Body: Streams, exercises: exStreams },
  { id: 'sha256', title: 'Integridad con SHA-256', minutes: 3, Body: Hash, exercises: exHash },
  { id: 'bugs-sockets', title: 'Bugs ocultos en Cliente y Server', minutes: 6, Body: Bugs, exercises: exBugs },
]
