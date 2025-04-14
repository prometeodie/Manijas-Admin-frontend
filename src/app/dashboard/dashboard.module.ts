import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

import { AboutComponent } from './pages/about/about.component';
import { AboutFormComponent } from './components/about-form/about-form.component';
import { BlogsComponent } from './pages/blogs/blogs.component';
import { BlogsFormComponent } from './components/blogs-form/blogs-form.component';
import { BoardgamesComponent } from './pages/boardgames/boardgames.component';
import { BoardgamesFormComponent } from './components/boardgames-form/boardgames-form.component';
import { CardsComponent } from './components/cards/cards.component';
import { ComponentsNavBarComponent } from './components/components-nav-bar/components-nav-bar.component';
import { ControlPanelComponent } from './pages/control-panel/control-panel.component';
import { CreateEditComponent } from './pages/create-edit/create-edit.component';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { EventFormComponent } from './components/event-form/event-form.component';
import { EventSampleCardComponent } from './components/event-sample-card/event-sample-card.component';
import { EventsComponent } from './pages/events/events.component';
import { HeaderComponent } from './components/header/header.component';
import { LayoutComponent } from './pages/layout/layout.component';
import { LoadingAnimationComponent } from './components/loading-animation/loading-animation.component';
import { ManijometroComponent } from './pages/manijometro/manijometro.component';
import { MessageComponent } from './pages/message/message.component';
import { NavBarComponent } from './components/nav-bar/nav-bar.component';
import { NewBtnComponent } from './components/new-btn/new-btn.component';
import { SearchBarComponent } from './components/search-bar/search-bar.component';
import { UnsaveComponent } from './components/unsave/unsave.component';
import { GameManijometroComponent } from './pages/game-manijometro/game-manijometro.component';
import { ReactiveFormsModule } from '@angular/forms';
import { UpdatePasswordComponent } from './components/update-password/update-password.component';
import { UserFormComponent } from "./components/user-form/user-form.component";
import { UserCardComponent } from './components/user-card/user-card.component';
import { NotAuthorizedComponent } from './pages/not-authorized/not-authorized.component';
import { OrganizeCardsComponent } from './components/organize-cards/organize-cards.component';

@NgModule({
  declarations: [
    LayoutComponent,
    BoardgamesComponent,
    BlogsComponent,
    EventsComponent,
    AboutComponent,
    ManijometroComponent,
    CreateEditComponent,
    MessageComponent,
    HeaderComponent,
    ControlPanelComponent,
    GameManijometroComponent,
    NotAuthorizedComponent
  ],
  imports: [
    HttpClientModule,
    CommonModule,
    ReactiveFormsModule,
    AboutFormComponent,
    BlogsFormComponent,
    BoardgamesFormComponent,
    CardsComponent,
    ComponentsNavBarComponent,
    DashboardRoutingModule,
    EventFormComponent,
    EventSampleCardComponent,
    LoadingAnimationComponent,
    NavBarComponent,
    NewBtnComponent,
    SearchBarComponent,
    UnsaveComponent,
    UpdatePasswordComponent,
    UserFormComponent,
    UserCardComponent,
    OrganizeCardsComponent
]
})
export class DashboardModule { }
