import { User } from 'src/users/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

@Entity()
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 'No title' })
  title: string;

  @Column({ default: 'No content' })
  content: string;

  @Column()
  authorId: number;

  @ManyToOne(() => User, (user) => user.posts)
  author: User;
}
