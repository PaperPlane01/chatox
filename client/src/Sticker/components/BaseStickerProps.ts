export interface BaseStickerProps {
	stickerId: string,
	size?: number,
	forceAutoplay?: boolean,
	forceLoop?: boolean,
	onClick?: () => void,
	onLongClick?: () => void,
	onLoad?: () => void
}
