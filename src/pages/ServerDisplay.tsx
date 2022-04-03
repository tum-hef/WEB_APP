import {
    BrowserRouter as Router,
    Route,
    Link,
    RouteComponentProps
  } from "react-router-dom";

import { Wrapper, MainContentContainer, ChartContainer } from '../styles/ServerDisplay.styles'
import MainMenu from '../components/MainMenu'
import Header from '../components/Header'
import PageHeader from '../components/PageHeader'
import LineChart from '../components/LineChart'

type TParams = { id: string };

const ServerDisplay = ({ match }: RouteComponentProps<TParams>) => {
    // Hardcoded for the moment replace with keycloak specific data once 
    // servers are listed in keycloak
    
    const getName = () => {
        return 'Berlin Stations'
    }

    const getDescription = () => {
        return 'A beta FROST Server for testing purposes.'
    }

    return (
        <Wrapper>
            <MainMenu/>
            <MainContentContainer>
                <Header/>
                <PageHeader name={match.params.id} description={getDescription()}/>
                <ChartContainer>
                    <LineChart url={"http://tuzehez-hefiot.srv.mwn.de:6001/FROST-Server"}/>
                </ChartContainer>
            </MainContentContainer>
        </Wrapper>
    )
}

export default ServerDisplay