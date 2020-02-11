import React from "react";
import { Link } from "react-router-dom";
import { Menu } from 'semantic-ui-react';

export default class MenuComponent extends React.Component {
	render() {
		return (
			<div>
				<Menu stackable>
					<Menu.Item>
						<img alt="Logo" src='https://react.semantic-ui.com/logo.png' />
					</Menu.Item>
					<Menu.Item as={Link} to="/">
                        HTML TO JUNIT TEST
					</Menu.Item>
					<Menu.Item as={Link} to="/generate-controller">
                        CONTROLLER GENERATOR
					</Menu.Item>
					<Menu.Item as={Link} to="/generate-service">
                        SERVICE GENERATOR
					</Menu.Item>
					<Menu.Item as={Link} to="/generate-mys-pages">
                        MYS PAGES GENERATOR
					</Menu.Item>
					<Menu.Item as={Link} to="/settings">
                        SETTINGS
					</Menu.Item>
				</Menu>
			</div>
		);
	}
}

