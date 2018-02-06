import React, { Component } from 'react';
import Dropzone from 'react-dropzone';
import './FileLoader.css';

export class FileLoader extends Component {
  constructor(props) {
    super(props);
  }

  onDrop(files) {
    this.props.onDrop(files);
  }

  render() {
    let files = this.state.files.map(f => (
      <li key={f.name}>{f.name} - {f.size} bytes</li>
    ));

    return (
      <section>
        <div className="dropzone">
          <Dropzone onDrop={this.onDrop.bind(this)}>
            <p>Try dropping some files here, or click to select files to upload.</p>
          </Dropzone>
        </div>
        <aside>
          <h2>Dropped files</h2>
          <ul>{files}</ul>
        </aside>
      </section>
    );
  }
}

export default FileLoader;

