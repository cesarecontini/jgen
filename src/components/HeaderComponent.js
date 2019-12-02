import React from 'react';
import PropTypes from 'prop-types';
import { Header } from 'semantic-ui-react';

export default class HeaderComponent extends React.Component {
	render() {
		
		const {title, subTitle, icon} = this.props;

		return (
			<div>
				<Header as='h1' 
					icon={icon ? icon : 'code'}
					content={title}
					subheader={subTitle}></Header>
			</div>
		);
	}
}

HeaderComponent.propTypes = {
	title: PropTypes.string,
	subTitle: PropTypes.string,
	icon: PropTypes.string
}
