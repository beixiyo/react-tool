import { clsx } from 'clsx'
import { motion } from 'framer-motion'
import { BarChart3 } from 'lucide-react'
import { memo, useState } from 'react'
import { cn } from 'utils'
import { Button } from '@/components/Button'
import { ChatInput } from '@/components/ChatInput'
import { Sidebar } from '@/components/Sidebar'
import { SidebarTestData } from '@/components/Sidebar/test.data'
import { ChatEvent, ChatEventBus } from '../constants'
import { useChatData } from '../useChatData'
import { AgentProgress } from './AgentProgress'
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
    activeAgent,
    currentReport,
    agentTasks,
    handleTaskClick,
    handleTaskAction,
  } = useChatData()
  const [isReportOpen, setIsReportOpen] = useState(false)
  const [isAgentProgressCollapsed, setIsAgentProgressCollapsed] = useState(false)

  function handleOnSubmit(content: string) {
    ChatEventBus.emit(ChatEvent.SetScrollToBottom)
    sendMessage(content)
  }

  return <div
    className={ clsx(
      'ChatPageContainer relative flex flex-row h-full gap-4 overflow-hidden',
      className,
    ) }
    style={ style }
  >
    <Sidebar
      data={ SidebarTestData }
      loadMore={ async () => { } }
      hasMore={ false }
      className="fixed left-2 z-50 h-96 center-y"
    />

    {/* 左侧面板区域 */ }
    <AgentProgress
      tasks={ agentTasks }
      onTaskClick={ handleTaskClick }
      onActionClick={ handleTaskAction }
      defaultCollapsed={ false }
      isCollapsed={ isAgentProgressCollapsed }
      onToggleCollapse={ () => setIsAgentProgressCollapsed(!isAgentProgressCollapsed) }
      className="shrink-0"
    />

    {/* Agent 面板 */ }
    {/* { activeAgent && !isAgentSidebarCollapsed && (
      <AgentPanel agent={ activeAgent } className="border-0 bg-transparent p-0" />
    ) } */}

    <div className="min-w-0 flex flex-1 pb-4">
      <motion.div
        layout
        className={ cn(
          'h-full flex flex-1 flex-col gap-4 max-w-4xl mx-auto',
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

    { currentReport && (
      <>
        <Button
          onClick={ () => setIsReportOpen(prev => !prev) }
          className="fixed bottom-6 right-6 z-40"
          rounded="full"
          variant="default"
          designStyle="neumorphic"
        >
          <BarChart3 size={ 18 } />
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
