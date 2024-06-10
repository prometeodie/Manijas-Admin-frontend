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

const routes: Routes = [
  {
    path:'',
    component:LayoutComponent,
    children:[
      {path:'boardgames', component:BoardgamesComponent},
      {path:'blogs', component:BlogsComponent},
      {path:'manijometro', component:ManijometroComponent},
      {path:'messages', component:MessagesComponent},
      {path:'message', component:MessageComponent},
      {path:'events', component:EventsComponent},
      {path:'create-edit', component:CreateEditComponent},
      {path:'**', redirectTo:'boardgames'}
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
