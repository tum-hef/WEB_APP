import React, { Component } from 'react'
import { Wrapper, Header, InfoContainer } from '../styles/FrostServerCard.styles'

type FrostServerCardProps = {
    name: String
    description: String
}

class FrostServerCard extends Component<FrostServerCardProps> {
    render(){
        return(
            <a href={"/servers/" + this.props.name}>
                <Wrapper>
                    <InfoContainer img={require("../resources/ServerRoom.jpg")}>
                    </InfoContainer>
                <   Header>
                        <h1>{this.props.name}</h1>
                        <p>{this.props.description}</p>
                    </Header>
                </Wrapper>
            </a>
        )
    }
}

export default FrostServerCard