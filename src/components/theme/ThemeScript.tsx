/**
 * Inline-скрипт, выставляющий класс темы (`light`/`dark`) на <html> ДО гидрации.
 * Без него next-themes навешивает класс уже после первого рендера, и React
 * сообщает о hydration mismatch.
 *
 * Должен рендериться внутри <head> (или прямо в <html> до <body>), чтобы
 * выполниться до первого пэйнта.
 */
export function ThemeScript() {
  const code = `(function () {
    try {
      var stored = localStorage.getItem('theme');
      var theme = stored;
      if (!theme || theme === 'system') {
        theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      var root = document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(theme);
      root.style.colorScheme = theme;
    } catch (_) {}
  })();`

  return <script dangerouslySetInnerHTML={{ __html: code }} />
}
