import { useState, useEffect, useRef, useCallback } from 'react'
import { Sun, Moon, Languages, Timer, RefreshCw, Trophy, Type } from 'lucide-react'

const translations = {
  en: {
    title: 'Typing Speed Test',
    subtitle: 'Test your typing speed. Calculate WPM, accuracy and track your history.',
    start: 'Start typing to begin...',
    restart: 'Restart',
    newTest: 'New Test',
    wpm: 'WPM',
    accuracy: 'Accuracy',
    time: 'Time',
    chars: 'Chars',
    correct: 'Correct',
    incorrect: 'Incorrect',
    history: 'History',
    noHistory: 'Complete a test to see your history.',
    best: 'Best',
    avg: 'Average',
    tests: 'tests',
    testComplete: 'Test complete!',
    builtBy: 'Built by',
    wordsPerMin: 'words/min',
  },
  pt: {
    title: 'Teste de Velocidade de Digitacao',
    subtitle: 'Teste sua velocidade de digitacao. Calcule PPM, precisao e acompanhe seu historico.',
    start: 'Comece a digitar...',
    restart: 'Reiniciar',
    newTest: 'Novo Teste',
    wpm: 'PPM',
    accuracy: 'Precisao',
    time: 'Tempo',
    chars: 'Chars',
    correct: 'Corretos',
    incorrect: 'Erros',
    history: 'Historico',
    noHistory: 'Complete um teste para ver seu historico.',
    best: 'Melhor',
    avg: 'Media',
    tests: 'testes',
    testComplete: 'Teste concluido!',
    builtBy: 'Criado por',
    wordsPerMin: 'palavras/min',
  }
} as const

type Lang = keyof typeof translations

const SENTENCES = [
  'The quick brown fox jumps over the lazy dog and runs away into the forest.',
  'Programming is the art of telling another human what one wants the computer to do.',
  'The best way to predict the future is to create it with hard work and dedication.',
  'Success is not final, failure is not fatal; it is the courage to continue that counts.',
  'In the middle of every difficulty lies opportunity for those who seek it.',
  'The only way to do great work is to love what you do every single day.',
  'Technology is best when it brings people together and makes life easier for everyone.',
  'A journey of a thousand miles begins with a single step in the right direction.',
  'The greatest glory in living lies not in never falling but in rising every time we fall.',
  'Life is what happens when you are busy making other plans for the future.',
]

interface TestResult {
  wpm: number
  accuracy: number
  time: number
  date: Date
}

function getRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export default function TypingSpeedTest() {
  const [lang, setLang] = useState<Lang>(() => navigator.language.startsWith('pt') ? 'pt' : 'en')
  const [dark, setDark] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches)
  const [sentence, setSentence] = useState(() => getRandom(SENTENCES))
  const [typed, setTyped] = useState('')
  const [started, setStarted] = useState(false)
  const [finished, setFinished] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [history, setHistory] = useState<TestResult[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const t = translations[lang]

  if (typeof document !== 'undefined') {
    document.documentElement.classList.toggle('dark', dark)
  }

  const correctChars = typed.split('').filter((c, i) => c === sentence[i]).length
  const incorrectChars = typed.split('').filter((c, i) => c !== sentence[i]).length
  const accuracy = typed.length ? Math.round((correctChars / typed.length) * 100) : 100
  const wpm = elapsed > 0 ? Math.round((typed.trim().split(/\s+/).length / (elapsed / 60))) : 0

  const stopTimer = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
  }, [])

  useEffect(() => {
    if (started && !finished) {
      timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000)
    }
    return stopTimer
  }, [started, finished, stopTimer])

  useEffect(() => {
    if (typed === sentence && typed.length > 0 && !finished) {
      stopTimer()
      setFinished(true)
      const result: TestResult = {
        wpm: Math.round((sentence.trim().split(/\s+/).length / (elapsed / 60))),
        accuracy,
        time: elapsed,
        date: new Date(),
      }
      setHistory(h => [result, ...h.slice(0, 9)])
    }
  }, [typed, sentence, finished, elapsed, accuracy, stopTimer])

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    if (!started && val.length === 1) {
      setStarted(true)
      setElapsed(0)
    }
    if (!finished) setTyped(val)
  }

  const handleNewTest = () => {
    stopTimer()
    setSentence(getRandom(SENTENCES))
    setTyped('')
    setStarted(false)
    setFinished(false)
    setElapsed(0)
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  const bestWpm = history.length ? Math.max(...history.map(h => h.wpm)) : 0
  const avgWpm = history.length ? Math.round(history.reduce((s, h) => s + h.wpm, 0) / history.length) : 0

  const fmtTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 transition-colors">
      <header className="border-b border-zinc-200 dark:border-zinc-800 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <Type size={18} className="text-white" />
            </div>
            <span className="font-semibold">Typing Speed Test</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setLang(l => l === 'en' ? 'pt' : 'en')} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              <Languages size={14} />{lang.toUpperCase()}
            </button>
            <button onClick={() => setDark(d => !d)} className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <a href="https://github.com/gmowses/typing-speed-test" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
            </a>
          </div>
        </div>
      </header>

      <main className="flex-1 px-6 py-10">
        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{t.title}</h1>
            <p className="mt-2 text-zinc-500 dark:text-zinc-400">{t.subtitle}</p>
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: t.wpm, value: wpm, sub: t.wordsPerMin, color: 'blue' },
              { label: t.accuracy, value: `${accuracy}%`, sub: '', color: 'green' },
              { label: t.time, value: fmtTime(elapsed), sub: '', color: 'purple' },
              { label: t.chars, value: typed.length, sub: `/ ${sentence.length}`, color: 'amber' },
            ].map(s => (
              <div key={s.label} className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-3 text-center">
                <p className="text-[10px] uppercase tracking-wide text-zinc-400 mb-0.5">{s.label}</p>
                <p className={`text-2xl font-bold tabular-nums text-${s.color}-500`}>{s.value}</p>
                {s.sub && <p className="text-[10px] text-zinc-400">{s.sub}</p>}
              </div>
            ))}
          </div>

          {/* Typing area */}
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-4">
            {finished && (
              <div className="flex items-center gap-2 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 px-4 py-3 text-green-700 dark:text-green-300 text-sm font-medium">
                <Trophy size={16} />{t.testComplete} {wpm} {t.wordsPerMin}, {accuracy}% {t.accuracy.toLowerCase()}, {fmtTime(elapsed)}
              </div>
            )}

            {/* Text display */}
            <div className="font-mono text-lg leading-relaxed select-none">
              {sentence.split('').map((char, i) => {
                let cls = 'text-zinc-400 dark:text-zinc-500'
                if (i < typed.length) {
                  cls = typed[i] === char ? 'text-zinc-900 dark:text-zinc-100' : 'text-red-500 bg-red-100 dark:bg-red-900/30 rounded'
                } else if (i === typed.length) {
                  cls = 'text-zinc-900 dark:text-zinc-100 border-b-2 border-blue-500'
                }
                return <span key={i} className={cls}>{char}</span>
              })}
            </div>

            <input
              ref={inputRef}
              type="text"
              value={typed}
              onChange={handleInput}
              disabled={finished}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              placeholder={t.start}
              className="w-full px-4 py-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm disabled:opacity-50"
            />

            <div className="flex gap-2">
              <button onClick={handleNewTest} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition-colors">
                <RefreshCw size={15} />{finished ? t.newTest : t.restart}
              </button>
              {started && !finished && (
                <div className="flex items-center gap-1.5 text-sm text-zinc-500">
                  <Timer size={14} />{fmtTime(elapsed)}
                </div>
              )}
            </div>

            <div className="flex gap-6 text-xs text-zinc-400">
              <span className="text-green-500">{correctChars} {t.correct}</span>
              <span className="text-red-500">{incorrectChars} {t.incorrect}</span>
            </div>
          </div>

          {/* History */}
          {history.length > 0 && (
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold flex items-center gap-2"><Trophy size={16} className="text-amber-500" />{t.history}</h2>
                <div className="flex gap-4 text-xs text-zinc-400">
                  <span>{t.best}: <span className="text-blue-500 font-semibold">{bestWpm}</span> WPM</span>
                  <span>{t.avg}: <span className="text-zinc-600 dark:text-zinc-300 font-semibold">{avgWpm}</span> WPM</span>
                  <span>{history.length} {t.tests}</span>
                </div>
              </div>
              <div className="space-y-1.5">
                {history.map((h, i) => (
                  <div key={i} className="flex items-center justify-between text-sm px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
                    <span className="text-zinc-400 tabular-nums text-xs">#{history.length - i}</span>
                    <span className="font-semibold text-blue-500 tabular-nums">{h.wpm} WPM</span>
                    <span className="text-green-500 tabular-nums">{h.accuracy}%</span>
                    <span className="text-zinc-400 tabular-nums font-mono text-xs">{fmtTime(h.time)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-zinc-200 dark:border-zinc-800 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between text-xs text-zinc-400">
          <span>{t.builtBy} <a href="https://github.com/gmowses" className="text-zinc-600 dark:text-zinc-300 hover:text-blue-500 transition-colors">Gabriel Mowses</a></span>
          <span>MIT License</span>
        </div>
      </footer>
    </div>
  )
}
