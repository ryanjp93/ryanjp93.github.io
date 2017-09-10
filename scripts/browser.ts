class Browser {
	public static readonly IS_OPERA = window.navigator.userAgent.indexOf("OPR") > -1;
	public static readonly IS_EDGE = window.navigator.userAgent.indexOf("Edge") > -1;
	public static readonly IS_IOS = /iPad|iPhone|iPod/.test(window.navigator.userAgent) && !(window as any).MSStream;
	public static readonly IS_IOS_CHROME = window.navigator.userAgent.match("CriOS");
	public static readonly IS_CHROME = (window as any).chrome !== null && (window as any).chrome !== undefined && window.navigator.vendor === "Google Inc." && !Browser.IS_OPERA && !Browser.IS_EDGE;
}
