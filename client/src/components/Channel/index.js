import React, { useState, useEffect } from 'react';
import { Placeholder } from 'semantic-ui-react';
/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import styled from '@emotion/styled';
import Messages from '../Messages';
import ChannelInfo from '../ChannelInfo';
import MessageInput from '../MessageInput';
import ChannelDetails from '../ChannelDetails';
import socket from '../../helpers/socket';
import { getChannel } from '../../API/ChannelsAPI';

function Channel({ slug, user }) {
  const [channel, setChannel] = useState(null);
  const [info, setInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [details, setDetails] = useState(true);

  const toggleDetails = () => setDetails(!details);

  useEffect(() => {
    const fetchChannelData = async () => {
      try {
        setIsLoading(true);
        setIsError(false);
        const response = await getChannel(slug);
        setChannel(response.data);
      } catch (err) {
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };
    fetchChannelData();
  }, [slug]);

  useEffect(() => {
    if (channel) {
      document.title = `${channel.name} | Mini Slack Clone`;
    }
  }, [channel]);

  useEffect(() => {
    socket.on('send message', (data) => {
      if (channel && data.sentFrom === slug) {
        const updatedMessages = [...channel.messages, data.message];
        setChannel((prevState) => ({
          ...prevState,
          messages: updatedMessages,
        }));
      }
    });
  });

  useEffect(() => {
    socket.on('typing', (data) => {
      if (!data) {
        setInfo(null);
      } else {
        // verify if the sender and the receiver of
        // the message are on the same channel or not
        data.sentFrom === slug
          ? setInfo(`${data.username} is typing a message`)
          : setInfo(null);
      }
    });
  });

  if (isError) {
    return <div>something went wrong...</div>;
  }

  return isLoading ? (
    <ChannelLoading />
  ) : (
    <div>
      <ChannelInfo
        channel={channel}
        details={details}
        handleClick={toggleDetails}
        user={user}
      />
      <div
        css={css`
          display: flex;
          flex-direction: row;
          height: calc(100vh - 65px);
        `}
      >
        <ChannelContent details={details}>
          <Messages info={info} messages={channel.messages} />
          <MessageInput channel={channel} user={user} />
        </ChannelContent>
        {details && (
          <ChannelDetails channel={channel} handleClick={toggleDetails} />
        )}
      </div>
    </div>
  );
}

const ChannelLoading = () => (
  <Placeholder>
    <Placeholder.Line />
    <Placeholder.Line />
    <Placeholder.Line />
    <Placeholder.Line />
  </Placeholder>
);

const ChannelContent = styled.div`
  flex-basis: 100%;

  ${(props) =>
    props.details &&
    css`
      flex-basis: 75%;
    `};
`;

export default Channel;
