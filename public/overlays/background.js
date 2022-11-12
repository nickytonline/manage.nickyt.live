if (document.location.search) {
  document.forms['guestForm'].style.display = 'none';

  const { searchParams } = new URL(document.location.href);
  document.getElementById('title').innerText = searchParams.get('title');
  document.getElementById('guest').innerText = searchParams.get('guest');
}
