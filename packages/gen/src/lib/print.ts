import logUpdate from 'log-update';

export const PRINT_PREFIX = '[ omega ] ';

export function printInfo(message: string): void {
  console.info(PRINT_PREFIX + message);
}

export function printError(err: Error): void {
  console.error(PRINT_PREFIX, err);
}

export function updateLog(message: string) {
  logUpdate(PRINT_PREFIX + message);
}
