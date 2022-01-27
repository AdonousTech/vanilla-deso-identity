// Store sent messages and associated metadata in localStorage
const MessageMetaKey = "messageMetaKey";
// Store the identity users in localStorage
const IdentityUsersKey = "identityUsers";
// Store last local node URL in localStorage
const LastLocalNodeKey = "lastLocalNodeV2";
// Store last logged in user public key in localStorage
const LastLoggedInUserKey = "lastLoggedInUser";
// Store the last identity service URL in localStorage
const LastIdentityServiceKey = "lastIdentityServiceURL";

/**
* Note - We need to pass in the C3 runtime here from main
*/
export async function setIdentityServiceUsers(runtime, event) {
	const _users = event['data']['payload']['users'];
	const _publicKeyAdded = event['data']['payload']['publicKeyAdded'];
	
	console.log('[IDENTITY STORAGE][SETTING]');
	console.log('[identityUsers] ', _users);
	console.log('[LastLoggedInUserKey] ', _publicKeyAdded);
	
	try {
    	await runtime.storage.setItem(LastLoggedInUserKey, _publicKeyAdded);
		await runtime.storage.setItem(IdentityUsersKey, _users);
		
		console.log('[IDENTITY STORAGE] Set identity values to localstorage')
	} catch (error) {
		console.log('[IDENTITY STORAGE][ERROR] :: ', error);
	}
}

export async function getIdentityServiceUsers(runtime) {	
	return new Promise(async (resolve, reject) => {
			console.log('[IDENTITY STORAGE][GETTING]');
	
		try {
			const lastLoggedInUser = await runtime.storage.getItem(LastLoggedInUserKey);
			const identityUsers = await runtime.storage.getItem(IdentityUsersKey);
			const { encryptedSeedHex, accessLevel, accessLevelHmac } = identityUsers[lastLoggedInUser];
			resolve({ encryptedSeedHex, accessLevel, accessLevelHmac });

		} catch (error) {
			console.log('[IDENTITY STORAGE GET][ERROR] :: ', error);
			reject(error);
		}
	})
}

export async function getLastLoggedInUserPublicKey(runtime) {	
	return new Promise(async (resolve, reject) => {
			console.log('[IDENTITY STORAGE][GETTING]');
	
		try {
			const lastLoggedInUser = await runtime.storage.getItem(LastLoggedInUserKey);
			resolve(lastLoggedInUser);

		} catch (error) {
			console.log('[IDENTITY STORAGE GET][ERROR] :: ', error);
			reject(error);
		}
	})
}

