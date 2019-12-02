import React from "react";
import {
    Form,
    Grid
} from 'semantic-ui-react';

import CopyToClipboardComponent from './CopyToClipboardComponent';
import HeaderComponent from './HeaderComponent';
import generationService from '../services/ClassGeneratorService';

export default class ControllerGeneratorComponent extends React.Component {
    state = {
		basePackage: 'my.package',
		controllerName: 'MyController',
		constants: `String MY_CONSTANT = "template"`,
		autowiredServices: `MyControllerService myControllerService`,
		endpoints: `GET /some-path getSomePathPage template-view\nGET /another-path getAnotherPathPage another-template-view`,

        controllerClass: null,
        controllerTestClass: null
    };

    handleChange = (e, { name, value }) => this.setState({ [name]: value });

    handleSubmit = () => {
        const { basePackage, controllerName, constants, autowiredServices, endpoints } = this.state;
        const controllerClass = generationService.generateControllerClass({
			basePackage,
			controllerName,
			constants,
			autowiredServices,
			endpoints
        });
        
        const controllerTestClass = generationService.generateControllerTestClass({
			basePackage,
			controllerName,
			constants,
			autowiredServices,
			endpoints
		});
        console.log('controllerClass', constants, controllerClass);
        this.setState({
            controllerClass: controllerClass,
            controllerTestClass: controllerTestClass
        })
    }

    render() {

        const { 
			basePackage, 
			controllerName, 
			constants, 
			autowiredServices,
			endpoints, 
            controllerClass,
            controllerTestClass
         } = this.state

        return (
            <div>
                <Grid columns={1} padded>
                    <Grid.Column>
                        <HeaderComponent title='CONTROLLER GENERATOR'
                            subTitle='Generate a Spring Controller and optionally its service and test classes.' />
                    </Grid.Column>
                </Grid>
                <Grid columns={2} padded>
                    <Grid.Column>
                        <Form
                            size="large"
                            onSubmit={this.handleSubmit}>

                            <Form.Input
								label='Base Package'
                                placeholder='Base Package'
                                name='basePackage'
                                value={basePackage}
                                onChange={this.handleChange}
                            />
							<Form.Input
                                label='Controller Name'
                                placeholder='Controller Name'
                                name='controllerName'
                                value={controllerName}
                                onChange={this.handleChange}
                            />
                            <Form.TextArea
                                label="Constants"
								placeholder='Constants'
								
                                name='constants'
                                rows='3'
                                value={constants}
                                onChange={this.handleChange}
                            />
							<Form.TextArea
                                label="Autowired Services"
								placeholder='Autowired Services'
								
                                name='autowiredServices'
                                rows='3'
                                value={autowiredServices}
                                onChange={this.handleChange}
                            />
							<Form.TextArea
                                label="Endpoints"
								placeholder='Endpoints'
								
                                name='endpoints'
                                rows='3'
                                value={endpoints}
                                onChange={this.handleChange}
                            />

							
                            <Form.Button primary content='GENERATE CLASSES' />

                        </Form>
                    </Grid.Column>

                    <Grid.Column>

                        {controllerClass &&
                            <div>
                                <CopyToClipboardComponent 
                                    title='CONTROLLER CLASS' 
                                    textToCopy={controllerClass} />

                                <CopyToClipboardComponent 
                                    title='CONTROLLER TEST CLASS' 
                                    textToCopy={controllerTestClass} />
                            </div>
                            
                        }
                    </Grid.Column>
                </Grid>
            </div>

        );
    }
}
