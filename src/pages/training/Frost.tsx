import DashboardComponent from "../../components/DashboardComponent";
import TrainingCategories from "../../components/TrainingCategories";

function FrostTraining() {
  return (
    <DashboardComponent>
      <TrainingCategories
        name="Sensor Database"
        description="FROST Server - A Server implementation of the OGC SensorThings API. The OGC SensorThings API is an OGC standard specification for providing an open and unified way to interconnect IoT devices, data, and applications over the Web. The FRaunhofer Opensource SensorThings-Server is the first complete, open-source official reference implementation of the OGC SensorThings "
        object={[
          {
            name: "FROST",
            image: "FROST-Server-darkgrey.png",
            urls: [
              {
                name: "FROST GitHub Repository",
                path: "https://github.com/FraunhoferIOSB/FROST-Server",
              },
              {
                name: "FROST Endpoints",
                path: "https://github.com/tum-gis/iot-frost-ecosystem/blob/master/FROST-Server/FROST.md",
              },
              {
                name: "FROST Server Documentation",
                path: "https://fraunhoferiosb.github.io/FROST-Server/",
              },
              {
                name: "Fraunhofer IOSB",
                path: "https://www.iosb.fraunhofer.de/de/projekte-produkte/frostserver.html",
              },
              {
                name: "FROST Infrastructure",
                path: "https://github.com/tum-gis/iot-frost-ecosystem/tree/master/FROST-Server",
              },
            ],
          },
          {
            name: "OGC SensorThings",
            image: "OGC.png",
            urls: [
              {
                name: "OGC SensorThings API Documentation",
                path: "https://www.ogc.org/standard/sensorthings",
              },
              {
                name: "The OGC SensorThings API",
                path: "https://fraunhoferiosb.github.io/FROST-Server/sensorthingsapi/1_Home.html",
              },
            ],
          },
        ]}
      />
    </DashboardComponent>
  );
}

export default FrostTraining;
