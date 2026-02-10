export type IGoldPrice = {
  website: string;
  name: string;
  priceIRT: number;
  commission: number;
  last_modified: number;
};

export interface ITable {
    data: IGoldPrice[]
}