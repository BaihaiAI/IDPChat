export function getTimeHMD(time) {
    let hTitle = '';
    let mTitle = '';
    let sTitle = '';
    let h = parseInt(time / 60 / 60 % 24);
    h = h < 10 ? '0' + h : h;
    let m = parseInt(time / 60 % 60);
    m = m < 10 ? '0' + m : m;
    let s = parseInt(time % 60);
    s = s < 10 ? '0' + s : s;
    // 作为返回值返回
    if (h != 0) hTitle = `${h}小时`;
    if (m != 0) mTitle = `${m}分`;
    if (s != 0) sTitle = `${s}秒`;
    if (h == 0 && m == 0 && s == 0) return 0;
    return hTitle + mTitle + sTitle;
}