import { useMemo } from 'react';
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
} from 'material-react-table';
import { IGoldPrice, ITable } from './types';
import { englishToPersianDigits } from '../../utils/stringHelper';

const Table = ({data}: ITable) => {
  const columns = useMemo<MRT_ColumnDef<IGoldPrice>[]>(
    () => [
      {
        accessorKey: 'source',
        header: 'آدرس وب‌سایت',
        size: 150,
      },
      {
        accessorKey: 'price',
        header: 'قیمت به تومان',
        accessorFn(originalRow) {
          return englishToPersianDigits(originalRow?.price)
        },
        size: 200,
      },
      {
        accessorKey: 'api_date',
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
