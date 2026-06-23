import { Routes } from "@angular/router";

const ClientsRoutes: Routes = [
  {
    path: "",
    loadComponent: () =>
      import("./clients-list/clients-list.component").then(
        (m) => m.ClientsListComponent
      ),
  },
   {
    path: "new",
    loadComponent: () =>
      import("./clients-create/clients-create.component").then(
        (m) => m.ClientsCreateComponent
      ),
  },

    {
    path: "edit/:id",
    loadComponent: () =>
      import("./clients-create/clients-create.component").then(
        (m) => m.ClientsCreateComponent
      ),
  },
];

export default ClientsRoutes;
