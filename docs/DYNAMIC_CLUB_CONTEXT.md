# Sistema de Contexto de Clube Dinâmico

## Visão Geral
O sistema implementa um contexto React que detecta automaticamente o clube atual baseado na URL ou sessão do usuário, permitindo que a navbar e outras partes da aplicação mostrem informações específicas do clube (logo e nome).

## Como Funciona

### 1. ClubContext (`src/contexts/ClubContext.tsx`)
- **Propósito**: Gerenciar o estado global do clube atual
- **Detecção automática**: Identifica o clube baseado em:
  - URL com padrão `/clube/[slug]` → busca clube pelo slug
  - Usuário logado como CLUB_ADMIN → usa clube da sessão
  - Fallback para nenhum clube específico

### 2. Navbar Dinâmica (`src/components/navbar.tsx`)
- **Logo dinâmica**: Mostra logo do clube atual ou logo padrão
- **Nome dinâmico**: Exibe nome do clube atual ou "Suprema Five Series"
- **Responsiva**: Adapta texto para telas menores

### 3. API Pública (`src/app/api/public/clubs/[id]/route.ts`)
- **Acesso público**: Não requer autenticação
- **Busca flexível**: Aceita ID numérico ou slug
- **Apenas clubes ativos**: Filtra por `active: true`

## Cenários de Uso

### 1. Página Pública do Clube (`/clube/five-series`)
```
URL: /clube/five-series
Contexto: Detecta clube "five-series" via slug
Navbar: Mostra logo e nome do "Suprema Five Series"
```

### 2. Admin Logado
```
Usuário: CLUB_ADMIN do clube "Suprema Five Series"
Contexto: Usa clubId da sessão
Navbar: Mostra logo e nome do clube do admin
```

### 3. Página Inicial
```
URL: /
Contexto: Nenhum clube específico
Navbar: Logo e nome padrão
```

## Estrutura de Arquivos

```
src/
├── contexts/
│   └── ClubContext.tsx          # Context React para gerenciar clube atual
├── components/
│   └── navbar.tsx               # Navbar com logo/nome dinâmico
├── app/
│   ├── layout.tsx               # Provider do contexto
│   ├── api/
│   │   └── public/
│   │       └── clubs/
│   │           └── [id]/
│   │               └── route.ts # API pública de clubes
│   ├── clube/
│   │   └── [slug]/
│   │       └── page.tsx         # Página pública do clube
│   └── test-club-context/
│       └── page.tsx             # Página de teste (development)
```

## Implementação

### 1. ClubProvider no Layout
```tsx
<AuthProvider>
  <ClubProvider>
    <Navbar />
    <main>{children}</main>
  </ClubProvider>
</AuthProvider>
```

### 2. Hook useClub
```tsx
const { currentClub } = useClub()

// currentClub contém:
// - id: string
// - name: string  
// - slug: string
// - logo: string | null
```

### 3. Navbar Dinâmica
```tsx
{currentClub?.logo ? (
  <Image src={currentClub.logo} alt={`${currentClub.name} logo`} />
) : (
  <Image src="/suprema-five-serie.png" alt="Default logo" />
)}
<span>{currentClub?.name || "Suprema Five Series"}</span>
```

## Benefícios

1. **UX Consistente**: Logo e nome do clube sempre visíveis
2. **Contexto Automático**: Detecção inteligente sem configuração manual
3. **Multi-tenant**: Suporta múltiplos clubes na mesma aplicação
4. **Performante**: Cache automático e otimizações React
5. **Flexível**: Funciona em páginas públicas e área administrativa

## Testes

Acesse `/test-club-context` para testar diferentes cenários:
- Navegação entre páginas
- Detecção de clube via URL
- Comportamento com/sem login
- Visualização do estado do contexto

## Próximos Passos

1. **Cache**: Implementar cache local para informações do clube
2. **Erro handling**: Melhorar tratamento de erros de rede
3. **Loading states**: Estados de carregamento mais granulares
4. **SEO**: Meta tags dinâmicas baseadas no clube atual