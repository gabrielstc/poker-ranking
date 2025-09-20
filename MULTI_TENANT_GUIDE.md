# Sistema Multi-Tenant - Resumo das Mudanças

## Visão Geral
O sistema foi transformado de uma aplicação single-tenant para multi-tenant, permitindo múltiplos clubes de poker com seus próprios administradores, jogadores e torneios.

## Mudanças no Banco de Dados

### Novo Modelo: Club
```prisma
model Club {
  id          String   @id @default(cuid())
  name        String   @unique
  description String?
  logo        String?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relacionamentos
  users          User[]
  players        Player[]
  tournaments    Tournament[]

  @@map("clubs")
}
```

### Enum UserRole
```prisma
enum UserRole {
  SUPER_ADMIN    // Gerencia clubes e administradores
  CLUB_ADMIN     // Administra apenas seu clube
}
```

### Relacionamentos Atualizados
- **User**: Agora tem `role` e `clubId` (opcional para super admin)
- **Player**: Obrigatoriamente pertence a um clube (`clubId`)
- **Tournament**: Obrigatoriamente pertence a um clube (`clubId`)

### Constraint Unique
- `Player.nickname` agora é único apenas dentro do clube (`nickname_clubId`)

## Sistema de Autenticação

### Roles de Usuário
1. **SUPER_ADMIN**: 
   - Pode criar e gerenciar clubes
   - Pode atribuir administradores aos clubes
   - Tem acesso total ao sistema

2. **CLUB_ADMIN**:
   - Administra apenas jogadores e torneios do seu clube
   - Não pode acessar dados de outros clubes

### Novas Funções de Permissão
- `requireSuperAdmin()`: Requer super admin
- `requireClubAdmin()`: Requer admin de clube 
- `getUserClubFilter()`: Filtra dados por clube do usuário
- `canAccessClub()`: Verifica acesso a clube específico

## APIs Atualizadas

### `/api/clubs`
- **GET**: Lista clubes (super admin vê todos, club admin vê apenas o seu)
- **POST**: Criar clube (apenas super admin)

### `/api/players`
- **GET**: Lista jogadores de todos os clubes (API pública)
- **POST**: Criar jogador no clube do usuário (apenas club admin)

### `/api/admin/players`
- **GET**: Lista jogadores filtrados por clube do usuário

## Interfaces Atualizadas

### Navbar
- **Super Admin**: Link para "Gerenciar Clubes"
- **Club Admin**: Links para torneios, jogadores e usuários
- Mostra opções diferentes baseadas no role

### Nova Página: `/super-admin`
- Dashboard para gerenciar clubes
- Visualiza estatísticas de cada clube
- Permite criar novos clubes e gerenciar administradores

## Migração de Dados

### Script de Migração
- Cria tabela `clubs` com relacionamentos
- Adiciona campos `role` e `clubId` em `users`
- Adiciona campo `clubId` em `players` e `tournaments`
- Atualiza constraint unique de players

### Dados Iniciais
- Clube padrão "Clube Principal"
- Super admin: `superadmin@poker.com` / `admin123`

## Segurança

### Isolamento de Dados
- Club admins só acessam dados do seu clube
- APIs filtram automaticamente por clube
- Verificações de permissão em todas as rotas protegidas

### Validações
- Verificação de role em todas as APIs
- Validação de acesso a clubes específicos
- Tratamento de erros de autorização

## Como Usar

### Para Super Admin
1. Login com `superadmin@poker.com`
2. Acesse `/super-admin` para gerenciar clubes
3. Crie novos clubes e atribua administradores

### Para Club Admin
1. Login com credenciais do clube
2. Acesse áreas de administração (torneios, jogadores)
3. Dados automaticamente filtrados por clube

### Criação de Novos Clubes
1. Super admin cria clube via interface
2. Super admin cria usuário club admin
3. Associa usuário ao clube
4. Club admin pode começar a gerenciar seu clube

## Comandos Importantes

```bash
# Aplicar migração
npx prisma migrate deploy

# Gerar cliente Prisma
npx prisma generate

# Criar super admin inicial
node scripts/create-super-admin.js
```

## Credenciais Padrão

**Super Admin:**
- Email: `superadmin@poker.com`
- Senha: `admin123`

⚠️ **IMPORTANTE**: Altere a senha após o primeiro login!

## Próximos Passos Sugeridos

1. Implementar CRUD completo para clubes
2. Interface para criar/editar administradores de clube
3. Sistema de convites para novos clubes
4. Dashboard com métricas por clube
5. Configurações específicas por clube (logo, cores, etc.)
6. Sistema de billing por clube (se necessário)