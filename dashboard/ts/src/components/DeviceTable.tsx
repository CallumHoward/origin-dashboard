import React, { useCallback, useEffect } from "react";
import { Table } from "reactstrap";
import { useTable, useSortBy, useRowSelect } from "react-table";
import { fromUnixTime, intervalToDuration, formatDuration } from "date-fns";
import styled from "styled-components";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleUp, faAngleDown } from "@fortawesome/free-solid-svg-icons";
import { Device } from "../../_proto/examplecom/library/device_service_pb";
import IndeterminateCheckbox from "./IndeterminateCheckbox";

const StyledTr = styled.tr`
  td {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const StyledTh = styled.th`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  &:first-child > span {
    display: none;
  }
`;

type Props = {
  data: Device.AsObject[];
  now: Date;
  setSelectedDevices: React.Dispatch<React.SetStateAction<string[]>>;
};

const DeviceTable: React.FunctionComponent<Props> = ({
  data,
  now,
  setSelectedDevices,
}) => {
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
        accessor: (row) => {
          // console.log(fromUnixTime(row.lastContact));
          const duration =
            formatDuration(
              intervalToDuration({
                start: now,
                end: fromUnixTime(row.lastContact),
              })
            ) || "0 seconds";
          return `~${duration} ago`;
        },
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
    [now]
  );

  const getRowId = useCallback((row) => row.id, []);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    selectedFlatRows,
    state: { selectedRowIds },
  } = useTable(
    {
      autoResetSelectedRows: false,
      data,
      columns,
    },
    useSortBy,
    useRowSelect,
    getRowId,
    (hooks) => {
      hooks.visibleColumns.push((columns) => [
        // Let's make a column for selection
        {
          id: "selection",
          // The header can use the table's getToggleAllRowsSelectedProps method
          // to render a checkbox
          Header: ({ getToggleAllRowsSelectedProps }) => (
            <div>
              <IndeterminateCheckbox {...getToggleAllRowsSelectedProps()} />
            </div>
          ),
          // The cell can use the individual row's getToggleRowSelectedProps method
          // to the render a checkbox
          Cell: ({ row }) => (
            <div>
              <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />
            </div>
          ),
        },
        ...columns,
      ]);
    }
  );

  useEffect(() => {
    setSelectedDevices(selectedFlatRows.map((r: any) => r.original.id));
  }, [selectedRowIds]);

  return (
    <Table
      hover={true}
      responsive={true}
      striped={true}
      size={"sm"}
      {...getTableProps()}
    >
      <thead style={{ whiteSpace: "nowrap" }}>
        {headerGroups.map((headerGroup) => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map((column) => (
              <StyledTh
                {...column.getHeaderProps(column.getSortByToggleProps())}
              >
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
              </StyledTh>
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
                  backgroundColor: row.isSelected
                    ? "rgba(0, 123, 255, 0.5)"
                    : "",
                },
              })}
              onClick={() => {
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
