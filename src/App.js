import React from 'react';
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { Grid } from 'semantic-ui-react';

import MenuComponent from './components/MenuComponent';
import HtmlToJUnitComponent from './components/HtmlToJUnitComponent';
import ControllerGeneratorComponent from './components/ControllerGeneratorComponent';
import ServiceGeneratorComponent from './components/ServiceGeneratorComponent';
import SettingsComponent from './components/SettingsComponent';

import DbService from './services/DbService';

function App() {

	new DbService();
	
	return (
		<Router>
			<div>
				<MenuComponent />
				
				<Grid columns={1} padded>
					<Grid.Column>
						<Switch>
							<Route exact path='/'>
								<HtmlToJUnitComponent />
							</Route>
							<Route path='/generate-controller'>
								<ControllerGeneratorComponent />
							</Route>
							<Route path='/generate-service'>
								<ServiceGeneratorComponent />
							</Route>
							<Route path='/settings'>
								<SettingsComponent />
							</Route>
						</Switch>
					</Grid.Column>
				</Grid>

			</div>
		</Router>
	);
}

export default App;
