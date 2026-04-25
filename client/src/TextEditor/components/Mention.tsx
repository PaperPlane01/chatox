import React, {FunctionComponent, MouseEvent} from "react";
import {observer} from "mobx-react";
import {BeautifulMentionComponentProps} from "lexical-beautiful-mentions";
import {MentionData} from "../types";
import {useRouter} from "../../store";
import {Routes} from "../../router";

export const Mention: FunctionComponent<BeautifulMentionComponentProps<MentionData>> = observer(({
	trigger,
	value,
	data,
	children,
	...other
}) => {
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
