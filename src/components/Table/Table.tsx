import { useMemo } from 'react';
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
} from 'material-react-table';

type GoldPrice = {
  website: string;
  name: string;
  priceIRT: number;
  commission: number;
  last_modified: number;
};

const data: GoldPrice[] = [
  {
    website: 'https://wallgold.ir/',
    name: 'وال گلد',
    priceIRT: 6658000,
    commission: 0.1,
    last_modified: 1741697612416,
  },
];

const Table = () => {
  const columns = useMemo<MRT_ColumnDef<GoldPrice>[]>(
    () => [
      {
        accessorKey: 'website',
        header: 'آدرس وب‌سایت',
        size: 150,
      },
      {
        accessorKey: 'name',
        header: 'نام وب سایت',
        size: 150,
      },
      {
        accessorKey: 'priceIRT',
        header: 'قیمت به تومان',
        accessorFn(originalRow) {
          return originalRow.priceIRT.toLocaleString('fa-IR')
        },
        size: 200,
      },
      {
        accessorKey: 'commission',
        header: 'کمیسیون',
        size: 150,
      },
      {
        accessorKey: 'last_modified',
        header: 'تاریخ آخرین تغییر',
        size: 150,
      },
    ],
    [],
  );

  const table = useMaterialReactTable({
    columns,
    data,
    columnResizeDirection: 'rtl',
  });

  return <MaterialReactTable table={table} />;
};

export default Table;
