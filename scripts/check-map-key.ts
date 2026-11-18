/**
 * Map key self-check: `npm run check:map-key`.
 *
 * Answers one question before the browser is opened: is this Tianditu key
 * accepted by the provider *from this machine*? It calls the documented
 * geocoding service once and classifies the reply.
 *
 * It never prints the full key and never writes it anywhere.
 */

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { classifyProbe, explainCode, maskKey, readEnvValue } from './lib/map-key';

const ENV_FILES = ['.env.local', '.env'];
const PROBE_URL = 'https://api.tianditu.gov.cn/geocoder';
const PROBE_KEYWORD = '西安碑林博物馆';
const TIMEOUT_MS = 15_000;

/** Gateway codes quoted from the provider's help page; not the JSON service codes. */
const GATEWAY_CODES: Record<number, string> = {
  404: 'token 为空 —— 请求里没有带上 tk 参数。',
  405: '访问来源为空，无权限 —— 域名白名单可能没包含当前来源。',
  406: 'token 不存在 —— 密钥写错了。',
  407: '用户已冻结。',
  408: '当日配额已用完，或被暂停访问，或 IP 被加入黑名单。',
  409: '服务未授权 —— 创建应用时没有勾选对应服务。',
  410: '服务名与 token 不匹配。',
  411: '服务授权已过期。',
  4121: '请求头未携带来源信息。',
  413: '无法获取请求来源 IP。',
};

function usage(): void {
  console.log(`用法：
  npm run check:map-key                读取 .env.local / .env
  npm run check:map-key -- --key 你的Key   临时验证，不写入文件

只调用一次地名搜索（地理编码）接口，不消耗地图瓦片配额。`);
}

function argValue(flag: string): string | null {
  const index = process.argv.indexOf(flag);
  if (index === -1) return null;
  const value = process.argv[index + 1];
  return value && !value.startsWith('--') ? value.trim() : null;
}

function findKey(): { key: string; source: string } | null {
  const fromFlag = argValue('--key');
  if (fromFlag) return { key: fromFlag, source: '命令行参数' };

  for (const file of ENV_FILES) {
    const path = join(process.cwd(), file);
    if (!existsSync(path)) continue;
    const value = readEnvValue(readFileSync(path, 'utf8'), 'VITE_TIANDITU_KEY');
    if (value) return { key: value, source: file };
  }

  const fromProcess = process.env.VITE_TIANDITU_KEY?.trim();
  if (fromProcess) return { key: fromProcess, source: '环境变量' };
  return null;
}

async function main(): Promise<number> {
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    usage();
    return 0;
  }

  const found = findKey();
  if (!found) {
    console.error(`没有找到 VITE_TIANDITU_KEY。

在项目根目录新建 .env.local，写入一行：

  VITE_TIANDITU_KEY=你的Key

然后重新运行 npm run check:map-key。申请步骤见 docs/map-setup.md。`);
    return 2;
  }

  console.log('天地图密钥自检');
  console.log(`  来源：${found.source}`);
  console.log(`  密钥：${maskKey(found.key)}`);
  console.log(`  探测：地名搜索（地理编码），关键词「${PROBE_KEYWORD}」`);
  console.log('');

  const url = `${PROBE_URL}?ds=${encodeURIComponent(JSON.stringify({ keyWord: PROBE_KEYWORD }))}&tk=${encodeURIComponent(found.key)}`;

  let response: Response;
  try {
    response = await fetch(url, {
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: {
        // A browser key may be restricted by domain. Sending a local origin
        // makes the probe behave like the dev server rather than like a bot.
        Referer: 'http://localhost:5173/',
        Origin: 'http://localhost:5173',
      },
    });
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    console.error(`结果：请求失败 —— ${reason}`);
    console.error('网络不通或被拦截时，先确认能否打开 https://www.tianditu.gov.cn/。');
    return 1;
  }

  const body = await response.text();
  const result = classifyProbe(response.status, body);

  if (result.kind === 'ok') {
    const where =
      result.longitude !== null && result.latitude !== null
        ? `（${result.longitude.toFixed(4)}, ${result.latitude.toFixed(4)}）`
        : '';
    console.log(`结果：可用。匹配到「${result.label ?? PROBE_KEYWORD}」${where}`);
    console.log('');
    console.log('下一步：把 Key 留在 .env.local，运行 npm run dev（改了 .env 必须重启），');
    console.log('打开 http://localhost:5173/ ，地图栏应出现真实底图。');
    return 0;
  }

  if (result.kind === 'rejected') {
    // A browser key is exactly what this project needs, and the service API is
    // documented to refuse it. That is not a failure of the key.
    if (result.code === 301012) {
      console.log('结果：Key 类型正确（浏览器端）。服务端接口按设计拒绝这次探测，不能据此判断有效或无效。');
      console.log('');
      console.log('下一步：重启 npm run dev，打开 http://localhost:5173/ ，看地图栏是否出现底图。');
      return 0;
    }

    console.error(`结果：被拒绝 —— ${result.message}${result.code !== null ? `（code ${result.code}）` : ''}`);
    for (const line of explainCode(result.code)) console.error(`  · ${line}`);
    if (result.code === 301013) {
      console.error('  · 结论：这次探测不能证明 Key 无效，请按 docs/map-setup.md 第 5.2 节在浏览器里复核。');
    }
    if (result.resolve) console.error(`  服务商提示：${result.resolve}`);
    return 1;
  }

  if (result.kind === 'http-error') {
    console.error(`结果：HTTP ${result.httpStatus} —— ${result.message}`);
    const hint = GATEWAY_CODES[result.httpStatus];
    if (hint) console.error(`  · ${hint}`);
    return 1;
  }

  console.error(`结果：无法判断（HTTP ${result.httpStatus}）—— ${result.message}`);
  console.error('  · 密钥可能有效，但服务返回了未预期的结构；请把这一行发给维护者。');
  return 1;
}

main()
  .then((code) => {
    process.exitCode = code;
  })
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
