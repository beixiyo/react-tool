export async function getLanguageExtension(language: 'javascript' | 'html') {
  switch (language) {
    case 'html':
      const html = await import('@codemirror/lang-html')
      return html.html()
    case 'javascript':
      const js = await import('@codemirror/lang-javascript')
      return js.javascript({ jsx: true, typescript: true })

    default:
      const l: never = language
      break
  }
}
