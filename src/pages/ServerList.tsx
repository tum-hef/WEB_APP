import React, { Component } from "react";
import {
  MainContainer,
  MainContentContainer,
  CardContainer,
} from "../styles/ServerList.styles";
import MainMenu from "../components/MainMenu";
import FrostServerCard from "../components/FrostServerCard";
import Header from "../components/Header";
import PageHeader from "../components/PageHeader";
import ContentBar from "../components/ContentBar";

class ServerList extends React.Component {
  // Server Information is hardcoded for the moment.
  // Get data from keycloak once servers are listed as clients

  render() {
    return (
      <ContentBar>
        <CardContainer>
          <FrostServerCard
            name={"Berlin Stations"}
            description={"A beta FROST Server for testing purposes."}
          />
        </CardContainer>
      </ContentBar>
    );
  }
}

export default ServerList;
