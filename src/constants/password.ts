import { genSalt, hash, compare } from 'bcrypt';

export const MIN_LENGTH_PASSWORD = 8;

export const MIN_1_UPPER_LETTER = /^(?=(.*[A-Z]){1})/;
export const ONLY_LATIN_CHARACTERS_AND_SPECIAL_SYMBOLS = /^[a-zA-Z0-9!?@#$%^&*()]*$/; // !, ?, @, #, $, %, ^, &, *, (, )

export const MIN_LENGTH_PASSWORD_MESSAGE = 'The password must contain more than 8 characters.';

export const MIN_1_UPPER_LETTER_PASSWORD_MESSAGE =
  'The password must contain at least 1 uppercase letter';

export const ONLY_LATIN_CHARACTERS_AND_SPECIAL_SYMBOLS_PASSWORD_MESSAGE =
  'The password may contain only Latin characters and special symbols: !, @, #, $, %, ^, &, *, (, )';

export const hashPassword = async (password: string) => {
  const newSalt = await genSalt(10);
  return await hash(password, newSalt);
};

export const checkPassword = async (password: string, password_user: string) => {
  return await compare(password, password_user);
};
