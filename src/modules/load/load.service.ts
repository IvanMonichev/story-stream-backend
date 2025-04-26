import { Injectable } from '@nestjs/common';

@Injectable()
export class LoadService {
  async simulateCpu(duration = 5000): Promise<void> {
    const end = Date.now() + duration;
    while (Date.now() < end) {
      // Выполняем тяжёлые математические вычисления
      for (let i = 0; i < 1e5; i++) {
        const x = Math.pow(Math.random() * 1000, 5);
        Math.log(Math.sqrt(x));
      }
    }
  }
}
