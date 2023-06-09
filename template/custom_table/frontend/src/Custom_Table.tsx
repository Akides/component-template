import {
  ArrowTable,
  Streamlit,
  StreamlitComponentBase,
  withStreamlitConnection,
} from "streamlit-component-lib"
import React, { Fragment, ReactNode, createRef } from "react"
import { MaterialReactTable, MRT_RowSelectionState, type MRT_ColumnDef, MRT_TableInstance } from 'material-react-table';
import { Button } from "@mui/material";

interface State {
  numClicks: number
  isFocused: boolean
}

/**
 * This is a React-based component template. The `render()` function is called
 * automatically when your component should be re-rendered.
 */
class CustomTable extends StreamlitComponentBase<State> {
  public state = { numClicks: 0, isFocused: false }
  tableInstanceRef = createRef<MRT_TableInstance<any>>();

  tableColumns = (table: ArrowTable): MRT_ColumnDef<any>[] => {
    const headers = table.columnTable.toArray()
    const tableColumns: any[] = []

    for (let i = 0; i < headers.length; i++) {
      var header: { [key: string]: any } = {}
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
      if (header != undefined)
        row[header] = element
    }
    tableData.push(row)
  }

  return tableData
}

handleRowSelection = () => {
  const rowSelection = this.tableInstanceRef.current?.getState().rowSelection;
  console.log('row selected')
  console.log(rowSelection)
};


  public render = (): ReactNode => {

    // Arguments that are passed to the plugin in Python are accessible
    // via `this.props.args`. Here, we access the "name" arg.
    const name = this.props.args["name"]
    const data = this.props.args.data;

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
    
    // Show a button and some text.
    // When the button is clicked, we'll increment our "numClicks" state
    // variable, and send its new value back to Streamlit, where it'll
    // be available to the Python program.
    return (
      <Fragment>
        <MaterialReactTable
          columns={this.tableColumns(data)}
          data={this.tableData(data)}
          enableRowSelection={true}
          tableInstanceRef={this.tableInstanceRef}
        />
        <Button variant="text" onClick={this.handleRowSelection}>bulk edit</Button>
        <span>
        Hello, {name}! &nbsp;
        <button
          style={style}
          onClick={this.onClicked}
          disabled={this.props.disabled}
          onFocus={this._onFocus}
          onBlur={this._onBlur}
        >
          Click Me!
        </button>
        </span>
      </Fragment>
    
    )
  }
  

  /** Click handler for our "Click Me!" button. */
  private onClicked = (): void => {
    // Increment state.numClicks, and pass the new value back to
    // Streamlit via `Streamlit.setComponentValue`.
    this.setState(
      prevState => ({ numClicks: prevState.numClicks + 1 }),
      () => Streamlit.setComponentValue(this.state.numClicks)
    )
  }

  /** Focus handler for our "Click Me!" button. */
  private _onFocus = (): void => {
    this.setState({ isFocused: true })
  }

  /** Blur handler for our "Click Me!" button. */
  private _onBlur = (): void => {
    this.setState({ isFocused: false })
  }
}

// "withStreamlitConnection" is a wrapper function. It bootstraps the
// connection between your component and the Streamlit app, and handles
// passing arguments from Python -> Component.
//
// You don't need to edit withStreamlitConnection (but you're welcome to!).
export default withStreamlitConnection(CustomTable)
