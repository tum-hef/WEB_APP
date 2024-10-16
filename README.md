# Configuration

 - Keycloak Version:  15.0.2


1) Clone Repository

``` git clone https://github.com/HEFLoRa/WEB_APP.git```

2) Fill .env variables: 

   ```
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

