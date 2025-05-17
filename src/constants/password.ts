import { compare } from 'bcrypt';

export const checkPassword = async (password: string, password_user: string) => {
  return await compare(password, password_user);
};
