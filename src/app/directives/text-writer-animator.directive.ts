import {
    Directive,
    ElementRef,
    EventEmitter,
    Input,
    input,
    OnInit,
    Output,
} from '@angular/core';

@Directive({
    selector: '[TextWriterAnimator]',
    standalone: true,
})
export class TextWriterAnimatorDirective implements OnInit {
    @Input() text: string = '';
    @Input() speed: number = 20;
    @Output() animating: EventEmitter<boolean> = new EventEmitter<boolean>();
    constructor(private elementRef: ElementRef) {}
    ngOnInit(): void {
        this.animateText();
    }
    animateText() {
        this.animating.emit(true);
        let index = 0;
        let currentText = '';

        const addNextCharacter = () => {
            currentText += this.text.charAt(index);
            this.elementRef.nativeElement.innerHTML = currentText; // Render current text
            // chatContainer.scrollTop = chatContainer.scrollHeight;
            index++;
            if (index < this.text.length) {
                setTimeout(addNextCharacter, this.speed * Math.random()); // Adjust speed here (milliseconds)
            } else {
                this.animating.emit(false);
            }
        };
        addNextCharacter();
    }
}