import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { PROMPTS } from './prompts.ts';
import { promptForDay } from './catalog.ts';

const FORBIDDEN =
  /\b(crypto|bitcoin|nft|gambl|wager|broker|apr\b|interest rate|stock market|investing|investment advice)\b/i;

const FEE_HOOK = /\b(bag fee|change fee|cancel(?:lation)? fee|restocking fee|booking fee|convenience fee|processing fee)\b/i;

describe('prompt catalog', () => {
  it('has exactly 30 unique, complete prompts', () => {
    assert.equal(PROMPTS.length, 30);
    const ids = PROMPTS.map((prompt) => prompt.id);
    assert.equal(new Set(ids).size, 30);
    for (const prompt of PROMPTS) {
      assert.ok(prompt.title.length > 0);
      assert.ok(prompt.scenario.length > 40);
      assert.ok(prompt.outcome.length > 40);
      assert.match(prompt.source.asOf, /^\d{4}-\d{2}-\d{2}$/);
      assert.match(prompt.source.url, /^https:\/\//);
      assert.doesNotMatch(prompt.title, /—/);
      assert.doesNotMatch(prompt.scenario, /—/);
      assert.doesNotMatch(prompt.outcome, /—/);
      assert.doesNotMatch(`${prompt.title} ${prompt.scenario}`, FORBIDDEN);
      assert.doesNotMatch(`${prompt.title} ${prompt.scenario}`, FEE_HOOK);
    }
  });

  it('keeps the calendar mapping stable', () => {
    assert.equal(promptForDay('2026-11-11').id, PROMPTS[0].id);
    assert.equal(promptForDay('2026-12-11').id, PROMPTS[0].id);
    assert.equal(promptForDay('2026-11-12').id, PROMPTS[1].id);
  });
});
