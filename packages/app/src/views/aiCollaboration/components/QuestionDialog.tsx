/**
 * 问题对话框组件
 * 用于信息收集阶段
 */

import type { Question } from '../types'
import { Modal } from 'comps'
import { memo, useState } from 'react'
import { useSnapshot } from 'valtio'
import { workflowStore } from '../hooks/useWorkflow'

export type QuestionDialogProps = {
  className?: string
  style?: React.CSSProperties
  onSubmit?: (answers: Record<string, string>) => void
  onClose?: () => void
}

export const QuestionDialog = memo<QuestionDialogProps>((props) => {
  const {
    className,
    style,
    onSubmit,
    onClose,
  } = props

  const snap = useSnapshot(workflowStore, { sync: true })
  const [answers, setAnswers] = useState<Record<string, string>>({})

  const handleSubmit = () => {
    /** 检查必填项 */
    const requiredQuestions = (snap.currentQuestions || []).filter(q => q.isRequired)
    const missingRequired = requiredQuestions.filter(q => !answers[q.id]?.trim())

    if (missingRequired.length > 0) {
      alert('请填写所有必填项')
      return
    }

    onSubmit?.(answers)
  }

  return (
    <Modal
      isOpen={ snap.showQuestionDialog }
      onClose={ onClose }
      onOk={ handleSubmit }
      titleText="补充信息"
      okText="提交"
      cancelText="取消"
      width={ 672 }
      className={ className }
      style={ style }
      bodyClassName="space-y-6"
      header={
        <div className="flex flex-col gap-2">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            补充信息
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            为了生成更准确的方案，请回答以下问题
          </p>
        </div>
      }
    >
      {(snap.currentQuestions || []).map(question => (
        <QuestionItem
          key={ question.id }
          question={ question }
          value={ answers[question.id] || '' }
          onChange={ (value) => {
            setAnswers(prev => ({
              ...prev,
              [question.id]: value,
            }))
          } }
        />
      ))}
    </Modal>
  )
})

QuestionDialog.displayName = 'QuestionDialog'

/**
 * 单个问题项
 */
type QuestionItemProps = {
  question: Question
  value: string
  onChange: (value: string) => void
}

const QuestionItem = memo<QuestionItemProps>((props) => {
  const { question, value, onChange } = props

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
        {question.question}
        {question.isRequired && (
          <span className="ml-1 text-red-500">*</span>
        )}
      </label>
      <p className="text-xs text-slate-500 dark:text-slate-400">
        {question.aspect}
      </p>

      <textarea
        value={ value }
        onChange={ e => onChange(e.target.value) }
        placeholder="请输入您的答案"
        className="min-h-[80px] rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 transition focus:border-slate-900 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
      />
    </div>
  )
})

QuestionItem.displayName = 'QuestionItem'
