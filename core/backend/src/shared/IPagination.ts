export interface IPagination {
  limit?: number;
  orderby?: 'ASC' | 'DESC';
  offset?: number;
  sortby?: string;
}
