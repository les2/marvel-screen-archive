import { describe, expect, it } from 'vitest';
import { PWA_UPDATE_CHECK_INTERVAL_MS, controllerChangeState } from './pwa-update';

describe('PWA update lifecycle', () => {
  it('does not announce the initial service-worker installation', () => {
    expect(controllerChangeState(false)).toEqual({hadController:true,announce:false});
  });

  it('announces a replacement worker taking control', () => {
    expect(controllerChangeState(true)).toEqual({hadController:true,announce:true});
  });

  it('checks for a new release at least hourly while open', () => {
    expect(PWA_UPDATE_CHECK_INTERVAL_MS).toBe(3_600_000);
  });
});
