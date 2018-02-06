import React, { Component } from 'react';
import _ from 'lodash';

import { 
  Grid,
  Header, Icon,
  Dimmer, Loader,
} from 'semantic-ui-react';

import Heatmap from './Heatmap';

export class OTUTable extends Component {
  constructor(props) {
    super(props);

    this.state = { 
      shape: props.shape,
      data: props.biom && props.biom.data,
      normalize: { row: false, col: false },
      busy: false,
      maxRows: 50,
    };
  }

  componentWillReceiveProps(props) {
    this.setState({ 
      shape: props.shape,
      data: props.biom && props.biom.data,
    });
  }

  shape() {
    if (this.props.biom) {
      let { data, shape } = this.props.biom;
      let nrow, ncol;
      if (shape) {
        nrow = shape[0];
        ncol = shape[1];
      } else {
        nrow = (data && data.length) || 0;
        ncol = (data && data[0].length) || 0;
      }
      return [ nrow, ncol ];
    } else {
      return [ 0, 0 ];
    }
  }

  rowSums(data) {
    if (data) {
      return _.map(data, row => _.sum(row));
    } else {
      return null;
    }
  }

  colSums(data) {
    let { shape } = this.state;
    if (data) {
      let nrow, ncol;

      if (shape) {
        nrow = shape[0];
        ncol = shape[1];
      } else {
        nrow = data.length;
        ncol = data[0].length;
      }

      let colSums = new Array(ncol).fill(0);
      for (let i = 0; i < nrow; ++i) {
        for (let j = 0; j < ncol; ++j) {
          colSums[j] += (data[i][j] || 0);
        }
      }
      return colSums;
    } else {
      return null;
    }
  }

  normalize(normalize = {}) {
    this.setState({ busy: true });
    normalize = Object.assign({}, this.state.normalize, normalize);
 
    let rowSums, colSums;
    let [ nrow, ncol ] = this.shape();

    if (normalize.row) rowSums = this.rowSums(this.props.biom.data);
    if (normalize.col) colSums = this.colSums(this.props.biom.data);

    let nr = Math.min(nrow,this.state.maxRows);
    let newData = new Array(ncol);

    for (let j = 0; j < ncol; ++j) {
      newData[j] = new Array(nr);
      for (let i = 0; i < nr; ++i) {
        newData[j][i] = this.props.biom.data[i][j];
        if (normalize.row && rowSums[i] > 0) newData[j][i] /= rowSums[i];
        if (normalize.col && colSums[j] > 0) newData[j][i] /= colSums[j];
      }
    }

    this.setState({
      normalize, 
      busy: false,
      data: newData
    });
  }

  toggleNormalize(by) {
    let { row, col } = Object.assign({},this.state.normalize);
    if (by === "row") row = ! this.state.normalize.row;
    if (by === "col") col = ! this.state.normalize.col;
    this.normalize({ row, col });
  }

  render() {
    let { normalize } = this.state;

    let rowSumSum = Math.floor(_.sum(this.rowSums(this.state.data)));
    let colSumSum = Math.floor(_.sum(this.colSums(this.state.data)));

    let [ nrow, ncol ] = this.shape();

    return (
      <Grid columns={2} divided>
        <Dimmer active={this.state.busy}>
          <Loader size="massive">Calculating</Loader>
        </Dimmer>

        <Grid.Row>
          <Grid.Column width={4}>
            <Header as="h4">Normalize</Header>
            <Icon name={"toggle "+((normalize.row) ? "on" : "off")} onClick={() => this.toggleNormalize("row")}
            /> Row
            <br />
            <Icon name={"toggle "+((normalize.col) ? "on" : "off")} onClick={() => this.toggleNormalize("col")}
            /> Column
            <p>
              Rows = {nrow || 0}, Cols = {ncol || 0}
            </p>
            <p>row sums sum = {rowSumSum}</p>
            <p>col sums sum = {colSumSum}</p>
          </Grid.Column>

          <Grid.Column width={12}>
            { this.state.data ? <Heatmap data={this.state.data} /> : null }
          </Grid.Column>
        </Grid.Row>
      </Grid>
    );
  }
}

export default OTUTable;
