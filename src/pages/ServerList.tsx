import React, { Component} from 'react'
import { MainContainer, MainContentContainer, CardContainer } from '../styles/ServerList.styles'
import MainMenu from '../components/MainMenu'
import FrostServerCard from '../components/FrostServerCard'
import Header from '../components/Header'
import PageHeader from '../components/PageHeader'


class ServerList extends React.Component {
    render() {
        return (
            <MainContainer>
                <MainMenu/>
                <MainContentContainer>
                    <Header />
                    <PageHeader name="Lists all Servers" description="Welcome back kjbaumann."/>
                    <CardContainer>
                        <FrostServerCard name={"Berlin Stations"} description={"Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum."}/>
                    </CardContainer>
                </MainContentContainer>
            </MainContainer>
        )
    }
}

export default ServerList