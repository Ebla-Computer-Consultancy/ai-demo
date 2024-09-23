import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'app-loading',
    standalone: true,
    templateUrl: './loading.component.html',
    styleUrls: ['./loading.component.scss'],
})
export class LoadingComponent implements OnInit {
    @Input() color: string = 'primary';
    constructor() {}

    ngOnInit() {}
}
