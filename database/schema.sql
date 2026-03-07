-- Schema VISATech - Roteiro de Inspeção Completo

-- 1. Usuários (fiscais)
CREATE TABLE users (
  id            SERIAL PRIMARY KEY,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  nome          VARCHAR(255),
  role          VARCHAR(20)  NOT NULL DEFAULT 'fiscal',
  criado_em     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Estabelecimentos
CREATE TABLE estabelecimentos (
  id            SERIAL PRIMARY KEY,
  razao_social  VARCHAR(255) NOT NULL,
  nome_fantasia VARCHAR(255),
  cnpj          VARCHAR(18)  NOT NULL UNIQUE,
  endereco      TEXT,
  telefone      VARCHAR(20),
  email         VARCHAR(255),
  ativo         BOOLEAN      NOT NULL DEFAULT true,
  criado_em     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. Inspeções
CREATE TABLE inspecoes (
  id                 SERIAL PRIMARY KEY,
  estabelecimento_id INTEGER      REFERENCES estabelecimentos(id),
  fiscal_id          INTEGER      REFERENCES users(id),
  status             VARCHAR(30)  NOT NULL DEFAULT 'EM_ANDAMENTO',
  -- Valores possíveis: EM_ANDAMENTO | BLOQUEADA_B | FINALIZADA | CANCELADA
  secao_atual        CHAR(1)      NOT NULL DEFAULT 'A',
  secao_b_aprovada   BOOLEAN      NOT NULL DEFAULT false,
  criado_em          TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  finalizado_em      TIMESTAMP
);

-- 4. Respostas (uma linha por campo por seção por inspeção)
CREATE TABLE respostas (
  id          SERIAL PRIMARY KEY,
  inspecao_id INTEGER      NOT NULL REFERENCES inspecoes(id) ON DELETE CASCADE,
  secao       CHAR(1)      NOT NULL,       -- 'A', 'B', 'C' ... 'H'
  campo       VARCHAR(100) NOT NULL,       -- chave do campo, ex: 'farmaceutico_presente'
  valor       TEXT,                        -- tudo salvo como texto
  criado_em   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (inspecao_id, secao, campo)
);

-- 5. Inventário de medicamentos (Seção H)
CREATE TABLE inventario_itens (
  id             SERIAL PRIMARY KEY,
  inspecao_id    INTEGER      NOT NULL REFERENCES inspecoes(id) ON DELETE CASCADE,
  medicamento    VARCHAR(255),
  estoque_fisico INTEGER,
  estoque_escrit INTEGER,
  ordem          INTEGER      NOT NULL DEFAULT 0
);

-- ── Índices ──
CREATE INDEX idx_estabelecimentos_cnpj    ON estabelecimentos(cnpj);
CREATE INDEX idx_inspecoes_estabelecimento ON inspecoes(estabelecimento_id);
CREATE INDEX idx_inspecoes_fiscal          ON inspecoes(fiscal_id);
CREATE INDEX idx_inspecoes_status          ON inspecoes(status);
CREATE INDEX idx_respostas_inspecao        ON respostas(inspecao_id);
CREATE INDEX idx_respostas_secao           ON respostas(inspecao_id, secao);
CREATE INDEX idx_inventario_inspecao       ON inventario_itens(inspecao_id);
