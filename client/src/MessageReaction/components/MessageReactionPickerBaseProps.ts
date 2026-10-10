export interface MessageReactionPickerBaseProps {
    messageId: string,
    onEmojiPicked?: (emojiId: string) => void
}
