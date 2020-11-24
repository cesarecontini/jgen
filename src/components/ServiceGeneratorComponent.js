import React from "react";
import {
    Form,
    Grid
} from 'semantic-ui-react';

import CopyToClipboardComponent from './CopyToClipboardComponent';
import HeaderComponent from './HeaderComponent';
import generationService from '../services/ClassGeneratorService';
import DbService from '../services/DbService';

async function getSettings () {
	let basePackage = await new DbService().getSetting('basePackage');
    let servicesPackageName = await new DbService().getSetting('servicesPackageName');
    
	return {
        basePackage,
        servicesPackageName
    };
}

export default class ServiceGeneratorComponent extends React.Component {
    state = {
		basePackage: 'my.package',
		serviceName: 'MyService',
		constants: `String MY_CONSTANT = "a constant"`,
		autowiredServices: `JpaRepository jpaRepository`,
		serviceMethods: `public void doSomething\npublic void doSomethingElse\npublic String getFirstName`,

        serviceClass: null,
        serviceTestClass: null
    };

    metaDataKey = 'ServiceGenerator';
    dbService = new DbService();

    constructor() {
        super();
        
        getSettings().then(bp => this.setState(bp))
        this.dbService.getMetadata(this.metaDataKey)
            .then(md => {
                if(md) {
                    this.setState(md.values);
                }
            });

    }

    handleChange = (e, { name, value }) => this.setState({ [name]: value });

    handleSubmit = () => {
        const { basePackage, serviceName, servicesPackageName, constants, autowiredServices, serviceMethods } = this.state;
        const serviceClass = generationService.generateServiceClass({
			basePackage,
            serviceName,
            servicesPackageName,
			constants,
			autowiredServices,
			serviceMethods
        });
        
        const serviceTestClass = generationService.generateServiceTestClass({
			basePackage,
            serviceName,
            servicesPackageName,
			constants,
			autowiredServices,
			serviceMethods
		});
        
        this.setState({
            serviceClass: serviceClass,
            serviceTestClass: serviceTestClass
        })

        this.dbService.saveMetadata(this.metaDataKey, {basePackage, serviceName, servicesPackageName, constants, autowiredServices, serviceMethods});
    }

    render() {

        const { 
			serviceName, 
			constants, 
			autowiredServices,
			serviceMethods, 
            serviceClass,
            serviceTestClass
         } = this.state;

        return (
            <div>
                <Grid columns={1} padded>
                    <Grid.Column>
                        <HeaderComponent title='SERVICE GENERATOR'
                            subTitle='Generate a Spring Boot Service and its Junit test class.' />
                    </Grid.Column>
                </Grid>
                <Grid columns={2} padded>
                    <Grid.Column>
                        <Form
                            size="large"
                            onSubmit={this.handleSubmit}>

							<Form.Input
                                label='Service Name'
                                placeholder='Service Name'
                                name='serviceName'
                                value={serviceName}
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
                                label="Service Methods"
								placeholder='Service Methods'
								
                                name='serviceMethods'
                                rows='3'
                                value={serviceMethods}
                                onChange={this.handleChange}
                            />

							
                            <Form.Button primary content='GENERATE CLASSES' />

                        </Form>
                    </Grid.Column>

                    <Grid.Column>

                        {serviceClass &&
                            <div>
                                <CopyToClipboardComponent 
                                    title='SERVICE CLASS' 
                                    textToCopy={serviceClass} />

                                <CopyToClipboardComponent 
                                    title='SERVICE TEST CLASS' 
                                    textToCopy={serviceTestClass} />
                            </div>
                            
                        }
                    </Grid.Column>
                </Grid>
            </div>

        );
    }
}
