#!/usr/bin/env python3
"""Visual and smoke checks for Invoice Pad, following the webapp-testing skill."""

from pathlib import Path

from playwright.sync_api import sync_playwright

BASE = "http://127.0.0.1:5173"
SHOTS = Path("/workspace/bond/invoicepad-shots")
WIDTHS = (375, 768, 1280)
PAGES = ("/", "/invoice.html", "/tax.html", "/organizer.html", "/blog/", "/blog/free-invoice-template.html")


def path_name(route: str) -> str:
    if route == "/":
        return "home"
    return route.strip("/").replace(".html", "").replace("/", "-")


def main() -> None:
    SHOTS.mkdir(parents=True, exist_ok=True)
    failures: list[str] = []

    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True, executable_path="/usr/bin/google-chrome", args=["--no-sandbox", "--disable-dev-shm-usage"])
        page = browser.new_page()

        for width in WIDTHS:
            page.set_viewport_size({"width": width, "height": 900})
            for route in PAGES:
                url = f"{BASE}{route}"
                page.goto(url, wait_until="networkidle")
                title = page.title()
                if not title:
                    failures.append(f"{route} @{width}px has no title")
                dest = SHOTS / f"{path_name(route)}-{width}.png"
                page.screenshot(path=str(dest), full_page=True)
                print(f"saved {dest} title={title!r}")

        # Invoice smoke: one billed line should show a $150.00 total
        page.set_viewport_size({"width": 1280, "height": 900})
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

    if failures:
        raise SystemExit("UI checks failed:\n- " + "\n- ".join(failures))
    print("UI checks passed")


if __name__ == "__main__":
    main()
