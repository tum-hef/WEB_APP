import React, { Component} from 'react'
import { MainContainer, MainContentContainer, CardContainer } from '../styles/ServerList.styles'
import MainMenu from '../components/MainMenu'
import FrostServerCard from '../components/FrostServerCard'
import Header from '../components/Header'
import PageHeader from '../components/PageHeader'


class ServerList extends React.Component {
    // Server Information is hardcoded for the moment.
    // Get data from keycloak once servers are listed as clients

    render() {
        return (
            <MainContainer>
                <MainMenu/>
                <MainContentContainer>
                    <Header />
                    <PageHeader name="Lists all Servers" description="Welcome back kjbaumann."/>
                    <CardContainer>
                        <FrostServerCard name={"Berlin Stations"} description={"A beta FROST Server for testing purposes."}/>
                    </CardContainer>
                </MainContentContainer>
            </MainContainer>
        )
    }
}

export default ServerList