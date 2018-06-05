import React from 'react';
import {
  Col,
  Panel,
  Row
} from 'react-bootstrap';
import moment from 'moment';

const PullRequest = (props) => {
  const timeDifference = moment.duration(Date.now() - new Date(props.data.updated));

  const openedAgo = (props.data.updated) ? ` updated ${timeDifference.humanize()} ago ` : '';
  const message = `#${props.data.id}${openedAgo} by `;

  return (
    <Panel>
      <Row>
        <Col xs={1}>{/* placeholder */}</Col>
        <Col xs={4}>
          {/* todo: update to allow clicking directly to repository */}
          <p className="panelTitle"><a href={`${props.data.url}`}>{props.data.repo}</a></p>
        </Col>
        <Col xs={6}>
          <p className="panelTitle"><a href={`${props.data.url}`}>{props.data.title}</a></p>
        </Col>
      </Row>
      <Row>
        <Col xs={10} xsOffset={1}>
          <p className="panelFooter">{message}<a href={`${props.data.user.url}`}>{props.data.user.login}</a></p>
        </Col>
      </Row>
    </Panel>
  );
};

export default PullRequest;
