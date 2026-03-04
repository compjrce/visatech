# 📡 API Documentation - VISATech

## Base URL

- **Produção**: `https://visatech-backend.onrender.com/api`
- **Local**: `http://localhost:3000/api`

## Autenticação

Todas as rotas (exceto login) requerem autenticação via **Bearer Token JWT**.

### Header de Autenticação
```
Authorization: Bearer SEU_TOKEN_AQUI
```

---

## 🔐 Autenticação

### Login

**POST** `/auth/login`

Faz login e retorna token JWT.

**Body:**
```json
{
  "email": "admin@visatech.com",
  "password": "admin123"
}
```

**Response 200:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "admin@visatech.com",
    "role": "admin",
    "estabelecimento_id": null
  }
}
```

**Response 401:**
```json
{
  "error": "Credenciais inválidas"
}
```

### Registrar Usuário

**POST** `/auth/register`

Cria novo usuário (apenas admins).

**Headers:**
```
Authorization: Bearer TOKEN_DO_ADMIN
```

**Body:**
```json
{
  "email": "novo@email.com",
  "password": "senha123",
  "role": "auditor",
  "estabelecimento_id": 1
}
```

**Response 201:**
```json
{
  "user": {
    "id": 5,
    "email": "novo@email.com",
    "role": "auditor"
  }
}
```

---

## 🏢 Estabelecimentos

### Listar Estabelecimentos

**GET** `/estabelecimentos`

**Response 200:**
```json
[
  {
    "id": 1,
    "nome": "Restaurante Boa Vista",
    "cnpj": "12.345.678/0001-90",
    "ativo": true,
    "criado_em": "2024-11-16T20:00:00.000Z"
  }
]
```

### Criar Estabelecimento

**POST** `/estabelecimentos` (apenas admin)

**Body:**
```json
{
  "nome": "Novo Estabelecimento",
  "cnpj": "11.222.333/0001-44"
}
```

**Response 201:**
```json
{
  "id": 6,
  "nome": "Novo Estabelecimento",
  "cnpj": "11.222.333/0001-44",
  "ativo": true,
  "criado_em": "2024-11-16T21:00:00.000Z"
}
```

### Atualizar Estabelecimento

**PUT** `/estabelecimentos/:id` (apenas admin)

**Body:**
```json
{
  "nome": "Nome Atualizado",
  "cnpj": "11.222.333/0001-44",
  "ativo": false
}
```

### Deletar Estabelecimento

**DELETE** `/estabelecimentos/:id` (apenas admin)

**Response 200:**
```json
{
  "message": "Estabelecimento deletado"
}
```

---

## 📋 Questionários

### Listar Questionários

**GET** `/questionarios`

**Query Params (opcional):**
- `estabelecimento_id` - Filtrar por estabelecimento

**Response 200:**
```json
[
  {
    "id": 1,
    "titulo": "Inspeção Sanitária",
    "descricao": "Check-list para cozinha",
    "estabelecimento_id": 1,
    "estabelecimento_nome": "Restaurante Boa Vista",
    "total_perguntas": 8,
    "criado_em": "2024-11-16T20:00:00.000Z"
  }
]
```

### Buscar Questionário com Perguntas

**GET** `/questionarios/:id`

**Response 200:**
```json
{
  "id": 1,
  "titulo": "Inspeção Sanitária",
  "descricao": "Check-list para cozinha",
  "estabelecimento_id": 1,
  "criado_em": "2024-11-16T20:00:00.000Z",
  "perguntas": [
    {
      "id": 1,
      "questionario_id": 1,
      "texto": "A cozinha está limpa?",
      "ordem": 1,
      "obrigatoria": true,
      "criado_em": "2024-11-16T20:00:00.000Z"
    }
  ]
}
```

### Criar Questionário

**POST** `/questionarios` (apenas admin)

**Body:**
```json
{
  "titulo": "Novo Questionário",
  "descricao": "Descrição do questionário",
  "estabelecimento_id": 1,
  "perguntas": [
    {
      "texto": "Primeira pergunta?",
      "obrigatoria": true
    },
    {
      "texto": "Segunda pergunta?",
      "obrigatoria": false
    }
  ]
}
```

**Response 201:**
```json
{
  "id": 5,
  "titulo": "Novo Questionário",
  "descricao": "Descrição do questionário",
  "estabelecimento_id": 1,
  "criado_em": "2024-11-16T21:00:00.000Z"
}
```

### Atualizar Questionário

**PUT** `/questionarios/:id` (apenas admin)

**Body:**
```json
{
  "titulo": "Título Atualizado",
  "descricao": "Nova descrição",
  "perguntas": [
    {
      "texto": "Pergunta atualizada?",
      "obrigatoria": true
    }
  ]
}
```

### Deletar Questionário

**DELETE** `/questionarios/:id` (apenas admin)

---

## 📝 Auditorias

### Listar Auditorias

**GET** `/auditorias`

**Response 200:**
```json
[
  {
    "id": 1,
    "questionario_id": 1,
    "questionario_titulo": "Inspeção Sanitária",
    "user_id": 1,
    "auditor_email": "auditor@visatech.com",
    "estabelecimento_nome": "Restaurante Boa Vista",
    "data_inicio": "2024-11-16T14:30:00.000Z",
    "data_fim": "2024-11-16T15:00:00.000Z",
    "criado_em": "2024-11-16T14:30:00.000Z"
  }
]
```

### Buscar Auditoria com Respostas

**GET** `/auditorias/:id`

**Response 200:**
```json
{
  "id": 1,
  "questionario_id": 1,
  "questionario_titulo": "Inspeção Sanitária",
  "questionario_descricao": "Check-list para cozinha",
  "user_id": 1,
  "auditor_email": "auditor@visatech.com",
  "estabelecimento_nome": "Restaurante Boa Vista",
  "data_inicio": "2024-11-16T14:30:00.000Z",
  "data_fim": "2024-11-16T15:00:00.000Z",
  "respostas": [
    {
      "id": 1,
      "auditoria_id": 1,
      "pergunta_id": 1,
      "pergunta_texto": "A cozinha está limpa?",
      "ordem": 1,
      "resposta": "SIM",
      "observacao": null,
      "criado_em": "2024-11-16T14:35:00.000Z"
    },
    {
      "id": 2,
      "auditoria_id": 1,
      "pergunta_id": 2,
      "pergunta_texto": "Há pragas?",
      "ordem": 2,
      "resposta": "NAO",
      "observacao": "Encontradas algumas baratas",
      "criado_em": "2024-11-16T14:36:00.000Z"
    }
  ]
}
```

### Criar Auditoria

**POST** `/auditorias`

Usado quando um auditor responde um questionário.

**Body:**
```json
{
  "questionario_id": 1,
  "respostas": [
    {
      "pergunta_id": 1,
      "resposta": "SIM",
      "observacao": null
    },
    {
      "pergunta_id": 2,
      "resposta": "NAO",
      "observacao": "Problema encontrado na área"
    },
    {
      "pergunta_id": 3,
      "resposta": "NAO_SE_APLICA",
      "observacao": null
    }
  ]
}
```

**Response 201:**
```json
{
  "id": 5,
  "questionario_id": 1,
  "user_id": 1,
  "data_inicio": "2024-11-16T15:00:00.000Z",
  "data_fim": "2024-11-16T15:00:00.000Z",
  "criado_em": "2024-11-16T15:00:00.000Z"
}
```

---

## 🏥 Health Check

### Health

**GET** `/health` (sem autenticação)

**Response 200:**
```json
{
  "status": "OK",
  "timestamp": "2024-11-16T20:30:30.366Z"
}
```

---

## ❌ Códigos de Erro

| Código | Descrição |
|--------|-----------|
| 200 | Sucesso |
| 201 | Criado com sucesso |
| 400 | Requisição inválida |
| 401 | Não autenticado |
| 403 | Sem permissão (não é admin) |
| 404 | Recurso não encontrado |
| 500 | Erro interno do servidor |

---

## 📝 Exemplos com cURL

### Login
```bash
curl -X POST https://visatech-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@visatech.com","password":"admin123"}'
```

### Listar Estabelecimentos
```bash
curl https://visatech-backend.onrender.com/api/estabelecimentos \
  -H "Authorization: Bearer SEU_TOKEN"
```

### Criar Questionário
```bash
curl -X POST https://visatech-backend.onrender.com/api/questionarios \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "Novo Questionário",
    "descricao": "Descrição",
    "estabelecimento_id": 1,
    "perguntas": [
      {"texto": "Pergunta 1?", "obrigatoria": true}
    ]
  }'
```