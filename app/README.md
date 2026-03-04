# 📱 VISATech Mobile - App Android

App Flutter para auditores responderem questionários e auditorias.

## 🎨 Temas Disponíveis

O app possui 3 temas que o usuário pode escolher:

1. **Claro (Azul)** - Tema padrão com azul como cor primária
2. **Escuro (Laranja)** - Tema dark com laranja como destaque
3. **Feminino (Rosa)** - Tema com rosa vibrante

O tema é salvo localmente e persiste entre sessões.

## 🚀 Setup do Projeto

### Pré-requisitos

- Flutter SDK 3.0+
- Android Studio ou VS Code
- Android SDK
- Dispositivo Android ou Emulador

### Instalação

```bash
# 1. Clone o repositório (se ainda não clonou)
git clone https://github.com/seu-usuario/visatech.git
cd visatech/mobile-app

# 2. Instalar dependências
flutter pub get

# 3. Verificar se está tudo OK
flutter doctor

# 4. Rodar no emulador/device
flutter run
```

### Configurar URL da API

Edite o arquivo `lib/services/api_service.dart`, linha 9:

```dart
static const String baseUrl = 'https://visatech-backend.onrender.com/api';
```

Altere para a URL do seu backend.

## 📂 Estrutura do Projeto

```
lib/
├── main.dart                 # Entry point
├── models/
│   ├── user.dart            # Modelo de usuário
│   ├── questionario.dart    # Modelo de questionário
│   ├── pergunta.dart        # Modelo de pergunta
│   └── resposta.dart        # Modelo de resposta
├── providers/
│   └── theme_provider.dart  # Gerenciamento de temas
├── services/
│   ├── api_service.dart     # Chamadas HTTP
│   └── auth_service.dart    # Autenticação
└── screens/
    ├── login_screen.dart           # Tela de login
    ├── home_screen.dart            # Tela principal
    ├── questionarios_screen.dart   # Lista de questionários
    ├── auditoria_screen.dart       # Responder questionário
    └── auditorias_screen.dart      # Histórico
```

## 🔧 Funcionalidades

### ✅ Implementadas

- [x] Sistema de temas (Claro, Escuro, Feminino)
- [x] Login com JWT
- [x] Armazenamento seguro de credenciais
- [x] Listagem de questionários
- [x] Interface de auditoria (responder perguntas)
- [x] Respostas: SIM / NÃO / NÃO SE APLICA
- [x] Campo de observações por pergunta
- [x] Navegação entre perguntas
- [x] Validação de perguntas obrigatórias
- [x] Envio de auditoria para API
- [x] Histórico de auditorias
- [x] Visualização detalhada de auditorias
- [x] Pull to refresh
- [x] Tratamento de erros
- [x] Splash screen

### 🔄 Próximas Features

- [ ] Modo offline com SQLite
- [ ] Sincronização automática
- [ ] Fotos nas respostas
- [ ] Geolocalização
- [ ] Assinatura digital
- [ ] Push notifications
- [ ] Biometria

## 🏗️ Build do APK

### Debug APK

```bash
flutter build apk --debug
```

### Release APK

```bash
flutter build apk --release
```

O APK ficará em: `build/app/outputs/flutter-apk/app-release.apk`

### APKs separados por arquitetura (menor tamanho)

```bash
flutter build apk --split-per-abi
```

Gera 3 APKs:
- `app-armeabi-v7a-release.apk` (32-bit)
- `app-arm64-v8a-release.apk` (64-bit)
- `app-x86_64-release.apk` (emuladores)

## 🎯 Como Usar

### Login

Use as credenciais do sistema:
- Email: `admin@visatech.com`
- Senha: `admin123` (ou a senha que você configurou)

### Responder Questionário

1. Na tela inicial, escolha um questionário
2. Toque em "Iniciar Auditoria"
3. Responda cada pergunta (SIM/NÃO/N/A)
4. Adicione observações se necessário
5. Navegue entre perguntas
6. Finalize e envie

### Trocar Tema

1. Na tela de login: Selecione o tema desejado antes de entrar
2. Dentro do app: Menu (⋮) → Tema

## 🐛 Troubleshooting

### Erro: "Waiting for another flutter command"

```bash
killall -9 dart
```

### Erro de conexão com API

1. Verifique se a URL da API está correta
2. Teste a API no navegador: `https://sua-api.com/health`
3. Verifique sua conexão de internet

### Erro de build

```bash
flutter clean
flutter pub get
flutter run
```

## 📱 Testando

### Em dispositivo físico

1. Ative "Modo Desenvolvedor" no Android
2. Ative "Depuração USB"
3. Conecte o device via USB
4. Execute: `flutter run`

### No emulador

1. Abra Android Studio
2. AVD Manager → Crie/inicie um emulador
3. Execute: `flutter run`

## 📊 Dependências Principais

```yaml
dependencies:
  http: ^1.1.0                        # Requisições HTTP
  provider: ^6.1.1                    # Gerenciamento de estado
  shared_preferences: ^2.2.2          # Armazenamento local
  flutter_secure_storage: ^9.0.0      # Armazenamento seguro
  intl: ^0.18.1                       # Formatação de datas
```

## 🎨 Paleta de Cores

### Tema Claro (Azul)
- Primária: `#2196F3`
- Secundária: `#03A9F4`
- Background: `#F5F5F5`

### Tema Escuro (Laranja)
- Primária: `#FF9800`
- Secundária: `#FFB74D`
- Background: `#121212`

### Tema Feminino (Rosa)
- Primária: `#E91E63`
- Secundária: `#F48FB1`
- Background: `#FCE4EC`

## 📝 Notas

- O tema é salvo localmente e persiste entre sessões
- O token JWT expira em 24 horas
- As credenciais são armazenadas de forma segura com `flutter_secure_storage`
- Auditorias são enviadas em tempo real (sem modo offline no MVP)

## 🆘 Suporte

- Issues: https://github.com/seu-usuario/visatech/issues
- Email: suporte@visatech.com

---

**Desenvolvido com Flutter 💙**