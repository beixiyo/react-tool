import type { ChatInputFeatures, ResolveChatInputFeaturesOptions, ResolvedChatInputFeatures } from '../../types'

const DEFAULT_HISTORY_MAX_COUNT = 50

export function resolveChatInputFeatures(options: ResolveChatInputFeaturesOptions): ResolvedChatInputFeatures {
  const {
    features,
    enablePromptTemplates,
    enableHistory,
    enableAutoComplete,
    customTemplates,
    maxHistoryCount,
  } = options

  const promptTemplates = normalizePromptFeature(features?.promptTemplates, enablePromptTemplates)
  const history = normalizeHistoryFeature(features?.history, enableHistory, maxHistoryCount)
  const autocomplete = normalizeAutocompleteFeature(features?.autocomplete, enableAutoComplete)

  return {
    promptTemplates: {
      ...promptTemplates,
      templates: promptTemplates.templates ?? customTemplates,
    },
    history: {
      ...history,
      maxCount: history.maxCount,
    },
    autocomplete,
  }
}

function normalizePromptFeature(
  feature: ChatInputFeatures['promptTemplates'],
  legacyEnabled: boolean | undefined,
): ResolvedChatInputFeatures['promptTemplates'] {
  if (typeof feature === 'boolean')
    return { enabled: feature, includeDefaults: true }

  return {
    enabled: feature?.enabled ?? legacyEnabled ?? false,
    includeDefaults: feature?.includeDefaults ?? true,
    templates: feature?.templates,
    adapter: feature?.adapter,
  }
}

function normalizeHistoryFeature(
  feature: ChatInputFeatures['history'],
  legacyEnabled: boolean | undefined,
  legacyMaxCount: number | undefined,
): ResolvedChatInputFeatures['history'] {
  if (typeof feature === 'boolean')
    return { enabled: feature, maxCount: legacyMaxCount ?? DEFAULT_HISTORY_MAX_COUNT }

  return {
    enabled: feature?.enabled ?? legacyEnabled ?? false,
    maxCount: feature?.maxCount ?? legacyMaxCount ?? DEFAULT_HISTORY_MAX_COUNT,
    items: feature?.items,
    adapter: feature?.adapter,
    shortcut: feature?.shortcut,
  }
}

function normalizeAutocompleteFeature(
  feature: ChatInputFeatures['autocomplete'],
  legacyEnabled: boolean | undefined,
): ResolvedChatInputFeatures['autocomplete'] {
  if (typeof feature === 'boolean')
    return { enabled: feature }

  return {
    enabled: feature?.enabled ?? legacyEnabled ?? false,
    adapter: feature?.adapter,
  }
}
