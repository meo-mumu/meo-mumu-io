// Component pour la désobfuscation des emails
export function initEmailObfuscation() {
  const emailElements = document.querySelectorAll('.email');
  emailElements.forEach(email => {
    const txt = email.textContent
      .replace('at', '@')
      .replace('dot', '.')
      .replace(/\s+/g, '');
    email.textContent = txt;
    email.href = `mailto:${txt}`;
  });
}