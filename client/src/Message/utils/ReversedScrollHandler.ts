export class ReversedScrollHandler {
    private lastCallDate?: Date;

    public handleScroll(virtuosoDiv: Element, event: WheelEvent, restoredScrollingSpeedCoefficient: number): void {
        if (this.lastCallDate) {
            if (new Date().getTime() - this.lastCallDate.getTime() > 10) {
                virtuosoDiv.scrollTop -= event.deltaY * restoredScrollingSpeedCoefficient;
                this.lastCallDate = new Date();
            }
        } else {
            virtuosoDiv.scrollTop -= event.deltaY * restoredScrollingSpeedCoefficient;
            this.lastCallDate = new Date();
        }
    }
}
