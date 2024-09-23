import { Component, inject, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { environment } from '../../../environments/environment.prod';
import { filter } from 'rxjs';

@Component({
    selector: 'app-ai-services',
    templateUrl: './ai-services.component.html',
    styleUrls: ['./ai-services.component.scss'],
})
export class AiServicesComponent implements OnInit {
    router = inject(Router);
    logo = environment.logo;
    collapsed: boolean = true;
    activatedRoute!: string;
    navLinks = [
        {
            route: '/',
            title: 'Home',
        },
        {
            route: '/ai-service/ai-search',
            title: 'AI Search',
        },
        {
            route: '/ai-service/ai-chat-bot',
            title: 'Chat Bot',
        },
    ];
    constructor() {}

    ngOnInit() {
        this.router.events
            .pipe(filter((event) => event instanceof NavigationEnd))
            .subscribe((data) => {
                this.activatedRoute = data.url;
            });
    }
}
