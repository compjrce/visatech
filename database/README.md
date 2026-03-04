# 🗄️ Database - VISATech

## Estrutura do Banco de Dados

Este diretório contém todos os scripts SQL necessários para configurar o banco de dados PostgreSQL do VISATech (Sistema de Inspeção em Estabelecimentos Farmacêuticos).

## 📋 Arquivos

- `schema.sql` - Schema completo com estrutura de seções e inspeções
- `seeds.sql` - Dados iniciais (exemplos)
- `migrations/` - Migrações futuras

## 🚀 Como Usar

### Supabase (Produção)

1. Acesse seu projeto no Supabase
2. Vá em **SQL Editor**
3. Execute `schema.sql` completo
4. Execute `seeds.sql` para dados de exemplo (opcional)

### PostgreSQL Local (Desenvolvimento)

```bash
# Via Docker - Limpar e recriar
docker exec -i postgres-visatech psql -U postgres -d visatech << EOF
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
EOF

# Executar schema
docker exec -i postgres-visatech psql -U postgres -d visatech < schema.sql

# Ou conectando diretamente
psql -U postgres -d visatech -f schema.sql
```

## 📊 Diagrama de Relacionamentos

```
users
  ├── estabelecimento_id → estabelecimentos
  ├── inspecoes (fiscal_responsavel)
  └── respostas

estabelecimentos
  ├── inspecoes
  └── secao_a_dados

questionarios (roteiros)
  └── secoes (A, B, C, D, E, F, G, H)
      └── perguntas

inspecoes
  ├── questionario_id → questionarios
  ├── estabelecimento_id → estabelecimentos
  ├── fiscal_responsavel_id → users
  ├── secao_a_dados
  ├── respostas
  └── inventario_medicamentos (Seção H)

respostas
  ├── inspecao_id → inspecoes
  ├── pergunta_id → perguntas
  └── user_id → users (quem respondeu)
```

## 🏗️ Estrutura de Seções

O sistema organiza o Roteiro de Inspeção em seções:

| Seção | Título | Tipo | Bloqueante |
|-------|--------|------|------------|
| A | Identificação | IDENTIFICACAO | Não |
| B | Responsabilidade Técnica | VALIDACAO | **Sim** |
| C | Administração | DOCUMENTAL | Não |
| D | Edificação | OBJETIVA | Não |
| E | Armazenagem | OBJETIVA | Não |
| F | Produtos | OBJETIVA | Não |
| G | Serviços Farmacêuticos | OBJETIVA | Não |
| H | Controle Especial | MISTA | Não |

### ⚠️ Seção B - Bloqueante

A Seção B valida a presença do farmacêutico. Se **qualquer resposta for NÃO**, a inspeção é **BLOQUEADA** e não pode prosseguir.

## 🔐 Criar Usuário Admin

O schema já cria automaticamente um usuário admin. Para usar um hash seguro:

```sql
-- Deletar usuário padrão
DELETE FROM users WHERE email = 'admin@visatech.com';

-- Gere o hash em: https://bcrypt-generator.com/ (senha: admin123, rounds: 10)
INSERT INTO users (email, password_hash, nome, role) 
VALUES ('admin@visatech.com', '$2b$10$SEU_HASH_AQUI', 'Administrador', 'admin');
```

## 📈 Queries Úteis

### Ver estatísticas
```sql
SELECT 
  (SELECT COUNT(*) FROM estabelecimentos) as estabelecimentos,
  (SELECT COUNT(*) FROM questionarios) as roteiros,
  (SELECT COUNT(*) FROM secoes) as secoes,
  (SELECT COUNT(*) FROM perguntas) as perguntas,
  (SELECT COUNT(*) FROM inspecoes) as inspecoes,
  (SELECT COUNT(*) FROM respostas) as respostas;
```

### Últimas inspeções
```sql
SELECT 
  i.id,
  e.razao_social as estabelecimento,
  u.nome as fiscal,
  i.status,
  i.secao_b_aprovada,
  i.data_inicio,
  COUNT(DISTINCT r.id) as total_respostas
FROM inspecoes i
JOIN estabelecimentos e ON i.estabelecimento_id = e.id
JOIN users u ON i.fiscal_responsavel_id = u.id
LEFT JOIN respostas r ON r.inspecao_id = i.id
GROUP BY i.id, e.razao_social, u.nome, i.status, i.secao_b_aprovada, i.data_inicio
ORDER BY i.data_inicio DESC
LIMIT 10;
```

### Inspeções bloqueadas (Seção B reprovada)
```sql
SELECT 
  i.id,
  e.razao_social,
  u.nome as fiscal,
  i.data_inicio,
  i.status
FROM inspecoes i
JOIN estabelecimentos e ON i.estabelecimento_id = e.id
JOIN users u ON i.fiscal_responsavel_id = u.id
WHERE i.status = 'BLOQUEADA_B' OR i.secao_b_aprovada = false
ORDER BY i.data_inicio DESC;
```

### Respostas por seção de uma inspeção
```sql
SELECT 
  s.codigo as secao,
  s.titulo as secao_titulo,
  p.texto as pergunta,
  r.resposta_opcao,
  r.resposta_texto,
  r.observacao
FROM respostas r
JOIN perguntas p ON r.pergunta_id = p.id
JOIN secoes s ON p.secao_id = s.id
WHERE r.inspecao_id = 1 -- ID da inspeção
ORDER BY s.ordem, p.ordem;
```

### Inventário de medicamentos de uma inspeção
```sql
SELECT 
  medicamento,
  estoque_fisico,
  estoque_escriturado,
  (estoque_escriturado - estoque_fisico) as diferenca,
  observacao
FROM inventario_medicamentos
WHERE inspecao_id = 1 -- ID da inspeção
ORDER BY ordem;
```

## 🔍 Verificar Integridade

### Verificar se todas as tabelas foram criadas
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Deve retornar:
-- estabelecimentos
-- inspecoes
-- inventario_medicamentos
-- perguntas
-- questionarios
-- respostas
-- secao_a_dados
-- secoes
-- users
```

### Verificar seed inicial
```sql
-- Roteiro criado
SELECT id, titulo, versao, tipo FROM questionarios;

-- Seções criadas
SELECT codigo, titulo, tipo_secao, bloqueante 
FROM secoes 
ORDER BY ordem;

-- Perguntas da Seção B (bloqueante)
SELECT p.ordem, p.texto, p.obrigatoria
FROM perguntas p
JOIN secoes s ON p.secao_id = s.id
WHERE s.codigo = 'B'
ORDER BY p.ordem;

-- Estabelecimento exemplo
SELECT razao_social, nome_fantasia, cnpj FROM estabelecimentos;

-- Usuário admin
SELECT email, nome, role FROM users;
```

## 🔄 Backup

### Fazer backup completo
```bash
# Supabase (via pg_dump)
pg_dump "postgresql://postgres:senha@db.xxx.supabase.co:5432/postgres" > backup_visatech.sql

# PostgreSQL Local
docker exec -t postgres-visatech pg_dump -U postgres visatech > backup_visatech.sql
```

### Restaurar backup
```bash
# Supabase
psql "postgresql://postgres:senha@db.xxx.supabase.co:5432/postgres" < backup_visatech.sql

# PostgreSQL Local
docker exec -i postgres-visatech psql -U postgres visatech < backup_visatech.sql
```

### Backup seletivo (apenas dados)
```bash
# Apenas estabelecimentos e usuários
pg_dump -U postgres -d visatech -t estabelecimentos -t users --data-only > backup_data.sql
```

## 📝 Tipos de Resposta Suportados

| Tipo | Descrição | Usado em |
|------|-----------|----------|
| `SIM_NAO` | Sim ou Não | Seção B |
| `SIM_NAO_NA_NO` | Sim, Não, N/A, NO (Não Observado) | Seções D-G |
| `TEXTO` | Texto livre | Seção C |
| `DATA` | Data | Seção C |
| `NUMERO` | Valor numérico | Seção H |

## 🚨 Status de Inspeção

| Status | Descrição |
|--------|-----------|
| `EM_ANDAMENTO` | Inspeção iniciada, pode continuar |
| `BLOQUEADA_B` | Seção B reprovada - sem farmacêutico |
| `FINALIZADA` | Inspeção completa e enviada |
| `CANCELADA` | Inspeção cancelada |

## 🆕 Visão sintética

✅ Estrutura de **seções separadas** (A-H)  
✅ **Seção B bloqueante** (valida farmacêutico)  
✅ **Multi-usuário**: Vários fiscais podem responder seções diferentes  
✅ **Inventário dinâmico** de medicamentos (Seção H)  
✅ **Dados da Seção A** preenchidos automaticamente do estabelecimento  
✅ **Histórico completo** de quem respondeu cada pergunta  
✅ **Tipos de resposta** variados por seção  

## 📚 Documentação Adicional

- [API Documentation](../docs/API.md)
- [Roteiro de Inspeção RDC 44/2009](../docs/ROTEIRO_INSPECAO.md)