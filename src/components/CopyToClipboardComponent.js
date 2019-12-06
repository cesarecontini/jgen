import React from 'react';
import PropTypes from 'prop-types';

import {
	Form
} from 'semantic-ui-react';
import { CopyToClipboard } from 'react-copy-to-clipboard';

export default class CopyToClipboardComponent extends React.Component {

	state = {
		copied: false
	};

	render() {

		let { textToCopy, title } = this.props;
		let { copied } = this.state; 
		const textLength = textToCopy.split('\n').length;

		return (

			<div>

				<Form size="large">
					<Form.TextArea
						label={title}
						placeholder={title}
						name='textToCopy'
						rows={textLength < 15 ? textLength : 15}
						
						value={textToCopy}
					/>

					<CopyToClipboard text={textToCopy}
						onCopy={() => this.setState({ copied: true })}>
						<Form.Button
							toggle
							icon={!copied ? null : 'copy'}
							active={copied}
							content={!copied ? 'COPY TO CLIPBOARD' : 'COPIED!'} />
					</CopyToClipboard>

				</Form>
				<br />
			</div>
		);
	}
}

CopyToClipboardComponent.propTypes = {
	title: PropTypes.string,
	textToCopy: PropTypes.string
}
