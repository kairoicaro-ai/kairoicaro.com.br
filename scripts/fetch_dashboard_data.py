#!/usr/bin/env python3
"""
Busca dados públicos para o dashboard KIAA.
Executado diariamente às 04h BRT via GitHub Actions.
"""

import json
import sys
from datetime import datetime, timezone
from pathlib import Path

try:
    import requests
    from bs4 import BeautifulSoup
except ImportError:
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "requests", "beautifulsoup4"])
    import requests
    from bs4 import BeautifulSoup

SCRIPT_DIR = Path(__file__).parent
DATA_DIR = SCRIPT_DIR.parent / "data"
OUTPUT_FILE = DATA_DIR / "dashboard.json"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
}


def fetch_ibama_summary():
    """Tenta buscar resumo de autuações do IBAMA em Roraima."""
    try:
        # IBAMA open data portal
        url = "https://dadosabertos.ibama.gov.br/dados/SICAFI/RR/Quantidade/multasDistribuidasRR.json"
        resp = requests.get(url, headers=HEADERS, timeout=15)
        if resp.status_code == 200:
            data = resp.json()
            return {"status": "ok", "source": "IBAMA Dados Abertos", "data": data[:10] if isinstance(data, list) else data}
    except Exception as e:
        pass
    return {"status": "unavailable", "source": "IBAMA", "message": "Dados serão atualizados em breve"}


def fetch_mapbiomas_alerts():
    """Busca resumo de alertas do MapBiomas."""
    try:
        # MapBiomas Alerta API (public)
        url = "https://plataforma.alerta.mapbiomas.org/api/v1/alerts/stats"
        resp = requests.get(url, headers=HEADERS, timeout=15)
        if resp.status_code == 200:
            return {"status": "ok", "source": "MapBiomas Alerta", "data": resp.json()}
    except Exception:
        pass
    return {"status": "unavailable", "source": "MapBiomas", "message": "Dados serão atualizados em breve"}


def main():
    print(f"Buscando dados do dashboard... ({datetime.now(timezone.utc).isoformat()})")

    dashboard = {
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "sources": {
            "ibama_roraima": fetch_ibama_summary(),
            "mapbiomas_alerts": fetch_mapbiomas_alerts(),
        },
        "embeds": {
            "mapbiomas_plataforma": "https://plataforma.brasil.mapbiomas.org/",
            "mapbiomas_alerta": "https://alerta.mapbiomas.org/",
            "smartlab_sst": "https://smartlabbr.org/sst",
            "cnj_estatisticas": "https://painel-estatistica.stg.cloud.cnj.jus.br/",
            "ibama_autuacoes": "https://autuacoes.ibama.gov.br/",
            "dados_ambientais": "https://dadosambientais.com.br/",
            "ibama_dados_abertos": "https://dadosabertos.ibama.gov.br/"
        }
    }

    DATA_DIR.mkdir(parents=True, exist_ok=True)

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(dashboard, f, ensure_ascii=False, indent=2)

    print(f"Dashboard salvo em {OUTPUT_FILE}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
