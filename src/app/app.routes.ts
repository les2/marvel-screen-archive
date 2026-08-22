import { Component } from '@angular/core';
import type { Routes } from '@angular/router';

@Component({standalone:true,template:''})
export class RouteMarkerComponent {}

export const APP_ROUTES:Routes = [
  {path:'',component:RouteMarkerComponent,title:'Marvel Archive — Every screen universe, in order'},
  {path:'characters',component:RouteMarkerComponent,title:'Characters — Marvel Archive'},
  {path:'**',redirectTo:''}
];

export function pageFromUrl(url:string):'home'|'characters' {
  const path = url.split(/[?#]/,1)[0].replace(/\/+$/,'') || '/';
  return path === '/characters' ? 'characters' : 'home';
}
