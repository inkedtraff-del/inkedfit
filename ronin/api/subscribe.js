// Vercel serverless function: email signups -> Kit (kit.com, free up to 10,000 subscribers).
// Env vars (Vercel > Project > Settings > Environment Variables):
//   KIT_API_KEY         Kit > Settings > Developer > API key (v4)
//   KIT_FORM_GUIDE      id of the form for free-guide signups
//   KIT_FORM_WAITLIST   id of the form for drop-list signups

const KIT = 'https://api.kit.com/v4';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false });

  const { email, list, company } = req.body || {};
  if (company) return res.status(200).json({ ok: true }); // honeypot

  if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ ok: false, error: 'invalid_email' });
  }

  const address = email.trim().toLowerCase();
  const formId = list === 'waitlist' ? process.env.KIT_FORM_WAITLIST : process.env.KIT_FORM_GUIDE;
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'X-Kit-Api-Key': process.env.KIT_API_KEY,
  };

  try {
    // 1. create the subscriber (or return the existing one)
    const r1 = await fetch(`${KIT}/subscribers`, {
      method: 'POST', headers, body: JSON.stringify({ email_address: address }),
    });
    if (!r1.ok) throw new Error(`create ${r1.status}: ${await r1.text()}`);

    // 2. add them to the right form, so you can see where they came from
    if (formId) {
      const r2 = await fetch(`${KIT}/forms/${formId}/subscribers`, {
        method: 'POST', headers, body: JSON.stringify({ email_address: address }),
      });
      if (!r2.ok) throw new Error(`form ${r2.status}: ${await r2.text()}`);
    }
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('kit_error', err);
    return res.status(502).json({ ok: false });
  }
}
