import React, { Component } from 'react'
import { Wrapper } from '../styles/PageHeader.styles'

type PageHeaderProps = {
    name: string
    description: string
}

class PageHeader extends Component<PageHeaderProps> {
    render() {
        return (
            <Wrapper>
                <h1>{this.props.name}</h1>
                <p>{this.props.description}</p>
            </Wrapper>
        )
    }
}

export default PageHeader