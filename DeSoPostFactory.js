import * as IdentityStorage from './identityStorage.js';
const endpoint = '[NODE HOSTNAME HERE] e.g. node.deso.org';

export async function generateSubmittablePost(runtime) {
	return new Promise(async (resolve, reject) => {
	
		try {
			const actorPublicKey = await IdentityStorage.getLastLoggedInUserPublicKey(runtime);
			const _submittable =  {
				endpoint: endpoint,
				UpdaterPublicKeyBase58Check: actorPublicKey,
				PostHashHexToModify: '',
				ParentStakeID: '',
				Title: '',
				BodyObj: {
					Body: 'Nothing to see here @brootle 😉',
					ImageURLs: [],
					Images: []
				},
				RepostedPostHashHex: '',
				PostExtraData: {},
				Sub: '',
				IsHidden: false,
				MinFeeRateNanosPerKB: 1000,
				InTutorial: false
			};
			
			resolve(_submittable);
		} catch (error) {
			reject(error);
		}

	

		
	})
}