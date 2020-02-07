import React from "react";
import {
    Form,
    Grid,
    Modal
} from 'semantic-ui-react';

import HeaderComponent from './HeaderComponent';
import DbService from '../services/DbService';

export default class HtmlToJUnitComponent extends React.Component {
    state = {
        settings: [],
        isSaved: false
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
        this.setState({
            isSaved: true
        })


    }

    render() {

        const { settings } = this.state

        return (
            <div>
                <Grid columns={1} padded>
                    <Grid.Column>
                        <HeaderComponent title='SYSTEM SETTINGS'
                            subTitle='Manage base package settings'
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
                            
                            <Modal
                                trigger={<Form.Button primary content='SAVE SETTINGS' />}
                                header='SETTINGS SAVED'
                                content='Settings have been saved successfully!'
                                actions={[{ key: 'done', content: 'CLOSE', positive: true }]}
                            />
                            
                            
                        </Form>
                    </Grid.Column>

                </Grid>
            </div>

        );
    }
}
