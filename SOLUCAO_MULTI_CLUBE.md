# Proposta de Schema Multi-Clube

## Problema Atual
O schema atual não permite que um mesmo e-mail seja administrador de múltiplos clubes devido à constraint `@unique` no campo email.

## Solução Proposta: Relacionamento Many-to-Many

### Novo Schema Sugerido

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  password  String
  role      UserRole @default(CLUB_ADMIN)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relacionamento many-to-many com clubes
  clubMemberships UserClub[]

  @@map("users")
}

model Club {
  id          String   @id @default(cuid())
  name        String   @unique
  slug        String   @unique
  description String?
  logo        String?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relacionamentos
  userMemberships UserClub[]
  players         Player[]
  tournaments     Tournament[]

  @@map("clubs")
}

// Nova tabela de relacionamento
model UserClub {
  id         String   @id @default(cuid())
  userId     String
  clubId     String
  role       ClubRole @default(ADMIN)
  isActive   Boolean  @default(true)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  club Club @relation(fields: [clubId], references: [id], onDelete: Cascade)

  @@unique([userId, clubId])
  @@map("user_clubs")
}

enum UserRole {
  SUPER_ADMIN
  USER
}

enum ClubRole {
  OWNER      // Dono do clube
  ADMIN      // Administrador
  MODERATOR  // Moderador (apenas visualização)
}
```

### Vantagens da Solução

1. **Flexibilidade Total**: Um usuário pode administrar N clubes
2. **Roles Granulares**: Diferentes níveis de acesso por clube
3. **Histórico**: Pode manter histórico de participações
4. **Escalabilidade**: Preparado para futuras expansões

### Mudanças Necessárias

#### 1. Atualização do Schema
- Remover `clubId` de `User`
- Criar modelo `UserClub`
- Atualizar relacionamentos

#### 2. Atualização da Autenticação
```typescript
// Novo formato da sessão
interface Session {
  user: {
    id: string
    email: string
    name: string
    role: 'SUPER_ADMIN' | 'USER'
    clubs: Array<{
      id: string
      name: string
      slug: string
      role: 'OWNER' | 'ADMIN' | 'MODERATOR'
    }>
    currentClubId?: string // Clube ativo na sessão
  }
}
```

#### 3. Middleware de Seleção de Clube
```typescript
// Usuário seleciona qual clube quer administrar
function ClubSelector() {
  const { session, switchClub } = useAuth()
  
  return (
    <Select onValueChange={switchClub}>
      {session.user.clubs.map(club => (
        <SelectItem key={club.id} value={club.id}>
          {club.name}
        </SelectItem>
      ))}
    </Select>
  )
}
```

#### 4. APIs Atualizadas
```typescript
// GET /api/admin/players
// Filtra por clube ativo da sessão
const currentClubId = session.user.currentClubId
const players = await prisma.player.findMany({
  where: { clubId: currentClubId }
})
```

### Implementação Gradual

#### Fase 1: Migração Segura
1. Criar nova tabela `UserClub`
2. Migrar dados existentes
3. Manter compatibilidade temporária

#### Fase 2: Atualização do Frontend
1. Adicionar seletor de clube
2. Atualizar componentes para usar clube ativo
3. Implementar breadcrumbs de contexto

#### Fase 3: Limpeza
1. Remover campo `clubId` de `User`
2. Atualizar todas as APIs
3. Testes completos

### Comando de Migração
```sql
-- 1. Criar tabela UserClub
CREATE TABLE user_clubs (
  id String PRIMARY KEY,
  userId String NOT NULL,
  clubId String NOT NULL,
  role String DEFAULT 'ADMIN',
  isActive Boolean DEFAULT true,
  createdAt DateTime DEFAULT now(),
  updatedAt DateTime DEFAULT now(),
  UNIQUE(userId, clubId)
);

-- 2. Migrar dados existentes
INSERT INTO user_clubs (userId, clubId, role)
SELECT id, clubId, 'ADMIN' FROM users WHERE clubId IS NOT NULL;

-- 3. Depois de confirmar: ALTER TABLE users DROP COLUMN clubId;
```

## Alternativa Simples (Não Recomendada)

Se quiser uma solução rápida temporária:

```prisma
model User {
  email     String   // ❌ Remover @unique
  clubId    String?
  // Adicionar constraint composta
  @@unique([email, clubId])
}
```

Mas isso criaria registros duplicados do mesmo usuário, complicando autenticação.

## Recomendação

**Implementar a Solução Many-to-Many** é a abordagem mais robusta e preparada para o futuro, mesmo que requeira mais trabalho inicial.