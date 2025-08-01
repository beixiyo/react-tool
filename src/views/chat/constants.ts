import { EventBus } from '@jl-org/tool'

export enum ChatEvent {
  SetScrollToBottom,
}

export const ChatEventBus = new EventBus<ChatEvent>()
