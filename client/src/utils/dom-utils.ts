export const isScrollable = (element: HTMLDivElement): boolean => {
	return element.scrollWidth > element.clientWidth || element.scrollHeight > element.clientHeight;
};

export const isWindowScrollable = (): boolean => {
	return document.body.scrollHeight > window.innerHeight;
};
