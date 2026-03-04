-- Schema VISATech - Roteiro de Inspeção Completo

-- Tabela de estabelecimentos (com dados para Seção A)
CREATE TABLE estabelecimentos (
    id SERIAL PRIMARY KEY,
    razao_social VARCHAR(255) NOT NULL,
    nome_fantasia VARCHAR(255),
    cnpj VARCHAR(18) NOT NULL,
    endereco TEXT,
    telefone VARCHAR(20),
    email VARCHAR(255),
    ativo BOOLEAN DEFAULT true,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de usuários
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nome VARCHAR(255),
    role VARCHAR(50) DEFAULT 'auditor' CHECK (role IN ('admin', 'auditor', 'fiscal')),
    estabelecimento_id INTEGER REFERENCES estabelecimentos(id),
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de questionários (Roteiros)
CREATE TABLE questionarios (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    tipo VARCHAR(50) DEFAULT 'INSPECAO_FARMACIA', -- tipo de roteiro
    versao VARCHAR(10) DEFAULT '05', -- versão do roteiro
    ativo BOOLEAN DEFAULT true,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de seções (A, B, C, D, E, F, G, H)
CREATE TABLE secoes (
    id SERIAL PRIMARY KEY,
    questionario_id INTEGER REFERENCES questionarios(id) ON DELETE CASCADE,
    codigo VARCHAR(1) NOT NULL, -- 'A', 'B', 'C'...
    titulo VARCHAR(255) NOT NULL, -- 'IDENTIFICAÇÃO DA EMPRESA'
    descricao TEXT,
    ordem INTEGER NOT NULL,
    tipo_secao VARCHAR(50) NOT NULL, -- 'IDENTIFICACAO', 'VALIDACAO', 'DOCUMENTAL', 'OBJETIVA', 'MISTA'
    bloqueante BOOLEAN DEFAULT false, -- true para Seção B
    exige_farmaceutico BOOLEAN DEFAULT false, -- true para Seção B
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(questionario_id, codigo)
);

-- Tabela de perguntas
CREATE TABLE perguntas (
    id SERIAL PRIMARY KEY,
    secao_id INTEGER REFERENCES secoes(id) ON DELETE CASCADE,
    texto TEXT NOT NULL,
    ordem INTEGER NOT NULL,
    obrigatoria BOOLEAN DEFAULT false,
    tipo_resposta VARCHAR(50) NOT NULL, -- 'SIM_NAO', 'TEXTO', 'DATA', 'SIM_NAO_NA_NO', 'NUMERO'
    referencia_legal TEXT, -- Ex: "Art.15 da lei Federal 5991/73"
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de inspeções (auditorias)
CREATE TABLE inspecoes (
    id SERIAL PRIMARY KEY,
    questionario_id INTEGER REFERENCES questionarios(id),
    estabelecimento_id INTEGER REFERENCES estabelecimentos(id),
    fiscal_responsavel_id INTEGER REFERENCES users(id),
    tipo_inspecao VARCHAR(100), -- 'Solicitação de licença', 'Renovação', etc
    data_inicio TIMESTAMP NOT NULL,
    data_fim TIMESTAMP,
    status VARCHAR(50) DEFAULT 'EM_ANDAMENTO', -- 'EM_ANDAMENTO', 'BLOQUEADA_B', 'FINALIZADA', 'CANCELADA'
    secao_b_aprovada BOOLEAN DEFAULT false,
    observacoes_gerais TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de respostas
CREATE TABLE respostas (
    id SERIAL PRIMARY KEY,
    inspecao_id INTEGER REFERENCES inspecoes(id) ON DELETE CASCADE,
    pergunta_id INTEGER REFERENCES perguntas(id),
    user_id INTEGER REFERENCES users(id), -- quem respondeu
    resposta_texto TEXT, -- para respostas abertas
    resposta_opcao VARCHAR(20), -- 'SIM', 'NAO', 'NA', 'NO'
    observacao TEXT,
    respondido_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela específica para inventário (Seção H)
CREATE TABLE inventario_medicamentos (
    id SERIAL PRIMARY KEY,
    inspecao_id INTEGER REFERENCES inspecoes(id) ON DELETE CASCADE,
    medicamento VARCHAR(255) NOT NULL,
    estoque_fisico INTEGER,
    estoque_escriturado INTEGER,
    observacao TEXT,
    ordem INTEGER,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de dados da Seção A (preenchidos automaticamente)
CREATE TABLE secao_a_dados (
    id SERIAL PRIMARY KEY,
    inspecao_id INTEGER REFERENCES inspecoes(id) ON DELETE CASCADE,
    acompanhante_vistoria VARCHAR(255),
    objetivo_inspecao VARCHAR(100),
    horario_funcionamento VARCHAR(100),
    numero_funcionarios INTEGER,
    areas_fisicas JSONB, -- {vendas: true, estoque: true, ...}
    documentos JSONB, -- {afe_numero: '...', avcb_validade: '...', ...}
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para melhorar performance
CREATE INDEX idx_secoes_questionario ON secoes(questionario_id);
CREATE INDEX idx_perguntas_secao ON perguntas(secao_id);
CREATE INDEX idx_inspecoes_estabelecimento ON inspecoes(estabelecimento_id);
CREATE INDEX idx_inspecoes_status ON inspecoes(status);
CREATE INDEX idx_respostas_inspecao ON respostas(inspecao_id);
CREATE INDEX idx_respostas_pergunta ON respostas(pergunta_id);

-- Grants
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres;