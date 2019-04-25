/**
 * 是否是null或者undefined
 *
 * @param {} v 参数
 *
 * @return {boolean}
 */
export function isUndef(v: any): v is (null | undefined) {
    return v === null || v === undefined;
}

/**
 * 加载图片
 */
export function loadImage(src: string, anonymous?: boolean) {
    return new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image();
        if (anonymous) {
            image.setAttribute('crossOrigin', 'anonymous');
        }
        image.onload = () => {
            resolve(image);
        };
        image.onerror = (e) => {
            reject(e);
        };
        image.src = src;
    });
}