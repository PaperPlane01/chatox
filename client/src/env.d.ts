interface ImportMetaEnv {
	readonly VITE_CLIENT_ID: string
	readonly VITE_CLIENT_SECRET: string
	readonly VITE_API_BASE_URL: string
	readonly VITE_IMAGE_MAX_SIZE: number
	readonly VITE_VIDEO_MAX_SIZE: number
	readonly VITE_AUDIO_MAX_SIZE: number
	readonly VITE_FILE_MAX_SIZE: number
	readonly VITE_GOOGLE_CLIENT_ID: string
	readonly VITE_GOOGLE_CLIENT_SCOPE: string
	readonly VITE_GOOGLE_CLIENT_REDIRECT_URI: string
	readonly VITE_GOOGLE_CLIENT_SECRET: string
	readonly VITE_PUBLIC_URL: string
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}