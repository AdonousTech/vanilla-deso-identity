import * as Identity from './identity.js';
import * as DeSoPostFactory from './DeSoPostFactory.js';
import * as HttpClient from './HttpClient.js';

const isDebug = true;

export async function testLogin() {
    Identity.launchIdentityWindow('log-in');
}

export async function testSignAndPost() {
    const _post = await DeSoPostFactory.generateSubmittablePost(runtime);
	isDebug ? console.log('submittablePost :: ', _post) : void 0;
	
	// create HTTP client instance
	const httpClient = HttpClient.createHTTP();
	isDebug ? console.log('ready to use httpClient ::', httpClient) : void 0;
	
	//test
	const data1 = await httpClient.post(
		"[URL OF NODE API TO POST TO]",
		_post,
		{
		  onerror: (e) => {
		  	console.log('Error submitting test post... ::', e);
		  }
		}
	)
	console.log('made http call :: ', data1);
		

	await Identity.sign(runtime, data1);
}