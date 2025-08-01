'use client'

import { Button } from '@/components/Button'
import { useEffect, useState } from 'react'
import { echartsHtml } from '../HtmlPreview/test.data'
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
    <div className="p-4">
      <h2 className="mb-4 text-xl font-bold">CodeMirror Live Update Demo (HTML)</h2>
      <p className="mb-4">Click the button, and the editor below will render HTML code character by character at a 10ms interval, automatically scrolling to the bottom.</p>
      <Button onClick={ startTyping } disabled={ isTyping }>
        { isTyping
          ? 'Typing...'
          : 'Start' }
      </Button>

      <CodeMirrorEditor
        code={ code }
        language="html"
        className="mt-4 h-xl text-base"
        readOnly
      />
    </div>
  )
}

export default TestCodeMirror
