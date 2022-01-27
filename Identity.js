import * as IdentityStorage from './identityStorage.js';
import * as HttpClient from './HttpClient.js';

let initialized; // Value determining whether identity is initialized
let iframe; // The IFrame used for communicating between the Identity and Game
let pendingRequests = []; // Requests that were sent before the iframe initialized
const outboundRequests = {};
let storageGranted = new Promise((resolve, reject) => resolve(true));
let identityWindow;
let runtimeInstance;

const isDebug = true;

export function launchIdentityWindow(path) {
	
	// center the window
	const h = 1000;
	const w = 800;
	const y = window['outerHeight'] / 2 + window['screenY'] - h / 2;
	const x = window['outerWidth'] / 2 + window['screenX'] - w / 2;

	let url;
	
	if (path === 'log-in') {
		url = 'https://identity.deso.org/log-in?accessLevelRequest=3';
	}

	identityWindow = window['open'](url, null, `toolbar=no, width=${w}, height=${h}, top=${y}, left=${x}`);		
}

/**
* Listens for messages from the Window API (DeSo). Incoming events are intercepted by the
* handleMessage function
// See https://docs.deso.org/identity/window-api
// Use access modifiers to avoid issues with Advanced Minification
*/
export function listenForMessagesOnWindowAPI() {
	window.addEventListener("message", (event) => {handleMessage(event)});
}

/**
* TODO: NEED TO SUBMIT A TRANSACTION FIRST!!
* payload { accessLevel: number;
			accessLevelHmac: string;
			encryptedSeedHex: string;
			transactionHex: string; }
  Passed in after retrieving via IdentityStorage getIdentityServiceUsers
*/
export function sign(runtime, signable) {
	return new Promise(async (resolve, reject) => {
		try {
			const user = await IdentityStorage.getIdentityServiceUsers(runtime);
			console.log('ready to sign with signable ::', signable);
			console.log('ready to sign with user ::', user);
			
			const payloadToSign = {
			 	accessLevel: user.accessLevel,
				accessLevelHmac: user.accessLevelHmac,
				encryptedSeedHex: user.encryptedSeedHex,
				transactionHex: signable.body.TransactionHex
			}
			
			console.log('Payload to sign ::', payloadToSign);
			
			send("sign", payloadToSign);

			resolve();
		} catch (error) {
			console.log('[ERROR] testing sign method ::', error);
			reject(error);
		}
	})
}

function send(method, payload) {
	const req = {
		id: new Date() + Math.random(),
		method,
		payload,
		service: 'identity'
	}
	
	console.log('assembled req :: ', req);
	postMessage(req);
}

async function postMessage(req) {
	if (initialized) {
		const obj = await iframe['contentWindow']['postMessage'](req, "*");
		console.log('posted message ::', req);
		console.log('postMessage Resp ::', obj);
	} else {
		pendingRequests['push'](req);
	}
}

function handleMessage(event) {
	// event['data']
	// event['data']['service']
	// event['data']['method']

	if (event['data']['service'] !== "identity") {
		return;
	}

	/**
	* Methods are present on incoming requests but not responses
	* Incoming requests are handled by handleRequest function
	* Responses are handled by handleResponse function
	*/
	if (event['data']['method']) {
		handleRequest(event);
	} else {
		handleResponse(event);
	}
}

// private
function respond(window, id, payload) {
	window['postMessage']({ id, service: "identity", payload }, "*");
}
		
function handleRequest(event) {
	if (event['data']['method'] === "initialize") {
		console.log('[INFO] [handleRequest] initialize :: ', event);
		handleInitialize(event);
	} else if (event['data']['method'] === "storageGranted") {
		console.log('[INFO] [handleRequest] storageGranted :: ', event);
		handleStorageGranted();
	} else if (event['data']['method'] === "login") {
		console.log('[INFO] [handleRequest] login :: ', event);
		//TODO: SetIdentityServiceUsers
		IdentityStorage.setIdentityServiceUsers(runtimeInstance, event);
		handleLogin(event['data']['payload']);
	} else if (event['data']['method'] === "info") {
		console.log('[INFO] [handleRequest] info :: ', event);
		handleInfo(event['data']['id']);
	} else {
		console.error("[ERROR] Unhandled identity request");
		console.error(event);
	}
}

function handleResponse(event) {
 	console.log('[RECEVIED WINDOW RESPONSE] ::', event);
	/**
	* Once we receive the window response, we can inspect it for the signedTransactionHex which is at
	* event.data.payload.signedTransactionHex
	*
	* Jumping straight into submission here, due to restrictions in coding environment.
	* Typically, we would organize this better. HOWEVER, this could work well because we can 
	* access objects and set values to alert the user of the successful call
	*/
	try {
		console.log('[SIGNED TX HEX ] :: ', event.data.payload.signedTransactionHex);
		submitSignedTransaction(event.data.payload.signedTransactionHex);
	} catch (error) {
	
	}

}

async function submitSignedTransaction(signedTransactionHex) {
	// create HTTP client instance
	const httpClient = HttpClient.createHTTP();
	isDebug ? console.log('ready to use httpClient ::', httpClient) : void 0;
	
	const txToSubmit = {
		TransactionHex: signedTransactionHex
	}
	
	//test
	const data1 = await httpClient.post(
		"https://node.bitcloutapps.ninja/api/v0/submit-transaction",
		txToSubmit,
		{
		  onerror: (e) => {
		  	console.log('Error submitting test post... ::', e);
		  }
		}
	)
	console.log('submitted signed tx :: ', data1);
}

function handleInitialize(event) {
	console.log('[INFO] [handleInitialize] [event] ', event);
	if (!initialized) {
		initialized = true;
		console.log('[INFO] [handleInitialize] [initialized] ', initialized);
		
		/**
		* Initialize the IFrame which is used for communication between window and Identity
		* NOTE - Selector should always be identityIframe (ID) in Construct project
		* NOTE - URL property of IFrame in Construct should always be https://identity.deso.org
		*/
		iframe = identityIframe;
		console.log('[INFO] [IFrame] [Ref] :: ', iframe);
		
		// resolve any pending requests
		for (const request of pendingRequests) {
			postMessage(request);
		}
		
		// clear pending requests
		pendingRequests = [];
	}

	// acknowledge, provides hostname data
	respond(event.source, event.data.id, {});
}

async function handleStorageGranted() {
	await storageGranted(); // hack
}

function handleLogin(payload) {
	return new Promise((resolve, reject) => {
	    identityWindow['close']();
    	identityWindow = null;
		
		resolve(payload); // hack
	})
}

function handleInfo(id) {
    respond(identityWindow, id, {});
}
