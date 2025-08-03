const bypass = false
const base = 'https://wezan.arwaexchange.com/api'
import {
  GoogleSignin,
  statusCodes,
  isErrorWithCode,
} from '@react-native-google-signin/google-signin';
import StorageWrapper from '../../../store/storage-wrapper';

const idProd  = '521969317751-frn0aovmv2qposmilrfpil3s017u7595.apps.googleusercontent.com'
const idDebug = '521969317751-5dbab0ujkgs902681lo0bnaek8u56rtm.apps.googleusercontent.com'

//let formdata = new FormData();

//formdata.append("product[name]", 'test')
//formdata.append("product[price]", 10)
//formdata.append("product[category_ids][]", 2)

const webClientId = idDebug
export const configureGoogleSignIn = () => {
//console.log('client id=', webClientId)
  GoogleSignin.configure({
    webClientId,
    iosClientId: '',
    offlineAccess: true, //false,
    profileImageSize: 150,
  });
};
export const checkGoogle = async () => {
  if (! GoogleSignin.hasPreviousSignIn()) return

  const token   = await GoogleSignin.getTokens()
//const test    = GoogleSignin.getCurrentUser()
  const now     = Date.now()
  console.log("token", token)
  console.log("user",  data)
  //if (now > expire) {
  //  console.log('Google expire', 'now', now, 'expire', token, expire)
  //} else {
  //  console.log('Google ok', 'now', now, 'expire', token, expire)
  //  return
  //}
  const test  = GoogleSignin.getCurrentUser()
  const exist = await wzExist("G", test.user.email)
  console.log("onPressGoogle", "==wzExist==", exist)
  if (exist) {
    return; 
  }
  const xxx   = await GoogleSignin.signInSilently()
  const data  = GoogleSignin.getCurrentUser()

  console.log('===xxx===', xxx)
  console.log("user", data, "token", token)
  console.log("onPressGoogle", "before wzAddGcount")
  const rex = await wzAddGcount(data.user.email, data.user.id, data.idToken)
  console.log("onPressGoogle", "wzAddGcount", rex)

  const res   = await wzLogin("G:"+data.user.email, data.idToken)
  console.log("wzLogin", 'res=', res)
  StorageWrapper.setItem('accessToken', res.data.accessToken)
  StorageWrapper.setItem('refreshToken', res.data.refreshToken)
  StorageWrapper.setItem('accessTokenExpiresAt', res.data.accessTokenExpiresAt)
  StorageWrapper.setItem('refreshTokenExpiresAt', res.data.refreshTokenExpiresAt)
  StorageWrapper.setItem('type', 'google')
  StorageWrapper.setItem('account',  data.user.email)
  StorageWrapper.setItem('token', data.idToken)
  
}
export const signIn = async (callback) => {
  try {
    await GoogleSignin.hasPlayServices();
    const { type, data } = await GoogleSignin.signIn();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (type === 'success') {
      console.log('\n=============================\n',{ data }, '\n======================\n')
      //this.setState({ userInfo: data, error: undefined });
      //Alert.alert('ok: name='+data.user.name+' email='+data.user.email+' id='+data.user.id);
      callback();
    } else {
      // sign in was cancelled by user
      setTimeout(() => {
        Alert.alert('cancelled: id='+webClientId);
      }, 500);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error) {
    Alert.alert('exception:' + error.message+' id='+webClientId);
    console.log('signin error', error)
    /*
    if (isErrorWithCode(error)) {
      console.log('Arthur', 'error', error.message, error);
      switch (error.code) {
        case statusCodes.IN_PROGRESS:
          // operation (eg. sign in) already in progress
          //Alert.alert(
          //  'in progress',
          //  'operation (eg. sign in) already in progress',
          //);
          break;
        case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
          // android only
          //Alert.alert('play services not available or outdated');
          break;
        default:
          //Alert.alert('Something went wrong: ', error.toString());
      }
      //this.setState({ error });
    } else {
      alert(`an error that's not related to google sign in occurred`);
    }
    */
  }
};

export async function wzLogin0(email, pass) {
    if (bypass) return {ret: true}
    
    const ret = await fetch(base + '/wz_verify',  {
        method: 'POST',
        body: JSON.stringify({email, pass}),
        headers: {
          'Content-Type': 'application/json',
        },
    })
    const data = await ret.json()
    console.log("wzLogin:", data)
    return data
}

export async function wzInfo(token, email) {
  if (bypass) return {ret: true}
  
  const ret = await fetch(base + '/wz_info',  {
      method: 'POST',
      body: JSON.stringify({email}),
      headers: {
        'Authorization': `Bearer ${token}`, 
        'Content-Type': 'application/json',
      },
  })
  const data = await ret.json()
//console.log("wzInfo:", data)
  return data
}

async function wzFetch(method, token, body) {
  const ret = await fetch(base + method,  {
                        method: 'POST',
                        body: JSON.stringify(body),
                        headers: {
                          'Authorization': `Bearer ${token}`, 
                          'Content-Type': 'application/json',
                        },
                    })
  return await ret.json()
}
export async function wzPoint(token, target, value) {
  if (bypass) return {ret: true}
  
  console.log("wzPoint called:", token, target, value)
  try {
    const ret = await fetch(base + '/wz_point',  {
        method: 'POST',
        body: JSON.stringify({target, value}),
        headers: {
          'Authorization': `Bearer ${token}`, 
          'Content-Type': 'application/json',
        },
    })
    const data = await ret.json()
    console.log("wzPoint ok:", ret.status, data)
    return data
  } catch (error) {
    console.log("wzPoint fail:", error)
    return {ok: false};
  }
}

export async function wzCoin(token, source, value) {
  if (bypass) return {ret: true}
  
  try {
    const ret = await fetch(base + '/wz_arena',  {
        method: 'POST',
        body: JSON.stringify({source, value}),
        headers: {
          'Authorization': `Bearer ${token}`, 
          'Content-Type': 'application/json',
        },
    })
    const data = await ret.json()
    console.log("wzCoin ok:", ret.status, data)
    return data
  } catch (error) {
    console.log("wzCoin fail:", error)
    return {ok: false};
  }
}

export async function wzLogin(email, pass) {
  if (bypass) return {ret: true}
  
  const xxx = `grant_type=password&username=${email}&password=${pass}`
  try {
    const ret = await fetch(base + '/wz_token?',  {
        method: 'POST',
      //body: "grant_type=password&username=yuliang.hsieh@gmail.com&password=12345678",
        body: xxx,
        headers: {
          'Authorization': 'Basic YXBwbGljYXRpb246c2VjcmV0',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
    })
    console.log("==== [wzLogin] ==:")
    const data = await ret.json()
    console.log("==== [wzLogin]:", data)
    if (data.code) {
      return {ok: false, error: data}
    } else {
      return {ok: true, data}
    }
  } catch (error) {
    return {ok: false, error: error}
  }
}

export async function wzRefresh(token) {
  if (bypass) return {ret: true}
  
  const xxx = `grant_type=refresh_token&refresh_token=${token}`
  try {
    console.log("==== [wzRefresh] >>:", xxx)
    const ret = await fetch(base + '/wz_token',  {
        method: 'POST',
        body: xxx,
        headers: {
          'Authorization': 'Basic YXBwbGljYXRpb246c2VjcmV0',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
    })
    console.log("==== [wzLogin] ==:")
    const data = await ret.json()
    console.log("==== [wzLogin]:", data)
    if (data.code) {
      return {ok: false, error: data}
    } else {
      return {ok: true, data}
    }
  } catch (error) {
    return {ok: false, error: error}
  }
}

export async function wzExist(type, email) {
    if (bypass) return {ret: true}
    
    const ret = await fetch(base + '/wz_exist',  {
        method: 'POST',
        body: JSON.stringify({type, email}),
        headers: {
          'Content-Type': 'application/json',
        },
    })
    const data = await ret.json()
    console.log("wzExist:", type, email, data)

    return data.ret
}
 
export async function wzPass(email, pass) {
    if (bypass) return {ret: true}
    
    const ret = await fetch(base + '/wz_pass',  {
        method: 'POST',
        body: JSON.stringify({email, pass}),
        headers: {
          'Content-Type': 'application/json',
        },
    })
    const data = await ret.json()
    console.log("wzPass:", data)
    return data.ret
}

export async function wzAddAcount(email, pass, invite) {
    if (bypass) return {ret: true}
    
    const ret = await fetch(base + '/wz_add',  {
        method: 'POST',
        body: JSON.stringify({email, pass, invite}),
        headers: {
          'Content-Type': 'application/json',
        },
    })
    const data = await ret.json()
    console.log("wzAddAcount:", data)
    return data
}

export async function wzAddGcount(email, id, token) {
  if (bypass) return {ret: true}
  
  console.log("wzAddGcount called", email, id, token)
  try {
    const ret = await fetch(base + '/wz_google',  {
        method: 'POST',
        body: JSON.stringify({email, id, token}),
        headers: {
          'Content-Type': 'application/json',
        },
    })
    console.log("wzAddGcount:", 'called return')
    const data = await ret.json()
    console.log("wzAddGcount:", data)
    return data
  } catch(error) {
    console.log("wzAddGcount error", error)
    return false
  }
}

export async function wzMail(email, subject, text, html) {
  if (bypass) return {ret: true}
  
  const ret = await fetch(base + '/wz_mail',  {
      method: 'POST',
      body: JSON.stringify({email, subject, text, html}),
      headers: {
        'Content-Type': 'application/json',
      },
  })
  const data = await ret.json()
  console.log("wzMail:", data)
  return data
}

export async function wzAddStake(token, period, amount) {
  if (bypass) return {ret: true}
  
  console.log("wzAddStake called:", token, period, amount)
  try {
    const ret = await fetch(base + '/wz_stake_add',  {
        method: 'POST',
        body: JSON.stringify({period: "0", amount}),
        headers: {
          'Authorization': `Bearer ${token}`, 
          'Content-Type': 'application/json',
        },
    })
    const data = await ret.json()
    console.log("wzAddStake ok:", ret.status, data)
    return data
  } catch (error) {
    console.log("wzAddStake fail:", error)
    return {ok: false};
  }
}

export async function wzListStake(token) {
  if (bypass) return {ret: true}
  
  console.log("wzListStake called:", token)
  try {
    const ret = await fetch(base + '/wz_stake_list',  {
        method: 'POST',
        body: JSON.stringify({}),
        headers: {
          'Authorization': `Bearer ${token}`, 
          'Content-Type': 'application/json',
        },
    })
    const data = await ret.json()
    console.log("wzListStake ok:", ret.status, data)
    return data
  } catch (error) {
    console.log("wzListStake fail:", error)
    return {ok: false};
  }
}

export async function wzRemoveStake(token, sid, value) {
  if (bypass) return {ret: true}
  
  console.log("wzAddStake called:", token, sid, value)
  try {
    const ret = await fetch(base + '/wz_stake_remove',  {
        method: 'POST',
        body: JSON.stringify({sid, value}),
        headers: {
          'Authorization': `Bearer ${token}`, 
          'Content-Type': 'application/json',
        },
    })
    const data = await ret.json()
    console.log("wzAddStake ok:", ret.status, data)
    return data
  } catch (error) {
    console.log("wzAddStake fail:", error)
    return {ok: false};
  }
}
