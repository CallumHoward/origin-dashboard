import * as React from "react";
import { Table } from "reactstrap";
import { useTable, useSortBy, useRowSelect } from "react-table";
import styled from "styled-components";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleUp, faAngleDown } from "@fortawesome/free-solid-svg-icons";

const StyledTr = styled.tr`
  &:hover {
    background-color: #f9f9f9;
  }
`;

export type IElement = {
  col1?: string;
  col2?: string;
  col3?: string;
  col4?: string;
  col5?: string;
  col6?: string;
  col7?: string;
};

type Props = {
  data: any[];
};

const DeviceTable: React.FunctionComponent<Props> = ({data}) => {
  const columns = React.useMemo(
    () => [
      {
        Header: "ID",
        accessor: "col1",
      },
      {
        Header: "Name",
        accessor: "col2",
      },
      {
        Header: "Type",
        accessor: "col3",
      },
      {
        Header: "Last Contact",
        accessor: "col4",
      },
      {
        Header: "Battery",
        accessor: "col5",
      },
      {
        Header: "Version",
        accessor: "col6",
      },
      {
        Header: "Status",
        accessor: "col7",
      },
    ],
    []
  );

  //const data = React.useMemo(
  //  () => [
  //    {
  //      col1: "",
  //      col2: "Stacey",
  //      col3: "",
  //      col4: "",
  //      col5: "",
  //      col6: "",
  //      col7: "",
  //    },
  //    {
  //      col1: "",
  //      col2: "Baby",
  //      col3: "",
  //      col4: "",
  //      col5: "",
  //      col6: "",
  //      col7: "",
  //    },
  //    {
  //      col1: "",
  //      col2: "Mya",
  //      col3: "",
  //      col4: "",
  //      col5: "",
  //      col6: "",
  //      col7: "",
  //    },
  //  ],
  //  []
  //);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    toggleAllRowsSelected,
    prepareRow,
    state,
  } = useTable(
    {
      autoResetSelectedRows: false,
      data,
      columns,
    },
    useSortBy,
    useRowSelect
  );

  return (
    <>
      <Table {...getTableProps()}>
        <thead>
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                  {column.render("Header")}
                  <span style={{ paddingLeft: "0.5rem" }}>
                    {column.isSorted ? (
                      column.isSortedDesc ? (
                        <FontAwesomeIcon icon={faAngleUp} />
                      ) : (
                        <FontAwesomeIcon icon={faAngleDown} />
                      )
                    ) : (
                      <FontAwesomeIcon
                        icon={faAngleDown}
                        style={{ opacity: 0 }}
                      />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          ))}
        </thead>

        <tbody {...getTableBodyProps()}>
          {rows.map((row) => {
            prepareRow(row);
            return (
              <StyledTr
                {...row.getRowProps({
                  style: {
                    backgroundColor: row.isSelected ? "#eee" : "",
                  },
                })}
                onClick={(e: any) => {
                  toggleAllRowsSelected(false);
                  row.toggleRowSelected();
                }}
              >
                {row.cells.map((cell) => {
                  return (
                    <td {...cell.getCellProps()}>{cell.render("Cell")}</td>
                  );
                })}
              </StyledTr>
            );
          })}
        </tbody>
      </Table>
    </>
  );
};

export default DeviceTable;
