import React from 'react';
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { Grid } from 'semantic-ui-react';

import MenuComponent from './components/MenuComponent';
import HtmlToJUnitComponent from './components/HtmlToJUnitComponent';

function App() {
  return (
    <Router>
      <div>
        <MenuComponent />

        <Grid columns={1} padded>
            <Grid.Column>
                <Switch>
                    <Route path="/about">
                        <About />
                    </Route>
                    <Route path="/">
                        <HtmlToJUnitComponent />
                    </Route>
                </Switch>
            </Grid.Column>
        </Grid>
        
       
      </div>
    </Router>
  );
}

function About() {
  return <h2>About</h2>;
}


export default App;
