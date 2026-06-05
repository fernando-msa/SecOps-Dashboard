import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const messagesDir = join(__dirname, "..", "messages");
const locales = ["en", "pt-BR", "es"];

async function loadLocale(locale) {
  const raw = await readFile(join(messagesDir, `${locale}.json`), "utf8");
  return JSON.parse(raw);
}

function flattenKeys(value, prefix = "") {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return Object.entries(value).flatMap(([key, nested]) =>
      flattenKeys(nested, prefix ? `${prefix}.${key}` : key)
    );
  }

  return [prefix];
}

test("all locale dictionaries expose the same translation keys", async () => {
  const dictionaries = Object.fromEntries(
    await Promise.all(locales.map(async (locale) => [locale, await loadLocale(locale)]))
  );
  const referenceKeys = flattenKeys(dictionaries.en).sort();

  for (const locale of locales) {
    assert.deepEqual(
      flattenKeys(dictionaries[locale]).sort(),
      referenceKeys,
      `${locale} must match the en translation key set`
    );
  }
});

test("translation values are populated strings", async () => {
  for (const locale of locales) {
    const dictionary = await loadLocale(locale);
    const entries = flattenKeys(dictionary);

    for (const key of entries) {
      const value = key.split(".").reduce((current, segment) => current[segment], dictionary);
      assert.equal(typeof value, "string", `${locale}.${key} must be a string`);
      assert.notEqual(value.trim(), "", `${locale}.${key} must not be empty`);
    }
  }
});
