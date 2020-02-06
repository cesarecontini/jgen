import React from "react";
import {
    Form,
    Grid
} from 'semantic-ui-react';

import CopyToClipboardComponent from './CopyToClipboardComponent';
import HeaderComponent from './HeaderComponent';
import junitService from '../services/JunitService';

export default class HtmlToJUnitComponent extends React.Component {
    state = {
        path: '/some-path',
        html: `<ul id="fruits">
                    <li id="apple">Apple</li>
                    <li id="orange">Orange</li>
                    <li id="pear">Pear</li>
                </ul>`,
        junitTest: ''
    };

    handleChange = (e, { name, value }) => this.setState({ [name]: value });

    handleSubmit = () => {
        const { path, html } = this.state;
        const junitTest = junitService(path, html);
        console.log('junitTest', junitTest);
        this.setState({
            junitTest: junitTest
        })
    }

    render() {

        const { path, html, junitTest } = this.state

        return (
            <div>
                <Grid columns={1} padded>
                    <Grid.Column>
                        <HeaderComponent title='HTML to JUNIT TEST'
                            subTitle='Enter the URL path you want to run your JUnit test on and the HTML to evaluate.' />
                    </Grid.Column>
                </Grid>
                <Grid columns={2} padded>
                    <Grid.Column>
                        <Form
                            size="large"
                            onSubmit={this.handleSubmit}>

                            <Form.Input
                                label="Path"
                                placeholder='Path'
                                name='path'
                                value={path}
                                onChange={this.handleChange}
                            />
                            <Form.TextArea
                                label="HTML"
                                placeholder='Html'
                                name='html'
                                rows='15'
                                value={html}
                                onChange={this.handleChange}
                            />
                            <Form.Button primary content='GENERATE JUNIT TEST' />

                        </Form>
                    </Grid.Column>

                    <Grid.Column>

                        {junitTest &&
                            <CopyToClipboardComponent
                                title='GENERATED TEST'
                                textToCopy={junitTest} />
                        }
                    </Grid.Column>
                </Grid>
            </div>

        );
    }
}
