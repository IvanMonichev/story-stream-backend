import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { LoadService } from './load.service';

@ApiTags('Load')
@Controller('load')
export class LoadController {
  constructor(private readonly loadService: LoadService) {}

  @Get('cpu')
  @ApiOperation({
    summary: 'Симулировать нагрузку на CPU',
    description: 'Грузит CPU синхронным вычислением на 5 секунд',
  })
  async simulateCpuLoad(): Promise<string> {
    await this.loadService.simulateCpu();
    return 'CPU load completed';
  }
}
