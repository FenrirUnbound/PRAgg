import React, { Component } from 'react';
import MainView from './MainView';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      instances: []
    };
  }

  async updatePayload() {
    const endpoint = '/api/pullrequests';
    const payload = await fetch(endpoint).then((response) => { return response.json(); });

    this.setState({ instances: payload.data });
  }

  async componentDidMount() {
    return await this.updatePayload();
  }

  render() {
    return (<MainView instances={this.state.instances} />);
  }
}

export default App;
