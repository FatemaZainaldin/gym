import { Routes } from "@angular/router";
import { CustomerSidebar } from "./layout/sidebar";

const routes: Routes = [
  {
    path: "",
    component: CustomerSidebar,
    children: [
      {
        path: "dashboard",
        loadChildren: () => import("../admin/modules/dashboards/routes"),
      },

    ],
  },
];

export default routes;
