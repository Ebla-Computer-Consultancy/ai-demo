import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-ai-service-home',
    standalone: true,
    imports: [RouterModule],
    templateUrl: './ai-service-home.component.html',
    styleUrls: ['./ai-service-home.component.scss'],
})
export class AiServiceHomeComponent implements OnInit {
    services: {
        id: number;
        icon: string;
        title: string;
        route: string;
        description: string;
    }[] = [
        {
            id: 1,
            icon: 'robot-confused-outline',
            title: 'Chat bot',
            route: '/ai-service/ai-chat-bot',
            description:
                'A bot that provides assistance, answers questions and provides information in an immediate and efficient manner. The intelligent bot relies on natural information technologies to understand and queries users.',
        },
        {
            id: 2,
            icon: 'magnify',
            title: 'AI Search',
            route: '/ai-service/ai-search',
            description:
                'Smart Search is a cutting-edge technology that uses artificial intelligence to improve the online search experience. Instead of providing a long list of links, this service analyzes the intent and context behind the question to provide the user with accurate and detailed answers.',
        },
    ];
    ngOnInit() {}
}
