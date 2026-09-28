import type { ChatInputFeatures, ResolvedChatInputFeatures } from '../../types'

const DEFAULT_HISTORY_MAX_COUNT = 50

export function resolveChatInputFeatures(features?: ChatInputFeatures): ResolvedChatInputFeatures {
  return {
    promptTemplates: normalizePromptFeature(features?.promptTemplates),
    history: normalizeHistoryFeature(features?.history),
    autocomplete: normalizeAutocompleteFeature(features?.autocomplete),
  }
}

function normalizePromptFeature(
  feature: ChatInputFeatures['promptTemplates'],
): ResolvedChatInputFeatures['promptTemplates'] {
  if (typeof feature === 'boolean') return { enabled: feature, includeDefaults: true }

  return {
    enabled: feature?.enabled ?? false,
    includeDefaults: feature?.includeDefaults ?? true,
    templates: feature?.templates,
    adapter: feature?.adapter,
  }
}

function normalizeHistoryFeature(
  feature: ChatInputFeatures['history'],
): ResolvedChatInputFeatures['history'] {
  if (typeof feature === 'boolean') return { enabled: feature, maxCount: DEFAULT_HISTORY_MAX_COUNT }

  return {
    enabled: feature?.enabled ?? false,
    maxCount: feature?.maxCount ?? DEFAULT_HISTORY_MAX_COUNT,
    items: feature?.items,
    adapter: feature?.adapter,
  }
}

function normalizeAutocompleteFeature(
  feature: ChatInputFeatures['autocomplete'],
): ResolvedChatInputFeatures['autocomplete'] {
  if (typeof feature === 'boolean') return { enabled: feature }

  return {
    enabled: feature?.enabled ?? false,
    adapter: feature?.adapter,
  }
}
