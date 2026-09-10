export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, phone, project, message } = req.body || {};

  if (!name || !phone || !project) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const lead = {
    name,
    phone,
    project,
    message: message || '',
    receivedAt: new Date().toISOString(),
  };

  console.log('New quote request:', JSON.stringify(lead));

  const webhookUrl = process.env.QUOTE_WEBHOOK_URL;
  if (webhookUrl) {
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lead),
      });
    } catch (err) {
      console.error('Failed to forward lead to webhook:', err);
    }
  }

  return res.status(200).json({ ok: true });
}
