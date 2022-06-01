import React, { Component } from "react";
import Button from '@mui/material/Button'
import AddIcon from '@mui/icons-material/Add'

type AddButtonProps = {
}

class AddButton extends Component<AddButtonProps> {
    
    render() {
        return(
            <div>
                <Button variant="outlined" startIcon={<AddIcon/>}>
                    Add
                </Button>
            </div>
        )
    }
}

export default AddButton