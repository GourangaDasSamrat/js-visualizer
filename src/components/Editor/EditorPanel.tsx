import { useCallback, useMemo } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { dracula } from '@uiw/codemirror-theme-dracula';
import { EditorView, Decoration, type DecorationSet } from '@codemirror/view';
import { StateField, StateEffect } from '@codemirror/state';
import { autocompletion } from '@codemirror/autocomplete';
import { useExecutionStore } from '../../store/executionStore';

// Catppuccin Macchiato theme
const catppuccinMacchiato = EditorView.theme(
  {
    '&': {
      backgroundColor: '#24273a',
      color: '#cad3f5',
    },
    '.cm-content': { caretColor: '#f4dbd6' },
    '.cm-cursor': { borderLeftColor: '#f4dbd6' },
    '.cm-gutters': { backgroundColor: '#1e2030', color: '#6e738d', border: 'none' },
    '.cm-activeLineGutter': { backgroundColor: '#363a4f' },
    '.cm-activeLine': { backgroundColor: '#363a4f88' },
    '.cm-selectionBackground': { backgroundColor: '#363a4f' },
    '&.cm-focused .cm-selectionBackground': { backgroundColor: '#494d6488' },
    '.cm-matchingBracket': { color: '#a6da95', fontWeight: 'bold' },
    '.cm-keyword': { color: '#c6a0f6' },
    '.cm-def': { color: '#8aadf4' },
    '.cm-variable': { color: '#cad3f5' },
    '.cm-string': { color: '#a6da95' },
    '.cm-comment': { color: '#6e738d', fontStyle: 'italic' },
    '.cm-number': { color: '#f5a97f' },
    '.cm-operator': { color: '#91d7e3' },
    '.cm-property': { color: '#7dc4e4' },
    '.cm-atom': { color: '#f0c6c6' },
    '.cm-builtin': { color: '#eed49f' },
    '.cm-type': { color: '#ed8796' },
  },
  { dark: true }
);

// Active line highlight effect
const setActiveLine = StateEffect.define<number>();

const activeLineField = StateField.define<DecorationSet>({
  create() {
    return Decoration.none;
  },
  update(decorations, tr) {
    for (const effect of tr.effects) {
      if (effect.is(setActiveLine)) {
        const line = effect.value;
        if (line <= 0) return Decoration.none;
        try {
          const lineObj = tr.state.doc.line(line);
          const deco = Decoration.mark({
            class: 'cm-active-exec-line',
          }).range(lineObj.from, lineObj.to);
          return Decoration.set([deco]);
        } catch {
          return Decoration.none;
        }
      }
    }
    return decorations.map(tr.changes);
  },
  provide: (f) => EditorView.decorations.from(f),
});

const activeLineHighlightStyle = EditorView.baseTheme({
  '.cm-active-exec-line': {
    backgroundColor: '#f59e0b33',
    borderLeft: '3px solid #f59e0b',
    paddingLeft: '4px',
  },
});

interface EditorPanelProps {
  className?: string;
}

export function EditorPanel({ className = '' }: EditorPanelProps) {
  const { code, setCode, theme, setTheme, status } = useExecutionStore();
  const currentStep = useExecutionStore((s) => s.currentStep);

  const extensions = useMemo(
    () => [
      javascript({ jsx: false, typescript: false }),
      autocompletion(),
      activeLineField,
      activeLineHighlightStyle,
    ],
    []
  );

  const handleChange = useCallback(
    (value: string) => {
      setCode(value);
    },
    [setCode]
  );

  const onCreateEditor = useCallback(
    (view: EditorView) => {
      if (currentStep && currentStep.activeLine > 0) {
        view.dispatch({ effects: setActiveLine.of(currentStep.activeLine) });
      }
    },
    [currentStep]
  );

  const isReadonly = status === 'paused' || status === 'running' || status === 'complete';

  return (
    <div className={`flex flex-col h-full bg-[#1a1d2e] rounded-xl overflow-hidden border border-white/10 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#0f1117] border-b border-white/10 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
            <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
            <div className="w-3 h-3 rounded-full bg-[#28c840]" />
          </div>
          <span className="text-xs font-mono text-white/40 tracking-wider">script.js</span>
        </div>

        {/* Theme toggle */}
        <div className="flex items-center gap-1 bg-white/5 rounded-lg p-0.5">
          <button
            onClick={() => setTheme('dracula')}
            className={`px-3 py-1 text-xs rounded-md font-medium transition-all duration-200 ${
              theme === 'dracula'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'text-white/40 hover:text-white/70'
            }`}
          >
            Dracula
          </button>
          <button
            onClick={() => setTheme('catppuccin')}
            className={`px-3 py-1 text-xs rounded-md font-medium transition-all duration-200 ${
              theme === 'catppuccin'
                ? 'bg-[#c6a0f6]/80 text-white shadow-lg'
                : 'text-white/40 hover:text-white/70'
            }`}
          >
            Catppuccin
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-auto">
        <CodeMirror
          value={code}
          onChange={handleChange}
          theme={theme === 'dracula' ? dracula : catppuccinMacchiato}
          extensions={extensions}
          readOnly={isReadonly}
          onCreateEditor={onCreateEditor}
          height="100%"
          style={{ height: '100%', fontSize: '14px' }}
          basicSetup={{
            lineNumbers: true,
            foldGutter: true,
            dropCursor: true,
            allowMultipleSelections: false,
            indentOnInput: true,
            syntaxHighlighting: true,
            bracketMatching: true,
            closeBrackets: true,
            autocompletion: true,
            rectangularSelection: true,
            crosshairCursor: false,
            highlightActiveLine: true,
            highlightSelectionMatches: true,
            closeBracketsKeymap: true,
            defaultKeymap: true,
            searchKeymap: false,
            historyKeymap: true,
            foldKeymap: true,
            completionKeymap: true,
            lintKeymap: false,
          }}
        />
      </div>

      {/* Active line indicator */}
      {currentStep && currentStep.activeLine > 0 && (
        <div className="flex items-center gap-2 px-4 py-1.5 bg-amber-500/10 border-t border-amber-500/20 flex-shrink-0">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-xs text-amber-400/80 font-mono">
            Executing line {currentStep.activeLine}
          </span>
        </div>
      )}
    </div>
  );
}
