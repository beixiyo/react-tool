'use client'

import { useEffect, useState } from 'react'
import { Button, ThemeToggle } from '../../../../comps/src/components'
import { echartsHtml } from '../../../../comps/src/components/HtmlPreview/test.data'
import { CodeMirrorEditor } from './index'

function TestCodeMirror() {
  const [code, setCode] = useState(echartsHtml)
  const [isTyping, setIsTyping] = useState(false)

  const startTyping = () => {
    setIsTyping(true)
    setCode('') // Reset code
  }

  useEffect(() => {
    if (isTyping && code.length < echartsHtml.length) {
      const timeoutId = setTimeout(() => {
        setCode(echartsHtml.slice(0, code.length + 1))
      }) // 10ms interval
      return () => clearTimeout(timeoutId)
    }
    else if (isTyping) {
      setIsTyping(false)
    }
  }, [code, isTyping])

  return (
    <div className="min-h-screen bg-background p-4 text-text">
      <div className="mx-auto max-w-5xl space-y-4">
        <header className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">CodeMirror Live Update Demo (HTML)</h2>
            <p className="mt-1 text-sm text-text2">Click the button, and the editor below will render HTML code character by character, automatically scrolling to the bottom.</p>
          </div>
          <ThemeToggle />
        </header>

        <Button onClick={ startTyping } disabled={ isTyping }>
          { isTyping
            ? 'Typing...'
            : 'Start' }
        </Button>

        <CodeMirrorEditor
          code={ code }
          language="html"
          className="h-xl text-base"
          readOnly
        />
      </div>
    </div>
  )
}

export default TestCodeMirror
