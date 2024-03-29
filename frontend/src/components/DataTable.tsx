import * as React from 'react';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  HStack,
  Box,
  TableProps,
} from '@chakra-ui/react';
import { IoChevronDown, IoChevronUp } from 'react-icons/io5';
import {
  useReactTable,
  flexRender,
  getCoreRowModel,
  ColumnDef,
  SortingState,
  getSortedRowModel,
  TableOptions,
} from '@tanstack/react-table';

export type DataTableProps<Data extends object> = {
  data: Data[];
  columns: ColumnDef<Data, any>[];
  options?: Partial<TableOptions<Data>>;
  tableProps?: TableProps;
};

export function DataTable<Data extends object>({
  data,
  columns,
  options = {},
  tableProps,
}: DataTableProps<Data>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
    ...options,
  });

  return (
    <Table {...tableProps}>
      <Thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <Tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => {
              // see https://tanstack.com/table/v8/docs/api/core/column-def#meta to type this correctly
              const meta: any = header.column.columnDef.meta;
              return (
                <Th
                  key={header.column.id}
                  onClick={header.column.getToggleSortingHandler()}
                  isNumeric={meta?.isNumeric}
                  cursor="pointer"
                  textTransform="none"
                >
                  <HStack>
                    <Box>
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </Box>

                    {header.column.getIsSorted() ? (
                      header.column.getIsSorted() === 'desc' ? (
                        <IoChevronDown aria-label="sorted descending" />
                      ) : (
                        <IoChevronUp aria-label="sorted ascending" />
                      )
                    ) : null}
                  </HStack>
                </Th>
              );
            })}
          </Tr>
        ))}
      </Thead>
      <Tbody>
        {table.getRowModel().rows.map((row) => {
          const tableMeta: any = (table.options.meta as any) || {};
          const rowProps =
            (tableMeta.rowProps && tableMeta.rowProps(row)) || {};
          return (
            <Tr key={row.id} {...rowProps}>
              {row.getVisibleCells().map((cell) => {
                // see https://tanstack.com/table/v8/docs/api/core/column-def#meta to type this correctly
                const meta: any = cell.column.columnDef.meta || {};
                const colProps = (meta.cellProps && meta.cellProps(cell)) || {};
                return (
                  <Td key={cell.id} isNumeric={meta?.isNumeric} {...colProps}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </Td>
                );
              })}
            </Tr>
          );
        })}
      </Tbody>
    </Table>
  );
}
