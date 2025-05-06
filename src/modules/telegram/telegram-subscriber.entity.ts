import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('telegram_subscribers')
export class TelegramSubscriberEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  chatId: number;
}
