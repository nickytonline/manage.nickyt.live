function getCommandResponse({user, command, message, flags, extra}) {
  switch(command) {
    case 'rust':
      return '🦀'

    case 'crate':
      return '📦'

    case 'compile':
      return '🖥️'

    case 'todd':
      return '🦞'

    default:
      return '';
  }
}

export function chatInteractions() {
  ComfyJS.onCommand = (user, command, message, flags, extra) => {
    const emoji = document.createElement('div');
    emoji.className = 'start';
    emoji.innerHTML = getCommandResponse({user, command, message, flags, extra});
    document.body.appendChild(emoji);

    setTimeout(() => {
      emoji.parentElement.removeChild(emoji);
    }, 20000)
  };
  ComfyJS.Init("nickytonline");
}