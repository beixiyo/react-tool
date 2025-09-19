'use client'

import type { CodeMirrorLanguage } from '../CodeMirrorEditor'
import { Code2, Edit, Play } from 'lucide-react'
import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { cn } from 'utils'
import { Button } from '../Button'
import { CodeMirrorEditor } from '../CodeMirrorEditor'
import { HtmlPreview } from '../HtmlPreview'
import { KeepAlive } from '../KeepAlive'

export const CodePreview = memo<CodePreviewProps>((
  {
    code,
    language = 'html',
    style,
    mode = 'code',
    className,
    copyable = true,
    editable = false,
    readonly,
    title = '代码预览',
    onCodeChange,
    customHeader,
    headerHeight = 44,
  },
) => {
  const [activeMode, setActiveMode] = useState<CodePreviewMode>(mode)
  const [currentCode, setCurrentCode] = useState(code)
  const [editorValue, setEditorValue] = useState(code)

  useEffect(() => {
    setActiveMode(mode)
  }, [mode])

  /** 当外部代码变化时更新 */
  useEffect(() => {
    setCurrentCode(code)
    setEditorValue(code)
  }, [code])

  const handleRunCode = useCallback(() => {
    /** 如果是从编辑模式运行，先应用编辑后的代码 */
    if (activeMode === 'edit') {
      setCurrentCode(editorValue)
      if (onCodeChange) {
        onCodeChange(editorValue)
      }
    }
    setActiveMode('preview')
  }, [activeMode, editorValue, onCodeChange])

  const handleShowCode = useCallback(() => {
    setActiveMode('code')
  }, [])

  const handleEditCode = useCallback(() => {
    setActiveMode('edit')
    setEditorValue(currentCode)
  }, [currentCode])

  const handleSaveCode = useCallback(() => {
    setCurrentCode(editorValue)
    if (onCodeChange) {
      onCodeChange(editorValue)
    }
    setActiveMode('code')
  }, [editorValue, onCodeChange])

  const isHtml = language === 'html'

  const contentStyle = useMemo(() => ({
    height: `calc(100% - ${headerHeight}px)`,
  }), [headerHeight])

  return (
    <div
      className={ cn(
        'flex flex-col rounded-lg border border-gray-200 bg-white shadow-xs dark:border-gray-700 dark:bg-gray-800',
        className,
      ) }
      style={ style }
    >
      { customHeader
        ? (
            customHeader({
              activeTab: activeMode,
              setActiveTab: setActiveMode,
              isHtml,
              handleShowCode,
              handleEditCode,
              handleSaveCode,
              handleRunCode,
              title,
            })
          )
        : (
            <div
              className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-2 dark:border-gray-700 dark:bg-gray-900"
              style={ { height: headerHeight } }
            >
              <div className="text-sm text-gray-700 font-medium dark:text-gray-300">
                { title }
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={ handleShowCode }
                  variant={ activeMode === 'code'
                    ? 'primary'
                    : 'default' }
                  leftIcon={ <Code2 size={ 14 } /> }
                >
                  代码
                </Button>

                { editable && (
                  <Button
                    size="sm"
                    onClick={ activeMode === 'edit'
                      ? handleSaveCode
                      : handleEditCode }
                    variant={ activeMode === 'edit'
                      ? 'primary'
                      : 'default' }
                    leftIcon={ <Edit size={ 14 } /> }
                  >
                    { activeMode === 'edit'
                      ? '保存'
                      : '编辑' }
                  </Button>
                ) }

                <Button
                  size="sm"
                  onClick={ handleRunCode }
                  variant={ activeMode === 'preview'
                    ? 'primary'
                    : 'default' }
                  leftIcon={ <Play size={ 14 } /> }
                  disabled={ !isHtml }
                >
                  运行
                </Button>
              </div>
            </div>
          ) }

      <KeepAlive active={ ['code', 'edit'].includes(activeMode) }>
        <CodeMirrorEditor
          code={ currentCode }
          language={ language }
          readOnly={ readonly ?? activeMode === 'code' }
          copyable={ copyable }
          style={ contentStyle }
          onChange={ setEditorValue }
        />
      </KeepAlive>

      <KeepAlive active={ activeMode === 'preview' }>
        { isHtml
          ? (
              <HtmlPreview
                html={ currentCode }
                title={ title }
                draggable={ false }
                overflow="auto"
                showControls={ false }
                style={ contentStyle }
              />
            )
          : (
              <div className="h-full flex items-center justify-center p-4 text-gray-500 dark:text-gray-400">
                只有 HTML 代码可以预览运行
              </div>
            ) }
      </KeepAlive>
    </div>
  )
})

CodePreview.displayName = 'CodePreview'

export type CodePreviewMode = 'code' | 'preview' | 'edit'

export interface CodePreviewProps {
  /**
   * 要显示和运行的代码
   */
  code: string
  /**
   * 是否只读
   * @default false
   */
  readonly?: boolean
  /**
   * 代码语言
   * @default 'html'
   */
  language?: CodeMirrorLanguage
  /**
   * 头部高度（像素）
   * @default 44
   */
  headerHeight?: number
  /**
   * 是否允许复制代码
   * @default true
   */
  copyable?: boolean
  /**
   * @default 'code'
   */
  mode?: CodePreviewMode
  /**
   * 是否允许编辑代码
   * @default false
   */
  editable?: boolean
  /**
   * 预览窗口标题
   * @default '代码预览'
   */
  title?: string
  /**
   * 代码更改回调
   */
  onCodeChange?: (code: string) => void
  /**
   * 自定义样式
   */
  style?: React.CSSProperties
  /**
   * 自定义类名
   */
  className?: string
  /**
   * 自定义头部
   * 传入一个函数，返回自定义头部的 JSX
   */
  customHeader?: (props: {
    activeTab: 'code' | 'preview' | 'edit'
    setActiveTab: (tab: 'code' | 'preview' | 'edit') => void
    isHtml: boolean
    handleShowCode: () => void
    handleEditCode: () => void
    handleSaveCode: () => void
    handleRunCode: () => void
    title: string
  }) => React.ReactNode
}
