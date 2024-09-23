import { Routes } from '@angular/router';
import { AiAvatarComponent } from './view/ai-services/ai-avatar/ai-avatar.component';

export const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: '/ai-service/ai-service-home',
    },
    {
        path: 'ai-service',
        loadChildren: () =>
            import('./view/ai-services/ai-services.module').then(
                (m) => m.AiServicesModule
            ),
    },
    {
        path: 'ai-avatar',
        component: AiAvatarComponent,
    },
];
