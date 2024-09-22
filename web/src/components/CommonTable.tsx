import { getThemes } from "@/util";
import {
  Pagination,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/react";
import { useEffect, useState } from "react";

export type CommonTableColumnProps = {
  style?: any; //CSS;
  rowStyle?: any; //CSS;
  label: string;
  value?: string;
  component?: (value: any, row: any) => JSX.Element;
};

type TableProps = {
  columns?: Array<CommonTableColumnProps>;
  data?: any;
  isLoading?: boolean;
  pagination?: { perPage: number; page?: number };
  border?: boolean;
};
const CommonTable = ({
  columns = [],
  data = [],
  isLoading,
  pagination: initPagination,
  border
}: TableProps) => {
  const [pagination, setPagination] = useState<{
    perPage: number;
    page: number;
  }>({ page: 1, perPage: 5, ...initPagination });
  const [paginatedData, setPaginatedData] = useState<any[]>([]);


  useEffect(() => {
    const startFrom = (pagination?.page - 1) * pagination.perPage;
    const endWith = pagination.page * pagination.perPage;
    setPaginatedData(data.slice(startFrom, endWith))

  }, [pagination, data]);

  const onChangePage = (pageNumber: number) => {
    setPagination({ ...pagination, page: pageNumber });
  };

  const { themeLabel } = getThemes();

  return (
    <div className="common-table bg-backgroundContrast text-textColor rounded-xl shadow-small">
      <Table
        aria-label="commonTables"
      >
        <TableHeader>
          {columns.map((col, i) => (
            <TableColumn
              className="bg-background text-secondaryText font-bold w-3/12 px-4 h-[32px]"
              key={i}
              style={col.style}
            >
              {col.label}
            </TableColumn>
          ))}
        </TableHeader>
        <TableBody
          isLoading={isLoading}
          loadingContent={isLoading && <Spinner color="secondary" className="mt-10" />}
          emptyContent={
            !isLoading && !data.length && (
              <p className="mt-6 font-semibold text-secondaryText">
                No Data Found
              </p>
            )
          }
        >
          {paginatedData.map((row: any, i: number) => {
            return (
              <TableRow
                key={i}
              >
                {columns.map((col, i) => {
                  return (
                    <TableCell
                      className={`text-textColor text-base tracking-tighter first:ps-1.5 last:pe-3 ps-[18px] py-0 pe-0 pb-0.5 leading-[2] text-nowrap before:opacity-100 before:border-b before:border-b-borderGray before:!rounded-none ${border ?? true ? '' : 'before:hidden'}`}
                      key={i}
                      style={col.rowStyle}
                    >
                      <>
                        {col.component
                          ? col.component(row[col.value ?? ""], row)
                          : row[col.value ?? ""]}
                      </>
                    </TableCell>
                  );
                })}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <div>
        {(pagination && data.length) > pagination.perPage ? (
          <div className="flex w-full justify-center sticky left-0">
            <Pagination
              className={`${themeLabel}-pagination mt-0 mb-2  table-pagination`}
              showControls
              initialPage={1}
              page={pagination.page}
              total={Math.ceil(data.length / pagination.perPage)}
              onChange={onChangePage}
            />
          </div>
        ) : (
          <></>
        )}
      </div>
    </div >
  );
};

export default CommonTable;
