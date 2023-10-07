import DashboardComponent from "../../components/DashboardComponent";
import TrainingCategories from "../../components/TrainingCategories";

function WebAppTraining() {
  return (
    <DashboardComponent>
      <TrainingCategories
        name="Web App Training"
        description="Documentation for the SensorHub WebApp."
        object={[
          {
            name: "General",
            urls: [
              {
                name: "Documentation",
                path: "/documents/2023-10-06_SensorHub_Documentation_DG.pdf",
              },
            ],
          },
        ]}
      />
    </DashboardComponent>
  );
}

export default WebAppTraining;
