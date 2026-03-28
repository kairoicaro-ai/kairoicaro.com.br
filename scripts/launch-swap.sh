#!/bin/bash
# ══════════════════════════════════════════════════════════════
# KIAA Launch Swap — Executa em 01/04/2026 12h BRT
# Troca index.html (placeholder) ↔ novo-index.html (site real)
# ══════════════════════════════════════════════════════════════
set -euo pipefail

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_DIR"

echo "═══ KIAA LAUNCH SWAP ═══"
echo "Diretório: $REPO_DIR"
echo ""

# Verificações de segurança
if [ ! -f "novo-index.html" ]; then
    echo "ERRO: novo-index.html não encontrado. Swap cancelado."
    exit 1
fi
if [ ! -f "index.html" ]; then
    echo "ERRO: index.html não encontrado. Swap cancelado."
    exit 1
fi
if [ ! -f "CNAME" ]; then
    echo "ERRO: CNAME não encontrado. Swap cancelado."
    exit 1
fi

echo "[1/7] Backup: index.html → index-placeholder.html"
cp index.html index-placeholder.html

echo "[2/7] Swap: novo-index.html → index.html"
cp novo-index.html index.html

echo "[3/7] Atualizar canonical em index.html"
sed -i 's|href="https://kairoicaro.com.br/novo-index.html"|href="https://kairoicaro.com.br/"|g' index.html

echo "[4/7] Atualizar robots meta em index.html (noindex → index)"
sed -i 's|content="noindex, nofollow"|content="index, follow"|g' index.html

echo "[5/7] Atualizar 404.html (novo-index → index)"
sed -i 's|href="novo-index.html"|href="index.html"|g' 404.html

echo "[6/7] Atualizar portal-login.html (novo-index → index)"
sed -i 's|href="novo-index.html"|href="index.html"|g' portal-login.html

echo "[7/7] Atualizar sw.js cache (novo-index → index)"
sed -i "s|'/novo-index.html'|'/index.html'|g" sw.js
# Bump cache version
sed -i "s|kiaa-site-v2|kiaa-site-v3|g" sw.js

echo ""
echo "═══ SWAP CONCLUÍDO ═══"
echo ""
echo "Próximos passos:"
echo "  1. git add -A"
echo "  2. git commit -m 'Launch: swap index.html ↔ novo-index.html'"
echo "  3. git push origin main"
echo "  4. Aguardar 1-2 min para deploy no GitHub Pages"
echo "  5. Verificar https://kairoicaro.com.br/"
echo ""
echo "ATENÇÃO: NÃO deletar novo-index.html (manter como backup)"
echo "ATENÇÃO: NÃO tocar no CNAME"
