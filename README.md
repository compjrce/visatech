# 📱 VISATech - Sistema de Auditoria e Inspeção

Sistema completo para gestão de questionários, auditorias e relatórios, com app Android e painel web administrativo.

## 🌐 URLs em Produção

- **Backend API**: https://visatech-backend.onrender.com
- **Painel Web**: https://visatech-admin.vercel.app
- **Documentação API**: [docs/API.md](docs/API.md)

## 🎯 Visão Geral

O VISATech permite que auditores respondam questionários personalizados através de um app Android, enquanto administradores gerenciam estabelecimentos, questionários e visualizam relatórios através de um painel web.

## 🏗️ Arquitetura

```
┌─────────────────┐
│  App Android    │
│   (Flutter)     │
└────────┬────────┘
         │
         │ API REST
         │
┌────────▼────────┐      ┌──────────────┐
│   Backend API   │◄─────┤  Painel Web  │
│  (Node.js)      │      │   (React)    │
└────────┬────────┘      └──────────────┘
         │
         │
┌────────▼────────┐
│   PostgreSQL    │
│   (Supabase)    │
└─────────────────┘
```

## 🚀 Tecnologias

### Backend
- **Node.js** + Express
- **PostgreSQL** (Supabase)
- **JWT** para autenticação
- **bcryptjs** para hash de senhas

### Frontend Web
- **React** + Vite
- **Tailwind CSS** (via CDN)
- **Lucide React** (ícones)

### Mobile (Fase 2)
- **Flutter** + Dart
- **SQLite** para modo offline
- **HTTP/Dio** para API

## 📁 Estrutura do Projeto

```
visatech/
├── backend/
│   ├── server.js           # API principal
│   ├── package.json
│   └── .env                # Variáveis de ambiente
├── web-admin/
│   ├── src/
│   │   └── App.jsx         # Aplicação React
│   ├── package.json
│   └── vite.config.js
├── mobile-app/             # (Fase 2 - Flutter)
│   └── ...
├── database/
│   └── schema.sql          # Schema do banco
├── docs/
│   └── DEPLOY.md          # Guia de deploy
└── README.md
```

## 🎨 Funcionalidades

### Painel Web (Admin)
- ✅ Login com JWT
- ✅ CRUD de Estabelecimentos
- ✅ CRUD de Questionários
- ✅ Visualização de Relatórios
- ✅ Criação de perguntas personalizadas
- ✅ Associação de questionários a estabelecimentos

### App Android (Auditor)
- 🔲 Login com JWT
- 🔲 Listagem de questionários
- 🔲 Interface de resposta (SIM/NÃO/N/A)
- 🔲 Modo offline
- 🔲 Sincronização de dados
- 🔲 Histórico de auditorias

## 🗄️ Modelo de Dados

```sql
users
├── id
├── email
├── password_hash
├── role (admin/auditor)
└── estabelecimento_id

estabelecimentos
├── id
├── nome
├── cnpj
└── ativo

questionarios
├── id
├── titulo
├── descricao
└── estabelecimento_id

perguntas
├── id
├── questionario_id
├── texto
├── ordem
└── obrigatoria

auditorias
├── id
├── questionario_id
├── user_id
├── data_inicio
└── data_fim

respostas
├── id
├── auditoria_id
├── pergunta_id
├── resposta (SIM/NAO/NAO_SE_APLICA)
└── observacao
```

## 🔧 Instalação Local

### Pré-requisitos
- Node.js 18+
- npm ou yarn
- Conta no Supabase (grátis)

### Backend

```bash
cd backend
npm install

# Configurar .env
cp .env.example .env
# Editar .env com suas credenciais

# Rodar servidor
npm run dev
```

### Web Admin

```bash
cd web-admin
npm install

# Rodar em desenvolvimento
npm run dev
```

Acesse: http://localhost:5173

## 🚀 Deploy

Siga o guia completo em `docs/DEPLOY.md`

### Quick Deploy

1. **Banco de Dados**: Criar projeto no Supabase e executar `schema.sql`
2. **Backend**: Deploy no Render conectando ao GitHub
3. **Frontend**: Deploy no Vercel conectando ao GitHub

## 🔐 Segurança

- Senhas hasheadas com bcrypt (10 rounds)
- Autenticação via JWT
- Tokens expiram em 24h
- CORS configurado
- Variáveis sensíveis em .env
- SQL injection prevenido (prepared statements)

## 🌐 Endpoints da API

### Autenticação
```
POST /api/auth/login
POST /api/auth/register (apenas admin)
```

### Estabelecimentos
```
GET    /api/estabelecimentos
POST   /api/estabelecimentos (admin)
PUT    /api/estabelecimentos/:id (admin)
DELETE /api/estabelecimentos/:id (admin)
```

### Questionários
```
GET    /api/questionarios
GET    /api/questionarios/:id
POST   /api/questionarios (admin)
PUT    /api/questionarios/:id (admin)
DELETE /api/questionarios/:id (admin)
```

### Auditorias
```
GET    /api/auditorias
GET    /api/auditorias/:id
POST   /api/auditorias
```

## 🧪 Testando a API

```bash
# Health check
curl https://seu-backend.onrender.com/health

# Login
curl -X POST https://seu-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@visatech.com","password":"admin123"}'

# Listar estabelecimentos (com token)
curl https://seu-backend.onrender.com/api/estabelecimentos \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

## 📱 App Android (Fase 2)

O desenvolvimento do app Flutter está planejado para consumir a mesma API REST.

### Features previstas:
- Login offline-first
- Cache de questionários
- Respostas salvas localmente
- Sincronização automática
- Geração de PDF offline

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Add nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto é de código aberto. Use como quiser! 

## 🆘 Suporte

- 📧 Email: suporte@visatech.com
- 📚 Documentação: `/docs`
- 🐛 Issues: GitHub Issues

## ✅ Roadmap

### Fase 1 - Backend + Web ✅
- [x] API REST completa
- [x] Autenticação JWT
- [x] CRUD completo
- [x] Painel web funcional
- [x] Deploy automático

### Fase 2 - App Android 🚧
- [ ] Setup Flutter
- [ ] Telas principais
- [ ] Integração com API
- [ ] Modo offline
- [ ] Build APK

### Fase 3 - Melhorias 📋
- [ ] Geração de PDF dos relatórios
- [ ] Dashboard com gráficos
- [ ] Notificações push
- [ ] Exportar Excel
- [ ] Multi-idioma
- [ ] Dark mode

## 🎉 Status

🟢 **Backend**: Produção  
🟢 **Web Admin**: Produção  
🟡 **App Android**: Desenvolvimento  

---

**Desenvolvido para facilitar auditorias e inspeções** 🚀