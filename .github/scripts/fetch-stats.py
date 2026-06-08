#!/usr/bin/env python3
"""Fetch live stats (Google Scholar via SerpApi, GitHub via public API) and
write data/stats.json. Failures are non-fatal: a field that cannot be fetched
keeps its previous value, so a transient outage never wipes the numbers.

Env:
  SERPAPI_KEY  SerpApi key (Google Scholar Author API). Optional.
  GH_TOKEN     GitHub token (raises rate limit / private access). Optional.
"""
import datetime
import json
import os
import pathlib
import re
import sys
import urllib.parse
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parents[2]
STATS = ROOT / "data" / "stats.json"

SCHOLAR_AUTHOR_ID = "obMPBnEAAAAJ"
GH_REPO = "aia-uclouvain/pydl8.5"


def load():
    try:
        return json.loads(STATS.read_text())
    except Exception:
        return {}


def get(url, headers=None):
    req = urllib.request.Request(url, headers=headers or {})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read().decode("utf-8")), dict(r.headers)


def main():
    stats = load()
    stats.setdefault("scholar", {})
    stats.setdefault("papers", {})
    stats.setdefault("pydl85", {})
    stats.pop("github", None)  # legacy key, superseded by "pydl85"

    # ---- Google Scholar via SerpApi -------------------------------------
    key = os.environ.get("SERPAPI_KEY")
    if key:
        try:
            url = "https://serpapi.com/search.json?" + urllib.parse.urlencode({
                "engine": "google_scholar_author",
                "author_id": SCHOLAR_AUTHOR_ID,
                "num": "100",
                "api_key": key,
            })
            d, _ = get(url)
            for row in d.get("cited_by", {}).get("table", []):
                if "citations" in row:
                    stats["scholar"]["citations"] = row["citations"]["all"]
                if "h_index" in row:
                    stats["scholar"]["hIndex"] = row["h_index"]["all"]
            for art in d.get("articles", []):
                title = (art.get("title") or "").lower()
                cited = art.get("cited_by", {}).get("value")
                if cited is None:
                    continue
                if "caching branch-and-bound" in title:
                    stats["papers"]["aaai2020"] = cited
                elif title.startswith("pydl8.5"):
                    stats["papers"]["ijcai2021"] = cited
        except Exception as e:  # noqa: BLE001
            print(f"[scholar] skipped: {e}", file=sys.stderr)
    else:
        print("[scholar] SERPAPI_KEY not set; keeping previous values", file=sys.stderr)

    # ---- GitHub (releases = tags, plus commits + stars) -----------------
    # The repo ships versions as git tags (no GitHub Release objects), so the
    # "21 releases" figure is the tag count, not /releases or PyPI versions.
    headers = {"Accept": "application/vnd.github+json", "User-Agent": "stats-bot"}
    tok = os.environ.get("GH_TOKEN")
    if tok:
        headers["Authorization"] = "Bearer " + tok
    try:
        d, _ = get(f"https://api.github.com/repos/{GH_REPO}", headers)
        stats["pydl85"]["stars"] = d.get("stargazers_count")
    except Exception as e:  # noqa: BLE001
        print(f"[github/repo] skipped: {e}", file=sys.stderr)
    try:
        tags, _ = get(f"https://api.github.com/repos/{GH_REPO}/tags?per_page=100", headers)
        if isinstance(tags, list):
            stats["pydl85"]["releases"] = len(tags)  # accurate up to 100 tags
    except Exception as e:  # noqa: BLE001
        print(f"[github/tags] skipped: {e}", file=sys.stderr)
    try:
        _, h = get(f"https://api.github.com/repos/{GH_REPO}/commits?per_page=1", headers)
        m = re.search(r'[?&]page=(\d+)>;\s*rel="last"', h.get("Link", ""))
        if m:
            stats["pydl85"]["commits"] = int(m.group(1))
    except Exception as e:  # noqa: BLE001
        print(f"[github/commits] skipped: {e}", file=sys.stderr)

    stats["updatedAt"] = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d")

    STATS.parent.mkdir(parents=True, exist_ok=True)
    STATS.write_text(json.dumps(stats, indent=2, ensure_ascii=False) + "\n")
    print(json.dumps(stats, indent=2))


if __name__ == "__main__":
    main()
