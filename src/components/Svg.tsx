import Icons from "./icons.svg";

type Props = {
    width?: number;
    height?: number;
    size?: number;
    className?: string;
    iconId: string;
};

export function Svg({ size, width, height, iconId, className }: Props) {
    return (
        <svg
            className={className}
            width={size || width}
            height={size || height}
        >
            <use href={`${Icons.src}#${iconId}`}></use>
        </svg>
    );
}
