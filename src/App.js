import React, { Component } from 'react';

import Dropzone from 'react-dropzone';
import { OTUTable } from './Biom';

import { 
  Container, Header, Segment,
  Dimmer, Loader,
} from 'semantic-ui-react';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      files: [],
      readingFile: false,
      error: null,
      biom: null,
    };

    this.onDrop = this.onDrop.bind(this);
  }

  onDrop(files) {
    this.setState({ files });
    this.readJSON(files[0]);
  }

  readJSON(file) {
    const reader = new FileReader();
    reader.onload = () => {
      this.setState({ readingFile: true })
      try {
        let biom = JSON.parse(reader.result);
        this.setState({ readingFile: false, biom });
      } catch (error) {
        this.setState({ 
          readingFile: false,
          error: "JSON parse error: " + error,
        });
      }
    };
    reader.onabort = () => this.setState({ error: 'File reading was aborted.' });
    reader.onerror = () => this.setState({ error: 'File reading has failed.' });
    reader.readAsText(file);
  }

  render() {
    let dropzone;
    if (! this.state.biom) {
      dropzone = (
        <Segment>
          <Dimmer active={this.state.readingFile}>
            <Loader size="massive">Reading file</Loader>
          </Dimmer>
          <Dropzone onDrop={this.onDrop}>
            <p>Drop file here.</p>
          </Dropzone>
        </Segment>
      );
    }

    return (
      <Container>

        <Header as="h1">mapOMICS</Header>
        {dropzone}
        <OTUTable biom={this.state.biom} />
      </Container>
    );
  }
}

export default App;
