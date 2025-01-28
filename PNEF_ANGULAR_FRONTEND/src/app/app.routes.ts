import { Routes } from '@angular/router';
import { WelcomePageComponent } from './Components/welcome-page/welcome-page.component';
import { LoginPageComponent } from './Components/login-page/login-page.component';
import { HomePageComponent } from './Components/home-page/home-page.component';
import { NavigationPageComponent } from './Components/navigation-page/navigation-page.component';
import { ProfilePageComponent } from './Components/profile-page/profile-page.component';
import { RegisterPageComponent } from './Components/register-page/register-page.component';

export const routes: Routes = [
    { path: '', redirectTo: "welcome", pathMatch: 'full' },
    { path: 'welcome', component: WelcomePageComponent },
    { path: 'login', component: LoginPageComponent },
    { path: 'register', component: RegisterPageComponent },
    { path: 'navigation', component: NavigationPageComponent, children: [
        { path: '', redirectTo: "home", pathMatch: 'full' },
        { path: 'home', component: HomePageComponent },
        { path: 'profile', component: ProfilePageComponent },
    ] }
];
