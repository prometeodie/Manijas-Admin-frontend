import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

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
import { HeaderComponent } from './components/header/header.component';
import { NavBarComponent } from './components/nav-bar/nav-bar.component';
import { ControlPanelComponent } from './pages/control-panel/control-panel.component';
import { LoadingAnimationComponent } from './components/loading-animation/loading-animation.component';
import { CardsComponent } from './components/cards/cards.component';
import { NewBtnComponent } from './components/new-btn/new-btn.component';
import { EventFormComponent } from './components/event-form/event-form.component';
import { EventSampleCardComponent } from './components/event-sample-card/event-sample-card.component';


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
    HeaderComponent,
    ControlPanelComponent
  ],
  imports: [
    HttpClientModule,
    CommonModule,
    DashboardRoutingModule,
    CardsComponent,
    LoadingAnimationComponent,
    NavBarComponent,
    NewBtnComponent,
    EventFormComponent,
    EventSampleCardComponent
  ]
})
export class DashboardModule { }
