import React from "react";
import { Link } from "react-router-dom";
import { Menu } from 'semantic-ui-react';

export default class MenuComponent extends React.Component {
    render() {
      return (
        <div>
          <Menu stackable>
            <Menu.Item>
              <img alt="Logo" src='https://react.semantic-ui.com/logo.png' />
            </Menu.Item>
            <Menu.Item as={Link} to="/">
              HTML TO JUNIT TEST
            </Menu.Item>
            <Menu.Item as={Link} to="/about">
              CLASS GENERATOR
            </Menu.Item>
          

          </Menu>
          
        </div>
      );
    }
}

