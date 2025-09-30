import { clsx } from 'clsx'
import { motion } from 'framer-motion'
import { BarChart3 } from 'lucide-react'
import { memo, useState } from 'react'
import { cn } from 'utils'
import { Button } from '@/components/Button'
import { ChatInput } from '@/components/ChatInput'
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
  const {
    messages,
    removeMessage,
    sendMessage,
    currentReport,
  } = useChatData()
  const [isReportOpen, setIsReportOpen] = useState(false)

  function handleOnSubmit(content: string) {
    ChatEventBus.emit(ChatEvent.SetScrollToBottom, undefined)
    sendMessage(content)
  }

  return <div
    className={ clsx(
      'ChatPageContainer relative flex h-full overflow-hidden',
      className,
    ) }
    style={ style }
  >
    {/* 主内容区 - 增加留白 */ }
    <div className="min-w-0 flex flex-1 justify-center px-6 py-8">
      <motion.div
        layout
        className={ cn(
          'h-full flex w-full max-w-4xl flex-col gap-6',
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
          showUploader={ false }
          showQuickMode={ false }
        />
      </motion.div>
    </div>

    {/* 报告预览按钮 - 简化样式 */ }
    { currentReport && (
      <>
        <Button
          onClick={ () => setIsReportOpen(prev => !prev) }
          className="fixed bottom-8 right-8 z-40 shadow-sm transition-all duration-200 hover:shadow-md"
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
& React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLDivElement>, HTMLDivElement>
