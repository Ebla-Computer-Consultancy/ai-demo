import { MessageRole } from '../types/types';
import { cloneable } from './cloneable';

export class Message extends cloneable<Message> {
    context!: IContext;
    end_turn!: boolean;
    function_call!: unknown;
    tool_calls!: unknown;
    constructor(
        public content: string = '',
        public role: MessageRole = 'user'
    ) {
        super();
    }
}

interface IContext {
    citations: ICitations[];
    intent: string;
}
export interface ICitations {
    filepath: string;
    content: string;
    url: string;
}
