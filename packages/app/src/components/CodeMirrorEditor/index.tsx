'use client'

import { Compartment, EditorState } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { copyToClipboard } from '@jl-org/tool'
import { vitesseDark } from 'codemirror-theme-vitesse'
import { useAsyncEffect, useConst } from 'hooks'
import { memo, useCallback, useEffect, useRef } from 'react'
import { cn } from 'utils'
import { Button, Message } from 'comps'
import { getLanguageExtension } from './tools'

export const CodeMirrorEditor = memo<CodeMirrorEditorProps>((
  {
    style,
    className,
    code,
    language = 'javascript',
    readOnly = false,
    copyable = true,
    onChange,
  },
) => {
  const languageConf = useConst(new Compartment())
  const readonlyConf = useConst(new Compartment())

  const editorRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)

  // ======================
  // * Effects
  // ======================
  useAsyncEffect(async () => {
    if (!editorRef.current)
      return

    const lang = await getLanguageExtension(language)

    const state = EditorState.create({
      doc: code,
      extensions: [
        vitesseDark,
        languageConf.of(lang!),
        readonlyConf.of(EditorState.readOnly.of(readOnly)),

        EditorView.updateListener.of((update) => {
          if (update.docChanged && !readOnly) {
            const code = update.state.doc.toString()
            onChange?.(code)
          }
        }),
      ],
    })

    const view = new EditorView({
      state,
      parent: editorRef.current,
    })

    viewRef.current = view

    return () => {
      view.destroy()
      viewRef.current = null
    }
  }, []) // Initialize only once

  // Effect to switch language
  useAsyncEffect(async () => {
    if (viewRef.current) {
      const lang = await getLanguageExtension(language)
      viewRef.current.dispatch({
        effects: languageConf.reconfigure(lang!),
      })
    }
  }, [language])

  // Effect to update code
  useEffect(() => {
    const view = viewRef.current
    if (view && code !== undefined && code !== view.state.doc.toString()) {
      view.dispatch({
        changes: {
          from: 0,
          to: view.state.doc.length,
          insert: code || '',
        },
        selection: { anchor: (code || '').length },
        scrollIntoView: true,
      })
    }
  }, [code])

  // read-only
  useEffect(() => {
    if (viewRef.current) {
      viewRef.current.dispatch({
        effects: readonlyConf.reconfigure(
          EditorState.readOnly.of(readOnly),
        ),
      })
    }
  }, [readOnly, readonlyConf])

  // ======================
  // * Fns
  // ======================
  const handleCopy = useCallback(() => {
    copyToClipboard(code || '').then(() => {
      Message.success('Copy Success')
    })
  }, [code])

  return (
    <div
      className={ cn(
        'relative h-full border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden bg-slate-600',
        className,
      ) }
      style={ style }
    >
      { copyable && (
        <Button
          onClick={ handleCopy }
          aria-label="Copy"
          className="absolute right-2 top-2 z-10 h-6 p-1"
          size="sm"
        >
          Copy
        </Button>
      ) }

      <div
        ref={ editorRef }
        className={ cn(
          'CodeMirrorEditorContainer overflow-y-auto overflow-x-hidden h-full',
        ) }
      />
    </div>
  )
})

CodeMirrorEditor.displayName = 'CodeMirrorEditor'

export type CodeMirrorEditorProps = {
  code?: string
  /**
   * The editor language
   * @default 'javascript'
   */
  language?: CodeMirrorLanguage
  /**
   * Callback when the value changes
   */
  onChange?: (value: string) => void
  /**
   * Whether the editor is read-only
   * @default false
   */
  readOnly?: boolean
  /**
   * Whether to show the copy button
   * @default true
   */
  copyable?: boolean
}
& Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'>

export type CodeMirrorLanguage = 'javascript' | 'html'
