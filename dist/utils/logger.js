"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
class Logger {
    constructor(verbose = true) {
        this.verbose = verbose;
    }
    info(message, ...args) {
        if (this.verbose) {
            console.log('ℹ', message, ...args);
        }
    }
    success(message, ...args) {
        if (this.verbose) {
            console.log('✅', message, ...args);
        }
    }
    warn(message, ...args) {
        if (this.verbose) {
            console.log('⚠️', message, ...args);
        }
    }
    error(message, ...args) {
        console.error('❌', message, ...args);
    }
    step(step, total, message) {
        if (this.verbose) {
            console.log(`[${step}/${total}]`, message);
        }
    }
}
exports.Logger = Logger;
