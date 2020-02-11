import React from "react";
import {
    Form,
    Grid
} from 'semantic-ui-react';

import CopyToClipboardComponent from './CopyToClipboardComponent';
import HeaderComponent from './HeaderComponent';
import MysGeneratorService from '../services/MysGeneratorService';
import DbService from '../services/DbService';

import AceEditor from "react-ace";

import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/theme-github";

async function getSettings () {
	let basePackage = await new DbService().getSetting('basePackage');
    let controllersPackageName = await new DbService().getSetting('controllersPackageName');
    let formsPackageName = await new DbService().getSetting('formsPackageName');
    
    console.log(controllersPackageName, formsPackageName)

	return {
        basePackage,
        controllersPackageName,
        formsPackageName
    };
}

export default class MysGeneratorComponent extends React.Component {
    state = {
        options: null,
        stringVal: `{
            "journeyPrefix": "MyAudit",
            "baseUrl": "/{dispCode}/base",
            "pages" : [
                {
                    "url": "/page1",
                    "action": "/page1",
                    "title": "Your details",
                    "subTitle": "Please enter your details",
                    "fields": [
                        {
                            "name": "firstName",
                            "label": "First name",
                            "hint": "Hint",
                            "type": "text",
                            "optionIds": [],
                            "optionValues": [],
                            "dataTargets": [],
                            "maxLength": 255,
                            "min": 0,
                            "max": 255,
                            "radioOrCheckboxInline": false,
                            "displayMode": "full_column",
                            "isDataTargetSource": false,
                            "htmlChunkBeforeFieldTemplateName": "",
                            "htmlChunkBeforeFieldFragmentName": "",
                            "validations": ["@NotNull"]
                        },
                        {
                            "name": "lastName",
                            "label": "Last name"
                        }  
                    ]
                },
                {
                    "url": "/page2",
                    "action": "/page2",
                    "title": "Address",
                    "subTitle": "Enter your address",
                    "fields": [
                        {
                            "name": "addressLine1",
                            "label": "Address line 1"
                        }  
                    ]
                }

            ]
            }`
    };

    constructor() {
        super();
        
        getSettings().then(bp => this.setState(bp))

    }

    handleChange = (v) => {
        this.setState({
            options: JSON.parse(v),
            stringVal: v
        })
    };

    handleSubmit = () => {
        const { basePackage, controllersPackageName, formsPackageName } = this.state;

        const v = this.refs.aceEditor.editor.getValue();
        const stringVal = v;
        let options = {};
        console.log('basePackage, controllersPackageName, formsPackageName', basePackage, controllersPackageName, formsPackageName)
        try {
            options = Object.assign(JSON.parse(v), {basePackage, controllersPackageName, formsPackageName}) 
        } catch (E) {
            console.log('E', E)
            options = {};
        }
        this.setState({options, stringVal})
    }

    render() {

        return (
            <div>
                <Grid columns={1} padded>
                    <Grid.Column>
                        <HeaderComponent title='MYS PAGES GENERATOR'
                            subTitle='Generate constant, controller, form classes from configuration JSON.' />
                    </Grid.Column>
                </Grid>
                <Grid columns={2} padded>
                    <Grid.Column>
                        <Form
                            size="large"
                            onSubmit={this.handleSubmit}>

                            <AceEditor
                                mode="json"
                                theme="github"
                                name="UNIQUE_ID_OF_DIV"
                                ref="aceEditor"
                                value={this.state.stringVal}
                                    editorProps={{ $blockScrolling: true }}
                            />

							
                            <Form.Button primary content='GENERATE CLASSES' />

                        </Form>
                    </Grid.Column>

                    <Grid.Column>

                        {this.state.options &&
                            
                           

                            <div>
                                <CopyToClipboardComponent 
                                    title='CONSTANTS CLASS' 
                                    textToCopy={MysGeneratorService.generateConstantClass(this.state.options)} />

                                <CopyToClipboardComponent 
                                    title='PAGE UTILS CLASS' 
                                    textToCopy={MysGeneratorService.generatePageUtils(this.state.options)} />
                            
                                {MysGeneratorService.generateAnnotatedForms(this.state.options).map((f,i)=> {
                                    return <CopyToClipboardComponent
                                        key={i}    
                                        title={`ANNOTATED FORM: ${f.formName}`}
                                        textToCopy={f.code} />
                                })}


                                <CopyToClipboardComponent 
                                    title='CONTROLLER CLASS' 
                                    textToCopy={MysGeneratorService.generateMysControllerPage(this.state.options)} />
                            </div>
                            
                        }
                    </Grid.Column>
                </Grid>
            </div>

        );
    }
}
