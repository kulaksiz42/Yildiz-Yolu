# GitHub repo root; no third-party Python dependencies.
from pathlib import Path
import hashlib, json, struct
root=Path(__file__).resolve().parents[1]
path=root/"assets/rig/footballer.glb"
data=path.read_bytes()
assert data[:4]==b"glTF" and struct.unpack_from("<I",data,4)[0]==2
assert struct.unpack_from("<I",data,8)[0]==len(data)
jlen,ctype=struct.unpack_from("<II",data,12)
assert ctype==0x4e4f534a
g=json.loads(data[20:20+jlen].decode("utf8"))
assert len(g["skins"][0]["joints"])==22
names={a["name"] for a in g["animations"]}
assert {"idle","run","pass_r","pass_l","shoot_r","shoot_l"}<=names
assert len(g["materials"])>=6
assert all(a.get("channels") for a in g["animations"])
bridge=(root/"assets/rig/bridge.js").read_text()
assert "new T.GLTFLoader().loadAsync" in bridge
assert "T.SkeletonUtils.clone" in bridge
assert "window.YYRigStatus" in bridge
html=(root/"index.html").read_text()
assert '<script src="./assets/rig/bridge.js"></script>' in html
assert "YYRigSnapshot" in html
for p in ["three.min.js","GLTFLoader.js","SkeletonUtils.js"]:
 assert (root/"assets/rig/lib"/p).stat().st_size>5000
print("PASS: GLB metadata, 22 joints, six clips, local MIT runtime, bridge and live page imports")
