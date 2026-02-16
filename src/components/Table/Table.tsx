import { useMemo } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
} from "material-react-table";
import { IGoldPrice, ITable } from "./types";
import { englishToPersianDigits } from "../../utils/stringHelper";
import { toJalali } from "../../utils/toJalali";

const Table = ({ data }: ITable) => {
  const columns = useMemo<MRT_ColumnDef<IGoldPrice>[]>(
    () => [
      {
        accessorKey: "source",
        header: "وب‌سایت",
        enableSorting: false,
        size: 100,
      },
      {
        accessorKey: "price",
        header: "قیمت خرید به تومان",
        accessorFn(originalRow) {
          return <span className="center">{englishToPersianDigits(originalRow?.price)}</span>
        },
        size: 120,
      },
      {
        accessorKey: "api_date",
        header: "تاریخ آخرین تغییر",
        accessorFn(originalRow) {
          return toJalali(originalRow.api_date)
        },
        enableSorting: false,
        size: 130,
      },
    ],
    [],
  );

  const table = useMaterialReactTable({
    columns,
    data,
    columnResizeDirection: "rtl",
    enablePagination: false,
    enableBottomToolbar: false,
    enableGlobalFilter: false,
    enableFilters: false,
    enableColumnActions: false,
    enableColumnFilters: false,
    enableDensityToggle: false,
    enableTopToolbar: false,
    enableColumnFilterModes: false,
    enableFullScreenToggle: false,
    enableHiding: false,
    muiTableBodyRowProps: () => ({
      sx: {
        backgroundColor: "#000",
      },
    }),
    muiTableHeadCellProps: () => ({
      sx: {
        backgroundColor: "#000",
      },
    }),
    localization: {
      language: "fa",
      sortByColumnAsc: "",
      sortByColumnDesc: "",
      sortedByColumnAsc: "",
      sortedByColumnDesc: "",
    },
  });

  return <MaterialReactTable table={table} />;
};

export default Table;
