import DashboardComponent from "../../components/DashboardComponent";
import TrainingCategories from "../../components/TrainingCategories";

function GrafanaTraining() {
  return (
    <DashboardComponent>
      <TrainingCategories
        name="Grafana Training"
        description="Grafana is an open-source analytics and visualization platform for building dashboards, exploring time-series data, and configuring alerts."
        object={[
          {
            name: "Documentation",
            image: "grafana-icon.png",
            urls: [
              {
                name: "Grafana Documentation",
                path: "https://grafana.com/docs/grafana/latest/",
              },
              {
                name: "Dashboards",
                path: "https://grafana.com/docs/grafana/latest/dashboards/",
              },
              {
                name: "Panels and visualizations",
                path: "https://grafana.com/docs/grafana/latest/panels-visualizations/",
              },
              {
                name: "Data sources",
                path: "https://grafana.com/docs/grafana/latest/datasources/",
              },
              {
                name: "Alerting",
                path: "https://grafana.com/docs/grafana/latest/alerting/",
              },
            ],
          },
          {
            name: "Tutorials",
            urls: [
              {
                name: "Grafana Tutorials",
                path: "https://grafana.com/tutorials/",
              },
              {
                name: "Grafana fundamentals learning journey",
                path: "https://grafana.com/docs/learning-journeys/grafana-fundamentals/",
              },
              {
                name: "Create your first dashboard",
                path: "https://grafana.com/docs/grafana/latest/dashboards/build-dashboards/create-dashboard/",
              },
              {
                name: "Grafana Play demo",
                path: "https://play.grafana.org/",
              },
            ],
          },
        ]}
      />
    </DashboardComponent>
  );
}

export default GrafanaTraining;
