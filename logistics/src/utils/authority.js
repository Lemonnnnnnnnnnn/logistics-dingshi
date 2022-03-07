export function getAuthority (key = 'ejd_antd-pro-authority') {
  const authorityString = localStorage.getItem(key);
  let authority;
  try {
    authority = JSON.parse(authorityString);
  } catch (e) {
    authority = authorityString;
  }
  if (typeof authority === 'string') {
    return [authority];
  }
  return authority || ['admin'];
}

export function setAuthority (authority) {
  const proAuthority = typeof authority === 'string' ? [authority] : authority;
  return localStorage.setItem('ejd_antd-pro-authority', JSON.stringify(proAuthority));
}
