export interface IUser {
  id: string | undefined;
  name: string;
}

export interface IResRoom {
  success: boolean;
  roomId?: string;
  error?: string;
}