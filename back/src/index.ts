import {onCall} from 'firebase-functions/v2/https';

exports.helloWorld = onCall({region: 'us-central1'}, () => {
    return 'hello world'
});
