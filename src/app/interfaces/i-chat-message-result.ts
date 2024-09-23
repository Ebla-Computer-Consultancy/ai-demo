import { Message } from '../models/message';
import { FinishReason } from '../types/types';

export interface IChatMessageResult {
    finish_reason: FinishReason;
    index: number;
    logprobs: unknown;
    message: Message;
    error: boolean;
}
