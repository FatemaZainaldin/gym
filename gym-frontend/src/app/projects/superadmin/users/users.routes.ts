import { Routes } from "@angular/router";

const UsersRoutes: Routes = [
  {
    path: "",
    loadComponent: () =>
      import("./users-list/users-list.component").then(
        (m) => m.UsersListComponent
      ),
  },
];

export default UsersRoutes;
