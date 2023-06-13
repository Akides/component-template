import {
    ArrowTable,
    Streamlit,
    StreamlitComponentBase,
    withStreamlitConnection,
  } from "streamlit-component-lib"
  import React, { Fragment, ReactNode, createRef, useState } from "react"
  import { MRT_RowSelectionState } from 'material-react-table';
  import { AppBar, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, IconButton, List, ListItem, ListItemText, TextField, Toolbar, Typography } from "@mui/material";
  import { TransitionProps } from '@mui/material/transitions';
import CloseIcon from '@mui/icons-material/Close';
import Slide from '@mui/material/Slide';

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

type BulkProps = {
    open: boolean
    onClose: Function
    table: ArrowTable
    selection: MRT_RowSelectionState
}

function BulkEditor(props: BulkProps) {
    const table = props.table
    const selection = props.selection
    const colNums = table.columns
    const headersArr = table.columnTable.toArray()
    const headers: string[] = []
    const [controllers, setControllers] = useState<Record<string, any>>({})

    //init headers and controllers
    for (let i = 0; i < colNums-1; i++) {
        const hA = headersArr[i][0]
        headers.push(hA)
    }

    const handleTextChange = (name: string, value: string) => {
        setControllers((prevCons) => (
            {
                ...prevCons,
                [name]: value
            }
        ))
    }

    const handleSave = () => {
        const changes = convertInputsToObjects()
        console.log(changes)
        Streamlit.setComponentValue(changes)
    }

    const convertInputsToObjects = () => {
        //iterate columnTextfields and apply to every row
        const rows = []

        for (const index in selection) {
            const i = parseInt(index)
            let row: any = {
                index: i
            }
            for (const key in controllers) {
                const val = controllers[key]
                row[key] = val
            }
            rows.push(row)
        }
        return rows
    }

    const getRowsData = (): any[] => {
        for (const index in selection) {
          console.log(index)
        }
    
        const rows: any[] = []
    
        for (const index in selection) {
          const i = parseInt(index)
          let row: any = {
            index: i,
            name: "",
            age: ""
          }
          for (let j = 1; j < colNums; j++) {
            const cell = table.getCell(i+1, j).content?.toString()
            const header = headersArr[j-1][0].toString()
            if (cell !== undefined) {
              if (header === "Name") {
                row['name'] = cell.toString()
              }
              if (header === "ID") {
                row['age'] = cell.toString()
              }
            }
          }
          rows.push(row)
        }
        
        return rows
      }

    const columnTextFields = () => {
        let i = 0
        return headers.map( header => {
            const tf = <TextField
                autoFocus
                margin="normal"
                id={i.toString()}
                label={header}
                type="text"
                fullWidth
                variant="standard"
                onChange={(e) => handleTextChange(header, e.target.value)}
            />
            i++
            return tf
        })
    }

    return <Dialog
        fullScreen
        open={props.open}
        onClose={() => props.onClose()}
        TransitionComponent={Transition}
    >
        <AppBar sx={{ position: 'relative' }}>
            <Toolbar>
                <IconButton
                edge="start"
                color="inherit"
                onClick={() => props.onClose()}
                aria-label="close"
                >
                <CloseIcon />
                </IconButton>
                <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
                Edit
                </Typography>
                <Button autoFocus color="inherit" onClick={handleSave}>
                save
                </Button>
            </Toolbar>
        </AppBar>
        <DialogContent>
          <DialogContentText>
            Edit multiple rows
          </DialogContentText>
        </DialogContent>
        {columnTextFields()}
    </Dialog>
}

  export default BulkEditor;