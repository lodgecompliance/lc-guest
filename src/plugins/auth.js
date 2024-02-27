import { auth } from '../firebase';

export default () => {
    //console.log(auth.currentUser);
    return new Promise(resolve => {
        //console.log("waiting for auth change...")
        auth.onAuthStateChanged(user => {
            //console.log("Auth changed--->", user);
            resolve(user);
        });
    })
};