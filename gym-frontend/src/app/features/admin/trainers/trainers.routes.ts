import { Routes } from "@angular/router";

const TrainersRoutes: Routes = [
  {
    path: "",
    loadComponent: () =>
      import("./trainers-list/trainers-list.component").then(
        (m) => m.TrainersListComponent
      ),
  },
   {
    path: "new",
    loadComponent: () =>
      import("./trainers-create/trainers-create.component").then(
        (m) => m.TrainersCreateComponent
      ),
  },
];

export default TrainersRoutes;
