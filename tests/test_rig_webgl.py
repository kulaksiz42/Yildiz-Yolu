from pathlib import Path
from playwright.sync_api import sync_playwright
import subprocess, time, urllib.request, sys

root=Path(__file__).resolve().parents[1]
port=8766
server=subprocess.Popen([sys.executable,"-m","http.server",str(port),"--bind","127.0.0.1"],cwd=root,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
try:
 for _ in range(80):
  try:
   urllib.request.urlopen(f"http://127.0.0.1:{port}/index.html",timeout=1).close();break
  except Exception:time.sleep(.1)
 else:raise AssertionError("Local test server never started")
 with sync_playwright() as pw:
  browser=pw.chromium.launch(headless=True,args=["--no-sandbox","--use-gl=angle","--use-angle=swiftshader","--enable-webgl","--enable-unsafe-swiftshader"])
  page=browser.new_page(viewport={"width":390,"height":844},is_mobile=True,has_touch=True)
  errors=[]
  page.on("pageerror",lambda e:errors.append(str(e)))
  page.goto(f"http://127.0.0.1:{port}/",wait_until="domcontentloaded")
  page.locator("#new").click()
  page.locator("#slots-list button").first.click()
  page.locator("#name").fill("Test Rig")
  for _ in range(6):page.locator("#forward").click()
  page.locator(".answer").first.click()
  page.locator(".answer").first.click()
  page.locator("#play").click()
  assert page.locator("#s-match").is_visible()
  assert page.locator("#rig-toggle").is_visible()
  page.locator("#rig-toggle").click()
  page.wait_for_function("window.YYRigStatus && (window.YYRigStatus().active || window.YYRigStatus().error)",timeout=45000)
  status=page.evaluate("YYRigStatus()")
  if not status["active"]:
   # Software renderers may be unavailable on hosted CI runners. Fail on asset, JS or adapter bugs.
   error=status.get("error") or "unknown"
   assert any(k in error.lower() for k in ["webgl","context","gpu","hardware"]), "Unexpected rig error: "+error
   print("SKIP 3D rendering: WebGL context unavailable on CI; model static checks remain active: "+error)
  else:
   page.wait_for_timeout(600)
   status=page.evaluate("YYRigStatus()")
   assert status["ready"] and status["actors"]>=5,status
   assert status["calls"]>0,status
   assert not errors,errors
   out=root/"tests/rig_v08_preview.png"
   page.screenshot(path=str(out))
   print("PASS 3D GLB match: actual Three.js WebGL frame, skinned players",status)
   page.locator("#rig-toggle").click()
   assert page.evaluate("YYRigEnabled===false && !YYRigStatus().active")
   print("PASS fallback: original engine can resume")
  browser.close()
finally:
 server.terminate()
 try:server.wait(timeout=3)
 except subprocess.TimeoutExpired:server.kill()
