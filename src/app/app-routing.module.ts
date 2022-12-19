import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {HomepageComponent} from "./homepage/homepage.component";
import {AboutMeComponent} from "./about-me/about-me.component";
import {DocsIndexComponent} from "./docs-index/docs-index.component";
import {MavenIndexComponent} from "./maven-index/maven-index.component";

const routes: Routes = [
  { path: '', component: HomepageComponent, pathMatch: 'full' },
  { path: 'about-me', component: AboutMeComponent, pathMatch: 'full' },
  { path: 'docs', component: DocsIndexComponent, pathMatch: 'full' },
  { path: 'maven', component: MavenIndexComponent, pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
