import { Injectable } from '@nestjs/common';

@Injectable()
export class LoadService {
  async simulateCpu(duration = 5000): Promise<void> {
    const end = Date.now() + duration;
    while (Date.now() < end) {
      Math.sqrt(Math.random() * Number.MAX_SAFE_INTEGER);
      await new Promise((resolve) => setImmediate(resolve));
    }
  }
}
