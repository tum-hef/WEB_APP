import React, { Component } from 'react'
import { Wrapper, SearchContainer, MenuContainer } from '../styles/Header.styles'
import Search from './Search'
import UserMenu from './UserMenu'

// Needed for future logic
type HeaderProps = {

}

class Header extends Component<HeaderProps> {

    render() {
        return (
            <Wrapper>
                <MenuContainer>
                    <UserMenu/> 
                </MenuContainer>
            </Wrapper>
        )
    }
}

export default Header