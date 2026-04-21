export interface Friend {
  ID: string;
  user_wallet_address?: string;
  friend_wallet_address: string;
  nickname: string;
  User?: User;
  Friend?: User;
}
