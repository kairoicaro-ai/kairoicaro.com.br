#!/bin/bash
# ══════════════════════════════════════════════════════════════
# KIAA — Substituir placeholder GA4 pelo Measurement ID real
# Uso: bash scripts/set-ga4-id.sh G-ABC1234567
# ══════════════════════════════════════════════════════════════
set -euo pipefail

if [ $# -ne 1 ]; then
    echo "Uso: bash scripts/set-ga4-id.sh G-SEU_ID_AQUI"
    echo "Exemplo: bash scripts/set-ga4-id.sh G-ABC1234567"
    exit 1
fi

GA4_ID="$1"

if [[ ! "$GA4_ID" =~ ^G-[A-Z0-9]{8,12}$ ]]; then
    echo "ERRO: ID inválido. Formato esperado: G-XXXXXXXXXX"
    exit 1
fi

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_DIR"

echo "═══ KIAA GA4 Setup ═══"
echo "Measurement ID: $GA4_ID"
echo ""

COUNT=0
for f in *.html; do
    if grep -q "G-XXXXXXXXXX" "$f" 2>/dev/null; then
        sed -i "s/G-XXXXXXXXXX/$GA4_ID/g" "$f"
        COUNT=$((COUNT + 1))
        echo "  ✓ $f"
    fi
done

echo ""
echo "═══ $COUNT arquivos atualizados com $GA4_ID ═══"
echo ""
echo "Próximos passos:"
echo "  git add *.html"
echo "  git commit -m 'Config: GA4 $GA4_ID em $COUNT páginas'"
echo "  git push origin main"
