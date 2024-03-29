import { Button } from '@react-email/button';
import { Column } from '@react-email/column';
import { Container } from '@react-email/container';
import { Head } from '@react-email/head';
import { Hr } from '@react-email/hr';
import { Html } from '@react-email/html';
import { Link } from '@react-email/link';
import { Preview } from '@react-email/preview';
import { Section } from '@react-email/section';
import { Text } from '@react-email/text';
import * as React from 'react';
import invariant from 'tiny-invariant';

export function Email(props) {
  const { request, type } = props;

  return (
    <Html lang="en">
      <Head>
        <title>request comment</title>
      </Head>
      <Preview>Email preview text request comment</Preview>;
      <Link href={`${process.env.HOSTNAME}/request/${request.id}`}>
        View Request
      </Link>
      <Text>
        {request.creator.firstName} {request.creator.lastName} commented on a
        request you (watch/mention/created).
      </Text>
      <Hr />
      {request.name}
      request id: {request.id}.
    </Html>
  );
}
