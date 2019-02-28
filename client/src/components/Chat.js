import axios from 'axios';
import React, { useEffect, useState, useReducer } from 'react';
import { Redirect } from 'react-router-dom';
import styled from 'styled-components';
import Main from './Main';
import Sidebar from './Sidebar';
import Loading from './Loading';
import { getCurrentUser } from '../utils/auth';
import socket from '../utils/socket';

const StyledChat = styled.div`
  display: flex;
  height: 100vh;
`;

function Chat() {
  const [currentChannel, setCurrentChannel] = useState('general');
  const [users, setUsers] = useState(null);
  const [channels, dispatch] = useReducer((channels, action) => {
    switch (action.type) {
      case 'ADD_CHANNEL':
        return { ...channels, [action.channelName]: action.channel };
      case 'ADD_MESSAGE': {
        const { channel, message } = action.data;
        const oldMessages = channels[channel].messages || [];
        const updatedMessages = [...oldMessages, message];
        return { ...channels, [channel]: { ...channels[channel], messages: updatedMessages } };
      }
      default:
        return channels;
    }
  }, null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(false);
    try {
      const channelsPromise = axios.get('/api/channels');
      const usersPromise = axios.get('/api/users');

      const [channelsResponse, usersResponse] = await axios.all([channelsPromise, usersPromise]);

      const channels = channelsResponse.data;
      const users = usersResponse.data.filter((user) => user.username !== getCurrentUser().data.username);
      setUsers(users);
      channels.forEach((channel) => dispatch({ type: 'ADD_CHANNEL', channelName: channel.name, channel }));
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    socket.on('send message', (data) => {
      dispatch({ type: 'ADD_MESSAGE', data });
    });
  }, []);

  if (!getCurrentUser()) return <Redirect to="/" />;

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <h1>error...</h1>;
  }

  return (
    <StyledChat>
      <Sidebar
        users={users}
        channels={channels}
        currentChannel={currentChannel}
        handleCurrentChannelChange={(channel) => setCurrentChannel(channel)}
        handleAddChannel={(channel) => dispatch({ type: 'ADD_CHANNEL', channelName: channel.name, channel })}
      />
      <Main messages={channels[currentChannel].messages || []} currentChannel={channels[currentChannel]} />
    </StyledChat>
  );
}

export default Chat;
