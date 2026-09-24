import Icons from "./icons.svg";

type Props = {
    width?: number;
    height?: number;
    size?: number;
    className?: string;
    color?: string;
    iconId: string;
};

export function Svg({ size, width, height, iconId, className, color }: Props) {
    return (
        <svg
            className={className}
            style={color ? { color } : undefined}

            width={size || width}
            height={size || height}
        >
            <use href={`${Icons.src}#${iconId}`}></use>
        </svg>
    );
}
