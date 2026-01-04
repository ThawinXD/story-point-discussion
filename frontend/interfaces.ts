export interface IUser {
  id: string | undefined;
  name: string;
}

export interface IResRoom {
  success: boolean;
  roomId?: string;
  error?: string;
  action?: number;
}

export interface IRoomUser {
  name: string;
  isVoted: boolean;
}

export interface IEstimation {
  name: string;
  vote: string;
}

export interface IRoom {
  roomId: string;
  host: string;
  users: IRoomUser[];
  cards: string[];
  canVote: boolean;
  revealed: boolean;
  estimations: IEstimation[];
  voteResult: IVoteResult;
}

export interface IVoteResult {
  votes: [string, number][];
}