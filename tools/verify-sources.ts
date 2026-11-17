import { PROMPTS } from '../src/shared/prompts.ts';

const UA =
  'ReadTheRoomSourceCheck/1.0 (local verification; not sent by the production app)';

async function check(url: string): Promise<{ ok: boolean; status: number; finalUrl: string; excerpt: string }> {
  const response = await fetch(url, {
    redirect: 'follow',
    headers: { 'user-agent': UA, accept: 'text/html,application/xhtml+xml' },
    signal: AbortSignal.timeout(20000),
  });
  const text = await response.text();
  const excerpt = text.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 400);
  return { ok: response.ok, status: response.status, finalUrl: response.url, excerpt };
}

let failed = 0;
for (const prompt of PROMPTS) {
  try {
    const result = await check(prompt.source.url);
    const mark = result.ok ? 'OK' : 'FAIL';
    if (!result.ok) {
      failed += 1;
    }
    console.log(`${mark} ${result.status} ${prompt.id} ${result.finalUrl}`);
  } catch (error) {
    failed += 1;
    console.log(`FAIL ERR ${prompt.id} ${prompt.source.url} ${error instanceof Error ? error.message : error}`);
  }
}

if (failed > 0) {
  console.error(`\n${failed} source(s) failed to load.`);
  process.exit(1);
}

console.log(`\nAll ${PROMPTS.length} sources returned a successful HTTP status.`);
