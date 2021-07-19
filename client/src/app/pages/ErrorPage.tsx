import React from "react";
import { Link } from "react-router-dom";

export function ErrorPage({
	statusCode,
	customMessage,
}: {
	statusCode: number;
	customMessage?: string;
}) {
	let message;

	if (!customMessage) {
		switch (statusCode) {
			case 400:
				message = "The server refused this request.";
				break;
			case 401:
				message = "Looks like you're not authorised. Try logging in.";
				break;
			case 403:
				message = "Looks like you're not allowed to be here.";
				break;
			case 404:
				message = "This page does not exist. If you think it should exist, let us know!";
				break;
			case 500:
				message = "Looks like the server has failed. This has been reported!";
				break;
			default:
				message = "An unexpected error has occured. This has been reported!";
				break;
		}
	} else {
		message = customMessage;
	}

	return (
		<div className="fullscreen">
			<div className="d-flex flex-column flex-root">
				<div className="d-flex flex-row-fluid flex-column bgi-size-cover bgi-position-center bgi-no-repeat p-10 p-sm-30">
					<h1
						className="font-size-sm-100 font-weight-boldest mt-15"
						style={{ fontSize: "150px" }}
					>
						{statusCode}
					</h1>
					<p className="font-size-h3 font-weight-light">{message}</p>
					<p>
						<Link to="/">Go Home.</Link>
					</p>
				</div>
			</div>
		</div>
	);
}
