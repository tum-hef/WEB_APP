import React, { Component } from 'react'
import { Wrapper }  from '../styles/Pagination.styles'
//TODO: A simple Pagination component for listing servers or devices
type PaginationProps = {

}

class Pagination extends Component<PaginationProps> {

    render() {
        return (
            <Wrapper>
                <h1>Pagination</h1>
            </Wrapper>
        )
    }
}

export default Pagination