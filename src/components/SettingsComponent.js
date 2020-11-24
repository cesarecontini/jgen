import React from "react";
import {
    Form,
    Grid
} from 'semantic-ui-react';

import HeaderComponent from './HeaderComponent';
import DbService from '../services/DbService';

export default class SettingsComponent extends React.Component {
    state = {
        settings: []
    };

    dbService = new DbService();

    constructor() {
        super();
        this.dbService.getSettings().then(settings => {
            settings.forEach(s => {
                this.setState({[s.propertyName] : s.value});
            });
            this.setState({
                settings
            });
        });
        
    }

    handleChange = (e, { name, value }) => {
        this.setState({ [name]: value })
    };

    handleSubmit = () => {
        let settingsTmp = this.state.settings;
        settingsTmp.forEach(s => {
            s.value = this.state[s.propertyName];
        });

        this.dbService.setSettings(settingsTmp);


    }

    render() {

        const { settings } = this.state

        return (
            <div>
                <Grid columns={1} padded>
                    <Grid.Column>
                        <HeaderComponent title='SYSTEM SETTINGS'
                            subTitle='Apply settings as requested'
                            icon='settings' />
                    </Grid.Column>
                </Grid>
                <Grid columns={1} padded>
                    <Grid.Column>
                        <Form
                            size="large"
                            onSubmit={this.handleSubmit}>

                            {settings.map((s, i) => <Form.Input
                                key={i}
                                label={s.name}
                                placeholder={s.name}
                                name={s.propertyName}
                                id={s.id}
                                value={this.state[s.propertyName]}
                                onChange={this.handleChange}
                            />
                                
                            )}
                            
                            
                            <Form.Button primary content='SAVE SETTINGS' />

                        </Form>
                    </Grid.Column>

                </Grid>
            </div>

        );
    }
}
