import {
    BrowserRouter as Router,
    Route,
    Link,
    RouteComponentProps
  } from "react-router-dom";

import { Wrapper, MainContentContainer } from '../styles/ServerDisplay.styles'
import MainMenu from '../components/MainMenu'
import Header from '../components/Header'
import PageHeader from '../components/PageHeader'

type TParams = { id: string };

const ServerDisplay = ({ match }: RouteComponentProps<TParams>) => {
    const getName = () => {

    }

    const getDescription = () => {
        
    }

    return (
        <Wrapper>
            <MainMenu/>
            <MainContentContainer>
                <Header/>
                <PageHeader name={"IOT Server " + match.params.id} description="A beta FROST Server for testing purposes."/>
            </MainContentContainer>
        </Wrapper>
    )
}

export default ServerDisplay