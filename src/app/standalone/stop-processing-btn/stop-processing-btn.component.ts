import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
    selector: 'stop-processing-btn',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './stop-processing-btn.component.html',
    styleUrls: ['./stop-processing-btn.component.scss'],
})
export class StopProcessingBtnComponent implements OnInit {
    @Output() onClick: EventEmitter<void> = new EventEmitter<void>();
    @Input() active: boolean = false;
    @Input() position: string = 'top';
    constructor() {}

    ngOnInit() {}
}
