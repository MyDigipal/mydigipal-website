"""Publie `generate-email.js` dans le workflow n8n du calculateur (dg9ND1PqgJDEqMMd).

Le code du nœud « Generate Email HTML » ne vit QUE dans n8n : ce fichier-ci en est la copie
versionnée. On modifie `generate-email.js`, on le teste avec `test-mails.cjs`, puis on lance
`python scripts/n8n-calculateur/publier.py`. Une sauvegarde du workflow en ligne est écrite
avant chaque envoi (`wf_backup_avant_push.json`, ignoré par git). La clé API est lue dans
~/.claude/.env.claude (N8N_MCP_API_KEY), jamais dans ce fichier.
"""
import io
import json
import os
import urllib.request
from pathlib import Path

HERE = Path(__file__).parent
BASE = "https://n8n.mydigipal.com/api/v1/workflows/dg9ND1PqgJDEqMMd"
env = Path(os.path.expanduser("~/.claude/.env.claude"))
key = [l.split("=", 1)[1].strip().strip("'\"") for l in io.open(env, encoding="utf-8") if l.startswith("N8N_MCP_API_KEY=")][0]


def call(method, url, body=None):
    data = json.dumps(body).encode("utf-8") if body is not None else None
    req = urllib.request.Request(url, data=data, method=method, headers={
        "X-N8N-API-KEY": key, "Accept": "application/json", "Content-Type": "application/json"})
    return json.loads(urllib.request.urlopen(req, timeout=60).read().decode("utf-8") or "{}")


wf = call("GET", BASE)
io.open(HERE / "wf_backup_avant_push.json", "w", encoding="utf-8").write(json.dumps(wf, ensure_ascii=False, indent=1))
nodes = {n["name"]: n for n in wf["nodes"]}
assert {"Webhook", "Generate Email HTML", "Email to Paul", "Email to Prospect", "Google Sheets", "Respond to Webhook"} <= set(nodes)

nodes["Generate Email HTML"]["parameters"]["jsCode"] = io.open(HERE / "generate-email.js", encoding="utf-8").read()

pro = nodes["Email to Prospect"]["parameters"]
pro["subject"] = "={{ $json.prospectSubject }}"
pro["message"] = "={{ $json.prospectHtml }}"
pro["options"] = {"replyTo": "paul@mydigipal.com", "appendAttribution": False}

paul = nodes["Email to Paul"]["parameters"]
paul["subject"] = "={{ $json.paulSubject }}"
paul["message"] = "={{ $json.paulHtml }}"
paul["options"] = {"appendAttribution": False}

# Plus de pièce jointe HTML : le mail est le devis, « Revoir mon devis » le rouvre.
wf["nodes"] = [n for n in wf["nodes"] if n["name"] != "Create Attachment"]
conn = wf["connections"]
conn.pop("Create Attachment", None)
conn["Generate Email HTML"] = {"main": [[
    {"node": "Email to Paul", "type": "main", "index": 0},
    {"node": "Email to Prospect", "type": "main", "index": 0},
    {"node": "Google Sheets", "type": "main", "index": 0},
]]}

ALLOWED = {"saveExecutionProgress", "saveManualExecutions", "saveDataErrorExecution", "saveDataSuccessExecution",
           "executionTimeout", "errorWorkflow", "timezone", "executionOrder", "callerPolicy", "callerIds"}
settings = {k: v for k, v in (wf.get("settings") or {}).items() if k in ALLOWED}
res = call("PUT", BASE, {"name": wf["name"], "nodes": wf["nodes"], "connections": conn, "settings": settings})
act = call("POST", BASE + "/activate")

apres = call("GET", BASE)
n2 = {n["name"]: n for n in apres["nodes"]}
print("noeuds :", sorted(n2))
print("code identique :", n2["Generate Email HTML"]["parameters"]["jsCode"] == io.open(HERE / "generate-email.js", encoding="utf-8").read())
print("sujets :", n2["Email to Prospect"]["parameters"]["subject"], "|", n2["Email to Paul"]["parameters"]["subject"])
print("options :", n2["Email to Prospect"]["parameters"]["options"], n2["Email to Paul"]["parameters"]["options"])
print("liens :", [o["node"] for o in apres["connections"]["Generate Email HTML"]["main"][0]])
print("actif :", act.get("active"), "| version :", res.get("versionId"))
