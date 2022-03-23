import React, { Component} from 'react'
import { useKeycloak } from '@react-keycloak/web'
import { MainContainer } from '../styles/ServerList.styles'
import MainMenu from '../components/MainMenu'


class ServerList extends React.Component {
    render() {
        return (
            <MainContainer>
                <MainMenu/>
                
            </MainContainer>
        )
    }
}

export default ServerList