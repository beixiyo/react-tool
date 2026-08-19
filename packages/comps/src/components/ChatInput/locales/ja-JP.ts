export const jaJP = {
  chatInput: {
    autoCompletePanel: {
      labels: {
        history: '履歴',
        keyword: 'キーワード',
        template: 'テンプレート',
      },
      loading: '候補を検索中...',
      select: '選択',
      suggestionCount: '{{count}} 件の候補',
    },
    buttons: {
      inputHistory: '入力履歴',
      promptTemplates: 'プロンプトテンプレート',
      uploadFile: 'ファイルをアップロード',
    },
    categories: {
      code: 'コード関連',
      custom: 'カスタム',
      debug: 'デバッグ関連',
      document: 'ドキュメント関連',
      explain: '説明',
      optimize: 'パフォーマンス最適化',
      test: 'テスト関連',
      translate: '翻訳・変換',
    },
    historyPanel: {
      clearAll: '🗑️ すべてクリア',
      deleteHistory: '履歴を削除',
      emptyState: {
        noHistory: '📝 入力履歴がありません',
        noHistoryDesc: '入力を開始すると履歴が作成されます',
        noResults: '🔍 一致する履歴が見つかりません',
        noResultsDesc: '別のキーワードで検索してください',
      },
      labels: {
        daysAgo: '{{count}} 日前',
        hoursAgo: '{{count}} 時間前',
        justNow: 'たった今',
        minutesAgo: '{{count}} 分前',
        quickFill: 'クイック入力',
        template: '⭐ テンプレート',
      },
      recordCount: '{{count}} 件の記録',
      searchPlaceholder: '履歴を検索...',
      shortcuts: {
        cancel: 'キャンセル',
        confirm: '確定',
        history: '履歴',
        select: '選択',
      },
      title: '📚 入力履歴',
    },
    placeholder: '質問を入力するか、{{shortcut}} でプロンプトテンプレートを開く...',
    promptPanel: {
      allCategories: '🌟 すべて',
      emptyState: {
        noResults: '🔍 一致するテンプレートが見つかりません',
        noResultsDesc: '別のキーワードで検索してください',
        noTemplates: '📝 利用可能なテンプレートがありません',
        noTemplatesDesc: 'カスタムテンプレートを作成できます',
      },
      labels: {
        custom: '⭐ カスタム',
      },
      searchPlaceholder: 'テンプレートを検索...',
      shortcuts: {
        cancel: 'キャンセル',
        confirm: '確定',
        select: '選択',
      },
      templateCount: '{{count}} 件のテンプレート',
      title: '✨ プロンプトテンプレート',
    },
    shortcuts: {
      history: '履歴',
      send: '送信',
      templates: 'テンプレート',
    },
    templates: {
      addComments: {
        description: 'コードに詳細なコメントを追加',
        title: 'コメントを追加',
      },
      codeExplain: {
        description: 'コードの機能と実装ロジックを分析',
        title: 'このコードを説明',
      },
      codeOptimize: {
        description: 'コードのパフォーマンスと構造を最適化',
        title: 'この関数を最適化',
      },
      codeReview: {
        description: 'コード品質をレビュー',
        title: 'コードレビュー',
      },
      debugError: {
        description: 'コードのエラーを分析して解決',
        title: 'エラーをデバッグ',
      },
      refactorCode: {
        description: 'コード構造をリファクタリング',
        title: 'コードをリファクタリング',
      },
      translateCode: {
        description: '異なるプログラミング言語間でコードを変換',
        title: 'プログラミング言語を変換',
      },
      writeTest: {
        description: 'ユニットテストコードを生成',
        title: 'ユニットテストを作成',
      },
    },
    upload: {
      duplicateRemoved: '重複画像を {{count}} 件除外しました',
      exceedCount: '画像は最大 {{count}} 枚までアップロードできます',
      exceedSize: '画像サイズが上限を超えています',
      exceedPixels: '画像の寸法が上限を超えています',
    },
    voice: {
      audioPlaybackFailed: '音声の再生に失敗しました',
      download: 'ダウンロード',
      endRecording: '録音を終了',
      errors: {
        recordingFailed: '音声録音に失敗しました。マイクの権限を確認してください',
        startSpeechToTextFailed: '音声認識の開始に失敗しました',
      },
      reRecord: '再録音',
      review: '再生確認',
      startRecording: '録音を開始',
      startSpeechToText: '音声入力を開始',
      status: {
        processing: '処理中',
        processingSpeechToText: '認識処理中',
        ready: '録音準備完了',
        recording: '録音中',
        recordingComplete: '録音完了',
        recordingSpeechToText: '認識中',
        speechToTextProcessing: '認識結果を整理中です、しばらくお待ちください',
        stopRecording: '録音を停止',
        stopSpeechToText: '認識を停止',
        voiceProcessing: '録音を整理中です、しばらくお待ちください',
      },
      submit: '送信',
      voiceMode: {
        audio: '音声を録音',
        text: '音声をテキストに変換',
      },
    },
  },
} as const
