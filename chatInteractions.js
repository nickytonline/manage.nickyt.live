function getCommandResponse({user, command, message, flags, extra}) {
  // if(!flags.broadcaster) {
  //   return `You are user ${user}`
  // }

  switch(command) {
    case 'rust':
      return '🦀'

    case 'crate':
      return '📦'

    case 'cargo':
      return '🚢'

    default:
      return '';
  }
}

export function chatInteractions() {
  ComfyJS.onCommand = (user, command, message, flags, extra) => {
    const emoji = document.createElement('div');
    emoji.className = 'start'
    emoji.innerHTML = getCommandResponse({user, command, message, flags, extra})
    document.body.appendChild(emoji)
    // setTimeout(() => {
      // emoji.className = 'move'
    // }, 1000);
  };
  ComfyJS.Init("nickytonline");
}