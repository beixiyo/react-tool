/**
 * TypeScript 类型推导系统
 * 提供完整的类型安全支持，包括键路径推导、插值参数推导等
 */

export type {
  PathExtractor,
  TranslationPaths,
  PluralKeyPath,
} from './pathExtractor'

export type {
  ExtractInterpolationVars,
  ExtractInterpolationFromValue,
  BuildInterpolationParams,
} from './interpolation'

export type {
  TFunction,
  TFunctionWithPlural,
  BuildTranslateOptions,
} from './builder'

export { createTypedTFunction } from './instance'

