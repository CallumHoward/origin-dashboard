import React from "react";
import { Table } from "reactstrap";
import { useTable, useSortBy, useRowSelect } from "react-table";
import styled from "styled-components";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleUp, faAngleDown } from "@fortawesome/free-solid-svg-icons";
import { Device } from "../../_proto/examplecom/library/device_service_pb";

const StyledTr = styled.tr`
  &:hover {
    background-color: #f9f9f9;
  }
`;

type Props = {
  data: Device.AsObject[];
};

const DeviceTable: React.FunctionComponent<Props> = ({ data }) => {
  const columns = React.useMemo(
    () => [
      {
        Header: "ID",
        accessor: (row: Device.AsObject) => {
          return <a href={`http://${row.ip}`}>{row.id}</a>;
        },
      },
      {
        Header: "Name",
        accessor: "name",
      },
      {
        Header: "Type",
        accessor: "type",
      },
      {
        Header: "Last Contact",
        accessor: "lastContact",
      },
      {
        Header: "Battery",
        accessor: "battery",
      },
      {
        Header: "Version",
        accessor: "version",
      },
      {
        Header: "Status",
        accessor: "status",
      },
    ],
    []
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    toggleAllRowsSelected,
    prepareRow,
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
                return <td {...cell.getCellProps()}>{cell.render("Cell")}</td>;
              })}
            </StyledTr>
          );
        })}
      </tbody>
    </Table>
  );
};

export default DeviceTable;
