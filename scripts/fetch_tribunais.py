#!/usr/bin/env python3
"""
Busca noticias dos tribunais (STF, STJ, TRF1, TRT11, TST) e salva como JSON.
Executado via GitHub Actions a cada 6 horas.
"""

import json
import os
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

try:
    import requests
    from bs4 import BeautifulSoup
except ImportError:
    print("Instalando dependencias...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "requests", "beautifulsoup4"])
    import requests
    from bs4 import BeautifulSoup

# Diretorio de saida
SCRIPT_DIR = Path(__file__).parent
DATA_DIR = SCRIPT_DIR.parent / "data"
OUTPUT_FILE = DATA_DIR / "informativos.json"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.5",
}

MAX_PER_TRIBUNAL = 3


def clean_text(text):
    """Remove HTML, whitespace excessivo e caracteres estranhos."""
    if not text:
        return ""
    text = re.sub(r'<[^>]+>', '', str(text))
    text = re.sub(r'\s+', ' ', text).strip()
    return text[:300]  # limita resumo


def parse_date(date_str):
    """Tenta extrair data de diferentes formatos."""
    if not date_str:
        return datetime.now(timezone.utc).strftime("%Y-%m-%d")

    date_str = clean_text(date_str).strip()

    # Formatos comuns em sites BR
    formats = [
        "%d/%m/%Y",
        "%d/%m/%Y %H:%M",
        "%Y-%m-%dT%H:%M:%S",
        "%Y-%m-%d",
        "%a, %d %b %Y %H:%M:%S %z",
        "%d de %B de %Y",
    ]

    # Meses em portugues
    meses_pt = {
        'janeiro': '01', 'fevereiro': '02', 'marco': '03', 'abril': '04',
        'maio': '05', 'junho': '06', 'julho': '07', 'agosto': '08',
        'setembro': '09', 'outubro': '10', 'novembro': '11', 'dezembro': '12',
        'março': '03',
    }

    for fmt in formats:
        try:
            dt = datetime.strptime(date_str, fmt)
            return dt.strftime("%Y-%m-%d")
        except ValueError:
            continue

    # Tenta formato "DD de MES de AAAA"
    match = re.search(r'(\d{1,2})\s+de\s+(\w+)\s+de\s+(\d{4})', date_str.lower())
    if match:
        dia, mes, ano = match.groups()
        if mes in meses_pt:
            return f"{ano}-{meses_pt[mes]}-{dia.zfill(2)}"

    # Tenta extrair qualquer data no formato DD/MM/YYYY
    match = re.search(r'(\d{2})/(\d{2})/(\d{4})', date_str)
    if match:
        return f"{match.group(3)}-{match.group(2)}-{match.group(1)}"

    return datetime.now(timezone.utc).strftime("%Y-%m-%d")


def fetch_stj():
    """Busca noticias do STJ via RSS."""
    items = []
    try:
        url = "https://res.stj.jus.br/hrestp-c-portalp/RSS.xml"
        resp = requests.get(url, headers=HEADERS, timeout=15)
        resp.raise_for_status()

        soup = BeautifulSoup(resp.content, "lxml-xml")
        for item in soup.find_all("item")[:MAX_PER_TRIBUNAL]:
            title = clean_text(item.find("title").text) if item.find("title") else ""
            desc = clean_text(item.find("description").text) if item.find("description") else ""
            link = item.find("link").text.strip() if item.find("link") else ""
            pub_date = item.find("pubDate").text if item.find("pubDate") else ""

            if title:
                items.append({
                    "tribunal": "STJ",
                    "title": title,
                    "summary": desc,
                    "url": link,
                    "date": parse_date(pub_date),
                    "category": "Jurisprudencia"
                })
        print(f"  STJ: {len(items)} noticias")
    except Exception as e:
        print(f"  STJ ERRO: {e}")
    return items


def fetch_stf():
    """Busca noticias do STF via scraping."""
    items = []
    try:
        url = "https://noticias.stf.jus.br/"
        resp = requests.get(url, headers=HEADERS, timeout=15)
        resp.raise_for_status()

        soup = BeautifulSoup(resp.text, "html.parser")

        # Busca cards de noticias
        articles = soup.select("article, .post, .noticia, .news-item, .card")[:10]

        if not articles:
            # Fallback: busca links com titulos
            articles = soup.select("h2 a, h3 a, .titulo a")[:10]
            for a_tag in articles[:MAX_PER_TRIBUNAL]:
                title = clean_text(a_tag.text)
                link = a_tag.get("href", "")
                if link and not link.startswith("http"):
                    link = "https://noticias.stf.jus.br" + link
                if title and len(title) > 10:
                    items.append({
                        "tribunal": "STF",
                        "title": title,
                        "summary": "",
                        "url": link,
                        "date": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
                        "category": "Constitucional"
                    })
        else:
            for article in articles[:MAX_PER_TRIBUNAL]:
                title_el = article.select_one("h2, h3, .title, .titulo")
                link_el = article.select_one("a[href]")
                desc_el = article.select_one("p, .excerpt, .resumo, .desc")
                date_el = article.select_one("time, .date, .data, span.date")

                title = clean_text(title_el.text) if title_el else ""
                link = link_el.get("href", "") if link_el else ""
                if link and not link.startswith("http"):
                    link = "https://noticias.stf.jus.br" + link

                if title and len(title) > 10:
                    items.append({
                        "tribunal": "STF",
                        "title": title,
                        "summary": clean_text(desc_el.text) if desc_el else "",
                        "url": link,
                        "date": parse_date(date_el.text if date_el else ""),
                        "category": "Constitucional"
                    })

        print(f"  STF: {len(items)} noticias")
    except Exception as e:
        print(f"  STF ERRO: {e}")
    return items


def fetch_tst():
    """Busca noticias do TST via scraping."""
    items = []
    try:
        url = "https://www.tst.jus.br/noticias"
        resp = requests.get(url, headers=HEADERS, timeout=15)
        resp.raise_for_status()

        soup = BeautifulSoup(resp.text, "html.parser")

        # TST usa Liferay - busca estrutura tipica
        articles = soup.select(".asset-abstract, .entry-title, article, .noticias-item, .journal-content-article")[:10]

        if not articles:
            # Fallback generico
            for a_tag in soup.select("h3 a, h2 a, .title a")[:MAX_PER_TRIBUNAL]:
                title = clean_text(a_tag.text)
                link = a_tag.get("href", "")
                if link and not link.startswith("http"):
                    link = "https://www.tst.jus.br" + link
                if title and len(title) > 10:
                    items.append({
                        "tribunal": "TST",
                        "title": title,
                        "summary": "",
                        "url": link,
                        "date": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
                        "category": "Trabalhista"
                    })
        else:
            for article in articles[:MAX_PER_TRIBUNAL]:
                title_el = article.select_one("h3, h2, .title, a")
                link_el = article.select_one("a[href]")
                desc_el = article.select_one("p, .content, .abstract-text")
                date_el = article.select_one("time, .date, .modified-date, span")

                title = clean_text(title_el.text) if title_el else ""
                link = link_el.get("href", "") if link_el else ""
                if link and not link.startswith("http"):
                    link = "https://www.tst.jus.br" + link

                if title and len(title) > 10:
                    items.append({
                        "tribunal": "TST",
                        "title": title,
                        "summary": clean_text(desc_el.text) if desc_el else "",
                        "url": link,
                        "date": parse_date(date_el.text if date_el else ""),
                        "category": "Trabalhista"
                    })

        print(f"  TST: {len(items)} noticias")
    except Exception as e:
        print(f"  TST ERRO: {e}")
    return items


def fetch_trf1():
    """Busca noticias do TRF1 via scraping."""
    items = []
    try:
        url = "https://www.trf1.jus.br/trf1/noticias/"
        resp = requests.get(url, headers=HEADERS, timeout=15, allow_redirects=True)
        resp.raise_for_status()

        soup = BeautifulSoup(resp.text, "html.parser")

        articles = soup.select("article, .noticia, .news-item, .card, .list-item")[:10]

        if not articles:
            for a_tag in soup.select("h2 a, h3 a, .titulo a, a.title")[:MAX_PER_TRIBUNAL]:
                title = clean_text(a_tag.text)
                link = a_tag.get("href", "")
                if link and not link.startswith("http"):
                    link = "https://www.trf1.jus.br" + link
                if title and len(title) > 10:
                    items.append({
                        "tribunal": "TRF1",
                        "title": title,
                        "summary": "",
                        "url": link,
                        "date": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
                        "category": "Federal"
                    })
        else:
            for article in articles[:MAX_PER_TRIBUNAL]:
                title_el = article.select_one("h2, h3, .title, .titulo, a")
                link_el = article.select_one("a[href]")
                desc_el = article.select_one("p, .resumo, .excerpt")
                date_el = article.select_one("time, .date, .data")

                title = clean_text(title_el.text) if title_el else ""
                link = link_el.get("href", "") if link_el else ""
                if link and not link.startswith("http"):
                    link = "https://www.trf1.jus.br" + link

                if title and len(title) > 10:
                    items.append({
                        "tribunal": "TRF1",
                        "title": title,
                        "summary": clean_text(desc_el.text) if desc_el else "",
                        "url": link,
                        "date": parse_date(date_el.text if date_el else ""),
                        "category": "Federal"
                    })

        print(f"  TRF1: {len(items)} noticias")
    except Exception as e:
        print(f"  TRF1 ERRO: {e}")
    return items


def fetch_trt11():
    """Busca noticias do TRT11 via scraping."""
    items = []
    try:
        url = "https://portal.trt11.jus.br/index.php/comunicacao/noticias-lista"
        resp = requests.get(url, headers=HEADERS, timeout=15, allow_redirects=True)
        resp.raise_for_status()

        soup = BeautifulSoup(resp.text, "html.parser")

        articles = soup.select("article, .item, .blog-item, tr, .list-row, .noticia")[:10]

        if not articles:
            for a_tag in soup.select("h2 a, h3 a, td a, .list-title a")[:MAX_PER_TRIBUNAL]:
                title = clean_text(a_tag.text)
                link = a_tag.get("href", "")
                if link and not link.startswith("http"):
                    link = "https://portal.trt11.jus.br" + link
                if title and len(title) > 10:
                    items.append({
                        "tribunal": "TRT11",
                        "title": title,
                        "summary": "",
                        "url": link,
                        "date": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
                        "category": "Trabalhista"
                    })
        else:
            for article in articles[:MAX_PER_TRIBUNAL]:
                title_el = article.select_one("h2, h3, a, .title")
                link_el = article.select_one("a[href]")
                desc_el = article.select_one("p, .intro, .excerpt")
                date_el = article.select_one("time, .date, .created, span.date")

                title = clean_text(title_el.text) if title_el else ""
                link = link_el.get("href", "") if link_el else ""
                if link and not link.startswith("http"):
                    link = "https://portal.trt11.jus.br" + link

                if title and len(title) > 10:
                    items.append({
                        "tribunal": "TRT11",
                        "title": title,
                        "summary": clean_text(desc_el.text) if desc_el else "",
                        "url": link,
                        "date": parse_date(date_el.text if date_el else ""),
                        "category": "Trabalhista"
                    })

        print(f"  TRT11: {len(items)} noticias")
    except Exception as e:
        print(f"  TRT11 ERRO: {e}")
    return items


def main():
    print(f"Buscando informativos dos tribunais... ({datetime.now(timezone.utc).isoformat()})")

    all_items = []

    # Busca de cada tribunal
    all_items.extend(fetch_stf())
    all_items.extend(fetch_stj())
    all_items.extend(fetch_trf1())
    all_items.extend(fetch_trt11())
    all_items.extend(fetch_tst())

    # Remove duplicatas por titulo
    seen_titles = set()
    unique_items = []
    for item in all_items:
        title_key = item["title"].lower().strip()
        if title_key not in seen_titles and len(item["title"]) > 15:
            seen_titles.add(title_key)
            unique_items.append(item)
    all_items = unique_items

    # Ordena por data (mais recentes primeiro)
    all_items.sort(key=lambda x: x.get("date", ""), reverse=True)

    # Monta JSON final
    output = {
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "total": len(all_items),
        "items": all_items
    }

    # Garante que o diretorio existe
    DATA_DIR.mkdir(parents=True, exist_ok=True)

    # Salva JSON
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print(f"\nTotal: {len(all_items)} noticias salvas em {OUTPUT_FILE}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
