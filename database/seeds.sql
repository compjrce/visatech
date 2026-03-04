-- ============================================
-- SEED INICIAL - Roteiro de Inspeção Farmácia
-- ============================================

-- Criar questionário principal
INSERT INTO questionarios (titulo, descricao, tipo, versao) 
VALUES (
    'Roteiro de Inspeção em Estabelecimentos Farmacêuticos',
    'Drogarias - baseado na RDC 44/2009',
    'INSPECAO_FARMACIA',
    '05'
);

-- Criar Seção A - IDENTIFICAÇÃO
INSERT INTO secoes (questionario_id, codigo, titulo, descricao, ordem, tipo_secao, bloqueante) 
VALUES (
    1, 
    'A', 
    'IDENTIFICAÇÃO DA EMPRESA / ESTABELECIMENTO',
    'Dados do estabelecimento e objetivo da inspeção',
    1,
    'IDENTIFICACAO',
    false
);

-- Criar Seção B - RESPONSABILIDADE TÉCNICA (BLOQUEANTE)
INSERT INTO secoes (questionario_id, codigo, titulo, descricao, ordem, tipo_secao, bloqueante, exige_farmaceutico) 
VALUES (
    1,
    'B',
    'RESPONSABILIDADE TÉCNICA',
    'Validação da presença do farmacêutico - BLOQUEANTE',
    2,
    'VALIDACAO',
    true,
    true
);

-- Perguntas da Seção B
INSERT INTO perguntas (secao_id, texto, ordem, obrigatoria, tipo_resposta, referencia_legal) VALUES
(2, 'Existe responsável técnico no estabelecimento inscrito no CRF?', 1, true, 'SIM_NAO', 'Art.15 da lei Federal 5991/73 c/c Art.3º da Resolução RDC 44/2009'),
(2, 'Farmacêutico presente desde o início da inspeção?', 2, true, 'SIM_NAO', 'Art.15 § 1º e 2º da Lei Federal 5991/73 c/c Art.3º da Resolução RDC 44/2009'),
(2, 'O farmacêutico está identificado de modo distinto dos demais funcionários?', 3, true, 'SIM_NAO', 'Art.17, parágrafo único da Resolução RDC 44/2009');

-- Criar Seção C - ADMINISTRAÇÃO
INSERT INTO secoes (questionario_id, codigo, titulo, ordem, tipo_secao, bloqueante) 
VALUES (1, 'C', 'ADMINISTRAÇÃO', 3, 'DOCUMENTAL', false);

-- Criar Seção D - EDIFICAÇÃO E INSTALAÇÕES
INSERT INTO secoes (questionario_id, codigo, titulo, ordem, tipo_secao, bloqueante) 
VALUES (1, 'D', 'EDIFICAÇÃO E INSTALAÇÕES FÍSICAS GERAIS', 4, 'OBJETIVA', false);

-- Perguntas Seção D (exemplo - algumas)
INSERT INTO perguntas (secao_id, texto, ordem, obrigatoria, tipo_resposta, referencia_legal) VALUES
(4, 'Mantém em local visível ao público o Alvará Sanitário?', 1, false, 'SIM_NAO_NA_NO', 'Art.2 § 1º e § 2º da Resolução RDC 44/2009'),
(4, 'Mantém em local visível ao público a CRT e o cartaz complementar de identificação conforme legislação?', 2, false, 'SIM_NAO_NA_NO', 'Art.2 § 1º e § 2º da Resolução RDC 44/2009'),
(4, 'Possui avisos afixados quanto à proibição de uso de produtos fumígenos?', 3, false, 'SIM_NAO_NA_NO', 'Lei Estadual nº 13.541/09');

-- Criar Seção E - ARMAZENAGEM
INSERT INTO secoes (questionario_id, codigo, titulo, ordem, tipo_secao, bloqueante) 
VALUES (1, 'E', 'ARMAZENAGEM E EXPOSIÇÃO DOS PRODUTOS', 5, 'OBJETIVA', false);

-- Criar Seção F - PRODUTOS
INSERT INTO secoes (questionario_id, codigo, titulo, ordem, tipo_secao, bloqueante) 
VALUES (1, 'F', 'PRODUTOS', 6, 'OBJETIVA', false);

-- Criar Seção G - SERVIÇOS FARMACÊUTICOS
INSERT INTO secoes (questionario_id, codigo, titulo, ordem, tipo_secao, bloqueante) 
VALUES (1, 'G', 'PRESTAÇÃO DE SERVIÇOS FARMACÊUTICOS', 7, 'OBJETIVA', false);

-- Criar Seção H - CONTROLE ESPECIAL
INSERT INTO secoes (questionario_id, codigo, titulo, ordem, tipo_secao, bloqueante) 
VALUES (1, 'H', 'MEDICAMENTOS SUJEITOS A CONTROLE ESPECIAL', 8, 'MISTA', false);

-- Estabelecimento exemplo
INSERT INTO estabelecimentos (razao_social, nome_fantasia, cnpj, endereco) 
VALUES (
    'Drogaria Exemplo LTDA',
    'Farmácia Boa Saúde',
    '12.345.678/0001-90',
    'Rua das Flores, 123 - Centro'
);

-- Usuário admin (senha: admin123)
INSERT INTO users (email, password_hash, nome, role) 
VALUES ('admin@visatech.com', '$2b$10$GQS3b0nlMDLovXgB1wJ2uu2rsQwNznIFDDceSLBBl3Fpid9XkMIxW', 'Administrador', 'admin');
