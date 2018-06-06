import React from 'react';
import {
  Badge,
  Panel,
  PanelGroup
} from 'react-bootstrap';
import PullRequest from './PullRequest';

const Instance = (props) => {
  const instanceName = props.title || 'Instance Name';

  const pullRequests = props.pullRequests.map((pr, index) => {
    return (
      <PullRequest key={`pr_data_${index}`} data={pr}/>
    );
  });

  return (
    <div>
      <PanelGroup>
        <Panel id={`instance-${instanceName}`} defaultExpanded>
          <Panel.Heading>
            <Panel.Title toggle>
              <p>{instanceName} <Badge>{props.amount}</Badge></p>
            </Panel.Title>
          </Panel.Heading>
          <Panel.Collapse>
            <Panel.Body>
              {pullRequests}
            </Panel.Body>
          </Panel.Collapse>
        </Panel>
      </PanelGroup>
    </div>
  );
};

export default Instance;
