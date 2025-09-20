# 📁 Diretório de Backups

Este diretório armazena backups de dados do sistema de poker ranking.

## 🔒 Segurança

- ⚠️ **Dados sensíveis:** Este diretório contém dados de produção
- 🚫 **Não versionado:** Arquivos de backup são ignorados pelo Git
- 🔐 **Acesso restrito:** Mantenha backups em local seguro

## 📝 Tipos de Arquivo

- `backup-prod-YYYY-MM-DDTHH-mm-ss.json` - Backups de produção
- `backup-dev-YYYY-MM-DDTHH-mm-ss.json` - Backups de desenvolvimento (se necessário)

## 🎯 Uso

Backups são gerados automaticamente pelos scripts em `../scripts/`:

- `backup-prod.js` - Cria backup de produção
- `restore-backup.js` - Lista e restaura backups disponíveis

---

> **⚠️ IMPORTANTE:** Nunca commite arquivos de backup no Git. Eles contêm dados sensíveis de produção.