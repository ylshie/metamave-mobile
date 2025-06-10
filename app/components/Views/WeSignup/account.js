const bypass = false
const base = 'https://arwaexchange.com/api'

//let formdata = new FormData();

//formdata.append("product[name]", 'test')
//formdata.append("product[price]", 10)
//formdata.append("product[category_ids][]", 2)

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
  console.log("wzInfo:", data)
  return data
}

export async function wzLogin(email, pass) {
  if (bypass) return {ret: true}
  
  const xxx = `grant_type=password&username=${email}&password=${pass}`
  try {
    console.log("==== [wzLogin] >>:", encodedData, formdata, )
    const ret = await fetch(base + '/wz_token?'+encodedData,  {
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

export async function wzExist(email) {
    if (bypass) return {ret: true}
    
    const ret = await fetch(base + '/wz_exist',  {
        method: 'POST',
        body: JSON.stringify({email}),
        headers: {
          'Content-Type': 'application/json',
        },
    })
    const data = await ret.json()
    console.log("wzExist:", email, data)
    return data
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
    return data
}

export async function wzAdd(email, pass, id, invite) {
    if (bypass) return {ret: true}
    
    const ret = await fetch(base + '/wz_add',  {
        method: 'POST',
        body: JSON.stringify({email, pass, id, invite}),
        headers: {
          'Content-Type': 'application/json',
        },
    })
    const data = await ret.json()
    console.log("wzAdd:", data)
    return data
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
