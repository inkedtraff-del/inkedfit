// Vercel serverless function: coaching applications -> your Telegram.
// Env vars (Vercel > Project > Settings > Environment Variables):
//   TELEGRAM_BOT_TOKEN  token from @BotFather
//   TELEGRAM_CHAT_ID    your chat id (see README)

const esc = (s = '') =>
  String(s).slice(0, 800).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false });

  const { name, email, instagram, goal, experience, note, waitlist, company } = req.body || {};
  if (company) return res.status(200).json({ ok: true }); // honeypot

  const emailOk = typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!name || !emailOk || !instagram || !goal || !experience) {
    return res.status(400).json({ ok: false, error: 'missing_fields' });
  }

  const handle = String(instagram).trim().replace(/^@/, '').replace(/[^\w.]/g, '');
  const text = [
    waitlist === 'yes' ? '<b>Coaching waitlist</b>' : '<b>New coaching application</b>',
    '',
    `<b>Name:</b> ${esc(name)}`,
    `<b>Email:</b> ${esc(email)}`,
    `<b>Instagram:</b> <a href="https://instagram.com/${esc(handle)}">@${esc(handle)}</a>`,
    `<b>Goal:</b> ${esc(goal)}`,
    `<b>Training:</b> ${esc(experience)}`,
    note ? `\n<b>Holding them back:</b>\n${esc(note)}` : '',
  ].join('\n');

  try {
    const r = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: process.env.TELEGRAM_CHAT_ID,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    });
    if (!r.ok) throw new Error(await r.text());
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('telegram_error', err);
    return res.status(502).json({ ok: false });
  }
}
