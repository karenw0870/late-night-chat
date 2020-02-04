import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DashboardComponent } from './dashboard/dashboard.component';
import { LoginComponent } from './login/login.component';
import { UserIndexComponent } from './user/user-index/user-index.component';
import { UserEditComponent } from './user/user-edit/user-edit.component';
import { UserDetailComponent } from './user/user-detail/user-detail.component';
import { UserDeleteComponent } from './user/user-delete/user-delete.component';
import { GroupEditComponent } from './group/group-edit/group-edit.component';
import { GroupDetailComponent } from './group/group-detail/group-detail.component';
import { ChannelDetailComponent } from './channel/channel-detail/channel-detail.component';
import { AuthService } from './_services/auth.service';

const routes: Routes = [
  {path:'', component:LoginComponent},
  {path:'dashboard', component:DashboardComponent, canActivate:[AuthService]},
  {path:'login', component:LoginComponent},
  {path:'user', component:UserIndexComponent, canActivate:[AuthService]},
  {path:'user/edit', component:UserEditComponent, canActivate:[AuthService]},
  {path:'user/edit/:id', component:UserEditComponent, canActivate:[AuthService]},
  {path:'user/detail/:id', component:UserDetailComponent, canActivate:[AuthService]},
  {path:'user/delete/:id', component:UserDeleteComponent, canActivate:[AuthService]},
  {path:'group/edit', component:GroupEditComponent, canActivate:[AuthService]},
  {path:'group/edit/:id', component:GroupEditComponent, canActivate:[AuthService]},
  {path:'group/detail/:id', component:GroupDetailComponent, canActivate:[AuthService]},
  {path:'channel', component:ChannelDetailComponent, canActivate:[AuthService]},
  {path:'channel/:id', component:ChannelDetailComponent, canActivate:[AuthService]},
  { path:'**', redirectTo:''}
];
  
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
