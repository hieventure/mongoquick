export class Logger {
  private verbose: boolean;

  constructor(verbose: boolean = true) {
    this.verbose = verbose;
  }

  info(message: string, ...args: any[]) {
    if (this.verbose) {
      console.log('ℹ', message, ...args);
    }
  }

  success(message: string, ...args: any[]) {
    if (this.verbose) {
      console.log('✅', message, ...args);
    }
  }

  warn(message: string, ...args: any[]) {
    if (this.verbose) {
      console.log('⚠️', message, ...args);
    }
  }

  error(message: string, ...args: any[]) {
    console.error('❌', message, ...args);
  }

  step(step: number, total: number, message: string) {
    if (this.verbose) {
      console.log(`[${step}/${total}]`, message);
    }
  }
}
