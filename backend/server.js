const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const dns = require('dns');
require('dotenv').config();

// ✅ CORREÇÃO: Forçar IPv4 — resolve ENETUNREACH com Supabase no Render
dns.setDefaultResultOrder('ipv4first');

const app = express();
const PORT = process.env.PORT || 3000;

console.log('=================================');
console.log('🔍 Verificando Environment Variables:');
console.log('PORT:', process.env.PORT);
console.log('DATABASE_URL existe?', !!process.env.DATABASE_URL);
console.log('JWT_SECRET existe?', !!process.env.JWT_SECRET);
console.log('=================================');

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    const allowedOrigins = [
      'https://visatech-admin.vercel.app',
      'http://localhost:5173',
    ];
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

if (!process.env.DATABASE_URL) {
  console.error('❌ ERRO: DATABASE_URL não está definida!');
  process.exit(1);
}

const isLocal = process.env.DATABASE_URL.includes('localhost');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isLocal ? false : { rejectUnauthorized: false },
  connectionTimeoutMillis: 10000,
  ...(isLocal ? {} : {
    keepAlive: true,
    keepAliveInitialDelayMillis: 0,
  })
});

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token não fornecido' });
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token inválido' });
    req.user = user;
    next();
  });
};

// ==================== AUTENTICAÇÃO ====================

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) return res.status(401).json({ error: 'Credenciais inválidas' });
    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) return res.status(401).json({ error: 'Credenciais inválidas' });
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    res.json({ token, user: { id: user.id, email: user.email, nome: user.nome, role: user.role, estabelecimento_id: user.estabelecimento_id } });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

// ==================== ESTABELECIMENTOS ====================

app.get('/api/estabelecimentos', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM estabelecimentos WHERE ativo = true ORDER BY razao_social');
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar estabelecimentos:', error);
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

app.get('/api/estabelecimentos/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM estabelecimentos WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Estabelecimento não encontrado' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar estabelecimento:', error);
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

app.post('/api/estabelecimentos', authenticateToken, async (req, res) => {
  try {
    const { razao_social, nome_fantasia, cnpj, endereco, telefone, email, ativo } = req.body;
    if (!razao_social || !cnpj) return res.status(400).json({ error: 'Razão social e CNPJ são obrigatórios' });
    const result = await pool.query(
      `INSERT INTO estabelecimentos (razao_social, nome_fantasia, cnpj, endereco, telefone, email, ativo)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [razao_social, nome_fantasia, cnpj, endereco, telefone, email, ativo ?? true]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar estabelecimento:', error);
    if (error.code === '23505') return res.status(400).json({ error: 'CNPJ já cadastrado' });
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

app.put('/api/estabelecimentos/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { razao_social, nome_fantasia, cnpj, endereco, telefone, email, ativo } = req.body;
    if (!razao_social || !cnpj) return res.status(400).json({ error: 'Razão social e CNPJ são obrigatórios' });
    const result = await pool.query(
      `UPDATE estabelecimentos SET razao_social=$1, nome_fantasia=$2, cnpj=$3, endereco=$4, telefone=$5, email=$6, ativo=$7
       WHERE id=$8 RETURNING *`,
      [razao_social, nome_fantasia, cnpj, endereco, telefone, email, ativo, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Estabelecimento não encontrado' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar estabelecimento:', error);
    if (error.code === '23505') return res.status(400).json({ error: 'CNPJ já cadastrado' });
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

app.delete('/api/estabelecimentos/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM estabelecimentos WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Estabelecimento não encontrado' });
    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao excluir estabelecimento:', error);
    if (error.code === '23503') return res.status(400).json({ error: 'Não é possível excluir: estabelecimento possui inspeções vinculadas' });
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

// ==================== QUESTIONÁRIOS ====================

app.get('/api/questionarios', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT q.*,
        (SELECT COUNT(*) FROM secoes WHERE questionario_id = q.id) as total_secoes,
        e.razao_social as estabelecimento_nome,
        e.nome_fantasia as estabelecimento_fantasia,
        e.cnpj as estabelecimento_cnpj
      FROM questionarios q
      LEFT JOIN estabelecimentos e ON q.estabelecimento_id = e.id
      WHERE q.ativo = true ORDER BY q.criado_em DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar questionários:', error);
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

app.post('/api/questionarios', authenticateToken, async (req, res) => {
  try {
    const { titulo, descricao, tipo, versao, estabelecimento_id } = req.body;
    if (!titulo) return res.status(400).json({ error: 'Título é obrigatório' });
    const result = await pool.query(
      `INSERT INTO questionarios (titulo, descricao, tipo, versao, estabelecimento_id, ativo)
       VALUES ($1, $2, $3, $4, $5, true) RETURNING *`,
      [titulo, descricao, tipo || 'INSPECAO_FARMACIA', versao || '05', estabelecimento_id || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar questionário:', error);
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

app.put('/api/questionarios/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descricao, tipo, versao, estabelecimento_id, ativo } = req.body;
    const result = await pool.query(
      `UPDATE questionarios SET titulo=$1, descricao=$2, tipo=$3, versao=$4, estabelecimento_id=$5, ativo=$6
       WHERE id=$7 RETURNING *`,
      [titulo, descricao, tipo, versao, estabelecimento_id || null, ativo ?? true, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Questionário não encontrado' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar questionário:', error);
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

app.delete('/api/questionarios/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE questionarios SET ativo=false WHERE id=$1', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao excluir questionário:', error);
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

app.get('/api/questionarios/:id/completo', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const questionario = await pool.query(`
      SELECT q.*, e.razao_social, e.nome_fantasia, e.cnpj, e.endereco, e.telefone, e.email
      FROM questionarios q
      LEFT JOIN estabelecimentos e ON q.estabelecimento_id = e.id
      WHERE q.id = $1
    `, [id]);
    if (questionario.rows.length === 0) return res.status(404).json({ error: 'Questionário não encontrado' });
    const secoes = await pool.query('SELECT * FROM secoes WHERE questionario_id = $1 ORDER BY ordem', [id]);
    const secoesCompletas = await Promise.all(
      secoes.rows.map(async (secao) => {
        const perguntas = await pool.query('SELECT * FROM perguntas WHERE secao_id = $1 ORDER BY ordem', [secao.id]);
        return { ...secao, perguntas: perguntas.rows };
      })
    );
    res.json({ ...questionario.rows[0], secoes: secoesCompletas });
  } catch (error) {
    console.error('Erro ao buscar questionário:', error);
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

// ==================== INSPEÇÕES ====================

app.post('/api/inspecoes', authenticateToken, async (req, res) => {
  try {
    const { questionario_id, estabelecimento_id, tipo_inspecao, dados_secao_a } = req.body;
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const inspecaoResult = await client.query(`
        INSERT INTO inspecoes (questionario_id, estabelecimento_id, fiscal_responsavel_id, tipo_inspecao, data_inicio, status)
        VALUES ($1, $2, $3, $4, NOW(), 'EM_ANDAMENTO') RETURNING *
      `, [questionario_id, estabelecimento_id, req.user.id, tipo_inspecao]);
      const inspecaoId = inspecaoResult.rows[0].id;
      if (dados_secao_a) {
        await client.query(`
          INSERT INTO secao_a_dados (inspecao_id, acompanhante_vistoria, objetivo_inspecao, horario_funcionamento, numero_funcionarios, areas_fisicas, documentos)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [inspecaoId, dados_secao_a.acompanhante_vistoria, dados_secao_a.objetivo_inspecao, dados_secao_a.horario_funcionamento, dados_secao_a.numero_funcionarios, JSON.stringify(dados_secao_a.areas_fisicas || {}), JSON.stringify(dados_secao_a.documentos || {})]);
      }
      await client.query('COMMIT');
      res.status(201).json(inspecaoResult.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erro ao criar inspeção:', error);
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

app.post('/api/inspecoes/:id/validar-secao-b', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { respostas } = req.body;
    const todasSim = respostas.every(r => r.resposta_opcao === 'SIM');
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      for (const resposta of respostas) {
        await client.query(`
          INSERT INTO respostas (inspecao_id, pergunta_id, user_id, resposta_opcao, observacao)
          VALUES ($1, $2, $3, $4, $5)
        `, [id, resposta.pergunta_id, req.user.id, resposta.resposta_opcao, resposta.observacao]);
      }
      await client.query(`
        UPDATE inspecoes SET secao_b_aprovada = $1, status = $2 WHERE id = $3
      `, [todasSim, todasSim ? 'EM_ANDAMENTO' : 'BLOQUEADA_B', id]);
      await client.query('COMMIT');
      res.json({ aprovada: todasSim, mensagem: todasSim ? 'Seção B aprovada.' : 'Seção B reprovada. Farmacêutico ausente.' });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erro ao validar Seção B:', error);
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

app.post('/api/inspecoes/:id/secao/:secao_codigo/respostas', authenticateToken, async (req, res) => {
  try {
    const { id, secao_codigo } = req.params;
    const { respostas } = req.body;
    const inspecao = await pool.query('SELECT status FROM inspecoes WHERE id = $1', [id]);
    if (inspecao.rows[0].status === 'BLOQUEADA_B') {
      return res.status(403).json({ error: 'Inspeção bloqueada - Seção B não aprovada' });
    }
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(`
        DELETE FROM respostas WHERE inspecao_id = $1 AND pergunta_id IN (
          SELECT p.id FROM perguntas p JOIN secoes s ON p.secao_id = s.id WHERE s.codigo = $2
        )
      `, [id, secao_codigo]);
      for (const resposta of respostas) {
        await client.query(`
          INSERT INTO respostas (inspecao_id, pergunta_id, user_id, resposta_texto, resposta_opcao, observacao)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [id, resposta.pergunta_id, req.user.id, resposta.resposta_texto, resposta.resposta_opcao, resposta.observacao]);
      }
      await client.query('COMMIT');
      res.json({ success: true });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erro ao salvar respostas:', error);
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

app.post('/api/inspecoes/:id/inventario', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { medicamento, estoque_fisico, estoque_escriturado, observacao } = req.body;
    const result = await pool.query(`
      INSERT INTO inventario_medicamentos (inspecao_id, medicamento, estoque_fisico, estoque_escriturado, observacao, ordem)
      VALUES ($1, $2, $3, $4, $5, (SELECT COALESCE(MAX(ordem), 0) + 1 FROM inventario_medicamentos WHERE inspecao_id = $1))
      RETURNING *
    `, [id, medicamento, estoque_fisico, estoque_escriturado, observacao]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao adicionar inventário:', error);
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

app.get('/api/inspecoes/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const inspecao = await pool.query(`
      SELECT i.*, e.razao_social, e.nome_fantasia, e.cnpj,
        u.nome as fiscal_nome, q.titulo as questionario_titulo
      FROM inspecoes i
      JOIN estabelecimentos e ON i.estabelecimento_id = e.id
      JOIN users u ON i.fiscal_responsavel_id = u.id
      JOIN questionarios q ON i.questionario_id = q.id
      WHERE i.id = $1
    `, [id]);
    if (inspecao.rows.length === 0) return res.status(404).json({ error: 'Inspeção não encontrada' });
    const respostas = await pool.query(`
      SELECT r.*, p.texto as pergunta_texto, s.codigo as secao_codigo
      FROM respostas r JOIN perguntas p ON r.pergunta_id = p.id JOIN secoes s ON p.secao_id = s.id
      WHERE r.inspecao_id = $1 ORDER BY s.ordem, p.ordem
    `, [id]);
    const inventario = await pool.query('SELECT * FROM inventario_medicamentos WHERE inspecao_id = $1 ORDER BY ordem', [id]);
    res.json({ ...inspecao.rows[0], respostas: respostas.rows, inventario: inventario.rows });
  } catch (error) {
    console.error('Erro ao buscar inspeção:', error);
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

app.put('/api/inspecoes/:id/finalizar', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { observacoes_gerais } = req.body;
    const result = await pool.query(`
      UPDATE inspecoes SET status = 'FINALIZADA', data_fim = NOW(), observacoes_gerais = $1
      WHERE id = $2 RETURNING *
    `, [observacoes_gerais, id]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao finalizar inspeção:', error);
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

app.get('/api/inspecoes', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT i.*, e.razao_social, e.nome_fantasia, u.nome as fiscal_nome, q.titulo as questionario_titulo
      FROM inspecoes i
      JOIN estabelecimentos e ON i.estabelecimento_id = e.id
      JOIN users u ON i.fiscal_responsavel_id = u.id
      JOIN questionarios q ON i.questionario_id = q.id
      ORDER BY i.data_inicio DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar inspeções:', error);
    res.status(500).json({ error: 'Erro no servidor' });
  }
});


// ==================== SEÇÕES ====================

app.get('/api/questionarios/:id/secoes', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const secoes = await pool.query('SELECT * FROM secoes WHERE questionario_id = $1 ORDER BY ordem', [id]);
    const secoesCompletas = await Promise.all(
      secoes.rows.map(async (secao) => {
        const perguntas = await pool.query('SELECT * FROM perguntas WHERE secao_id = $1 ORDER BY ordem', [secao.id]);
        return { ...secao, perguntas: perguntas.rows };
      })
    );
    res.json(secoesCompletas);
  } catch (error) {
    console.error('Erro ao listar seções:', error);
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

app.post('/api/questionarios/:id/secoes', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { codigo, titulo, descricao, tipo_secao, bloqueante, exige_farmaceutico } = req.body;
    if (!codigo || !titulo || !tipo_secao) {
      return res.status(400).json({ error: 'Código, título e tipo são obrigatórios' });
    }
    // Calcula próxima ordem
    const ordemResult = await pool.query(
      'SELECT COALESCE(MAX(ordem), 0) + 1 as proxima FROM secoes WHERE questionario_id = $1', [id]
    );
    const ordem = ordemResult.rows[0].proxima;
    const result = await pool.query(
      `INSERT INTO secoes (questionario_id, codigo, titulo, descricao, ordem, tipo_secao, bloqueante, exige_farmaceutico)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [id, codigo.toUpperCase(), titulo, descricao, ordem, tipo_secao, bloqueante || false, exige_farmaceutico || false]
    );
    res.status(201).json({ ...result.rows[0], perguntas: [] });
  } catch (error) {
    console.error('Erro ao criar seção:', error);
    if (error.code === '23505') return res.status(400).json({ error: 'Já existe uma seção com este código neste roteiro' });
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

app.put('/api/secoes/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descricao, tipo_secao, bloqueante, exige_farmaceutico } = req.body;
    const result = await pool.query(
      `UPDATE secoes SET titulo=$1, descricao=$2, tipo_secao=$3, bloqueante=$4, exige_farmaceutico=$5
       WHERE id=$6 RETURNING *`,
      [titulo, descricao, tipo_secao, bloqueante, exige_farmaceutico, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Seção não encontrada' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar seção:', error);
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

app.delete('/api/secoes/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM secoes WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao excluir seção:', error);
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

// ==================== PERGUNTAS ====================

app.post('/api/secoes/:id/perguntas', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { texto, tipo_resposta, obrigatoria, referencia_legal } = req.body;
    if (!texto || !tipo_resposta) {
      return res.status(400).json({ error: 'Texto e tipo de resposta são obrigatórios' });
    }
    const ordemResult = await pool.query(
      'SELECT COALESCE(MAX(ordem), 0) + 1 as proxima FROM perguntas WHERE secao_id = $1', [id]
    );
    const ordem = ordemResult.rows[0].proxima;
    const result = await pool.query(
      `INSERT INTO perguntas (secao_id, texto, ordem, obrigatoria, tipo_resposta, referencia_legal)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [id, texto, ordem, obrigatoria || false, tipo_resposta, referencia_legal]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar pergunta:', error);
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

app.put('/api/perguntas/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { texto, tipo_resposta, obrigatoria, referencia_legal, ordem } = req.body;
    const result = await pool.query(
      `UPDATE perguntas SET texto=$1, tipo_resposta=$2, obrigatoria=$3, referencia_legal=$4, ordem=$5
       WHERE id=$6 RETURNING *`,
      [texto, tipo_resposta, obrigatoria, referencia_legal, ordem, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Pergunta não encontrada' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar pergunta:', error);
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

app.delete('/api/perguntas/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM perguntas WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao excluir pergunta:', error);
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

// ==================== HEALTH CHECK ====================
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date(), version: 'v1' });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});