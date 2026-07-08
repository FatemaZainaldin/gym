import { Routes } from "@angular/router";

const UsersRoutes: Routes = [
  {
    path: "",
    loadComponent: () =>
      import("./users-list/users-list.component").then(
        (m) => m.UsersListComponent
      ),
  },
  {
    path: 'new',
    loadComponent: () =>
      import("./users-create/users-create.component").then(
        (m) => m.UsersCreateComponent
      ),
  },

{
  path:"view/:id",
  loadComponent: () =>
  import("./users-view/users-view.component").then(
    (m) => m.UsersViewComponent
  )
},

   {
    path: "new/:id",
    loadComponent: () =>
      import("./users-create/users-create.component").then(
        (m) => m.UsersCreateComponent
      ),
  },

     {
    path: "edit/:id",
    loadComponent: () =>
      import("./users-create/users-create.component").then(
        (m) => m.UsersCreateComponent
      ),
  },

];

export default UsersRoutes;
