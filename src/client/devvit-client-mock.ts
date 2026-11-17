const params = new URLSearchParams(window.location.search);

export const context = {
  username: params.get('as') ?? 'local-preview',
  subredditName: 'local-preview',
  postId: 'local-preview',
  userId: params.get('as') ?? 'local-preview',
};

export function requestExpandedMode(_event: Event, _entry: string) {
  const url = new URL('game.html', window.location.href);
  url.search = window.location.search;
  window.location.assign(url.toString());
}

export function navigateTo(url: string) {
  if (url.startsWith('http')) {
    window.open(url, '_blank', 'noopener');
  }
}

export function showToast(message: string) {
  window.dispatchEvent(new CustomEvent('read-the-room-toast', { detail: message }));
}
