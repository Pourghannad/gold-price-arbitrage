export type IGoldPrice = {
  source: string;
  success: boolean;
  price: number;
  api_date: string;
};

export interface ITable {
    data: IGoldPrice[]
}