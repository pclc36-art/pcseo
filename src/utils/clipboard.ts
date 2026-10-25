// Robust Cross-Platform Clipboard Utility
// Seamless fallback for iframe preview, restricted mobile browsers, and modern async API

export async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof text !== 'string') {
    text = String(text ?? '');
  }

  // 1. Try modern Navigator Clipboard API
  if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fall through to textarea execCommand fallback
    }
  }

  // 2. Synchronous fallback using temporary textarea
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    // Avoid scrolling to bottom
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    textArea.style.pointerEvents = 'none';
    textArea.setAttribute('readonly', '');

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    textArea.setSelectionRange(0, 999999); // Mobile compatibility

    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.error('Safe clipboard copy failed:', err);
    return false;
  }
}
