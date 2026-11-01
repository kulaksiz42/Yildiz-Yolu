from pathlib import Path
from playwright.sync_api import sync_playwright

HTML = Path(__file__).resolve().parents[1].joinpath("index.html").read_text(encoding="utf-8")

def main():
    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True, args=["--no-sandbox", "--disable-gpu"])
        page = browser.new_page(viewport={"width": 390, "height": 844}, is_mobile=True, has_touch=True)
        errors = []
        page.on("pageerror", lambda err: errors.append(str(err)))
        page.evaluate("""() => {
          const store = {};
          Object.defineProperty(window, 'localStorage', { configurable:true, value:{
             getItem: k => store[k] ?? null, setItem:(k,v) => store[k] = String(v)
          } });
        }""")
        page.set_content(HTML)
        assert page.locator("#s-title").is_visible()
        page.locator("#new").click()
        assert page.locator("#slots-list button").count() == 3
        page.locator("#slots-list button").first.click()
        page.locator("#name").fill("Test Sporcu")
        for step in range(6):
            if step == 3:
                page.locator('[data-field="foot"][data-value="left"]').click()
                page.locator('[data-field="kit"][data-value="#4f9fe8"]').click()
            page.locator("#forward").click()
        assert page.locator("#s-story").is_visible()
        assert page.evaluate("career.foot === 'left' && career.kit === '#4f9fe8'")
        page.locator(".answer").first.click()
        page.locator(".answer").first.click()
        assert page.locator("#s-hub").is_visible()
        page.locator("#play").click()
        assert page.locator("#s-match").is_visible()
        assert page.locator("#radar").count() == 1
        page.evaluate("""() => {
          for (const d of match.defenders) { d.x = 28; d.z = 38; d.speed = 0 }
          match.team[0].x = -4; match.team[0].z = 21;
          match.team[1].x = 6; match.team[1].z = 23;
        }""")
        page.locator("#cycle-target").click()
        page.locator("#pass").click()
        assert page.evaluate("match?.flight?.kind === 'pass'")
        page.wait_for_function("match && match.successfulPasses === 1", timeout=5000)
        assert page.evaluate("screen === 'match' && match.moment === 0")
        page.locator("#backpass").click()
        page.wait_for_function("match && match.successfulPasses === 2", timeout=5000)
        page.locator('[data-shot="chip"]').click()
        assert page.evaluate("shotStyle === 'chip'")
        page.locator("#shoot").dispatch_event("click", {"detail": 0})
        assert page.evaluate("match.flight?.style === 'chip'")
        assert not errors, errors
        print("Smoke PASS: creator, slots, dialogue, match, radar, pass, back pass, chip shot, no JS errors")
        browser.close()

if __name__ == "__main__":
    main()
