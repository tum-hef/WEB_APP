import React, { Component } from 'react'
import { Wrapper, Header } from '../styles/FrostServerCard.styles'

type FrostServerCardProps = {
    name: String
}

class FrostServerCard extends Component<FrostServerCardProps> {

    render(){
        return(
            <Wrapper>
                <Header>
                    <h1>{this.props.name}</h1>
                </Header>
            </Wrapper>
        )
    }
}

export default FrostServerCard