-- Migração: adicionar estabelecimento_id na tabela questionarios
ALTER TABLE questionarios
  ADD COLUMN IF NOT EXISTS estabelecimento_id INTEGER REFERENCES estabelecimentos(id);

-- Índice para melhorar performance
CREATE INDEX IF NOT EXISTS idx_questionarios_estabelecimento ON questionarios(estabelecimento_id);