#!/usr/bin/env python3
"""Generate photo sets for Klipi's sample businesses with Google's Nano Banana image model.

Reads GEMINI_API_KEY from the environment (never pass it on the command line).
Picks the newest available image model (e.g. gemini-3-pro-image over gemini-2.5-flash-image)
unless --model is given. For every business, shot 1 is generated from text; later shots pass
shot 1 as a reference image, so the set looks like one real business (same place, light, props).

Usage: python3 -I generate.py --out OUT_DIR [--only food,beauty] [--model NAME] [--dry-run]
"""
import argparse, base64, json, os, re, ssl, sys, time, urllib.request

API = "https://generativelanguage.googleapis.com/v1beta"
HERE = os.path.dirname(os.path.abspath(__file__))


def ctx():
    ca = os.environ.get("SSL_CERT_FILE") or "/root/.ccr/ca-bundle.crt"
    return ssl.create_default_context(cafile=ca) if os.path.exists(ca) else ssl.create_default_context()


def call(path, body=None, key=None, method=None):
    req = urllib.request.Request(f"{API}/{path}", data=json.dumps(body).encode() if body else None,
                                 method=method or ("POST" if body else "GET"),
                                 headers={"Content-Type": "application/json", "x-goog-api-key": key})
    with urllib.request.urlopen(req, context=ctx(), timeout=180) as r:
        return json.loads(r.read())


def best_image_model(key):
    names = []
    page = None
    while True:
        res = call("models?pageSize=200" + (f"&pageToken={page}" if page else ""), key=key)
        for m in res.get("models", []):
            n = m["name"].split("/")[-1]
            if "image" in n and "generateContent" in m.get("supportedGenerationMethods", []) and "imagen" not in n:
                names.append(n)
        page = res.get("nextPageToken")
        if not page:
            break
    def rank(n):
        v = re.search(r"gemini-(\d+(?:\.\d+)?)", n)
        return (float(v.group(1)) if v else 0, "pro" in n, "preview" not in n)
    names.sort(key=rank, reverse=True)
    return names


def generate(model, prompt, aspect, key, refs=()):
    parts = [{"inline_data": {"mime_type": "image/png", "data": base64.b64encode(r).decode()}} for r in refs]
    parts.append({"text": prompt})
    body = {"contents": [{"role": "user", "parts": parts}],
            "generationConfig": {"responseModalities": ["IMAGE"], "imageConfig": {"aspectRatio": aspect}}}
    for attempt in range(4):
        try:
            res = call(f"models/{model}:generateContent", body, key=key)
            for c in res.get("candidates", []):
                for p in c.get("content", {}).get("parts", []):
                    d = p.get("inline_data") or p.get("inlineData")
                    if d:
                        return base64.b64decode(d["data"])
            raise RuntimeError("no image in response: " + json.dumps(res)[:300])
        except Exception as e:  # rate limits and transient errors: back off and retry
            print(f"  retry {attempt + 1}: {str(e)[:160]}", file=sys.stderr)
            time.sleep(6 * (attempt + 1))
    raise RuntimeError("failed after retries")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", required=True)
    ap.add_argument("--only", default="")
    ap.add_argument("--model", default="")
    ap.add_argument("--dry-run", action="store_true")
    a = ap.parse_args()
    key = os.environ.get("GEMINI_API_KEY")
    if not key:
        sys.exit("GEMINI_API_KEY is not set")
    spec = json.load(open(os.path.join(HERE, "shots.json"), encoding="utf-8"))
    models = [a.model] if a.model else best_image_model(key)
    print("image models (best first):", models[:5])
    model = models[0]
    if a.dry_run:
        return
    only = set(filter(None, a.only.split(",")))
    for biz in spec["businesses"]:
        if only and biz["id"] not in only:
            continue
        out = os.path.join(a.out, biz["id"])
        os.makedirs(out, exist_ok=True)
        hero = None
        for i, shot in enumerate(biz["shots"], 1):
            path = os.path.join(out, f"{i:02d}-{shot['name']}.png")
            if os.path.exists(path):
                hero = hero or open(os.path.join(out, sorted(os.listdir(out))[0]), "rb").read()
                continue
            prompt = " ".join([spec["style_prefix"], biz["world"], shot["prompt"], spec["rules"]])
            if hero:
                prompt = spec["consistency"] + " " + prompt
            print(f"{biz['id']} {i}/{len(biz['shots'])} {shot['name']}")
            img = generate(model, prompt, shot.get("aspect", "4:5"), key, [hero] if hero else [])
            open(path, "wb").write(img)
            hero = hero or img
    print("done ->", a.out, "model:", model)


if __name__ == "__main__":
    main()
