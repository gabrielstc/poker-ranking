# Upload de Logos para Clubes

## Funcionalidade Implementada

Foi implementado um sistema completo de upload de logos para clubes, permitindo que administradores façam upload de arquivos PNG, JPG, JPEG ou WebP para serem usados como logos dos clubes.

## Componentes Criados

### 1. API de Upload (`/api/upload`)
- **Endpoint**: `POST /api/upload`
- **Funcionalidade**: Recebe arquivos de imagem e converte para base64
- **Validações**:
  - Tipos permitidos: PNG, JPG, JPEG, WebP
  - Tamanho máximo: 5MB
  - Verificação de autenticação e permissões
- **Retorno**: Data URL em base64 para armazenamento no banco

### 2. Componente ImageUpload
- **Arquivo**: `src/components/ui/image-upload.tsx`
- **Funcionalidade**: 
  - Interface drag-and-drop para upload de imagens
  - Preview da imagem selecionada
  - Validação no frontend
  - Feedback visual durante upload
  - Opção para trocar ou remover imagem

### 3. Integração nos Formulários
- **Arquivo**: `src/app/super-admin/page.tsx`
- **Atualizações**:
  - Substituição do campo "URL do Logo" pelo componente de upload
  - Exibição das logos nos cards dos clubes
  - Suporte tanto para criação quanto edição de clubes

## Como Usar

### 1. Criando um Clube com Logo
1. Acesse a página de Super Admin
2. Clique em "Novo Clube"
3. Preencha nome e descrição
4. Na seção "Logo do Clube":
   - Clique na área ou arraste um arquivo de imagem
   - Selecione um arquivo PNG, JPG, JPEG ou WebP (máximo 5MB)
   - Visualize o preview da imagem
5. Clique em "Criar Clube"

### 2. Editando Logo de um Clube
1. Na lista de clubes, clique em "Editar" no clube desejado
2. Na seção "Logo do Clube":
   - Para trocar: clique em "Trocar" sobre a imagem atual
   - Para remover: clique no "X" no canto superior direito
   - Para adicionar: clique na área de upload
3. Clique em "Salvar Alterações"

### 3. Visualização das Logos
- As logos aparecem automaticamente nos cards dos clubes
- Tamanho de exibição: 48x48px (3rem)
- Layout responsivo com fallback quando não há logo

## Tecnologias Utilizadas

### Backend
- **Next.js API Routes**: Para endpoint de upload
- **Buffer**: Para conversão de arquivo para base64
- **Next-auth**: Para autenticação e autorização

### Frontend
- **React Hooks**: useState, useEffect, useRef, useCallback
- **Tailwind CSS**: Para estilização responsiva
- **Lucide React**: Para ícones
- **Sonner**: Para notificações toast

### Banco de Dados
- **Prisma**: ORM utilizado
- **PostgreSQL**: Banco de dados
- **Campo logo**: String opcional que armazena data URL base64

## Estrutura de Dados

```typescript
interface Club {
  id: string
  name: string
  description: string | null
  logo: string | null  // Data URL base64 ou URL externa
  isActive: boolean
  // ... outros campos
}
```

## Validações Implementadas

### Upload de Arquivo
- ✅ Tipos permitidos: PNG, JPG, JPEG, WebP
- ✅ Tamanho máximo: 5MB
- ✅ Autenticação obrigatória
- ✅ Permissões: SUPER_ADMIN ou CLUB_ADMIN

### Interface
- ✅ Drag and drop
- ✅ Preview de imagem
- ✅ Feedback de loading
- ✅ Tratamento de erros
- ✅ Validação visual de arquivos

## Benefícios

1. **Experiência do Usuário**: Interface intuitiva com drag-and-drop
2. **Segurança**: Validação de tipos e tamanhos de arquivo
3. **Performance**: Imagens convertidas para base64, eliminando necessidade de servidor de arquivos
4. **Responsividade**: Layout adaptativo em diferentes tamanhos de tela
5. **Manutenção**: Dados centralizados no banco de dados principal

## Próximos Passos Possíveis

1. **Otimização de Imagens**: Implementar redimensionamento automático
2. **Servidor de Arquivos**: Migrar para storage externo (AWS S3, Cloudinary)
3. **Formatos Adicionais**: Suporte para SVG
4. **Compressão**: Reduzir tamanho dos arquivos automaticamente
5. **Galeria**: Banco de logos pré-definidas para seleção rápida