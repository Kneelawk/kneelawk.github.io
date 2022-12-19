import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MenuBarComponent } from './menu-bar/menu-bar.component';
import { HomepageComponent } from './homepage/homepage.component';
import { AboutMeComponent } from './about-me/about-me.component';
import { DocsIndexComponent } from './docs-index/docs-index.component';
import { HttpClientModule } from "@angular/common/http";
import { BASE_URL } from "./index-reader.service";
import { MavenIndexComponent } from './maven-index/maven-index.component';

@NgModule({
  declarations: [
    AppComponent,
    MenuBarComponent,
    HomepageComponent,
    AboutMeComponent,
    DocsIndexComponent,
    MavenIndexComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule
  ],
  providers: [
    { provide: BASE_URL, useValue: '/docs.index' }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
