import React, { Component } from 'react';
import {
    Col,
    Grid,
    Row
  } from 'react-bootstrap';
import Instance from './Instance';

const MainView = (props) => {
  const instances = props.instances.map((instance, index) => {
    return (
      <Row key={`instanceRow_${index+1}`}>
        <Instance key={`instance_${index}`}
          amount={instance.amount}
          pullRequests={instance.pullRequests}
          title={instance.name}
          />
      </Row>);
  });

  return (
    <Grid fluid={true}>
      <Col xs={12} md={8} mdOffset={2}>
        <Row>
          <h1>Pull Request Aggregator</h1>
        </Row>
        {instances}
      </Col>
    </Grid>
  );
}

export default MainView;
