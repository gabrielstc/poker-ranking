# 🏆 Sistema de Ranking de Poker

Um sistema web completo para gerenciamento e exibição de ranking de torneios de poker, desenvolvido com as mais modernas tecnologias.

## 🚀 Tecnologias Utilizadas

- **Next.js 15** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Prisma** - ORM e gerenciamento de banco de dados
- **PostgreSQL** - Banco de dados principal com Prisma Accelerate
- **NextAuth.js** - Autenticação
- **TailwindCSS** - Estilização
- **shadcn/ui** - Componentes de interface
- **Lucide React** - Ícones
- **date-fns** - Manipulação de datas
- **Sonner** - Sistema de notificações

## ✨ Funcionalidades

### 📊 Página Pública de Ranking
- Exibição do ranking mensal ordenado por pontuação
- Filtros por mês e ano
- Destaque visual para os 3 primeiros colocados
- Layout responsivo e intuitivo
- Estatísticas detalhadas (pontos, torneios, vitórias, posição média)

### 🔐 Sistema de Autenticação
- Login/logout seguro
- Criptografia de senhas com bcrypt
- Sessões gerenciadas com NextAuth.js
- Áreas protegidas para administração

### 🏆 Gerenciamento de Torneios
- Criar, editar e excluir torneios
- Campos: nome, data, buy-in, descrição, status
- Status: Próximo, Em Andamento, Finalizado, Cancelado
- Visualização de participantes por torneio

### 👥 Gerenciamento de Jogadores
- Cadastro completo de jogadores
- Campos: nome, nickname, email, telefone
- Histórico de participações
- Estatísticas individuais (torneios, pontos, vitórias)

### 📱 Design Responsivo
- Interface adaptável para desktop e mobile
- Animações sutis e feedback visual
- Tema moderno com TailwindCSS
- Componentes acessíveis com shadcn/ui

## 🛠️ Instalação e Configuração

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn

### 1. Clone o repositório
```bash
git clone <url-do-repositorio>
cd poker-ranking
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure as variáveis de ambiente
Crie um arquivo `.env` na raiz do projeto:

```env
# Database - Prisma Accelerate (connection pooling and caching)
DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=YOUR_ACCELERATE_API_KEY"

# Direct Database URL (for migrations and schema operations)
DIRECT_DATABASE_URL="postgres://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require"

# NextAuth.js
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

### 4. Configure o banco de dados PostgreSQL
```bash
# Gerar o cliente Prisma
npx prisma generate

# Aplicar o schema ao banco
npx prisma db push
```

### 5. Popular com dados de exemplo (opcional)
```bash
npm run seed
```

### 6. Iniciar o servidor de desenvolvimento
```bash
npm run dev
```

O sistema estará disponível em http://localhost:3000

## 👤 Credenciais de Acesso

Após executar o seed, você pode fazer login com:
- **Email:** admin@poker.com
- **Senha:** admin123

## 📁 Estrutura do Projeto

```
src/
├── app/                    # Páginas e rotas da aplicação
│   ├── api/               # API Routes
│   │   ├── auth/          # Autenticação
│   │   ├── players/       # Gestão de jogadores
│   │   ├── tournaments/   # Gestão de torneios
│   │   └── ranking/       # API do ranking
│   ├── admin/             # Páginas administrativas
│   ├── login/             # Página de login
│   └── page.tsx           # Página inicial (ranking público)
├── components/            # Componentes React
│   ├── ui/               # Componentes base do shadcn/ui
│   ├── providers/        # Providers (Auth, Theme)
│   └── navbar.tsx        # Navegação principal
├── lib/                  # Utilitários e configurações
│   ├── prisma.ts         # Cliente Prisma
│   ├── auth.ts           # Configuração NextAuth
│   └── utils.ts          # Utilitários gerais
└── types/                # Definições de tipos TypeScript
```

## 🗄️ Modelo de Dados

### Usuários (Users)
- id, email, name, password
- Sistema de autenticação para administradores

### Jogadores (Players)  
- id, name, nickname, email, phone
- Informações básicas dos participantes

### Torneios (Tournaments)
- id, name, date, buyIn, description, status
- Eventos de poker com diferentes status

### Participações (TournamentParticipations)
- Relaciona jogadores com torneios
- position, points, prize
- Armazena resultados e pontuações

## 🎯 Sistema de Pontuação

O ranking é calculado baseado em:
- **Pontos totais** obtidos em todos os torneios
- **Número de torneios** participados
- **Vitórias** (1º lugar)
- **Posição média** nos torneios

## 🔧 Scripts Disponíveis

```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build para produção
npm run start        # Servidor de produção
npm run lint         # Verificação de código
npm run seed         # Popular banco com dados
```

## 🌐 Deploy

### Vercel (Recomendado)
1. Conecte seu repositório ao Vercel
2. Configure as variáveis de ambiente
3. O deploy será automático

### Outras Plataformas
O projeto é compatível com qualquer plataforma que suporte Next.js:
- Netlify
- Railway
- AWS Amplify
- DigitalOcean App Platform

## ⚙️ Variáveis de Ambiente

Crie um arquivo `.env` com:

```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth.js
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

## 🚀 Próximas Funcionalidades

- [ ] Gráficos e estatísticas avançadas
- [ ] Sistema de upload de avatars
- [ ] Notificações por email
- [ ] API pública para integração
- [ ] Modo escuro/claro
- [ ] Export de dados (CSV, PDF)
- [ ] Sistema de rankings por categorias
- [ ] Chat em tempo real durante torneios

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

Para suporte e dúvidas, abra uma issue no repositório ou entre em contato.

---

Desenvolvido com ❤️ utilizando as melhores práticas de desenvolvimento web moderno.
