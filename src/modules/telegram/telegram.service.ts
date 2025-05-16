import { PostEntity } from '@/modules/post/entities/post.entity';
import { TelegramSubscriberEntity } from '@/modules/telegram/telegram-subscriber.entity';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as TelegramBot from 'node-telegram-bot-api';
import * as process from 'process';
import { Repository } from 'typeorm';

@Injectable()
export class TelegramService implements OnModuleInit {
  private bot: TelegramBot | null;
  private readonly logger = new Logger(TelegramService.name);
  private subscribers: number[] = [];

  constructor(
    @InjectRepository(TelegramSubscriberEntity)
    private readonly subscriberRepository: Repository<TelegramSubscriberEntity>,
  ) {}

  async onModuleInit() {
    const token = process.env.TELEGRAM_BOT_TOKEN;

    if (!token || token === 'secret') {
      this.logger.warn('TELEGRAM_BOT_TOKEN не задан. Бот не будет инициализирован.');
      return;
    }

    try {
      this.bot = new TelegramBot(token, { polling: true });

      const me = await this.bot.getMe();
      this.logger.log(`Telegram Bot инициализирован: ${me.username}`);
    } catch (e) {
      this.logger.error('Невалидный токен или ошибка при инициализации Telegram Bot', e);
      this.bot = null;
      return;
    }

    const all = await this.subscriberRepository.find();
    this.subscribers = all.map((sub) => sub.chatId);

    this.logger.log('Telegram-бот успешно запущен.');

    this.bot.onText(/\/start/, async (msg) => {
      const chatId = msg.chat.id;

      const exists = await this.subscriberRepository.findOneBy({ chatId });
      if (!exists) {
        await this.subscriberRepository.save({ chatId });
        this.subscribers.push(chatId);
        await this.bot?.sendMessage(chatId, 'Вы успешно подписались на уведомления.');
      } else {
        await this.bot?.sendMessage(chatId, 'Вы уже подписаны.');
      }
    });
  }

  async notifyPostCreated(post: PostEntity) {
    const message = `📝 <b>Новый пост создан</b>\n\n<b>ID:</b> ${post.id}\n<b>Заголовок:</b> ${post.title}\n<b>Содержание:</b>\n${post.body}`;
    await this.broadcast(message);
  }

  async notifyPostUpdated(post: PostEntity) {
    const message = `✏️ <b>Пост обновлён</b>\n\n<b>ID:</b> ${post.id}\n<b>Обновлённый заголовок:</b> ${post.title}\n<b>Новое содержание:</b>\n${post.body}`;
    await this.broadcast(message);
  }

  async notifyPostDeleted(id: number) {
    const message = `🗑️ <b>Пост удалён</b>\n\n<b>ID:</b> ${id}`;
    await this.broadcast(message);
  }

  private async broadcast(message: string) {
    if (!this.bot) return;
    for (const chatId of this.subscribers) {
      try {
        await this.bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
      } catch (error) {
        this.logger.error(`Ошибка отправки сообщения в чат ${chatId}: ${error.message}`);
      }
    }
  }
}
