/**
 * Helpers for `npm run check:map-key`.
 *
 * Pure functions only, so the probe classification can be tested without a
 * network. The probe itself lives in `scripts/check-map-key.ts`.
 */

export interface Rejection {
  kind: 'rejected';
  httpStatus: number;
  /** Provider service code, when the body carries one (for example 301001). */
  code: number | null;
  message: string;
  resolve: string | null;
}

export interface Acceptance {
  kind: 'ok';
  httpStatus: number;
  /** Best-effort place label returned by the geocoder, for a human to eyeball. */
  label: string | null;
  longitude: number | null;
  latitude: number | null;
}

export interface ProbeProblem {
  kind: 'http-error' | 'unexpected';
  httpStatus: number;
  message: string;
}

export type ProbeResult = Rejection | Acceptance | ProbeProblem;

/**
 * Reads one variable from dotenv-style text.
 *
 * Handles `export ` prefixes, single or double quotes, inline `#` comments and
 * trailing whitespace — all of which are common when a key is pasted by hand.
 * Returns null when the variable is absent, empty, or only a comment.
 */
export function readEnvValue(text: string, name: string): string | null {
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    const withoutExport = line.startsWith('export ') ? line.slice(7).trim() : line;
    const equals = withoutExport.indexOf('=');
    if (equals <= 0) continue;

    const key = withoutExport.slice(0, equals).trim();
    if (key !== name) continue;

    let value = withoutExport.slice(equals + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1).trim();
    } else {
      // An unquoted `#` starts a comment only when preceded by whitespace.
      const comment = value.search(/\s#/);
      if (comment >= 0) value = value.slice(0, comment).trim();
    }
    return value.length > 0 ? value : null;
  }
  return null;
}

/** Never print a full key: logs get pasted into issues and chat. */
export function maskKey(key: string): string {
  if (key.length <= 8) return `${'*'.repeat(key.length)} (${key.length})`;
  return `${key.slice(0, 4)}…${key.slice(-4)} (${key.length} 位)`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function toNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '' && Number.isFinite(Number(value))) {
    return Number(value);
  }
  return null;
}

/**
 * Classifies a geocoder response.
 *
 * Two shapes are documented by the provider in practice:
 *   success — `{ "status": "0", "location": { "lon": "...", "lat": "..." } }`
 *   failure — `{ "msg": "非法key", "code": 301001, "resolve": "..." }`
 * Anything else is reported as unexpected rather than guessed at.
 */
export function classifyProbe(httpStatus: number, body: string): ProbeResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(body);
  } catch {
    return {
      kind: httpStatus >= 200 && httpStatus < 300 ? 'unexpected' : 'http-error',
      httpStatus,
      message: body.trim().slice(0, 160) || '(空响应)',
    };
  }

  if (!isRecord(parsed)) {
    return { kind: 'unexpected', httpStatus, message: '返回的 JSON 不是对象。' };
  }

  const code = toNumber(parsed.code);
  if (code !== null) {
    return {
      kind: 'rejected',
      httpStatus,
      code,
      message: typeof parsed.msg === 'string' ? parsed.msg : '(未给出原因)',
      resolve: typeof parsed.resolve === 'string' ? parsed.resolve : null,
    };
  }

  const status = parsed.status;
  if (status === '0' || status === 0 || status === 'ok') {
    const location = isRecord(parsed.location) ? parsed.location : null;
    return {
      kind: 'ok',
      httpStatus,
      label: location && typeof location.keyWord === 'string' ? location.keyWord : null,
      longitude: location ? toNumber(location.lon) : null,
      latitude: location ? toNumber(location.lat) : null,
    };
  }

  return {
    kind: 'unexpected',
    httpStatus,
    message: `status=${String(status ?? '(缺失)')} msg=${String(parsed.msg ?? '(缺失)')}`,
  };
}

/** Human-readable cause for the service codes this project has evidence for. */
export function explainCode(code: number | null): string[] {
  switch (code) {
    case 301001:
      return [
        '密钥不存在或被判为非法：常见于复制时漏字符、带了引号或空格。',
        '也可能用了「服务端」类型的 Key —— 网页必须用「浏览器端」。',
        '刚创建的 Key 可能有短暂延迟，等 1–2 分钟再试。',
      ];
    case 301012:
      return [
        '这是「浏览器端」Key，服务端接口按设计拒绝它 —— 说明 Key 的类型选对了。',
        '命令行探测无法验证浏览器端 Key；请在浏览器里确认底图是否出现（docs/map-setup.md 第 5.2 节）。',
      ];
    case 301013:
      return [
        'Key 类型与调用方式不匹配：浏览器端 Key 不支持这种服务端直连，或相反。',
        '若 Key 设了域名白名单，命令行探测没有浏览器来源，也可能被拒绝；这并不代表网页里不能用。',
      ];
    case 301002:
      return ['服务未授权：创建应用时可能没有勾选所需的地图 API 服务。'];
    default:
      return ['对照 docs/map-setup.md 的「报错对照表」逐项排查。'];
  }
}
