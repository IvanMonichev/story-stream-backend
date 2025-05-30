import { Test, TestingModule } from '@nestjs/testing';
import { TelegramService } from './telegram.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TelegramSubscriberEntity } from './telegram-subscriber.entity';
import { PostEntity } from '@/modules/post/entities/post.entity';
import { Repository } from 'typeorm';
import * as TelegramBot from 'node-telegram-bot-api';

jest.mock('node-telegram-bot-api');

describe('TelegramService', () => {
  let service: TelegramService;
  let botSendMessage: jest.Mock;
  let subscriberRepo: Partial<Repository<TelegramSubscriberEntity>>;

  beforeEach(async () => {
    botSendMessage = jest.fn();

    (TelegramBot as jest.Mock).mockImplementation(() => ({
      getMe: jest.fn().mockResolvedValue({ username: 'TestBot' }),
      onText: jest.fn(),
      sendMessage: botSendMessage,
    }));

    subscriberRepo = {
      find: jest.fn().mockResolvedValue([{ chatId: 123 }, { chatId: 456 }]),
      findOneBy: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TelegramService,
        {
          provide: getRepositoryToken(TelegramSubscriberEntity),
          useValue: subscriberRepo,
        },
      ],
    }).compile();

    service = module.get<TelegramService>(TelegramService);

    process.env.TELEGRAM_BOT_TOKEN = 'dummy_token';
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should log warning and skip bot init if token is missing', async () => {
    process.env.TELEGRAM_BOT_TOKEN = '';

    const logSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const loggerSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const initResult = await service.onModuleInit();

    expect(initResult).toBeUndefined();
    logSpy.mockRestore();
    loggerSpy.mockRestore();
  });

  it('should handle bot initialization error gracefully', async () => {
    (TelegramBot as jest.Mock).mockImplementation(() => {
      throw new Error('Invalid token');
    });

    process.env.TELEGRAM_BOT_TOKEN = 'invalid';

    const loggerError = jest.spyOn(console, 'error').mockImplementation(() => {});
    const initResult = await service.onModuleInit();

    expect(initResult).toBeUndefined();
    loggerError.mockRestore();
  });

  it('should not send messages if bot is not initialized', async () => {
    // бот не инициализируется — не вызываем onModuleInit
    const result = await (service as any).broadcast('test');
    expect(result).toBeUndefined();
  });

  describe('notifyPostCreated', () => {
    it('should broadcast post created message', async () => {
      await service.onModuleInit();

      const post: PostEntity = {
        id: 1,
        title: 'Test Title',
        body: 'Test Body',
      } as PostEntity;

      await service.notifyPostCreated(post);

      expect(botSendMessage).toHaveBeenCalledTimes(2);
      expect(botSendMessage).toHaveBeenCalledWith(
        123,
        expect.stringContaining('Новый пост создан'),
        { parse_mode: 'HTML' },
      );
    });
  });

  describe('notifyPostUpdated', () => {
    it('should broadcast post updated message', async () => {
      await service.onModuleInit();

      const post: PostEntity = {
        id: 2,
        title: 'Updated Title',
        body: 'Updated Body',
      } as PostEntity;

      await service.notifyPostUpdated(post);

      expect(botSendMessage).toHaveBeenCalledTimes(2);
      expect(botSendMessage).toHaveBeenCalledWith(123, expect.stringContaining('Пост обновлён'), {
        parse_mode: 'HTML',
      });
    });
  });

  describe('notifyPostDeleted', () => {
    it('should broadcast post deleted message', async () => {
      await service.onModuleInit();

      await service.notifyPostDeleted(3);

      expect(botSendMessage).toHaveBeenCalledTimes(2);
      expect(botSendMessage).toHaveBeenCalledWith(123, expect.stringContaining('Пост удалён'), {
        parse_mode: 'HTML',
      });
    });
  });
});
