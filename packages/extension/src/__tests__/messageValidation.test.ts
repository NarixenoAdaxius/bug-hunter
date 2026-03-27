import { describe, it, expect } from 'vitest';

function isValidWebviewMessage(data: unknown): boolean {
  if (data == null || typeof data !== 'object' || !('type' in data)) return false;
  const obj = data as Record<string, unknown>;
  if (obj.type === 'ready') return true;
  if (obj.type === 'userAction') {
    const payload = obj.payload;
    if (payload == null || typeof payload !== 'object') return false;
    const p = payload as Record<string, unknown>;
    return typeof p.action === 'string';
  }
  if (obj.type === 'cosmeticAction') {
    const payload = obj.payload;
    if (payload == null || typeof payload !== 'object') return false;
    const p = payload as Record<string, unknown>;
    const cat = p.category;
    const okCat = cat === 'pet' || cat === 'avatar' || cat === 'border' || cat === 'theme';
    return okCat && (p.action === 'purchase' || p.action === 'equip') && typeof p.id === 'string';
  }
  return false;
}

describe('isValidWebviewMessage', () => {
  it('accepts ready message', () => {
    expect(isValidWebviewMessage({ type: 'ready' })).toBe(true);
  });

  it('accepts userAction with action string', () => {
    expect(
      isValidWebviewMessage({ type: 'userAction', payload: { action: 'attack', bugId: '1' } })
    ).toBe(true);
  });

  it('accepts userAction without bugId', () => {
    expect(isValidWebviewMessage({ type: 'userAction', payload: { action: 'test' } })).toBe(true);
  });

  it('rejects null', () => {
    expect(isValidWebviewMessage(null)).toBe(false);
  });

  it('rejects undefined', () => {
    expect(isValidWebviewMessage(undefined)).toBe(false);
  });

  it('rejects missing type', () => {
    expect(isValidWebviewMessage({ payload: 'x' })).toBe(false);
  });

  it('rejects unknown type', () => {
    expect(isValidWebviewMessage({ type: 'unknown' })).toBe(false);
  });

  it('accepts cosmeticAction purchase', () => {
    expect(
      isValidWebviewMessage({
        type: 'cosmeticAction',
        payload: { action: 'purchase', category: 'pet', id: 'pet-duck' },
      })
    ).toBe(true);
  });

  it('rejects cosmeticAction with bad category', () => {
    expect(
      isValidWebviewMessage({
        type: 'cosmeticAction',
        payload: { action: 'purchase', category: 'nope', id: 'x' },
      })
    ).toBe(false);
  });

  it('rejects userAction without payload', () => {
    expect(isValidWebviewMessage({ type: 'userAction' })).toBe(false);
  });

  it('rejects userAction with non-string action', () => {
    expect(isValidWebviewMessage({ type: 'userAction', payload: { action: 42 } })).toBe(false);
  });

  it('rejects primitive values', () => {
    expect(isValidWebviewMessage('ready')).toBe(false);
    expect(isValidWebviewMessage(42)).toBe(false);
  });
});
