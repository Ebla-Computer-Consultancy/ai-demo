const english_regex = /^[a-zA-Z0-9?><;,{}[\]\-_+=!@#$%\^&*|']*$/;
export function isRTL(str: string) {
    return /[\u0600-\u06FF]+/.test(str);
}
export const formateString = (text: string) => {
    text.split(' ')
        .map((word) => (isRTL(word) ? '\u202A' : '\u202C') + word)
        .join(' ');

    return text;
};
