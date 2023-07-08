import DashboardComponent from "../../components/DashboardComponent";
import TrainingCategories from "../../components/TrainingCategories";

function NodeRedTraining() {
  return (
    <DashboardComponent>
      <TrainingCategories
        name="Node RED Training"
        description="Node-RED is a flow-based, low-code development tool for visual programming developed originally by IBM for wiring together hardware devices, APIs and online services as part of the Internet of Things."
        object={[
          {
            name: "Lecture",
            urls: [
              {
                name: "A brief introduction to Node-RED",
                path: "https://syncandshare.lrz.de/dl/fiMycusNcpQkQjhnjSM9NG/sensorHUB_Training_Material/Node-RED/Tutorials/Lectures/Node-RED%20Lecture%201%20%E2%80%93%20A%20brief%20introduction%20to%20Node-RED%20%E2%80%93%20Node%20RED%20Programming%20Guide.pdf?inline",
              },
              {
                name: "Building your first flows",
                path: "https://syncandshare.lrz.de/dl/fiMycusNcpQkQjhnjSM9NG/sensorHUB_Training_Material/Node-RED/Tutorials/Lectures/Node-RED%20Lecture%202%20%E2%80%93%20Building%20your%20first%20flows%20%E2%80%93%20Node%20RED%20Programming%20Guide.pdf?inline",
              },
              {
                name: "Basic nodes and flows",
                path: "https://syncandshare.lrz.de/dl/fiMycusNcpQkQjhnjSM9NG/sensorHUB_Training_Material/Node-RED/Tutorials/Lectures/Node-RED%20Lecture%203%20%E2%80%93%20Basic%20nodes%20and%20flows%20%E2%80%93%20Node%20RED%20Programming%20Guide.pdf?inline",
              },
              {
                name: "A tour of the core nodes",
                path: "https://syncandshare.lrz.de/dl/fiMycusNcpQkQjhnjSM9NG/sensorHUB_Training_Material/Node-RED/Tutorials/Lectures/Node-RED%20Lecture%204%20%E2%80%93%20A%20tour%20of%20the%20core%20nodes%20%E2%80%93%20Node%20RED%20Programming%20Guide.pdf?inline",
              },
              {
                name: "The Node-RED programming model",
                path: "https://syncandshare.lrz.de/dl/fiMycusNcpQkQjhnjSM9NG/sensorHUB_Training_Material/Node-RED/Tutorials/Lectures/Node-RED%20Lecture%205%20%E2%80%93%20The%20Node-RED%20programming%20model%20%E2%80%93%20Node%20RED%20Programming%20Guide.pdf?inline",
              },
              {
                name: "Intermediate flows",
                path: "https://syncandshare.lrz.de/dl/fiMycusNcpQkQjhnjSM9NG/sensorHUB_Training_Material/Node-RED/Tutorials/Lectures/Node-RED%20Lecture%206%20%E2%80%93%20Intermediate%20flows%20%E2%80%93%20Node%20RED%20Programming%20Guide.pdf?inline",
              },
              {
                name: "Dashboards and UI techniques for Node-RED",
                path: "https://syncandshare.lrz.de/dl/fiMycusNcpQkQjhnjSM9NG/sensorHUB_Training_Material/Node-RED/Tutorials/Lectures/Node-RED%20Lecture%207%20%E2%80%93%20Dashboards%20and%20UI%20techniques%20for%20Node-RED%20%E2%80%93%20Node%20RED%20Programming%20Guide.pdf?inline",
              },
              {
                name: " Advanced flows with Node-RED ",
                path: "https://syncandshare.lrz.de/dl/fiMycusNcpQkQjhnjSM9NG/sensorHUB_Training_Material/Node-RED/Tutorials/Lectures/Node-RED%20Lecture%208%20Advanced%20flows%20with%20Node-RED%20%E2%80%93%20Node%20RED%20Programming%20Guide.pdf?inline",
              },
            ],
          },
          {
            name: "Tutorials",
            urls: [
              {
                name: "Tutorial SQLite and Node-RED ",
                path: "https://syncandshare.lrz.de/dl/fiMycusNcpQkQjhnjSM9NG/sensorHUB_Training_Material/Node-RED/Tutorials/Tutorials/Tutorial%20SQLite%20and%20Node-RED%20%E2%80%93%20Node%20RED%20Programming%20Guide.pdf?inline",
              },
              {
                name: "Tutorial Node-RED dashboards  multiple lines on a chart ",
                path: "https://syncandshare.lrz.de/dl/fiMycusNcpQkQjhnjSM9NG/sensorHUB_Training_Material/Node-RED/Tutorials/Tutorials/Tutorial%20Node-RED%20dashboards%20%E2%80%93%20multiple%20lines%20on%20a%20chart%20%E2%80%93%20Node%20RED%20Programming%20Guide.pdf?inline",
              },
              {
                name: " Tutorial Node-RED dashboards – creating your own UI widget",
                path: "https://syncandshare.lrz.de/dl/fiMycusNcpQkQjhnjSM9NG/sensorHUB_Training_Material/Node-RED/Tutorials/Tutorials/Tutorial%20Node-RED%20dashboards%20%E2%80%93%20creating%20your%20own%20UI%20widget%20%E2%80%93%20Node%20RED%20Programming%20Guide.pdf?inline",
              },
              {
                name: "Tutorial Node-RED dashboards – creating your own UI widget II",
                path: "https://syncandshare.lrz.de/dl/fiMycusNcpQkQjhnjSM9NG/sensorHUB_Training_Material/Node-RED/Tutorials/Tutorials/Tutorial%20Node-RED%20dashboards%20%E2%80%93%20creating%20your%20own%20UI%20widget%20II%20(using%20external%20charts)%20%E2%80%93%20Node%20RED%20Programming%20Guide.pdf?inline",
              },
              {
                name: "Cryptocurrency prices and data from Binance with Node-RED tutorial",
                path: "https://syncandshare.lrz.de/dl/fiMycusNcpQkQjhnjSM9NG/sensorHUB_Training_Material/Node-RED/Tutorials/Tutorials/Cryptocurrency%20prices%20and%20data%20from%20Binance%20with%20Node-RED%20tutorial%20%E2%80%93%20Node%20RED%20Programming%20Guide.pdf?inline",
              },
              {
                name: "The Node-RED programming model",
                path: "https://syncandshare.lrz.de/dl/fiMycusNcpQkQjhnjSM9NG/sensorHUB_Training_Material/Node-RED/Tutorials/Lectures/Node-RED%20Lecture%205%20%E2%80%93%20The%20Node-RED%20programming%20model%20%E2%80%93%20Node%20RED%20Programming%20Guide.pdf?inline",
              },
              {
                name: "Dashboards and graphs for cryptocurrency data using Node-RED tutorial ",
                path: "https://syncandshare.lrz.de/dl/fiMycusNcpQkQjhnjSM9NG/sensorHUB_Training_Material/Node-RED/Tutorials/Tutorials/Dashboards%20and%20graphs%20for%20cryptocurrency%20data%20using%20Node-RED%20tutorial%20%E2%80%93%20Node%20RED%20Programming%20Guide.pdf?inline",
              },
              {
                name: "Smart City standards an overview",
                path: "https://syncandshare.lrz.de/dl/fiMycusNcpQkQjhnjSM9NG/sensorHUB_Training_Material/Node-RED/Tutorials/Tutorials/Smart%20City%20standards%20an%20overview%20%E2%80%93%20Node%20RED%20Programming%20Guide.pdf?inline",
              },

              {
                name: " Tutorial Advanced dashboards for Node-RED (and cryptocurrency)",
                path: "https://syncandshare.lrz.de/dl/fiMycusNcpQkQjhnjSM9NG/sensorHUB_Training_Material/Node-RED/Tutorials/Tutorials/Tutorial%20Advanced%20dashboards%20for%20Node-RED%20(and%20cryptocurrency)%20%E2%80%93%20Node%20RED%20Programming%20Guide.pdf?inline",
              },
            ],
          },
          {
            name: "Other",
            urls: [
              {
                name: "Documentation",
                path: "https://nodered.org/docs/",
              },
              {
                name: "User Guide",
                path: "https://nodered.org/docs/user-guide/",
              },
            ],
          },
        ]}
      />
    </DashboardComponent>
  );
}

export default NodeRedTraining;
