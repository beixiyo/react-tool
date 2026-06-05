import type { ChatSubmitPayload } from 'comps'
import { useSignals } from '@preact/signals-react/runtime'
import { clsx } from 'clsx'
import { Button, ChatInput } from 'comps'
import { BarChart3 } from 'lucide-react'
import { memo, useState } from 'react'
import { cn } from 'utils'
import { ChatEvent, ChatEventBus } from '../constants'
import { useChatData } from '../useChatData'
import { ChatHistory } from './ChatHistory'
import { ReportPreview } from './ReportPreview'

export const ChatPage = memo<ChatPageProps>((
  {
    style,
    className,
  },
) => {
  /** 订阅 chat signals（本项目未启用 signals babel transform，需手动调用以建立追踪） */
  useSignals()

  const {
    messages,
    removeMessage,
    sendMessage,
    currentReport,
  } = useChatData()
  const [isReportOpen, setIsReportOpen] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([])

  function handleOnSubmit(data: ChatSubmitPayload) {
    const content = data.text || ''
    ChatEventBus.emit(ChatEvent.SetScrollToBottom, undefined)
    sendMessage(content, data.images || uploadedFiles)
    setUploadedFiles([])
  }

  function handleFilesChange(files: string[]) {
    setUploadedFiles(prev => [...prev, ...files])
  }

  function handleFileRemove(index: number) {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  return <div
    className={ clsx(
      'ChatPageContainer relative flex h-full overflow-hidden bg-background',
      className,
    ) }
    style={ style }
  >
    <div
      className={ cn(
        'min-w-0 flex flex-1 flex-col gap-6 px-6 py-8',
        'mx-auto w-full max-w-4xl',
      ) }>

      <ChatHistory
        className="min-h-0 w-full flex-1"
        messages={ messages }
        onDeleteMessage={ removeMessage }
      />
      <ChatInput
        className="h-32"
        onSubmit={ handleOnSubmit }
        placeholder="Ask me anything..."
        enablePromptTemplates
        enableHistory
        enableAutoComplete
        enableVoiceRecorder
        enableUploader={ true }
        uploadedFiles={ uploadedFiles }
        onFilesChange={ handleFilesChange }
        onFileRemove={ handleFileRemove }
      />
    </div>

    { currentReport && (
      <>
        <Button
          onClick={ () => setIsReportOpen(prev => !prev) }
          className="fixed bottom-8 right-8 z-40 shadow-xs transition-all duration-200 hover:shadow-md"
          rounded="full"
          variant="default"
        >
          <BarChart3 size={ 20 } />
        </Button>

        <ReportPreview
          report={ currentReport }
          isOpen={ isReportOpen }
          onClose={ () => setIsReportOpen(false) }
        />
      </>
    ) }
  </div>
})

ChatPage.displayName = 'ChatPage'

export type ChatPageProps = {
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
}
& React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>
