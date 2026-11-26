import Prism from 'prismjs'
import 'prismjs/components/prism-clike'
import 'prismjs/components/prism-java'
import { useMemo, useState } from 'react'

// Aplana los tokens de Prism en líneas: [[{types, text}], ...]
function toLines(code) {
  const tokens = Prism.tokenize(code, Prism.languages.java)
  const lines = [[]]
  const walk = (tok, types) => {
    if (typeof tok === 'string') {
      const parts = tok.split('\n')
      parts.forEach((part, i) => {
        if (i > 0) lines.push([])
        if (part) lines[lines.length - 1].push({ types, text: part })
      })
      return
    }
    const next = [...types, tok.type, ...(tok.alias ? [].concat(tok.alias) : [])]
    if (Array.isArray(tok.content)) tok.content.forEach((t) => walk(t, next))
    else walk(tok.content, next)
  }
  tokens.forEach((t) => walk(t, []))
  return lines
}

// Quita la indentación común para poder escribir el código indentado en JSX
export function dedent(str) {
  const lines = str.replace(/^\n+|\s+$/g, '').split('\n')
  const indents = lines.filter((l) => l.trim()).map((l) => l.match(/^ */)[0].length)
  const min = indents.length ? Math.min(...indents) : 0
  return lines.map((l) => l.slice(min)).join('\n')
}

/**
 * code: string Java
 * hl / err / ok: números de línea (1-based) a resaltar en amarillo / rojo / verde
 * tags: { [linea]: [{ label, color }] } etiquetas en el margen (simulador)
 * notes: { [linea]: 'texto' } anotación a la derecha de la línea
 */
export default function CodeBlock({ code, title, hl = [], err = [], ok = [], tags = {}, notes = {}, compact = false, lang = 'JAVA' }) {
  const src = useMemo(() => dedent(code), [code])
  const lines = useMemo(() => toLines(src), [src])
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(src)
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    } catch { /* sin portapapeles: no pasa nada */ }
  }

  return (
    <div className={`not-prose my-5 overflow-hidden rounded-xl border border-line ${compact ? 'text-[12.5px]' : 'text-[13.5px]'}`} style={{ background: 'var(--code-bg)' }}>
      <div className="flex items-center justify-between border-b px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider" style={{ borderColor: 'var(--code-line)', color: '#a8a29e' }}>
        <span className="truncate normal-case tracking-normal">{title || ''}</span>
        <div className="flex items-center gap-3">
          <span>{lang}</span>
          {!compact && (
            <button onClick={copy} className="rounded px-1.5 py-0.5 hover:bg-white/10" aria-label="Copiar código">
              {copied ? 'copiado' : 'copiar'}
            </button>
          )}
        </div>
      </div>
      <pre className="thin-scroll overflow-x-auto py-2 font-mono leading-[1.65]" style={{ color: 'var(--code-fg)' }}>
        {lines.map((line, i) => {
          const n = i + 1
          const cls = err.includes(n) ? 'code-line-err' : ok.includes(n) ? 'code-line-ok' : hl.includes(n) ? 'code-line-hl' : ''
          return (
            <div key={i} className={`flex min-w-max pr-4 ${cls}`}>
              <span className="w-10 shrink-0 select-none pr-3 text-right" style={{ color: '#57534e' }}>{n}</span>
              {tags[n] && (
                <span className="mr-2 flex shrink-0 gap-1">
                  {tags[n].map((t) => (
                    <span key={t.label} className="rounded px-1 text-[10px] font-bold leading-[1.6]" style={{ background: t.color, color: '#000' }}>{t.label}</span>
                  ))}
                </span>
              )}
              <code className="whitespace-pre">
                {line.length === 0 ? ' ' : line.map((t, j) => (
                  <span key={j} className={t.types.map((x) => 'tok-' + x).join(' ')}>{t.text}</span>
                ))}
              </code>
              {notes[n] && <span className="ml-4 whitespace-pre text-[12px] italic" style={{ color: err.includes(n) ? '#fca5a5' : '#fbbf24' }}>← {notes[n]}</span>}
            </div>
          )
        })}
      </pre>
    </div>
  )
}
