import { Injectable } from '@nestjs/common';

@Injectable()
export class LoadService {
  simulateCpu(): void {
    let result = 0;
    for (let i = 0; i < 1e9; i++) {
      result += Math.sin(i) * Math.cos(i) + Math.pow(i, 2);
    }
    console.log(result);
  }
}
