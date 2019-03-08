import React from 'react';
import { Link, Route } from 'react-router-dom';
import { Dropdown, Image, Icon } from 'semantic-ui-react';
import styled from 'styled-components';
import { ListItem, List } from './styles/List';
import { getCurrentUser } from '../utils/auth';
import AddChannel from './AddChannel';

const ChannelsList = styled.div`
  margin: 15px 0;
  h3 {
    margin-bottom: 7px;
  }
`;

const trigger = (
  <span>
    <Image avatar src={getCurrentUser() && getCurrentUser().gravatar} />
    {getCurrentUser() && getCurrentUser().username}
  </span>
);

const options = [
  { key: 'user', text: 'Account', icon: 'user' },
  // { key: 'settings', text: 'Settings', icon: 'settings' },
  {
    key: 'sign-out',
    text: 'Sign Out',
    icon: 'sign out',
    as: Link,
    to: '/signout',
  },
];

const StyledSideBar = styled.div`
  flex: 0 0 20%;
  padding: 15px;
  color: #fff;
  background-color: #2185d0;
`;

const CustomLink = ({ to, children }) => (
  <Route
    path={to}
    children={({ match }) => (
      <ListItem active={match}>
        <Link to={to}>{children}</Link>
      </ListItem>
    )}
  />
);

function Sidebar({ users, channels, handleAddChannel, match }) {
  return (
    <StyledSideBar>
      <Dropdown trigger={trigger} options={options} />
      <ChannelsList>
        <h3>Channels</h3>
        <List>
          {channels.map((channel) => (
            <CustomLink key={channel.id} to={`${match.url}/${channel.id}`}>
              <Icon name={channel.private ? 'lock' : 'hashtag'} />
              {channel.name}
            </CustomLink>
          ))}
        </List>
      </ChannelsList>
      <AddChannel users={users} handleAddChannel={handleAddChannel} />
    </StyledSideBar>
  );
}

export default Sidebar;
