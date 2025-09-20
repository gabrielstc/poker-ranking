# Campo Suprema ID - Sistema de Propaganda

## Visão Geral
O campo `supremaId` foi adicionado ao modelo `Club` para identificar clubes na plataforma Suprema e exibir propaganda direcionada nas telas de torneios.

## Implementação

### 1. Schema do Banco de Dados
```prisma
model Club {
  id          String   @id @default(cuid())
  name        String   @unique
  slug        String   @unique
  description String?
  logo        String?
  supremaId   String?  // 🆕 ID do clube na Suprema (usado para propaganda)
  isActive    Boolean  @default(true)
  // ... outros campos
}
```

### 2. APIs Atualizadas
- ✅ `POST /api/clubs` - Criar clube com supremaId
- ✅ `PUT /api/clubs/[id]` - Editar clube incluindo supremaId  
- ✅ `GET /api/clubs` - Listar clubes com supremaId
- ✅ `GET /api/public/clubs` - API pública com supremaId
- ✅ `GET /api/public/clubs/[id]` - Clube individual com supremaId

### 3. Contexto do Clube
O `ClubContext` foi atualizado para incluir o campo `supremaId`:

```tsx
interface ClubContextData {
  id: string
  name: string
  slug: string
  logo: string | null
  supremaId: string | null  // 🆕 Novo campo
}
```

## Componente SupremaPropaganda

### Variantes Disponíveis

#### 1. **Banner** (usado em listas de torneios)
```tsx
<SupremaPropaganda 
  supremaId="clube-id-suprema"
  clubName="Nome do Clube"
  variant="banner"
/>
```
- Exibição destacada com gradiente dourado
- Botão de ação proeminente
- Ideal para chamar atenção

#### 2. **Compact** (usado em detalhes de torneio)
```tsx
<SupremaPropaganda 
  supremaId="clube-id-suprema"
  clubName="Nome do Clube"
  variant="compact"
/>
```
- Layout minimalista e discreto
- Ocupa pouco espaço na tela
- Integração sutil com o conteúdo

#### 3. **Default** (usado em páginas admin)
```tsx
<SupremaPropaganda 
  supremaId="clube-id-suprema"
  clubName="Nome do Clube"
  variant="default"
/>
```
- Card completo com informações detalhadas
- Múltiplos CTAs (Call-to-Action)
- Ideal para áreas administrativas

## Integração nas Páginas

### 1. Página de Torneios (`/tournaments`)
```tsx
{currentClub?.supremaId && (
  <SupremaPropaganda 
    supremaId={currentClub.supremaId}
    clubName={currentClub.name}
    variant="banner"
  />
)}
```

### 2. Detalhes do Torneio (`/tournaments/[id]`)
```tsx
{currentClub?.supremaId && (
  <SupremaPropaganda 
    supremaId={currentClub.supremaId}
    clubName={currentClub.name}
    variant="compact"
  />
)}
```

### 3. Admin de Torneios (`/admin/tournaments`)
```tsx
{currentClub?.supremaId && (
  <SupremaPropaganda 
    supremaId={currentClub.supremaId}
    clubName={currentClub.name}
    variant="default"
  />
)}
```

## Como Configurar

### 1. Para Super Admin
1. Acesse a área de administração de clubes
2. Edite o clube desejado
3. Adicione o `supremaId` no campo correspondente
4. Salve as alterações

### 2. Via API
```json
{
  "name": "Nome do Clube",
  "description": "Descrição do clube",
  "logo": "data:image/png;base64,iVBOR...",
  "supremaId": "clube-id-na-suprema"
}
```

## Comportamento

### ✅ Com supremaId configurado:
- Propaganda é exibida em todas as telas de torneios
- Links direcionam para `https://suprema.com/club/{supremaId}`
- Diferentes variantes conforme o contexto da página

### ❌ Sem supremaId:
- Nenhuma propaganda é exibida
- Experiência normal do usuário sem modificações

## URLs da Suprema
- **Perfil do Clube:** `https://suprema.com/club/{supremaId}`
- **Download do App:** `https://suprema.com/download`

## Teste
Acesse `/test-club-context` para:
- Ver o status atual do supremaId
- Entender quando a propaganda é exibida
- Visualizar diferentes variantes do componente

## Benefícios

1. **Marketing Direcionado:** Propaganda contextual baseada no clube
2. **Flexibilidade:** Múltiplas variantes para diferentes contextos
3. **Configuração Simples:** Campo opcional, não afeta clubes existentes
4. **Integração Automática:** Funciona com o sistema de contexto existente
5. **Experiência Consistente:** Design harmonioso com a aplicação