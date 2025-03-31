import * as bcrypt from 'bcrypt';
import { ReviewEntity } from "./../../reviews/entities/review.entity";
import { BaseEntity } from "./../../common/config/base.entity";
import { UserRole } from "./../../common/enums/user-role.enum";
import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany } from "typeorm";
import { FavoriteEntity } from "./../../favorites/entities/favorite.entity";

@Entity({ name: 'user' })
export class UserEntity extends BaseEntity {
  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ type: 'varchar' })
  password: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @OneToMany(
    () => ReviewEntity,
    (review) => review.user
  )
  reviews: ReviewEntity[];

  @OneToMany(
    () => FavoriteEntity,
    (favorite) => favorite.user
  )
  favorites: FavoriteEntity[];

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password) {
      // Only hash the password if it's being set or updated
      const salt = await bcrypt.genSalt()
      this.password = await bcrypt.hash(this.password, salt)
    }
  }

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password)
  }
}
