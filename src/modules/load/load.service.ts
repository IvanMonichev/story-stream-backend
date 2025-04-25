import { Injectable } from '@nestjs/common';

@Injectable()
export class LoadService {
  simulateCpu(duration = 5000): void {
    const start = Date.now();
    while (Date.now() - start < duration) {
      Math.sqrt(Math.random() * Number.MAX_SAFE_INTEGER);
    }
  }
}
