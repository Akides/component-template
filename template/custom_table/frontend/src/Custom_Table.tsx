import {
  ArrowTable,
  Streamlit,
  StreamlitComponentBase,
  withStreamlitConnection,
} from "streamlit-component-lib"
import React, { Fragment, ReactNode, createRef } from "react"
import { MaterialReactTable, type MRT_ColumnDef, MRT_TableInstance, MRT_RowSelectionState, MRT_PaginationState } from 'material-react-table';
import { Box, Button, Stack } from "@mui/material";
interface State {
  numClicks: number
  isFocused: boolean
  modalOpen: boolean
  rowSelection: MRT_RowSelectionState
}


/**
 * This is a React-based component template. The `render()` function is called
 * automatically when your component should be re-rendered.
 */
class CustomTable extends StreamlitComponentBase<State> {
  configureColumnVisibility = (hideColumns: Array<string>) => {
    let hideObj: { [key: string]: boolean } = {}
    hideColumns.forEach(col => {
      hideObj[col] = false
    });
    return hideObj
  }

  public state = { numClicks: 0,
    isFocused: false,
    modalOpen: false,
    rowSelection: {
    }
  }

  data = this.props.args.data;
  sum_columns = this.props.args.sum_columns;
  lastRowId = ''
  tableInstanceRef = createRef<MRT_TableInstance<any>>();

  tableColumns = (table: ArrowTable, sumColumns: Array<string>, hideColumns: Array<string>): MRT_ColumnDef<any>[] => {
    const headers = table.columnTable.toArray()
    const tableColumns: any[] = []

    for (let i = 0; i < headers.length; i++) {
      let header: { [key: string]: any } = {}
      const headerName = headers[i][0].toString();
      if (sumColumns.length > 0 && sumColumns.includes(headerName)) {
        header = {
          Footer: () => (
            <Box color="warning.main">{5}</Box>
          ),
          size: 100
        }
      }
      else {
        header = {
          size: 100
        }
      }
      header['header'] = headerName
      header['accessorKey'] = headerName
      if (hideColumns.includes(headerName)) {
        header['enableHiding'] = false
      }
      tableColumns.push(header)
    }
    return tableColumns
}

  tableData = (table: ArrowTable): any[] => {
    const colsNum = table.columns
    const rowsNum = table.rows

    const headers = table.columnTable.toArray()
    const tableData = []
    for (let i = 1; i < rowsNum; i++) {
      var row: { [key: string]: any } = {}
      for (let j = 1; j < colsNum; j++) {
        const element = table.getCell(i, j).content?.toString()
        const header = headers[j-1][0].toString()
        if (header !== undefined)
          row[header] = element
      }
      tableData.push(row)
    }
    return tableData
  }

  displayedTable = () => {
    let rows = this.tableInstanceRef.current!.getFilteredRowModel().rows.map(row => row.original)
    let cols = this.tableInstanceRef.current!.getVisibleFlatColumns().map(col => col.id)
    let rowsDisplayed: Array<string[]> = []
    rows.forEach(row => {
      let rowDisplayed: string[] = []
      cols.forEach(col => {
        rowDisplayed.push(row[col])
      });
      rowsDisplayed.push(rowDisplayed)
    });
    return {
      columns: cols,
      rows: rowsDisplayed
    }
  }

  handleRowSelectionChange = () => {
    //console.log(this.tableInstanceRef.current?.getState().rowSelection)
    //Streamlit.setComponentValue(this.tableInstanceRef.current?.getState().rowSelection)
  }

  public render = (): ReactNode => {

    // Arguments that are passed to the plugin in Python are accessible
    // via `this.props.args`. Here, we access the "name" arg.
    const data = this.props.args.data;
    const sumColumns = this.props.args.sum_columns;
    const hideColumns: Array<string> = this.props.args.hide_columns;

    // Streamlit sends us a theme object via props that we can use to ensure
    // that our component has visuals that match the active theme in a
    // streamlit app.
    const { theme } = this.props
    const style: React.CSSProperties = {}

    // Maintain compatibility with older versions of Streamlit that don't send
    // a theme object.
    if (theme) {
      // Use the theme object to style our button border. Alternatively, the
      // theme style is defined in CSS vars.
      const borderStyling = `1px solid ${
        this.state.isFocused ? theme.primaryColor : "gray"
      }`
      style.border = borderStyling
      style.outline = borderStyling
    }
    /*<Button variant="text" onClick={() => this.setState({modalOpen: true})}>bulk edit</Button> */
    /*        <BulkEditor open={this.state.modalOpen} onClose={() => this.setState({modalOpen: false})} table={data} selection={this.tableInstanceRef.current?.getState().rowSelection!}/>
 */

     return (
      <Fragment>
        <MaterialReactTable
          columns={this.tableColumns(data, sumColumns, hideColumns)}
          data={this.tableData(data)}
          enableFullScreenToggle={false}
          enableDensityToggle={false}
          enableColumnActions={false}
          enableStickyHeader
          enableStickyFooter={sumColumns.length > 0 ? true : false}
          muiTableContainerProps={{ sx: { maxHeight: '600px' } }}
          initialState={{density: 'compact' } }
          getRowId={(row) => row.ID}
          //enablePagination={false}
          autoResetPageIndex={false}
          tableInstanceRef={this.tableInstanceRef}
          muiTableBodyRowProps={({ row }) => ({
            //implement row selection click events manually
            onClick: () =>
              {
                const displayed = this.displayedTable()
                let finalTable: any = displayed
                if (this.lastRowId != row.id) {
                  finalTable['selected_row'] = row.id
                  Streamlit.setComponentValue(finalTable)
                  this.lastRowId = row.id
                }
                else {
                  Streamlit.setComponentValue(finalTable)
                  this.lastRowId = ''
                }
                this.setState((prevState) => ({
                  rowSelection: {
                    [row.id]: !prevState.rowSelection[row.id],
                  },
                }));
              },
            selected: this.state.rowSelection[row.id as keyof typeof this.state.rowSelection],
            sx: {
              cursor: 'pointer',
            },
          })}
          state={{
            rowSelection: this.state.rowSelection,
            columnVisibility:  this.configureColumnVisibility(hideColumns)
          }}
          renderBottomToolbarCustomActions={({ table }) => (
            <Button
                color="secondary"
                onClick={() => {
                  let table: any = this.displayedTable()
                  table['dl_request'] = true
                  Streamlit.setComponentValue(table)
                }}
                variant="text"
              >
                Download
              </Button>
          )}
          onColumnFiltersChange={()=> console.log('test')}
          /*
        muiTableHeadCellFilterTextFieldProps={({column}) => ({
          onChange: () => {
            console.log('man')
          }
        })}*/
        />
      </Fragment>
    );
  }
}

// "withStreamlitConnection" is a wrapper function. It bootstraps the
// connection between your component and the Streamlit app, and handles
// passing arguments from Python -> Component.
//
// You don't need to edit withStreamlitConnection (but you're welcome to!).
export default withStreamlitConnection(CustomTable)
