# HEFIot Web App
## Table of Contents
1. Developing Enviroment
2. Plugins and Coding-Conventions
## Developing Enviroment
To run the App locally for developing and debugging you have to start the Web App itself, the Keycloak Server and all Frost Server you want to use.
To start the Development Server of the Web App run ``` npm start ``` from the root directory.
### Set Up Keycloak Instance
To set up the Keycloak server first start the docker container with ``` docker-compose up ``` while beeing in the same directory as the docker-compose file.
[Docker-Compose file for the Keycloak Server](documentation/docker-compose.yaml)
The Web App is configured to run on a specific Realm and Client. If you wish to change that setup you can use [this file in the Repository](./keycloak.ts) to do so and set your keycloak settings accordingly. However, **it is recommended** to use the [original configuration](documentation/realm-export.yaml) and import it to your local Keycloak instance. Check out this site for a detailed tutorial for importing and exporting realm data in keycloak https://keepgrowing.in/tools/keycloak-in-docker-2-how-to-import-a-keycloak-realm/.
### Set Up Frost Server(s)
As sample data csn be helful in debugging, check out this repository on how to create local Frost Servers and how to link them to a keycloak instance.
https://github.com/kjbaumann/Keycloak-on-Frost-Server-Introduction
## Plugins and Coding-Conventions

