export interface IResult<M> {
    count: number;
    total_count: number;
    page_number: number;
    rs: M[];
}
