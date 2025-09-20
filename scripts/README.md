# 🗄️ Scripts de Migração e Backup - Poker Ranking

Este diretório contém scripts para migração segura de dados entre ambientes de produção e desenvolvimento.

## 📋 Scripts Disponíveis

### 1. `backup-prod.js` - Backup de Produção
Cria um backup completo dos dados de produção em formato JSON.

```bash
node scripts/backup-prod.js
```

**O que faz:**
- Conecta ao banco de produção usando `PROD_DATABASE_URL`
- Extrai todos os dados preservando ordem de dependências
- Salva backup com timestamp em `backups/backup-prod-YYYY-MM-DDTHH-mm-ss.json`
- Inclui metadados e estatísticas

### 2. `migrate-prod-to-dev.js` - Migração Completa
Migra dados de produção diretamente para desenvolvimento.

```bash
node scripts/migrate-prod-to-dev.js
```

**O que faz:**
- ⚠️ **ATENÇÃO: APAGA todos os dados em desenvolvimento**
- Copia dados diretamente de produção para desenvolvimento
- Preserva IDs e relacionamentos originais
- Valida integridade após migração
- Solicita confirmação antes de executar

### 3. `restore-backup.js` - Restaurar Backup
Restaura um backup específico para o ambiente de desenvolvimento.

```bash
node scripts/restore-backup.js
```

**O que faz:**
- Lista backups disponíveis
- Usa automaticamente o backup mais recente
- ⚠️ **ATENÇÃO: APAGA todos os dados em desenvolvimento**
- Restaura dados do backup selecionado
- Solicita confirmação antes de executar

## 🔧 Configuração

### Variáveis de Ambiente Necessárias (.env)

```env
# Produção
PROD_DATABASE_URL="sua_url_de_producao"

# Desenvolvimento  
DEV_DATABASE_URL="sua_url_de_desenvolvimento"
```

### Pré-requisitos
- Node.js instalado
- Dependências do projeto (`npm install`)
- Acesso aos bancos de produção e desenvolvimento
- Prisma configurado corretamente

## 🚀 Fluxo Recomendado

### Opção 1: Migração Direta (Mais Rápida)
```bash
# Migrar dados de produção diretamente para desenvolvimento
node scripts/migrate-prod-to-dev.js
```

### Opção 2: Via Backup (Mais Segura)
```bash
# 1. Criar backup de produção
node scripts/backup-prod.js

# 2. Restaurar backup em desenvolvimento
node scripts/restore-backup.js
```

## 📊 Dados Migrados

Os scripts migram todas as tabelas na ordem correta:

1. **Clubes** (`clubs`)
2. **Usuários** (`users`) 
3. **Jogadores** (`players`)
4. **Torneios** (`tournaments`)
5. **Participações** (`tournament_participations`)

## ⚠️ Importante

### Segurança
- ✅ **Sempre fazer backup antes de migrar**
- ✅ **Scripts solicitam confirmação antes de executar**
- ✅ **Validação de integridade após migração**
- ❌ **NUNCA execute em produção por engano**

### Limitações
- Scripts não migram índices customizados
- Sequências (auto-increment) podem precisar de ajuste
- Conexões devem estar estáveis durante todo o processo

## 🐛 Troubleshooting

### Erro de Conexão
```
❌ Erro: P1001 Database connection error
```
**Solução:** Verifique as URLs de conexão no `.env`

### Erro de Permissão
```
❌ Erro: P2010 Raw query failed
```
**Solução:** Confirme permissões de leitura/escrita nos bancos

### Erro de Schema
```
❌ Erro: Unknown column
```
**Solução:** Execute `npx prisma db push` nos dois ambientes

## 📁 Estrutura de Backup

```json
{
  "metadata": {
    "timestamp": "2025-09-20T16:30:00.000Z",
    "version": "1.0", 
    "source": "production",
    "totalRecords": 1250
  },
  "data": {
    "clubs": [...],
    "users": [...],
    "players": [...],
    "tournaments": [...],
    "participations": [...]
  }
}
```

---

> **💡 Dica:** Execute sempre primeiro um backup antes de qualquer migração para garantir que você possa reverter se necessário.