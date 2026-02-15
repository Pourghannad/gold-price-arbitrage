export type IGoldPrice = {
  website: string;
  priceIRT: number;
  commission: number;
  last_modified: number;
};

export interface ITable {
    data: IGoldPrice[]
}