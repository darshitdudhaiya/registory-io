const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

function generateRandomText(length = 4) {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
  let text = '';
  for (let i = 0; i < length; i++) {
    text += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return text;
}

function generateSvgCaptcha(text) {
  const width = 120;
  const height = 48;
  let noiseLines = '';
  for (let i = 0; i < 5; i++) {
    const x1 = Math.random() * width;
    const y1 = Math.random() * height;
    const x2 = Math.random() * width;
    const y2 = Math.random() * height;
    const strokeColor = `rgba(${Math.floor(Math.random() * 150) + 100}, ${Math.floor(Math.random() * 150) + 100}, 255, 0.4)`;
    noiseLines += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${strokeColor}" stroke-width="${Math.random() * 1.5 + 1}" />`;
  }
  let textElements = '';
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const fontSize = Math.floor(Math.random() * 8) + 28;
    const x = 12 + i * 26 + Math.random() * 4;
    const y = 32 + (Math.random() * 10 - 5);
    const rotationAngle = Math.random() * 40 - 20;
    const charColor = `hsl(${Math.random() * 360}, 80%, 75%)`;
    textElements += `
      <text 
        x="${x}" 
        y="${y}" 
        font-family="'Courier New', Courier, monospace" 
        font-size="${fontSize}" 
        font-weight="bold" 
        fill="${charColor}" 
        transform="rotate(${rotationAngle} ${x} ${y})"
      >
        ${char}
      </text>`;
  }
  return `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#1a1b26" rx="8" />
      ${noiseLines}
      ${textElements}
    </svg>
  `.trim();
}

const getCaptcha = (req, res) => {
  try {
    if (!JWT_SECRET) {
      return res.status(500).json({ error: 'JWT_SECRET is not configured' });
    }
    const text = generateRandomText(4);
    const svg = generateSvgCaptcha(text);
    const token = jwt.sign({ text: text.toLowerCase() }, JWT_SECRET, { expiresIn: '5m' });
    res.cookie('captcha_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 300 * 1000
    });
    return res.json({ svg });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to generate CAPTCHA' });
  }
};

module.exports = { getCaptcha };
