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
        accessorKey: 'website',
        header: 'آدرس وب‌سایت',
        size: 150,
      },
      {
        accessorKey: 'priceIRT',
        header: 'قیمت به تومان',
        accessorFn(originalRow) {
          return englishToPersianDigits(originalRow?.priceIRT)
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
