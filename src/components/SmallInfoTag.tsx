import React, { Component } from 'react'
import { runInThisContext } from 'vm'
import { Wrapper, InfoContainer } from '../styles/SmallInfoTag.styles'

type SmallInfoTagProps = {
    name: string
    link: string
    icon: string
}


class SmallInfoTag extends Component<SmallInfoTagProps> {

    render() {
        return (
            <Wrapper>
                <InfoContainer>
                    <p>{this.props.name}</p>
                </InfoContainer>
            </Wrapper>
        )
    }
}


export default SmallInfoTag