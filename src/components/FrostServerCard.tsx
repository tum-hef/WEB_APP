import React, { Component } from 'react'
import { Wrapper, Header, InfoContainer } from '../styles/FrostServerCard.styles'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faImage } from '@fortawesome/free-solid-svg-icons'


type FrostServerCardProps = {
    name: String
    description: String
}

class FrostServerCard extends Component<FrostServerCardProps> {

    render(){
        return(
            <Wrapper>
                <InfoContainer img={require("../resources/ServerRoom.jpg")}>
                </InfoContainer>
                <Header>
                    <h1>{this.props.name}</h1>
                    <p>{this.props.description}</p>
                </Header>
            </Wrapper>
        )
    }
}

export default FrostServerCard