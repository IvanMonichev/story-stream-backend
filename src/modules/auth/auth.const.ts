export enum TOKEN_TYPE {
  Access = 'Access',
}

export const cookieName: Record<TOKEN_TYPE, string> = {
  [TOKEN_TYPE.Access]: 'access',
};
