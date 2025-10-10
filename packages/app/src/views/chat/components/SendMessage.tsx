import { Send } from 'lucide-react'
import { memo } from 'react'
import { cn } from 'utils'
import { Button } from 'comps'
import { Textarea } from 'comps'

export const SendMessage = memo<SendMessageProps>((
  {
    style,
    className,
    onSendMessage,
  },
) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  return <Textarea
    ref={ textareaRef }
    placeholder="Ask me anything..."
    containerClassName={ cn(
      'SendMessageContainer w-full',
      className,
    ) }
    className="border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 placeholder:text-slate-400 dark:placeholder:text-slate-500"
    style={ style }
    rows={ 3 }
    onKeyDown={ (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        const content = (e.target as HTMLTextAreaElement).value
        onSendMessage(content)
        ; (e.target as HTMLTextAreaElement).value = ''
      }
    } }
  >
    <Button
      variant="primary"
      className="absolute bottom-3 right-3"
      onClick={ () => {
        if (textareaRef.current) {
          onSendMessage(textareaRef.current.value)
          textareaRef.current.value = ''
        }
      } }
      rounded="full"
      size="sm"
    >
      <Send strokeWidth={ 1.5 } size={ 18 } />
    </Button>
  </Textarea>
})

SendMessage.displayName = 'SendMessage'

export type SendMessageProps = {
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
  onSendMessage: (content: string) => void
}
& React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLDivElement>, HTMLDivElement>
