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

# 1) Projects (Servers)

  

URL: /projects

  

Data displayed:

  

1. ID

2. Client Name

3. URL

4. Description

5. Redirect Button to Device

  

# 2) Devices (Things)

  

URL: /devices

  

Data displayed:

  

1. ID

2. Name

3. Description

4. Redirect Button to Datastream

5. Redirect Button to Location

6. Button that exports a specific row to JSON file

  

Details:

Due that name or description might be too long to display in the table, an arrow in every row is provided in every row that makes possible to read the full name and description.

Button “Create Device” will redirect to a new form that creates a new device.

  

# 3) Create Device (Things)

  

URL: / devices/store

  

Form:

  

1. Device Information

a) Device ID

b) Application ID

  

2. TTNS Keys

a) AppEUI

b) DevEUI ID

c) AppKey ID

3. Payload Function

a) Type (Decoder/Encoder)

b) Format (FORMATTER_JAVASCRIPT / FORMATTER_CAYENNELPP/ FORMATTER_DEVICEREPO)

c) Function File

4. Lorawan Settings

a) Activation Method (OTAA / ABP)

b) LoRaWAN Version (1.0.0 / 1.0.1 1.0.2 / 1.0.3 /1.0.4 /1.1.0)

  

# 4) Datastreams

  

URL: /datastreams/{ID}

  

Data displayed:

  

1. ID

2. Name

3. Unit of Measurements

4. Descriptions

5. Redirect Button to Observations

  

# 5) Location

  

URL: / locations/{ID}

  

Data displayed:

  

1. Location Address Provided

2. Map

  
  

# 6) Observation

  

URL: / observations/{ID}

  

Data displayed:

  
  

2. Phenomenon Time

3. Result

4. Download Data as CSV

5. Graph of the last 10 Observation

6. 2 datetime input that makes possible to filter data
