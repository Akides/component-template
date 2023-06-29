import {
  ArrowTable,
  Streamlit,
  StreamlitComponentBase,
  withStreamlitConnection,
} from "streamlit-component-lib"
import React, { Fragment, ReactNode, createRef } from "react"
import { MaterialReactTable, type MRT_ColumnDef, MRT_TableInstance } from 'material-react-table';
import { Box, Button, Stack } from "@mui/material";
import { size } from "lodash";
interface State {
  numClicks: number
  isFocused: boolean
  modalOpen: boolean
}

/**
 * This is a React-based component template. The `render()` function is called
 * automatically when your component should be re-rendered.
 */
class CustomTable extends StreamlitComponentBase<State> {
  public state = { numClicks: 0,
    isFocused: false,
    modalOpen: false
  }

  tableInstanceRef = createRef<MRT_TableInstance<any>>();

  tableColumns = (table: ArrowTable, pin: boolean): MRT_ColumnDef<any>[] => {
    const headers = table.columnTable.toArray()
    const tableColumns: any[] = []

    for (let i = 0; i < headers.length; i++) {
      let header: { [key: string]: any } = {}
      if (pin) {
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
      const name = headers[i][0].toString();
      header['header'] = name
      header['accessorKey'] = name
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

  public render = (): ReactNode => {

    // Arguments that are passed to the plugin in Python are accessible
    // via `this.props.args`. Here, we access the "name" arg.
    const data = this.props.args.data;
    const pin = this.props.args.pin;
    console.log(pin);

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

    let columns = this.tableColumns(data)
    let colData = this.tableData(data)

     return (
      <MaterialReactTable
        columns={columns}
        data={colData}
        enableRowSelection //enable some features
        enableMultiRowSelection={false}
        enableColumnActions={false}
        enableStickyHeader
        enableStickyFooter={pin}
        muiTableContainerProps={{ sx: { maxHeight: '600px' } }}
        //enableColumnOrdering
        enableGlobalFilter={false} //turn off a feature
        initialState={{density: 'compact' }} 
        tableInstanceRef={this.tableInstanceRef}
      />
    );
  }
}

// "withStreamlitConnection" is a wrapper function. It bootstraps the
// connection between your component and the Streamlit app, and handles
// passing arguments from Python -> Component.
//
// You don't need to edit withStreamlitConnection (but you're welcome to!).
export default withStreamlitConnection(CustomTable)
