"""
grants-for-me scraper
Fetches grant data from California workforce training sources.

IMPORTANT: CSS selectors below are placeholders. Verify each against the
live page before running in production. Sites change their HTML structure
without notice — if a scrape fails, the existing grants.json is preserved.

Run locally:
    pip install -r requirements.txt
    python scraper.py

Output: ../public/data/grants.json
"""

import json
import logging
import re
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

import requests
from bs4 import BeautifulSoup

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
log = logging.getLogger(__name__)

OUTPUT_PATH = Path(__file__).parent.parent / "public" / "data" / "grants.json"

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (compatible; grants-for-me-bot/1.0; "
        "+https://github.com/nattapongsindhu/grants-for-me)"
    )
}

# ---------------------------------------------------------------------------
# Scrape targets
# Each entry: id, url, parser function name (defined below)
# ---------------------------------------------------------------------------
SOURCES = [
    {
        "id": "per-scholas-la",
        "url": "https://perscholas.org/locations/los-angeles/",
        "parser": "parse_per_scholas",
    },
    {
        "id": "futuro-health-rda",
        "url": "https://www.futurohealth.org/programs/",
        "parser": "parse_futuro_health",
    },
    {
        "id": "dental-assistant-apprenticeship-ca",
        "url": "https://www.dir.ca.gov/databases/das/aigstart.asp",
        "parser": "parse_ca_dir_apprenticeship",
    },
]


def sanitize_text(text: str, max_length: int = 300) -> str:
    """Strip HTML tags, normalize whitespace, and cap length."""
    text = re.sub(r"<[^>]+>", "", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text[:max_length]


def fetch(url: str) -> BeautifulSoup | None:
    try:
        resp = requests.get(url, headers=HEADERS, timeout=20)
        resp.raise_for_status()
        return BeautifulSoup(resp.text, "html.parser")
    except requests.RequestException as e:
        log.warning("fetch failed %s: %s", url, e)
        return None


# ---------------------------------------------------------------------------
# Per-source parsers
# TODO: Verify selectors against live pages before each run.
# ---------------------------------------------------------------------------

def parse_per_scholas(soup: BeautifulSoup) -> dict | None:
    """
    Target: perscholas.org/locations/los-angeles/
    Look for course name, cost (should be $0), and application link.
    Selector TODO: inspect the live page and update `.course-title` below.
    """
    title_el = soup.select_one(".course-title, h2.program-name")
    if not title_el:
        log.warning("per_scholas: selector miss — page structure may have changed")
        return None
    return {
        "id": "per-scholas-la",
        "scrapedName": sanitize_text(title_el.get_text(strip=True)),
        "lastScraped": datetime.now(timezone.utc).isoformat(),
    }


def parse_futuro_health(soup: BeautifulSoup) -> dict | None:
    """
    Target: futurohealth.org/programs/
    Look for RDA program listing and availability notice.
    Selector TODO: inspect live page and update `.program-card` below.
    """
    card = soup.select_one(".program-card, .catalog-item")
    if not card:
        log.warning("futuro_health: selector miss — page structure may have changed")
        return None
    name_el = card.select_one("h3, .program-title")
    return {
        "id": "futuro-health-rda",
        "scrapedName": sanitize_text(name_el.get_text(strip=True)) if name_el else "Futuro Health Program",
        "lastScraped": datetime.now(timezone.utc).isoformat(),
    }


def parse_ca_dir_apprenticeship(soup: BeautifulSoup) -> dict | None:
    """
    Target: dir.ca.gov/databases/das/aigstart.asp
    CA DIR uses a form-based search. This is a static info page — no
    dynamic scraping possible without Playwright. Returns metadata only.
    """
    log.info("ca_dir: static page, returning metadata only")
    return {
        "id": "dental-assistant-apprenticeship-ca",
        "scrapedName": "Dental Assistant Apprenticeship (CA DIR)",
        "lastScraped": datetime.now(timezone.utc).isoformat(),
    }


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

PARSERS = {
    "parse_per_scholas": parse_per_scholas,
    "parse_futuro_health": parse_futuro_health,
    "parse_ca_dir_apprenticeship": parse_ca_dir_apprenticeship,
}


def load_existing() -> dict:
    if OUTPUT_PATH.exists():
        with open(OUTPUT_PATH, encoding="utf-8") as f:
            return json.load(f)
    return {"grants": []}


def merge_scraped(existing: dict, scraped_updates: list[dict]) -> dict:
    """Merge scraped metadata into existing grant records by id."""
    update_map = {u["id"]: u for u in scraped_updates if u}
    for grant in existing["grants"]:
        if grant["id"] in update_map:
            update = update_map[grant["id"]]
            grant["lastVerified"] = update.get("lastScraped", grant["lastVerified"])
    existing["lastUpdated"] = datetime.now(timezone.utc).isoformat()
    return existing


def run():
    log.info("Starting scrape run")
    existing = load_existing()
    scraped = []

    for i, source in enumerate(SOURCES):
        if i > 0:
            time.sleep(2)  # rate limit: 2s between requests to avoid bans
        log.info("Fetching %s", source["url"])
        soup = fetch(source["url"])
        if soup is None:
            log.warning("Skipping %s — fetch failed, keeping existing data", source["id"])
            continue
        parser = PARSERS[source["parser"]]
        result = parser(soup)
        if result:
            scraped.append(result)
            log.info("Parsed %s OK", source["id"])
        else:
            log.warning("Parser returned None for %s", source["id"])

    merged = merge_scraped(existing, scraped)

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(merged, f, indent=2, ensure_ascii=False)
    log.info("Wrote %s grants to %s", len(merged["grants"]), OUTPUT_PATH)


if __name__ == "__main__":
    run()
    sys.exit(0)
