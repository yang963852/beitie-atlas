import { describe, expect, it } from 'vitest';
import { classifyProbe, explainCode, maskKey, readEnvValue } from '../scripts/lib/map-key';

describe('readEnvValue', () => {
  it('reads a plain assignment', () => {
    expect(readEnvValue('VITE_TIANDITU_KEY=abc123', 'VITE_TIANDITU_KEY')).toBe('abc123');
  });

  it('strips quotes and an export prefix left over from a shell habit', () => {
    expect(readEnvValue('export VITE_TIANDITU_KEY="abc123"', 'VITE_TIANDITU_KEY')).toBe('abc123');
    expect(readEnvValue("VITE_TIANDITU_KEY='abc123'", 'VITE_TIANDITU_KEY')).toBe('abc123');
  });

  it('drops an unquoted trailing comment but keeps a hash inside a quoted value', () => {
    expect(readEnvValue('VITE_TIANDITU_KEY=abc123 # 本地', 'VITE_TIANDITU_KEY')).toBe('abc123');
    expect(readEnvValue('VITE_TIANDITU_KEY="ab#c"', 'VITE_TIANDITU_KEY')).toBe('ab#c');
  });

  it('ignores a commented-out assignment and an empty value', () => {
    expect(readEnvValue('# VITE_TIANDITU_KEY=abc\n', 'VITE_TIANDITU_KEY')).toBeNull();
    expect(readEnvValue('VITE_TIANDITU_KEY=\n', 'VITE_TIANDITU_KEY')).toBeNull();
    expect(readEnvValue('OTHER=1', 'VITE_TIANDITU_KEY')).toBeNull();
  });
});

describe('maskKey', () => {
  it('never returns the full key', () => {
    const key = '0123456789abcdef0123456789abcdef';
    const masked = maskKey(key);
    expect(masked).not.toContain('89abcdef');
    expect(masked.startsWith('0123')).toBe(true);
    expect(masked).toContain('32');
  });

  it('fully masks a short value rather than revealing it', () => {
    expect(maskKey('abcd')).toBe('**** (4)');
  });
});

describe('classifyProbe', () => {
  it('accepts the documented success shape and reads the matched point', () => {
    const body = JSON.stringify({
      status: '0',
      location: { keyWord: '西安碑林博物馆', lon: '108.9523', lat: '34.2571' },
    });
    const result = classifyProbe(200, body);
    expect(result.kind).toBe('ok');
    if (result.kind !== 'ok') return;
    expect(result.label).toBe('西安碑林博物馆');
    expect(result.longitude).toBeCloseTo(108.9523);
    expect(result.latitude).toBeCloseTo(34.2571);
  });

  it('reports the provider code for an invalid key', () => {
    const body = JSON.stringify({
      msg: '非法key',
      code: 301001,
      resolve: '请到API控制台重新申请Key',
    });
    const result = classifyProbe(200, body);
    expect(result.kind).toBe('rejected');
    if (result.kind !== 'rejected') return;
    expect(result.code).toBe(301001);
    expect(result.message).toBe('非法key');
    expect(result.resolve).toBe('请到API控制台重新申请Key');
  });

  it('does not call a non-JSON body a rejected key', () => {
    const result = classifyProbe(502, '<html>gateway</html>');
    expect(result.kind).toBe('http-error');
    if (result.kind !== 'http-error') return;
    expect(result.httpStatus).toBe(502);
  });

  it('marks an unknown JSON shape as unexpected instead of guessing', () => {
    const result = classifyProbe(200, JSON.stringify({ status: '1', msg: '无结果' }));
    expect(result.kind).toBe('unexpected');
  });
});

describe('explainCode', () => {
  it('distinguishes an invalid key from a key-type mismatch', () => {
    expect(explainCode(301001).join('')).toContain('浏览器端');
    expect(explainCode(301013).join('')).toContain('白名单');
  });

  it('treats a browser-key refusal as a type confirmation, not a broken key', () => {
    const lines = explainCode(301012).join('');
    expect(lines).toContain('浏览器端');
    expect(lines).toContain('类型选对了');
  });
});
