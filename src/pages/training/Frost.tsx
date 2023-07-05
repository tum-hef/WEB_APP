import DashboardComponent from "../../components/DashboardComponent";
import Training from "../../components/Training";

function FrostTraining() {
  return (
    <DashboardComponent>
      <Training
        name="Frost Training"
        object={[
          {
            name: "FROST GitHub Repository",
            path: "https://github.com/FraunhoferIOSB/FROST-Server",
          },
          {
            name: "FROST Endpoints",
            path: "https://github.com/tum-gis/iot-frost-ecosystem/blob/master/FROST-Server/FROST.mdr",
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
          {
            name: "OGC SensorThings API Documentation",
            path: "https://www.ogc.org/standard/sensorthings",
          },
          {
            name: "The OGC SensorThings API",
            path: "https://fraunhoferiosb.github.io/FROST-Server/sensorthingsapi/1_Home.html",
          },
        ]}
      />
    </DashboardComponent>
  );
}

export default FrostTraining;
