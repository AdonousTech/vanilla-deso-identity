import * as HTTP from './vanilla-http.js';
export function createHTTP() {
	const _opts =  {
		// 某人为0，在固定间隔时间内的请求，若参数相同，直接走缓存，默认15分钟
		//Someone is 0, request in a fixed interval, if the parameters are the same, go directly to the cache, the default 15 minutes
		cacheTime: 60 * 15 * 1000,
		// 可选，请求URL前缀
		// Optional base URL | doesn't work properly when set
		baseURL: '',
		reducer: (e) => {
			return e;
		},
		onError: (e) => {
			console.log('[HTTP CLIENT][ERROR] :: ', e);
			return e;
		}
	}
	
	const http = HTTP.createHttp(_opts);
	console.log('Created http object :: ', http);
	return http;
	
}
export function get() {
	
}