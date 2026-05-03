import {type JSX, type SVGProps} from "react";

export default function ClockIcon (props: SVGProps<SVGSVGElement>): JSX.Element {

    return (
        <svg
            {...props}
            xmlns="http://w3.org"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none" stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            color={props.color}
        >
            <circle
                cx="12"
                cy="12"
                r="10"
                color={props.color}
            ></circle>
            <polyline
                color={props.color}
                points="12 6 12 12 16 14"
            ></polyline>
        </svg>
    );
}