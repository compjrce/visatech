const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const dns = require('dns');
require('dotenv').config();

// Forçar IPv4 — resolve ENETUNREACH com Supabase no Render
dns.setDefaultResultOrder('ipv4first');

const app = express();
const PORT = process.env.PORT || 3000;

console.log('=================================');
console.log('VISATech Backend v2');
console.log('PORT:', process.env.PORT);
console.log('DATABASE_URL existe?', !!process.env.DATABASE_URL);
console.log('JWT_SECRET existe?', !!process.env.JWT_SECRET);
console.log('=================================');

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    const allowed = ['https://visatech-admin.vercel.app', 'http://localhost:5173'];
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) return callback(null, true);
    if (allowed.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

if (!process.env.DATABASE_URL) {
  console.error('ERRO: DATABASE_URL não definida!');
  process.exit(1);
}

const isLocal = process.env.DATABASE_URL.includes('localhost');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isLocal ? false : { rejectUnauthorized: false },
  connectionTimeoutMillis: 10000,
  ...(isLocal ? {} : { keepAlive: true, keepAliveInitialDelayMillis: 0 }),
});

// ── Middleware de autenticação ──
const auth = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token não fornecido' });
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token inválido' });
    req.user = user;
    next();
  });
};

// ============================================================
// AUTENTICAÇÃO
// ============================================================

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) return res.status(401).json({ error: 'Credenciais inválidas' });
    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Credenciais inválidas' });
    const token = jwt.sign(
      { id: user.id, email: user.email, nome: user.nome, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({ token, user: { id: user.id, email: user.email, nome: user.nome, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, nome, role } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email e senha obrigatórios' });
    const exists = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (exists.rows.length > 0) return res.status(400).json({ error: 'Email já cadastrado' });
    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (email, password_hash, nome, role) VALUES ($1, $2, $3, $4) RETURNING id, email, nome, role',
      [email, hash, nome, role || 'fiscal']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

// ============================================================
// ESTABELECIMENTOS
// ============================================================

// Lista todos
app.get('/api/estabelecimentos', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM estabelecimentos ORDER BY razao_social'
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

// Busca por CNPJ — usado no fluxo de nova inspeção
app.get('/api/estabelecimentos/cnpj/:cnpj', auth, async (req, res) => {
  try {
    // Remove máscara para comparar
    const cnpj = req.params.cnpj.replace(/\D/g, '');
    const result = await pool.query(
      "SELECT * FROM estabelecimentos WHERE replace(replace(replace(cnpj, '.', ''), '/', ''), '-', '') = $1",
      [cnpj]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Não encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

// Cria
app.post('/api/estabelecimentos', auth, async (req, res) => {
  try {
    const { razao_social, nome_fantasia, cnpj, endereco, telefone, email } = req.body;
    if (!razao_social || !cnpj) return res.status(400).json({ error: 'Razão social e CNPJ são obrigatórios' });
    const result = await pool.query(
      `INSERT INTO estabelecimentos (razao_social, nome_fantasia, cnpj, endereco, telefone, email)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [razao_social, nome_fantasia, cnpj, endereco, telefone, email]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'CNPJ já cadastrado' });
    console.error(err);
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

// Atualiza
app.put('/api/estabelecimentos/:id', auth, async (req, res) => {
  try {
    const { razao_social, nome_fantasia, cnpj, endereco, telefone, email, ativo } = req.body;
    const result = await pool.query(
      `UPDATE estabelecimentos SET razao_social=$1, nome_fantasia=$2, cnpj=$3,
       endereco=$4, telefone=$5, email=$6, ativo=$7 WHERE id=$8 RETURNING *`,
      [razao_social, nome_fantasia, cnpj, endereco, telefone, email, ativo ?? true, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Não encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'CNPJ já cadastrado' });
    console.error(err);
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

// Desativa
app.delete('/api/estabelecimentos/:id', auth, async (req, res) => {
  try {
    await pool.query('UPDATE estabelecimentos SET ativo=false WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

// ============================================================
// INSPEÇÕES
// ============================================================

// Lista (com dados do estabelecimento)
app.get('/api/inspecoes', auth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        i.*,
        e.razao_social, e.nome_fantasia, e.cnpj,
        u.nome as fiscal_nome
      FROM inspecoes i
      LEFT JOIN estabelecimentos e ON i.estabelecimento_id = e.id
      LEFT JOIN users u ON i.fiscal_id = u.id
      ORDER BY i.criado_em DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

// Detalhe + todas as respostas
app.get('/api/inspecoes/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const insp = await pool.query(`
      SELECT i.*, e.razao_social, e.nome_fantasia, e.cnpj,
        e.endereco, e.telefone, e.email as estab_email,
        u.nome as fiscal_nome
      FROM inspecoes i
      LEFT JOIN estabelecimentos e ON i.estabelecimento_id = e.id
      LEFT JOIN users u ON i.fiscal_id = u.id
      WHERE i.id = $1
    `, [id]);

    if (insp.rows.length === 0) return res.status(404).json({ error: 'Não encontrada' });

    const respostas = await pool.query(
      'SELECT secao, campo, valor FROM respostas WHERE inspecao_id = $1 ORDER BY secao, id',
      [id]
    );

    const inventario = await pool.query(
      'SELECT * FROM inventario_itens WHERE inspecao_id = $1 ORDER BY ordem',
      [id]
    );

    // Organiza respostas por seção
    const respostasPorSecao = {};
    for (const r of respostas.rows) {
      if (!respostasPorSecao[r.secao]) respostasPorSecao[r.secao] = {};
      respostasPorSecao[r.secao][r.campo] = r.valor;
    }

    res.json({
      ...insp.rows[0],
      respostas: respostasPorSecao,
      inventario: inventario.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

// Cria inspeção
// Body: { estabelecimento_id?, razao_social, nome_fantasia, cnpj, endereco?, telefone?, email? }
// Se não tiver estabelecimento_id mas tiver CNPJ, busca ou cria o estabelecimento
app.post('/api/inspecoes', auth, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    let { estabelecimento_id, razao_social, nome_fantasia, cnpj, endereco, telefone, email } = req.body;

    // Resolve estabelecimento
    if (!estabelecimento_id) {
      if (!cnpj) return res.status(400).json({ error: 'CNPJ ou estabelecimento_id é obrigatório' });

      const cnpjLimpo = cnpj.replace(/\D/g, '');
      const existe = await client.query(
        "SELECT id FROM estabelecimentos WHERE replace(replace(replace(cnpj,'.',''),'/',''),'-','') = $1",
        [cnpjLimpo]
      );

      if (existe.rows.length > 0) {
        estabelecimento_id = existe.rows[0].id;
        // Atualiza dados se vieram no payload
        if (razao_social) {
          await client.query(
            `UPDATE estabelecimentos SET razao_social=$1, nome_fantasia=$2,
             endereco=$3, telefone=$4, email=$5 WHERE id=$6`,
            [razao_social, nome_fantasia, endereco, telefone, email, estabelecimento_id]
          );
        }
      } else {
        if (!razao_social) return res.status(400).json({ error: 'Razão social obrigatória para novo estabelecimento' });
        const novo = await client.query(
          `INSERT INTO estabelecimentos (razao_social, nome_fantasia, cnpj, endereco, telefone, email)
           VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
          [razao_social, nome_fantasia, cnpj, endereco, telefone, email]
        );
        estabelecimento_id = novo.rows[0].id;
      }
    }

    const result = await client.query(
      `INSERT INTO inspecoes (estabelecimento_id, fiscal_id, status, secao_atual)
       VALUES ($1, $2, 'EM_ANDAMENTO', 'A') RETURNING *`,
      [estabelecimento_id, req.user.id]
    );

    await client.query('COMMIT');
    res.status(201).json(result.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Erro no servidor' });
  } finally {
    client.release();
  }
});

// Salva respostas de uma seção (upsert)
// Body: { secao: 'B', respostas: { campo: valor, ... } }
app.post('/api/inspecoes/:id/respostas', auth, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { id } = req.params;
    const { secao, respostas } = req.body;

    if (!secao || !respostas) return res.status(400).json({ error: 'secao e respostas são obrigatórios' });

    // Verifica se inspeção existe e não está finalizada
    const insp = await client.query('SELECT * FROM inspecoes WHERE id = $1', [id]);
    if (insp.rows.length === 0) return res.status(404).json({ error: 'Inspeção não encontrada' });
    if (['FINALIZADA', 'CANCELADA'].includes(insp.rows[0].status)) {
      return res.status(400).json({ error: 'Inspeção já encerrada' });
    }

    // Upsert de cada campo
    for (const [campo, valor] of Object.entries(respostas)) {
      await client.query(
        `INSERT INTO respostas (inspecao_id, secao, campo, valor)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (inspecao_id, secao, campo)
         DO UPDATE SET valor = EXCLUDED.valor`,
        [id, secao, campo, valor !== null && valor !== undefined ? String(valor) : null]
      );
    }

    // Lógica de bloqueio seção B
    let novoStatus = insp.rows[0].status;
    let secaoB_aprovada = insp.rows[0].secao_b_aprovada;

    if (secao === 'B') {
      const vals = Object.values(respostas);
      const bloqueado = vals.some(v => v === 'NAO' || v === 'nao');
      novoStatus = bloqueado ? 'BLOQUEADA_B' : 'EM_ANDAMENTO';
      secaoB_aprovada = !bloqueado;
      await client.query(
        'UPDATE inspecoes SET status=$1, secao_b_aprovada=$2, secao_atual=$3 WHERE id=$4',
        [novoStatus, secaoB_aprovada, bloqueado ? 'B' : 'C', id]
      );
    } else {
      // Avança seção atual para a próxima
      const ordem = ['A','B','C','D','E','F','G','H'];
      const idx = ordem.indexOf(secao);
      const proxima = idx >= 0 && idx < ordem.length - 1 ? ordem[idx + 1] : secao;
      await client.query(
        'UPDATE inspecoes SET secao_atual=$1 WHERE id=$2 AND secao_atual=$3',
        [proxima, id, secao]
      );
    }

    await client.query('COMMIT');
    res.json({ success: true, status: novoStatus, secao_b_aprovada });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Erro no servidor' });
  } finally {
    client.release();
  }
});

// Finaliza inspeção
app.put('/api/inspecoes/:id/finalizar', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE inspecoes SET status='FINALIZADA', finalizado_em=NOW(), secao_atual='H'
       WHERE id=$1 AND status='EM_ANDAMENTO' RETURNING *`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(400).json({ error: 'Inspeção não encontrada ou não pode ser finalizada' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

// Cancela inspeção
app.put('/api/inspecoes/:id/cancelar', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE inspecoes SET status='CANCELADA', finalizado_em=NOW()
       WHERE id=$1 AND status NOT IN ('FINALIZADA','CANCELADA') RETURNING *`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(400).json({ error: 'Inspeção não encontrada ou já encerrada' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

// ============================================================
// INVENTÁRIO (Seção H)
// ============================================================

// Salva itens do inventário (substitui todos)
app.post('/api/inspecoes/:id/inventario', auth, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { id } = req.params;
    const { itens } = req.body; // [{ medicamento, estoque_fisico, estoque_escrit }]

    await client.query('DELETE FROM inventario_itens WHERE inspecao_id = $1', [id]);

    for (let i = 0; i < (itens || []).length; i++) {
      const it = itens[i];
      await client.query(
        `INSERT INTO inventario_itens (inspecao_id, medicamento, estoque_fisico, estoque_escrit, ordem)
         VALUES ($1, $2, $3, $4, $5)`,
        [id, it.medicamento, it.estoque_fisico ?? null, it.estoque_escrit ?? null, i + 1]
      );
    }

    await client.query('COMMIT');
    res.json({ success: true });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Erro no servidor' });
  } finally {
    client.release();
  }
});

// Lista inventário
app.get('/api/inspecoes/:id/inventario', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM inventario_itens WHERE inspecao_id=$1 ORDER BY ordem',
      [req.params.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

// ============================================================
// HEALTH CHECK
// ============================================================

app.get('/health', (req, res) => res.json({ status: 'ok', version: '2.0' }));

app.listen(PORT, () => {
  console.log(`VISATech API v2 rodando na porta ${PORT}`);
});