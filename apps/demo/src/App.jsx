import { TARGETS, assertIR, generate } from '@d2c/generator';
import React, { useMemo, useState } from 'react';

import IRRenderer from './IRRenderer.jsx';
import { SAMPLES } from './samples.js';

const VIEWS = [{ id: 'preview', label: 'Preview' }, ...TARGETS];

export default function App() {
  const [sampleId, setSampleId] = useState(SAMPLES[0].id);
  const [source, setSource] = useState(() => JSON.stringify(SAMPLES[0].ir, null, 2));
  const [view, setView] = useState('preview');
  const [copied, setCopied] = useState(false);

  const parsed = useMemo(() => {
    try {
      return { ok: true, ir: assertIR(JSON.parse(source)) };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  }, [source]);

  const generated = useMemo(() => {
    if (!parsed.ok || view === 'preview') return null;
    try {
      return { ok: true, ...generate(parsed.ir, { target: view }) };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  }, [parsed, view]);

  function pickSample(id) {
    const sample = SAMPLES.find((s) => s.id === id);
    if (!sample) return;
    setSampleId(id);
    setSource(JSON.stringify(sample.ir, null, 2));
  }

  async function copyCode() {
    if (!generated?.ok) return;
    try {
      await navigator.clipboard.writeText(generated.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="min-h-screen text-slate-800">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-6 py-4">
          <div>
            <h1 className="text-lg font-semibold text-slate-900">Figma Design to Code</h1>
            <p className="text-sm text-slate-500">
              Same IR, same generator, same output as the Figma plugin - just running in the browser.
            </p>
          </div>
          <div className="ml-auto flex gap-2">
            {SAMPLES.map((sample) => (
              <button
                key={sample.id}
                type="button"
                onClick={() => pickSample(sample.id)}
                className={`rounded-lg border px-3 py-1.5 text-sm transition ${
                  sampleId === sample.id
                    ? 'border-blue-600 bg-blue-600 text-white'
                    : 'border-slate-300 bg-white text-slate-600 hover:border-blue-400'
                }`}
              >
                {sample.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-6 px-6 py-6 lg:grid-cols-2">
        <section className="flex flex-col rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <h2 className="text-sm font-semibold text-slate-900">Design IR</h2>
            <span className="text-xs text-slate-500">Paste the JSON exported by the plugin</span>
          </div>
          <textarea
            value={source}
            onChange={(event) => setSource(event.target.value)}
            spellCheck={false}
            className="h-[28rem] w-full resize-y rounded-b-xl bg-slate-50 p-4 font-mono text-xs leading-relaxed text-slate-700 outline-none focus:bg-white"
          />
          {!parsed.ok && (
            <p className="border-t border-red-200 bg-red-50 px-4 py-2 text-xs text-red-700">{parsed.error}</p>
          )}
        </section>

        <section className="flex flex-col rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 px-4 py-3">
            {VIEWS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setView(item.id)}
                className={`rounded-lg px-3 py-1.5 text-sm transition ${
                  view === item.id ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {item.label}
              </button>
            ))}
            {view !== 'preview' && (
              <button
                type="button"
                onClick={copyCode}
                disabled={!generated?.ok}
                className="ml-auto rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:border-blue-400 disabled:opacity-40"
              >
                {copied ? 'Copied' : 'Copy'}
              </button>
            )}
          </div>

          <div className="flex-1 overflow-auto rounded-b-xl">
            {view === 'preview' ? (
              <div className="flex min-h-[28rem] items-center justify-center bg-[radial-gradient(circle_at_1px_1px,#cbd5e1_1px,transparent_0)] bg-[length:16px_16px] p-8">
                {parsed.ok ? <IRRenderer node={parsed.ir.root} /> : <p className="text-sm text-slate-500">Fix the IR to preview</p>}
              </div>
            ) : (
              <div>
                {generated?.ok ? (
                  <>
                    <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-2 text-xs text-slate-500">
                      <span className="font-mono">{generated.filename}</span>
                      <span>{generated.code.split('\n').length} lines</span>
                    </div>
                    <pre className="min-h-[26rem] overflow-auto p-4 font-mono text-xs leading-relaxed text-slate-800">
                      <code>{generated.code}</code>
                    </pre>
                  </>
                ) : (
                  <p className="p-4 text-sm text-red-700">{generated?.error ?? parsed.error}</p>
                )}
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="mx-auto max-w-7xl px-6 pb-10 text-xs text-slate-500">
        Tailwind utilities are compiled in the browser via the Play CDN so runtime-generated classes
        (including arbitrary values) render correctly. Use a real Tailwind build in production apps.
      </footer>
    </div>
  );
}
