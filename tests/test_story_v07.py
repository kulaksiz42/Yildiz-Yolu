from pathlib import Path
from playwright.sync_api import sync_playwright

HTML = Path(__file__).resolve().parents[1].joinpath("index.html").read_text(encoding="utf-8")

def main():
    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True, args=["--no-sandbox", "--disable-gpu"])
        page = browser.new_page(viewport={"width": 390, "height": 844}, is_mobile=True, has_touch=True)
        errors = []
        page.on("pageerror", lambda exc: errors.append(str(exc)))
        page.set_content(HTML)
        page.locator("#new").click()
        page.locator("#slots-list button").first.click()
        page.locator("#name").fill("Anlatı Test")
        for _ in range(6):
            page.locator("#forward").click()
        page.locator(".answer").first.click()
        page.locator(".answer").first.click()
        assert page.locator("#s-hub").is_visible()
        assert page.locator("#career-event").is_visible()
        assert "İlk 11 Haberi" in page.locator("#career-event").inner_text()
        initial = page.evaluate("career.coach")
        page.locator("#career-event").click()
        assert page.locator("#s-story").is_visible()
        page.locator(".answer").first.click()
        assert page.locator("#s-hub").is_visible()
        assert page.evaluate("career.coach") == initial + 5
        assert page.evaluate("career.eventsSeen.includes('shared_01')")
        assert page.evaluate("career.choiceHistory.some(v=>v.type==='career_event' && v.id==='shared_01')")
        assert "İlk 11 Haberi" in page.locator("#hub-news").inner_text()

        page.evaluate("career.week=2;showHub()")
        assert "İlk Antrenman" in page.locator("#career-event").inner_text()
        page.locator("#career-event").click()
        energy = page.evaluate("career.energy")
        page.locator(".answer").first.click()
        assert page.evaluate("career.energy") == energy - 3
        assert page.evaluate("career.eventsSeen.includes('tr_culture_1')")

        page.evaluate("career.country='en';career.eventsSeen=[];career.week=2;showHub()")
        assert "Yağmurda İdman" in page.locator("#career-event").inner_text()
        page.evaluate("career.country='es';showHub()")
        assert "Dar Alanda Oyun" in page.locator("#career-event").inner_text()

        assert page.evaluate("CAREER_EVENTS.length") == 16
        assert page.evaluate("new Set(CAREER_EVENTS.map(e=>e.id)).size === CAREER_EVENTS.length")
        assert not errors, errors
        print("Story v0.7 PASS: event UI, 3 countries, choice effects, saved decision log, no JS errors")
        browser.close()

if __name__ == "__main__":
    main()
