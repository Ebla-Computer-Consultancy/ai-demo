import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AiServicesComponent } from './ai-services.component';
import { RouterModule } from '@angular/router';
import { AiChatBotComponent } from './ai-chat-bot/ai-chat-bot.component';
import { AiSearchComponent } from './ai-search/ai-search.component';
import { AiServiceHomeComponent } from './ai-service-home/ai-service-home.component';
import { FormsModule } from "@angular/forms";
@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild([
            {
                path: '',
                component: AiServicesComponent,
                children: [
                    {
                        path: '',
                        pathMatch: 'full',
                        redirectTo: '/ai-service/ai-service-home',
                    },
                    {
                        path: 'ai-service-home',
                        component: AiServiceHomeComponent,
                    },
                    {
                        path: 'ai-chat-bot',
                        component: AiChatBotComponent,
                    },
                    {
                        path: 'ai-search',
                        component: AiSearchComponent,
                    },
                    {
                        path: 'ai-service-home',
                        component: AiServiceHomeComponent,
                    },
                ],
            },
        ]),
        FormsModule,
    ],
    declarations: [AiServicesComponent],
})
export class AiServicesModule {}
