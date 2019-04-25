import {
    loadImage,
    isUndef,
} from './utils';

declare global {
    type Part = TextPart | ImagePart | ImageElmPart | RectPart;
    interface TextPart {
        type: 'text';
        text: string;
        x: number;
        y: number;
        /** 将自动折行 */
        width?: number;
        lineHeight?: number;
        singleLine?: boolean;
        color?: string;
        font?: string;
        textAlign?: 'left' | 'center' | 'right';
    }
    interface RectPart {
        type: 'rect';
        backgroundColor?: string;
        x: number;
        y: number;
        width: number;
        height: number;
    }
    interface ImagePart {
        type: 'image';
        url: string;
        x: number;
        y: number;
        width: number;
        height: number;
        clip?: (ctx: CanvasRenderingContext2D, self: ImagePart) => void;
    }
    interface ImageElmPart {
        type: 'imageElm';
        elm: HTMLImageElement;
        x: number;
        y: number;
        width: number;
        height: number;
        clip?: (ctx: CanvasRenderingContext2D, self: ImageElmPart) => void;
    }
}

export function circleClip(ctx: CanvasRenderingContext2D, self: ImagePart) {
    ctx.moveTo(self.x + self.width, self.y + self.height / 2);
    ctx.arc(self.x + self.width / 2, self.y + self.height / 2, self.width / 2, 0, Math.PI * 2, true);
    ctx.clip();
}

export async function drawParts(ctx: CanvasRenderingContext2D, parts: Part[]) {
    for (let i = 0, len = parts.length; i < len; i++) {
        const part = parts[i];
        // 绘制文本
        if (part.type === 'text') {
            if (part.text === '') {
                continue;
            }
            ctx.save();
            ctx.fillStyle = part.color || '#000';
            if (part.font) {
                ctx.font = part.font;
            }
            ctx.textAlign = part.textAlign || 'left';

            // 对于宽度有限制要求
            if (part.width && part.lineHeight) {
                const result = await binarySearch(ctx, part.text, part.width);

                if (!part.singleLine) {
                    for (let i = 0, len = result.length; i < len; i++) {
                        ctx.fillText(result[i], part.x, part.y + i * part.lineHeight);
                    }
                } else {
                    const str = result.length > 1 ? result[0].substr(0, result[0].length - 1) + '..' : result[0];
                    ctx.fillText(str, part.x, part.y);
                }
            } else {
                ctx.fillText(part.text, part.x, part.y);
            }
            ctx.restore();
        } else if (part.type === 'rect') {
            ctx.save();
            ctx.fillStyle = part.backgroundColor || '#000',
            ctx.fillRect(part.x, part.y, part.width, part.height);
            ctx.restore();
        }
    }

    await Promise.all((parts as Array<ImagePart | ImageElmPart>).filter((part) => (part.type === 'image' || part.type === 'imageElm'))
    .map((part) => {
        return (part.type === 'image' ? loadImage(part.url, true) : Promise.resolve(part.elm))
            .then((image) => {
                ctx.save();
                if (!isUndef(part.clip)) {
                    ctx.beginPath();
                    // @ts-ignore
                    part.clip(ctx, part);
                    ctx.closePath();
                }
                ctx.drawImage(image, part.x, part.y, part.width, part.height);
                ctx.restore();
            })
            .catch((error) => {
                console.log('target1');
            });
    }));
}

export async function binarySearch(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): Promise<string[]> {
    const result: string[] = [];

    while (text.length > 0) {
        const metrics = ctx.measureText(text);
        // 如果宽度较小
        if (metrics.width <= maxWidth) {
            result.push(text);
            break;
        }

        // 宽度较大
        const str = text;
        let left = 0;
        let right: number = str.length - 1;
        let anchor: number = Math.floor((right + left) / 2);
        let _maxWidth = maxWidth;
        while ((right - left) > 1) {
            const width = ctx.measureText(str.substring(left, anchor)).width;
            if (width > _maxWidth) {
                right = anchor;
                anchor = Math.floor((right + left) / 2);
            } else {
                left = anchor;
                anchor = Math.floor((right + left) / 2);
                _maxWidth -= width;
            }
        }

        result.push(text.substr(0, anchor));
        text = text.substr(anchor);
    }

    return result;
}
