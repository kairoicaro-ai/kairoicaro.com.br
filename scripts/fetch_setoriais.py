#!/usr/bin/env python3
"""
Busca noticias setoriais relevantes para o KIAA.
Fontes: IBAMA, FEMARH, Migalhas, ConJur, JOTA
Executado diariamente as 04h BRT via GitHub Actions.
"""

import json
import re
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
OUTPUT_FILE = DATA_DIR / "setoriais.json"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.5",
}

# Keywords for relevance filtering by sector
KEYWORDS = {
    "ambiental": ["ibama", "femarh", "icmbio", "desmatamento", "licenciamento", "ambiental", "florestal",
                   "carbono", "redd", "car", "reserva legal", "embargo", "multa ambiental", "queimada",
                   "biodiversidade", "unidade de conservacao", "poluicao", "amazonia", "roraima"],
    "varejo": ["supermercado", "varejo", "consumidor", "cdc", "recall", "anvisa", "procon",
               "comercio", "loja", "atacado", "distribuidora", "alimento", "produto"],
    "empresarial": ["empresa", "societario", "compliance", "lgpd", "tributario", "fiscal",
                    "reforma tributaria", "ibs", "cbs", "imposto", "recuperacao judicial",
                    "falencia", "contrato", "trabalhista", "rescisao", "clt"]
}

MAX_PER_SOURCE = 3


def clean_text(text):
    if not text:
        return ""
    text = re.sub(r'<[^>]+>', '', str(text))
    text = re.sub(r'\s+', ' ', text).strip()
    return text[:400]


def classify_sector(title, summary):
    """Classify a news item into a sector based on keywords."""
    combined = (title + " " + summary).lower()
    scores = {}
    for sector, keywords in KEYWORDS.items():
        score = sum(1 for kw in keywords if kw in combined)
        if score > 0:
            scores[sector] = score

    if not scores:
        return "empresarial"  # default
    return max(scores, key=scores.get)


def fetch_ibama_news():
    """Fetch news from IBAMA."""
    items = []
    try:
        url = "https://www.gov.br/ibama/pt-br/assuntos/noticias"
        resp = requests.get(url, headers=HEADERS, timeout=15)
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, "html.parser")

        articles = soup.select("article, .tileItem, .noticias-item, .listagem-item")[:10]
        if not articles:
            articles = soup.select("h2 a, h3 a, .titulo a")[:10]

        for article in articles[:MAX_PER_SOURCE]:
            title_el = article.select_one("h2, h3, .title, a")
            link_el = article.select_one("a[href]")
            desc_el = article.select_one("p, .description, .resumo")

            title = clean_text(title_el.text) if title_el else ""
            link = link_el.get("href", "") if link_el else ""
            if link and not link.startswith("http"):
                link = "https://www.gov.br" + link

            if title and len(title) > 15:
                items.append({
                    "setor": "ambiental",
                    "title": title,
                    "summary": clean_text(desc_el.text) if desc_el else "",
                    "source": "IBAMA / Analise KIAA",
                    "date": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
                    "url": link
                })

        print(f"  IBAMA: {len(items)} noticias")
    except Exception as e:
        print(f"  IBAMA ERRO: {e}")
    return items


def fetch_migalhas():
    """Fetch news from Migalhas."""
    items = []
    try:
        url = "https://www.migalhas.com.br/quentes"
        resp = requests.get(url, headers=HEADERS, timeout=15)
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, "html.parser")

        articles = soup.select("article, .mg-card, .noticia-item, .listagem-item")[:10]
        if not articles:
            for a_tag in soup.select("h2 a, h3 a, .title a")[:10]:
                title = clean_text(a_tag.text)
                link = a_tag.get("href", "")
                if link and not link.startswith("http"):
                    link = "https://www.migalhas.com.br" + link
                if title and len(title) > 15:
                    sector = classify_sector(title, "")
                    items.append({
                        "setor": sector,
                        "title": title,
                        "summary": "",
                        "source": "Migalhas / Analise KIAA",
                        "date": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
                        "url": link
                    })
        else:
            for article in articles[:MAX_PER_SOURCE * 2]:
                title_el = article.select_one("h2, h3, .title, a")
                link_el = article.select_one("a[href]")
                desc_el = article.select_one("p, .description, .resumo")

                title = clean_text(title_el.text) if title_el else ""
                link = link_el.get("href", "") if link_el else ""
                if link and not link.startswith("http"):
                    link = "https://www.migalhas.com.br" + link

                if title and len(title) > 15:
                    sector = classify_sector(title, clean_text(desc_el.text) if desc_el else "")
                    items.append({
                        "setor": sector,
                        "title": title,
                        "summary": clean_text(desc_el.text) if desc_el else "",
                        "source": "Migalhas / Analise KIAA",
                        "date": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
                        "url": link
                    })

        print(f"  Migalhas: {len(items)} noticias")
    except Exception as e:
        print(f"  Migalhas ERRO: {e}")
    return items


def main():
    print(f"Buscando noticias setoriais... ({datetime.now(timezone.utc).isoformat()})")

    all_items = []
    all_items.extend(fetch_ibama_news())
    all_items.extend(fetch_migalhas())

    # Deduplicate
    seen = set()
    unique = []
    for item in all_items:
        key = item["title"].lower().strip()[:50]
        if key not in seen and len(item["title"]) > 15:
            seen.add(key)
            unique.append(item)

    # Sort by date
    unique.sort(key=lambda x: x.get("date", ""), reverse=True)

    # Limit per sector
    sector_counts = {}
    final = []
    for item in unique:
        s = item["setor"]
        sector_counts[s] = sector_counts.get(s, 0) + 1
        if sector_counts[s] <= 5:
            final.append(item)

    # If we got new items, merge with existing; otherwise keep existing
    existing_items = []
    if OUTPUT_FILE.exists():
        try:
            with open(OUTPUT_FILE, "r", encoding="utf-8") as f:
                existing = json.load(f)
                existing_items = existing.get("items", [])
        except Exception:
            pass

    if final:
        # Merge: new items first, then existing (dedup by title)
        merged_titles = {i["title"].lower().strip()[:50] for i in final}
        for item in existing_items:
            key = item["title"].lower().strip()[:50]
            if key not in merged_titles:
                final.append(item)
                merged_titles.add(key)

        # Keep max 15 items
        final = final[:15]
    else:
        final = existing_items

    output = {
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "total": len(final),
        "items": final
    }

    DATA_DIR.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print(f"\nTotal: {len(final)} noticias salvas em {OUTPUT_FILE}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
