#!/usr/bin/env python3
"""Visual and smoke checks for Invoice Pad, following the webapp-testing skill."""

from __future__ import annotations

import socket
import subprocess
import time
import urllib.request
from pathlib import Path

from playwright.sync_api import sync_playwright

BASE = "http://127.0.0.1:4173"
SHOTS = Path("/workspace/bond/invoicepad-shots")
WIDTHS = (375, 768, 1280)
VIEWPORT_PAGES = (
    "/",
    "/invoice.html",
    "/tax.html",
    "/organizer.html",
    "/blog/",
    "/blog/end-of-year-tax-checklist-for-freelancers.html",
    "/privacy.html",
    "/contact.html",
)
ROOT = Path(__file__).resolve().parents[1]

ALL_PAGES = [
    "/",
    "/invoice.html",
    "/tax.html",
    "/organizer.html",
    "/blog/",
    "/blog/free-invoice-template.html",
    "/blog/what-to-include-on-an-invoice.html",
    "/blog/how-much-should-i-set-aside-for-taxes-1099.html",
    "/blog/quarterly-estimated-tax-dates-2027.html",
    "/blog/end-of-year-tax-checklist-for-freelancers.html",
    "/free-invoice-generator.html",
    "/freelance-invoice-template.html",
    "/1099-tax-organizer.html",
    "/self-employed-tax-spreadsheet-2027.html",
    "/about.html",
    "/contact.html",
    "/privacy.html",
    "/terms.html",
    "/404.html",
    "/sitemap.xml",
    "/robots.txt",
    "/favicon.svg",
    "/og-image.svg",
    "/og-image.png",
]


def path_name(route: str) -> str:
    if route == "/":
        return "home"
    return route.strip("/").replace(".html", "").replace("/", "-")


def port_open() -> bool:
    with socket.socket() as sock:
        sock.settimeout(0.3)
        return sock.connect_ex(("127.0.0.1", 4173)) == 0


def wait_for_server(timeout: float = 20) -> None:
    deadline = time.time() + timeout
    while time.time() < deadline:
        try:
            with urllib.request.urlopen(BASE + "/", timeout=1) as response:
                if response.status < 500:
                    return
        except Exception:
            time.sleep(0.25)
    raise SystemExit(f"Preview server did not start at {BASE}")


def start_preview_if_needed() -> subprocess.Popen | None:
    if port_open():
        return None
    dist = ROOT / "dist" / "index.html"
    if not dist.exists():
        raise SystemExit("dist/ is missing. Run npm run build first.")
    proc = subprocess.Popen(
        ["npm", "run", "preview", "--", "--port", "4173", "--host", "127.0.0.1"],
        cwd=ROOT,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    try:
        wait_for_server()
    except Exception:
        proc.terminate()
        raise
    return proc


def main() -> None:
    SHOTS.mkdir(parents=True, exist_ok=True)
    failures: list[str] = []
    server = start_preview_if_needed()

    try:
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch(
                headless=True,
                executable_path="/usr/bin/google-chrome",
                args=["--no-sandbox", "--disable-dev-shm-usage"],
            )
            page = browser.new_page()
            console_errors: list[str] = []
            page_errors: list[str] = []

            def on_console(msg) -> None:
                if msg.type == "error":
                    text = msg.text
                    # Google Fonts or extension noise should not fail the smoke run.
                    if "fonts.gstatic.com" in text or "fonts.googleapis.com" in text:
                        return
                    console_errors.append(text)

            def on_pageerror(err) -> None:
                page_errors.append(str(err))

            page.on("console", on_console)
            page.on("pageerror", on_pageerror)

            for route in ALL_PAGES:
                console_errors.clear()
                page_errors.clear()
                response = page.goto(f"{BASE}{route}", wait_until="load")
                status = response.status if response else 0
                if status >= 400:
                    failures.append(f"{route} returned {status}")
                    continue
                if route.endswith((".xml", ".txt", ".svg")):
                    print(f"ok {route} {status}")
                    continue
                title = page.title()
                if route != "/sitemap.xml" and not title:
                    failures.append(f"{route} has no title")
                html = page.content()
                if route not in ("/404.html",) and "invoicepad.shop" not in html and route.endswith(".html") or route in ("/", "/blog/"):
                    if "invoicepad.shop" not in html:
                        failures.append(f"{route} is missing invoicepad.shop canonical host")
                if page_errors:
                    failures.append(f"{route} pageerror: {page_errors}")
                if console_errors:
                    failures.append(f"{route} console error: {console_errors}")
                print(f"ok {route} {status} title={title!r}")

            # Internal links from a fully rendered home page
            page.goto(f"{BASE}/", wait_until="networkidle")
            hrefs = page.eval_on_selector_all(
                "a[href]",
                "els => els.map(e => e.getAttribute('href'))",
            )
            seen = set()
            for href in hrefs:
                if not href or href.startswith(("http://", "https://", "mailto:", "#")):
                    continue
                path = href.split("?")[0]
                if path in seen:
                    continue
                seen.add(path)
                response = page.goto(f"{BASE}{path}", wait_until="load")
                status = response.status if response else 0
                if status >= 400:
                    failures.append(f"home link {path} returned {status}")

            # Repeat footer crawl from a blog post (relative-path trap)
            page.goto(f"{BASE}/blog/free-invoice-template.html", wait_until="load")
            hrefs = page.eval_on_selector_all(
                "a[href]",
                "els => els.map(e => e.getAttribute('href'))",
            )
            for href in hrefs:
                if not href or href.startswith(("http://", "https://", "mailto:", "#")):
                    continue
                path = href.split("?")[0]
                response = page.request.get(f"{BASE}{path}")
                if response.status >= 400:
                    failures.append(f"blog link {path} returned {response.status}")

            for width in WIDTHS:
                page.set_viewport_size({"width": width, "height": 900})
                for route in VIEWPORT_PAGES:
                    page.goto(f"{BASE}{route}", wait_until="networkidle")
                    dest = SHOTS / f"{path_name(route)}-{width}.png"
                    page.screenshot(path=str(dest), full_page=True)
                    print(f"saved {dest}")

            # Buy button fallback
            page.set_viewport_size({"width": 1280, "height": 900})
            page.goto(f"{BASE}/organizer.html", wait_until="networkidle")
            buy = page.locator("[data-buy-button]")
            label = buy.inner_text().strip()
            if label != "Coming soon":
                failures.append(f"buy button was {label!r}, expected Coming soon (no VITE_PAYMENT_URL)")
            if buy.get_attribute("aria-disabled") != "true":
                failures.append("buy button should be aria-disabled when checkout is unset")

            # Invoice smoke: one billed line should show a $150.00 total
            page.goto(f"{BASE}/invoice.html", wait_until="networkidle")
            page.fill("#fromName", "River Studio")
            page.fill("#toName", "North and Pine")
            page.fill('[data-field="description"]', "Strategy workshop")
            page.fill('[data-field="quantity"]', "3")
            page.fill('[data-field="unitPrice"]', "50")
            page.fill("#taxRatePercent", "0")
            page.locator("#taxRatePercent").blur()
            page.wait_for_timeout(200)
            total = page.locator("[data-invoice-total]").inner_text().strip()
            print(f"invoice total: {total}")
            if "$150.00" not in total:
                failures.append(f"invoice total was {total!r}, expected $150.00")
            page.screenshot(path=str(SHOTS / "invoice-smoke-1280.png"), full_page=True)

            # Tax smoke: $10,000 income, $4,000 expenses, 30% → $1,800 set aside
            page.goto(f"{BASE}/tax.html", wait_until="networkidle")
            page.select_option("#preset", "us")
            page.fill("#income", "10000")
            page.fill("#expenses", "4000")
            page.locator("#expenses").blur()
            page.wait_for_timeout(200)
            set_aside = page.locator('[data-result="setAside"]').inner_text().strip()
            profit = page.locator('[data-result="profit"]').inner_text().strip()
            print(f"tax profit: {profit}; set aside: {set_aside}")
            if "$6,000.00" not in profit:
                failures.append(f"tax profit was {profit!r}, expected $6,000.00")
            if "$1,800.00" not in set_aside:
                failures.append(f"tax set-aside was {set_aside!r}, expected $1,800.00")
            page.screenshot(path=str(SHOTS / "tax-smoke-1280.png"), full_page=True)

            browser.close()
    finally:
        if server is not None:
            server.terminate()
            try:
                server.wait(timeout=5)
            except subprocess.TimeoutExpired:
                server.kill()

    if failures:
        raise SystemExit("UI checks failed:\n- " + "\n- ".join(failures))
    print("UI checks passed")


if __name__ == "__main__":
    main()
