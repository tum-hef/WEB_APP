import React, { Component } from 'react'
import { Wrapper } from '../styles/PageHeader.styles'
import AddButton from './AddButton'

type PageHeaderProps = {
    name: string
    description: string
}

class PageHeader extends Component<PageHeaderProps> {
    render() {
        return (
            <Wrapper>
                <div>
                    <h1>{this.props.name}</h1>
                    <p>{this.props.description}</p>
                </div>
                <div>
                    <AddButton/>
                </div>
            </Wrapper>
        )
    }
}

export default PageHeader