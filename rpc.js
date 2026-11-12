import crypto from 'node:crypto';
import { r, who } from './_r.js';
const OWN = { users: 'id', tracks: 'owner', playlists: 'owner', comments: 'u', votes: 'u' };
const hash = (p, s) => crypto.scryptSync(p, s, 32).toString('hex');
export default async function handler(req, res) {
  try {
    const b = req.body || {};
    if (b.a === 'list') {
      const o = {};
      await Promise.all(Object.keys(OWN).map(async (k) => {
        const m = (await r.hgetall(k)) || {};
        o[k] = Object.entries(m).map(([id, v]) => ({ id, ...v }));
      }));
      return res.json(o);
    }
    if (b.a === 'reg' || b.a === 'login') {
      const id = String(b.n || '').trim().toLowerCase().replace(/[^a-z0-9_.-]/g, '').slice(0, 24);
      const p = String(b.p || '');
      if (id.length < 3 || p.length < 6) return res.status(400).json({ e: 'Usuário com 3+ letras/números e senha com 6+ caracteres.' });
      const cur = await r.hget('auth', id);
      if (b.a === 'reg') {
        if (cur) return res.status(400).json({ e: 'Esse usuário já existe.' });
        const s = crypto.randomBytes(8).toString('hex');
        await r.hset('auth', { [id]: { s, h: hash(p, s) } });
        await r.hset('users', { [id]: { name: String(b.n).trim().slice(0, 40) || id, bio: '', avatar: '', banner: '' } });
      } else if (!cur || hash(p, cur.s) !== cur.h) return res.status(401).json({ e: 'Usuário ou senha incorretos.' });
      const t = crypto.randomBytes(24).toString('hex');
      await r.set('s:' + t, id, { ex: 2592000 });
      return res.json({ t, uid: id });
    }
    const uid = await who(req);
    if (!uid) return res.status(401).json({ e: 'Faça login.' });
    if (b.a === 'me') return res.json({ uid });
    const f = OWN[b.c];
    if (!f || typeof b.id !== 'string' || b.id.length > 80) return res.status(400).json({ e: 'Pedido inválido.' });
    const old = await r.hget(b.c, b.id);
    const ok = b.c === 'users' ? b.id === uid : b.c === 'votes' ? b.id.endsWith('_' + uid) : !old || old[f] === uid;
    if (!ok) return res.status(403).json({ e: 'Sem permissão.' });
    if (b.a === 'del') { await r.hdel(b.c, b.id); return res.json({ ok: 1 }); }
    if (b.a !== 'set' && b.a !== 'upd') return res.status(400).json({ e: 'Ação inválida.' });
    const d = { ...(b.a === 'upd' ? old || {} : {}), ...(b.d || {}) };
    delete d.id;
    if (b.c !== 'users') d[f] = uid;
    if (b.c === 'votes' && d.v !== 1 && d.v !== -1) return res.status(400).json({ e: 'Voto inválido.' });
    if (JSON.stringify(d).length > 20000) return res.status(400).json({ e: 'Dados grandes demais.' });
    await r.hset(b.c, { [b.id]: d });
    res.json({ ok: 1 });
  } catch (e) { res.status(500).json({ e: 'Erro no servidor: ' + e.message }); }
}
