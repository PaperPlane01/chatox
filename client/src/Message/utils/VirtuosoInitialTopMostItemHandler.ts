export interface VirtuosoInitialTopMostItemIndexMapEntry {
    index: number,
    previous: number[]
}

export interface VirtuosoInitialTopMostIndexMap {
    [chatId: string]: VirtuosoInitialTopMostItemIndexMapEntry
}

export class VirtuosoInitialTopMostItemHandler {
    private initialTopMostIndexMap: VirtuosoInitialTopMostIndexMap = {};

    public setInitialTopMostItem(chatId: string, index: number): void {
        if (!this.initialTopMostIndexMap[chatId]) {
            this.initialTopMostIndexMap[chatId] = {
                index: 0,
                previous: []
            }
        }

        if (this.initialTopMostIndexMap[chatId].previous && this.initialTopMostIndexMap[chatId].previous.length !== 0) {
            const previous = this.initialTopMostIndexMap[chatId].previous[this.initialTopMostIndexMap[chatId].previous.length - 1];

            // For some reason react-virtuoso shifts startIndex position by 1 even if it's not been visible (even if overscan is not used)
            // This causes scroll position to shift by 1 upwards for no reason
            if ((previous - index) === 1) {
                // Negate this effect
                index = previous;
            } else if ((previous - index) > 20) {
                // Looks like some kind of race condition happens when switching between chats.
                // For some reason position of current chat is set to previous chat on first render.
                // We detect too large difference between current position and previous position of chat to avoid
                // scrolling to incorrect position when switching back.
                // This is a hacky work-around but I can't see any other way currently :(
                index = previous;
            }
        }

        // Save scroll position for selected chat
        this.initialTopMostIndexMap[chatId].index = index;

        if (this.initialTopMostIndexMap[chatId].previous) {
            this.initialTopMostIndexMap[chatId].previous.push(index);

            if (this.initialTopMostIndexMap[chatId].previous.length > 30) {
                // Do cleanup if we have too many items in scroll history array
                this.initialTopMostIndexMap[chatId].previous = this.initialTopMostIndexMap[chatId].previous.slice(25)
            }
        } else {
            this.initialTopMostIndexMap[chatId].previous = [index];
        }
    }

    public getInitialTopMostItem(chatId: string): number | undefined {
        if (this.initialTopMostIndexMap[chatId]) {
            return this.initialTopMostIndexMap[chatId].index;
        }

        return undefined;
    }
}
