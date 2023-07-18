import DashboardComponent from "../../components/DashboardComponent";
import TrainingCategories from "../../components/TrainingCategories";

function WebAppTraining() {
  return (
    <DashboardComponent>
      <TrainingCategories
        name="WebAppTraining"
        description="WebAppTrainingDescription "
        object={[
          {
            name: "General",
            urls: [
              {
                name: "General Info 1",
                path: "https://www.tum.de/",
              },
              {
                name: "General Info 2",
                path: "https://www.tum.de/",
              },
            ],
          },
        ]}
      />
    </DashboardComponent>
  );
}

export default WebAppTraining;
