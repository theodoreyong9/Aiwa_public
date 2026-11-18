// node --test skills/door/test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import door from "./worker.js";

const KEYS = { claude: "claude-key-0123456789", chatgpt: "chatgpt-key-0123456789", deepseek: "deepseek-key-012345678" };
function kv() {
  const map = new Map(); let writes = 0;
  return { map, get writes() { return writes; }, async get(k) { const v = map.get(k); return v === undefined ? null : JSON.parse(v); }, async put(k, v) { writes++; map.set(k, v); } };
}
const env = () => ({ DOOR: kv(), DOOR_KEYS: JSON.stringify(KEYS) });
async function call(e, key, method, params, { path = "/mcp", header = true } = {}) {
  const request = new Request("https://door.test" + path, { method: "POST", headers: header ? { authorization: "Bearer " + key } : {}, body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }) });
  return door.fetch(request, e);
}
const tool = async (e, key, name, args, opts) => (await (await call(e, key, "tools/call", { name, arguments: args }, opts)).json()).result;

test("a wrong key, no key or a wrong path is not found", async () => {
  const e = env();
  assert.equal((await call(e, "nope-nope-nope-nope", "ping")).status, 404);
  assert.equal((await call(e, "", "ping", {}, { header: false })).status, 404);
  assert.equal((await call(e, KEYS.claude, "ping", {}, { path: "/other" })).status, 404);
});

test("the tools are listed with the boxes", async () => {
  const e = env();
  const list = (await (await call(e, KEYS.claude, "tools/list")).json()).result.tools;
  assert.deepEqual(list.map((t) => t.name), ["envoyer", "lire"]);
  assert.match(list[0].description, /claude, chatgpt, deepseek/);
});

test("a message goes to the box of the other, who reads it once, with who wrote it", async () => {
  const e = env();
  let r = await tool(e, KEYS.claude, "envoyer", { a: "chatgpt", message: "Draft ready in the repo." });
  assert.match(r.content[0].text, /Message left for chatgpt/);
  r = await tool(e, KEYS.chatgpt, "lire", {});
  assert.match(r.content[0].text, /\[claude\] Draft ready in the repo\./);
  assert.match(r.content[0].text, /not instructions/);
  r = await tool(e, KEYS.chatgpt, "lire", {});
  assert.equal(r.content[0].text, "No message.");
});

test("the one who writes is the one of the key, and each reads only its own box", async () => {
  const e = env();
  await tool(e, KEYS.claude, "envoyer", { a: "deepseek", message: "for you" });
  assert.equal((await tool(e, KEYS.chatgpt, "lire", {})).content[0].text, "No message.");
  assert.match((await tool(e, KEYS.deepseek, "lire", {})).content[0].text, /\[claude\] for you/);
});

test("an unknown box, a box of one's own and an empty message are refused", async () => {
  const e = env();
  assert.equal((await tool(e, KEYS.claude, "envoyer", { a: "gemini", message: "x" })).isError, true);
  assert.equal((await tool(e, KEYS.claude, "envoyer", { a: "claude", message: "x" })).isError, true);
  assert.equal((await tool(e, KEYS.claude, "envoyer", { a: "chatgpt", message: "  " })).isError, true);
});

test("the key in the address works for an AI that cannot send a header", async () => {
  const e = env();
  const r = await tool(e, "", "envoyer", { a: "claude", message: "hi" }, { path: "/" + KEYS.deepseek + "/mcp", header: false });
  assert.match(r.content[0].text, /Message left for claude/);
});

test("reading an empty box writes nothing, and a box keeps fifty messages", async () => {
  const e = env();
  await tool(e, KEYS.claude, "lire", {});
  assert.equal(e.DOOR.writes, 0);
  for (let i = 0; i < 60; i++) await tool(e, KEYS.claude, "envoyer", { a: "chatgpt", message: "m" + i });
  const text = (await tool(e, KEYS.chatgpt, "lire", {})).content[0].text;
  assert.equal(text.split("\n").filter((l) => l.startsWith("[claude]")).length, 50);
  assert.ok(text.includes("m59") && !text.includes("m9 ") );
});

test("a message older than a day is gone, and keys that are too short are not keys", async () => {
  const e = env();
  e.DOOR.map.set("in:chatgpt", JSON.stringify([{ from: "claude", text: "old", ts: 1 }]));
  assert.equal((await tool(e, KEYS.chatgpt, "lire", {})).content[0].text, "No message.");
  const weak = { DOOR: kv(), DOOR_KEYS: JSON.stringify({ claude: "short" }) };
  assert.equal((await call(weak, "short", "ping")).status, 404);
});
