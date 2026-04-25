export interface BaseAvatarProps {
	width?: number | string,
	height?: number | string,
	className?: string,
	variant?: "circular" | "rounded" | "square",
	onClick?: () => void
}
