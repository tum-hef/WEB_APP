# sensorHUB - Graphical Web Application
The sensorHUB software is a novel, open-source software stack for enhanced accessibility and secure interoperability in IoT project management. It is developed by Technical University of Munich's (TUM) Hans Eisenmann-Forum for Agricultural Sciences (HEF). This repository presents the sensorHUB's graphical web interface. From a user perspective the sensorHUB web-based GUI represents the central access to the stack’s services including data processing, project management functionalities, and knowledge acquisition. With ReactJS, the web app builds on a widely used, state-of-the-art front-end web framework. For facilitated development, we apply pre-configured designs and code modules from [Material UI](https://mui.com/material-ui/), a widely used, open source ReactJS component library. The app is designed as reactive web application, enabling its usability from diverse end device platforms. User access the app using a landing page, which either forwards to the login or a registration procedure both being regulated by Keycloak’s authentication mechanism. After a successful login, the user is required to select from the scope of available FROST-servers (a user may be assigned several projects with related servers) before being forwarded to the app’s dashboard. Contents are organized using a sidebar, which supports users in navigating to their intended destinations. For more details, see the [sensorHUB repository](https://github.com/tum-hef/sensorHUB) and the related ISPRS publication [tba](https://www.google.com).
![App_features](https://github.com/user-attachments/assets/f76b06bd-6766-49ca-99fa-9f82f61897b6)

## Changes and Updates

See the [Change Log](CHANGELOG.md).

## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create.
Any contributions are greatly appreciated.
You can read more in our [contribution guidelines](CONTRIBUTING.md).

## Compiling


### Configuration

 - Keycloak Version:  15.0.2


1) Clone Repository

``` git clone https://github.com/HEFLoRa/WEB_APP.git```

2) Fill .env variables: 

   ```
    NODE_ENV="development"   # for LITE-version; when in PRO mode replace it with production
    REACT_APP_KEYCLOAK_URL=
    REACT_APP_KEYCLOAK_REALM=
    REACT_APP_KEYCLOAK_CLIENT_ID=
    REACT_APP_API_URL=
    REACT_APP_BACKEND_URL=```

3) Building the image from the application

```docker build -t hefsensorhub_image_frontend .```

4) Running Application on port 3000

```docker run -p 3000:80 --env-file .env --name hefsensorhub_container_frontend -d --restart always hefsensorhub_image_frontend```

-----------------------------------------------------------------------------------------------------------------


## Authors

David Gackstetter, Parid Varoshi, Syed Saad Zahidi

Contact: david.gackstetter@tum.de


## License

Copyright (C) 2024 Technical University of Munich, Arcisstr. 11, 80333 Munich, Germany.

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.

