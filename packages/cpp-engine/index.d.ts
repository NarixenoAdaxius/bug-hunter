export type ScanStatsResult = {
  byteLength: number;
  lineCount: number;
};

/**
 * Returns UTF-8 byte length and line count for the given string (native N-API implementation).
 */
export function scanStats(code: string): ScanStatsResult;
