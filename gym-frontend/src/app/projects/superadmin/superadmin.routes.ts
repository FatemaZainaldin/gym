import { Routes } from '@angular/router';
import { AdminLayout } from '../shared/layout/layout';


const routes: Routes = [
  {
    path: "",
    component: AdminLayout,
    children: [
       {
        path: "clients",
        loadChildren: () => import("./clients/clients.routes"),
      },
       {
        path: "users",
        loadChildren: () => import("./users/users.routes"),
      },
      
      
    ],
  },
  
];

export default routes;
