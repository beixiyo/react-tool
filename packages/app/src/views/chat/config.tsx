import type { AgentTask } from './types'
import { AlertCircle, BarChart3, Check, Clock, DollarSign, TrendingUp, Users, X } from 'lucide-react'

/**
 * 卡片图标组件
 */
export const CardIcons = {
  TrendingUp: <TrendingUp size={ 20 } />,
  Users: <Users size={ 20 } />,
  DollarSign: <DollarSign size={ 20 } />,
  AlertCircle: <AlertCircle size={ 20 } />,
  BarChart3: <BarChart3 size={ 20 } />,
}

/** 状态配置 */
export function getStatusConfig(status: AgentTask['status']) {
  const configs = {
    'complete': {
      label: 'Complete',
      icon: Check,
      className: 'border-green-500 toning-green',
    },
    'in-progress': {
      label: 'progress',
      icon: Clock,
      className: 'border-blue-500 toning-blue',
    },
    'waiting': {
      label: 'Waiting',
      icon: Clock,
      className: 'border-orange-500 toning-orange',
    },
    'error': {
      label: 'Error',
      icon: AlertCircle,
      className: 'border-red-500 toning-red',
    },
    'cancelled': {
      label: 'Cancelled',
      icon: X,
      className: 'border-gray-500 toning-gray',
    },
  }

  return configs[status] || configs.waiting
}
