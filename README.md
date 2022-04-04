# HEFIot Web App
## Table of Contents
1. Developing Enviroment
2. Plugins and Coding-Conventions
3. Routes and Keyloak
4. Folder Structure
## Developing Enviroment
To run the App locally for developing and debugging you have to start the Web App itself, the Keycloak Server and all Frost Server you want to use.
To start the Development Server of the Web App run ``` npm start ``` from the root directory.
### Set Up Keycloak Instance
1. To set up the Keycloak server first start the docker container with ``` docker-compose up ``` while beeing in the same directory as the docker-compose file. [Docker-Compose file for the Keycloak Server](documentation/docker-compose.yaml)
2. The Web App is configured to run on a specific Realm and Client. If you wish to change that setup you can use [this file in the Repository](src/keycloak.ts) to do so and set your keycloak settings accordingly. However, **it is recommended** to use the [original configuration](documentation/realm-export.json) and import it to your local Keycloak instance. Check out this site for a detailed tutorial for importing and exporting realm data in keycloak https://keepgrowing.in/tools/keycloak-in-docker-2-how-to-import-a-keycloak-realm/.
### Set Up Frost Server(s)
As sample data csn be helful in debugging, check out this repository on how to create local Frost Servers and how to link them to a keycloak instance.
https://github.com/kjbaumann/Keycloak-on-Frost-Server-Introduction
## Plugins and Coding-Conventions
### Keycloak Plugin
All keycloak calls such as retrieving the username are done with the ``` npm keycloak package ```. Check out the official documentation for more information https://www.npmjs.com/package/@react-keycloak/web
### Redux
For state management Redux is used. Check out the official documentation. https://redux.js.org/introduction/getting-started
### Create-React-App
For creating the basic folder structure and essential packages ``` npx create-react-app ``` was used. This provides the basic layout of the application as well as predefined deployment scripts and developing tools. A more detailed documentation can be found at https://create-react-app.dev/docs/getting-started.
### Styled Components
Every Component has its own css file which can be found at the [styles folder](src/styles) in the directory. The naming convention for said files is **ComponentName.styles.ts**. For a detailed documentetion check out https://styled-components.com/docs. When working with Visual Studio Code it is also recommended to use the styled components plugin for code highlighting as well as completion. https://marketplace.visualstudio.com/items?itemName=diegolincoln.vscode-styled-components
### Axios 
All api-calls are done with axios as it offers official typescript support. Check out the documentation for more information. https://axios-http.com/docs/intro
### Typescript
The Typescript configuration can be found at [tsconfig.json](/tsconfig.json). As there have not been any changes to the standard configuration there is no need to touch this file as of now.
### Coding-Conventions
- All components are coded in a single file for each one of them
- If the component does not have any parameters a functional component should be used
- If the component has parameters a class component should be used with a costum type for all props. A example for this can be found in the components folder of the repository.
- All typescript logic should be obeyed and keywords that override this logic should only be used in very specific cases.
## Routes and Keyloak
- All routing should follow the given configuration already present in the repository.
- The keyloak configuration file can be found here:  [keyloak.ts](src/keycloak.ts)
- Check out the the keycloak documentation for more information https://www.keycloak.org/documentation
## Folder Structure
In this section all important folders and files a explained for easier navigation through the repository. If a file is not named specifically it is either a file created from a specific ``` plugin ``` or ``` npx create-react-app ```.

```
WEB_APP
└── documentation
└── public
└── src
    └── Components
    └── models
    └── pages
    └── resources
    └── routes
    └── styles
    └── index.tsx
    └── kexcloak.ts
    └── react-app-env.d.ts
└── .gitignore
└── README.md
└── package-lock.json
└── package.json
└── tsconfig.json
└── yarn.lock
```
### documentation
The files in this folder are used to set up the developing configuration as descriped in the section above
### public
This folder contains basic configuration files for the apperance of the Web Application in the browser. A more detailed documentation can be found in the ``` Create React App ``` section.
### src
- **components:** This folder contains all components of the web app like the header or the main menu each in one file.
- **models:** Typscript requires models of each datastream that is imported. These models are stored in seperate files in this folder.
- **pages:** This folder contains all main components of each route.
- **resources:** This folder contains resources such as background pictures. 
- **routes:** All the diffrent routes are stored in the index.tsx file of this folder as well as the main components renderd in each route.
- **styles:** Each file in this folder contains styling for one component of the application.
- **index.tsx:** This is the main file for rendering all the routes. Look at the section ``` Create React App ``` for more information about this file.
- **keycloak.ts:** This is the file specified in the seaction ``` Set up Keycloak Instance ```
- **react-app-env.d.ts:** Look at the section ``` Typescript ``` for more information.
### package.json
This file contains all plugins used in the application.
### tsconfig.json
This file contains the Typescript configuration as mentioned in the section ``` Typescript 
