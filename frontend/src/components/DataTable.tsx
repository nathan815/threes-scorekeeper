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
  TableContainer,
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
};

export function DataTable<Data extends object>({
  data,
  columns,
  options = {},
  ...tableProps
}: DataTableProps<Data> & TableProps) {
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
    <TableContainer width="full">
      <Table {...tableProps}>
        <Thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <Tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                // see https://tanstack.com/table/v8/docs/api/core/column-def#meta to type this correctly
                const meta: any = header.column.columnDef.meta;
                // console.log('header', header.column.id, header.column.columnDef.id);
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
            const style =
              (table.options.meta as any)?.rowStyle &&
              (table.options.meta as any).rowStyle(row);
            return (
              <Tr key={row.id} style={style}>
                {row.getVisibleCells().map((cell) => {
                  // see https://tanstack.com/table/v8/docs/api/core/column-def#meta to type this correctly
                  const meta: any = cell.column.columnDef.meta;
                  return (
                    <Td key={cell.id} isNumeric={meta?.isNumeric}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </Td>
                  );
                })}
              </Tr>
            );
          })}
        </Tbody>
      </Table>
    </TableContainer>
  );
}
