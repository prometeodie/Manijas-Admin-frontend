import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { LayoutComponent } from './pages/layout/layout.component';
import { BoardgamesComponent } from './pages/boardgames/boardgames.component';
import { BlogsComponent } from './pages/blogs/blogs.component';
import { EventsComponent } from './pages/events/events.component';
import { AboutComponent } from './pages/about/about.component';
import { MessagesComponent } from './pages/messages/messages.component';
import { ManijometroComponent } from './pages/manijometro/manijometro.component';
import { CreateEditComponent } from './pages/create-edit/create-edit.component';
import { MessageComponent } from './pages/message/message.component';



@NgModule({
  declarations: [
    LayoutComponent,
    BoardgamesComponent,
    BlogsComponent,
    EventsComponent,
    AboutComponent,
    MessagesComponent,
    ManijometroComponent,
    CreateEditComponent,
    MessageComponent,
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule
  ]
})
export class DashboardModule { }
