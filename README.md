# 📱 VISATech — Sistema de Inspeção Farmacêutica

Sistema completo para realização e gestão de inspeções sanitárias em farmácias e drogarias conforme a **RDC 44/2009**.

## 🌐 URLs em Produção

| Serviço | URL |
|---------|-----|
| Backend API | https://visatech-backend.onrender.com |
| Painel Web | https://visatech-admin.vercel.app |

---

## 🏗️ Arquitetura

```
┌─────────────────┐
│   App Android   │
│   (Flutter)     │
└────────┬────────┘
         │ API REST (JWT)
┌────────▼────────┐      ┌──────────────┐
│   Backend API   │◄─────┤  Painel Web  │
│   (Node.js)     │      │   (React)    │
└────────┬────────┘      └──────────────┘
         │
┌────────▼────────┐
│   PostgreSQL    │
│   (Supabase)    │
└─────────────────┘
```

---

## 🚀 Tecnologias

- **Backend:** Node.js + Express + PostgreSQL (Supabase) + JWT
- **Web Admin:** React + Vite + Tailwind CSS
- **App Mobile:** Flutter (Android)

---

## 📁 Estrutura do Projeto

```
visatech/
├── app/                        # App Flutter (Android)
│   └── lib/
│       ├── main.dart
│       ├── models/
│       │   ├── campos.dart         # Perguntas fixas das seções A–H
│       │   ├── estabelecimento.dart
│       │   ├── inspecao.dart
│       │   └── user.dart
│       ├── screens/
│       │   ├── home_screen.dart
│       │   ├── login_screen.dart
│       │   ├── nova_inspecao_screen.dart
│       │   ├── inspecao_screen.dart
│       │   ├── inspecoes_screen.dart
│       │   ├── secao_screen.dart
│       │   └── resultado_screen.dart
│       ├── services/
│       │   ├── api_service.dart
│       │   └── auth_service.dart
│       └── providers/
│           └── theme_provider.dart
├── backend/
│   ├── server.js               # API principal
│   └── package.json
├── web-admin/
│   └── src/
│       └── App.jsx             # Painel administrativo React
├── database/
│   └── schema.sql
├── docs/
│   └── API.md
└── README.md
```

---

## 🗄️ Modelo de Dados

As perguntas das seções A–H são **fixas no código** (`campos.dart`). O banco armazena apenas as respostas.

```
users
├── id, email, password_hash, role, nome

estabelecimentos
├── id, razao_social, nome_fantasia, cnpj (unique)
├── endereco, telefone, email, ativo

inspecoes
├── id, estabelecimento_id, fiscal_id
├── status (EM_ANDAMENTO | BLOQUEADA_B | FINALIZADA | CANCELADA)
├── secao_atual, secao_b_aprovada
├── criado_em, finalizado_em

respostas
├── id, inspecao_id, secao, campo, valor
├── UNIQUE (inspecao_id, secao, campo)

inventario_itens
├── id, inspecao_id, medicamento, quantidade, validade, lote
```

---

## 🌐 Endpoints da API

### Auth
```
POST /api/auth/login
POST /api/auth/register
```

### Estabelecimentos
```
GET    /api/estabelecimentos
GET    /api/estabelecimentos/cnpj/:cnpj
POST   /api/estabelecimentos
PUT    /api/estabelecimentos/:id
DELETE /api/estabelecimentos/:id
```

### Inspeções
```
GET  /api/inspecoes
GET  /api/inspecoes/:id
POST /api/inspecoes
POST /api/inspecoes/:id/respostas
PUT  /api/inspecoes/:id/finalizar
PUT  /api/inspecoes/:id/cancelar
```

### Inventário (Seção H)
```
GET  /api/inspecoes/:id/inventario
POST /api/inspecoes/:id/inventario
```

### Health
```
GET /health  →  { status: 'ok', version: '2.0' }
```

---

## 📋 Seções do Roteiro de Inspeção

| Seção | Título | Tipo |
|-------|--------|------|
| A | Identificação do Estabelecimento | Dados + objetivo |
| B | Responsabilidade Técnica | SIM/NÃO — **bloqueante** |
| C | Administração | Documentos, POPs, registros |
| D | Edificação e Instalações Físicas | SIM/NÃO/N.A./N.O. |
| E | Armazenagem e Exposição | SIM/NÃO/N.A./N.O. |
| F | Produtos | SIM/NÃO/N.A./N.O. |
| G | Prestação de Serviços Farmacêuticos | SIM/NÃO/N.A./N.O. |
| H | Medicamentos de Controle Especial | SIM/NÃO/N.A./N.O. + inventário |

> A seção B é bloqueante: qualquer resposta **NÃO** encerra a inspeção com status `BLOQUEADA_B`.

---

## 🎨 Funcionalidades

### App Android
- Login com JWT
- Busca de estabelecimento por CNPJ (cadastra automaticamente se não existir)
- Fluxo de inspeção seção a seção (A → H)
- Todos os tipos de campo: SIM/NÃO, SIM/NÃO/N.A./N.O., texto, data, checkboxes, tabelas
- Histórico de inspeções com status colorido
- Temas: Claro, Escuro, Feminino

### Painel Web (Admin)
- Login com JWT
- Listagem de inspeções com status e detalhes por seção
- CRUD de estabelecimentos
- Cancelamento de inspeções

---

## 🔧 Instalação Local

### Pré-requisitos
- Node.js 18+
- Flutter SDK 3.x
- Conta no Supabase

### Backend
```bash
cd backend
npm install
cp .env.example .env   # configurar DATABASE_URL e JWT_SECRET
npm run dev
```

### Web Admin
```bash
cd web-admin
npm install
npm run dev            # http://localhost:5173
```

### App Flutter
```bash
cd app
flutter pub get
flutter run
```

---

## 🚀 Deploy

1. **Banco:** executar `schema.sql` no Supabase
2. **Backend:** deploy no Render apontando para `backend/server.js`
3. **Web Admin:** deploy no Vercel apontando para `web-admin/`

Credenciais iniciais: `admin@visatech.com` / `admin123`

---

## 🔐 Segurança

- Senhas com bcrypt (10 rounds)
- Autenticação JWT com expiração de 24h
- CORS configurado
- Variáveis sensíveis em `.env`
- SQL injection prevenido com prepared statements

---

## 🎉 Status

| Componente | Status |
|------------|--------|
| Backend API | 🟢 Produção |
| Web Admin | 🟢 Produção |
| App Android | 🟢 Funcional |