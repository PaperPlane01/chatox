import React, {forwardRef, MouseEvent} from "react";
import {observer} from "mobx-react";
import {BetterMentionComponentProps} from "lexical-better-mentions";
import {MentionData} from "../types";
import {useRouter} from "../../store";
import {Routes} from "../../router";

const _Mention = forwardRef<
	HTMLDivElement,
	BetterMentionComponentProps<MentionData>
>(({ trigger, value, data, children, ...other }, ref) => {
	const router = useRouter();

	if (!data) {
		return null;
	}

	const handleClick = (event: MouseEvent<HTMLAnchorElement>): void => {
		event.preventDefault();

		router.goTo(
			Routes.userPage,
			{slug: data.slug}
		);
	}

	return (
		<a href={`/users/${data.slug}`}
		   onClick={handleClick}
		   {...other}
		>
			@{value}
		</a>
	);
});

export const Mention = observer(_Mention);
