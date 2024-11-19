import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from './pages/layout/layout.component';
import { BoardgamesComponent } from './pages/boardgames/boardgames.component';
import { BlogsComponent } from './pages/blogs/blogs.component';
import { ManijometroComponent } from './pages/manijometro/manijometro.component';
import { MessagesComponent } from './pages/messages/messages.component';
import { MessageComponent } from './pages/message/message.component';
import { EventsComponent } from './pages/events/events.component';
import { CreateEditComponent } from './pages/create-edit/create-edit.component';
import { AboutComponent } from './pages/about/about.component';
import { ControlPanelComponent } from './pages/control-panel/control-panel.component';
import { unsavedChangesGuard } from './guard/unsaved-changes.guard';

const routes: Routes = [
  {
    path:'',
    component:LayoutComponent,
    children:[
      {path:'boardgames', component:BoardgamesComponent},
      {path:'blogs', component:BlogsComponent},
      {path:'us', component:AboutComponent},
      {path:'manijometro/:id', component:ManijometroComponent},
      {path:'manijometro', component:ManijometroComponent},
      {path:'control-panel', component:ControlPanelComponent},
      {path:'messages', component:MessagesComponent},
      {path:'message/:id', component:MessageComponent},
      {path:'events', component:EventsComponent},
      {path:'create-edit/:section/:id', canDeactivate: [unsavedChangesGuard], component:CreateEditComponent},
      {path:'create-edit/:section',canDeactivate: [unsavedChangesGuard], component:CreateEditComponent},
      {path:'**', redirectTo:'boardgames'}
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
