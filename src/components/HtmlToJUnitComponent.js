import React from "react";
import {
    Form,
    Grid,
    Icon,
    Label,
    Message
} from 'semantic-ui-react';
import {CopyToClipboard} from 'react-copy-to-clipboard';

import junitService from '../services/junitService';


export default class HtmlToJUnitComponent extends React.Component {
    state = {
        path: '/some-path',
        html: '<div id="element-id">a simple DIV element</div>',
        junitTest: '',
        copied: false
    };

    handleChange = (e, {name, value}) => this.setState({[name]: value});

    handleSubmit = () => {
        const { path, html } = this.state;

        
        const junitTest = junitService(path, html);
        console.log('junitTest', junitTest);
        this.setState({
            junitTest: junitTest
        })
    }

    render() {

        const { path, html, junitTest, copied} = this.state

        return (
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
                        
                    {junitTest ?
                        <Form size="large">
                            <Form.TextArea
                                    label="GENERATED TEST"
                                    placeholder='Html'
                                    name='html'
                                    rows='15'
                                    disabled
                                    value={junitTest}
                            />
                            
                            <CopyToClipboard text={junitTest}
                                onCopy={() => this.setState({copied: true})}>
                                <Form.Button
                                    content='COPY TO CLIPBOARD' />
                            </CopyToClipboard>
                            
                            {
                            copied ?
                                <div>
                                    <br />
                                    <Label>
                                        <Icon color='red' name='copy' /> COPIED TO CLIPBOARD!
                                    </Label>
                                </div>
                            : null
                            }

                        </Form>
                        : 
                        <div>
                            <Message size='large' positive>
                                <Message.Header>GENERATE JUNIT TEST FROM HTML</Message.Header>
                                <p>
                                    Please provide a path and some valid HTML and hit the JENERATE UNIT TEST button.
                                </p>
                            </Message>
                        </div>
                    }                     
                </Grid.Column>
            </Grid>
        );
    }
}
