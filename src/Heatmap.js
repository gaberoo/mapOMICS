import React, { Component } from "react";
import PropTypes from "prop-types";
import _ from "lodash"

import {
  Button, Container, Popup,
  Dimmer, Loader,
} from 'semantic-ui-react';

class Heatmap extends Component {
  static propTypes = {
    data: PropTypes.array.isRequired,
    width: PropTypes.number,
    height: PropTypes.number,
    zmin: PropTypes.number,
    zmax: PropTypes.number,
    invert: PropTypes.bool,
  }

  static defaultProps = {
    width: 500,
    height: 500,
    maxBoxSize: 50,
    invert: false,
    rowMajor: false,
  }

  constructor(props) {
    super(props);
    this.state = { busy: null };

    if (props.data) {
      if (props.rowMajor) {
        Object.assign(this.state, {
          nrow: props.data ? props.data.length : 0,
          ncol: props.data ? _.max(_.map(props.data, x => x.length)) : 0,
          zrange: [
            props.zmin !== undefined ? props.zmin : _.min(_.map(props.data, x => _.min(x))),
            props.zmax !== undefined ? props.zmax : _.max(_.map(props.data, x => _.max(x)))
          ],
        });
      } else {
        Object.assign(this.state, {
          ncol: props.data ? props.data.length : 0,
          nrow: props.data ? _.max(_.map(props.data, x => x.length)) : 0,
          zrange: [
            props.zmin !== undefined ? props.zmin : _.min(_.map(props.data, x => _.min(x))),
            props.zmax !== undefined ? props.zmax : _.max(_.map(props.data, x => _.max(x)))
          ],
        });
      }
    }

    this.calcCells = this.calcCells.bind(this);
  }

  componentWillReceiveProps(props) {
    this.readData(props.data);
  }

  readData(data) {
    this.setState({
      ncol: data ? data.length : 0,
      nrow: data ? _.max(_.map(data, x => x.length)) : 0,
      zrange: [
        this.props.zmin !== undefined ? this.props.zmin : _.min(_.map(data, x => _.min(x))),
        this.props.zmax !== undefined ? this.props.zmax : _.max(_.map(data, x => _.max(x)))
      ],
    });
  }

  scaleData(data, trim = false) {
    let { zrange } = this.state;
    return _.map(data, x => {
      return _.map(x, z => {
        let znew = (z-zrange[0])/(zrange[1]-zrange[0]);
        if (trim) znew = Math.max(Math.min(1,znew),0);
        return znew;
      });
    });
  }

  calcCells() {
    const { width, height, maxBoxSize, data } = this.props;
    const { nrow, ncol } = this.state;

    let boxWidth = Math.min(width/ncol,maxBoxSize);
    let boxHeight = Math.min(height/nrow,maxBoxSize);

    let scaledData = this.scaleData(data, true);

    let cells = [];

    for (let c = 0; c < ncol; ++c) {
      this.setState({ busy: `Generating column ${c+1}/${ncol}` });

      for (let r = 0; r < nrow; ++r) {
        let z;
        if (this.props.rowMajor) z = scaledData[r][c] || 0.0;
        else z = scaledData[c][r] || 0.0;

        if (this.props.invert) z = 1-z;
        let colorValue = Math.floor(255*z);
        let fill = `rgb(${colorValue},${colorValue},${colorValue})`;

        let key = `rect-${r}-${c}`;
        let rect = <rect key={key}
          x={c*boxWidth} y={r*boxHeight}
          width={boxWidth} height={boxHeight}
          stroke="#ffffff" fill={fill}
          data-value={this.props.data[c][r]} data-z={z}
        />;
        cells.push(rect);

        /*
        let header;
        if (this.props.names) {
          header = `${this.props.names[c]} <> ${this.props.names[r]}`;
        }

        cells.push(
          <Popup key={r+','+c} trigger={rect}>
            <Popup.Header>{header}</Popup.Header>
            <Popup.Content>
              <p>d = {Math.floor(100*this.props.data[c][r])/100 || 0}</p>
            </Popup.Content>
          </Popup>
        );
        */
      }
    }

    this.setState({ cells, busy: null });
  }

  render() {
    if (this.state.busy) {
      return <p>{this.state.busy}</p>;
    } else if (this.state.cells && this.state.cells.length > 0) {
      return (
        <svg width={this.props.width} height={this.props.height} className="plt-hm">
          {this.state.cells}
        </svg>
      );
    } else {
      return (
        <Button onClick={() => this.calcCells()}>Calculate Heatmap</Button>
      );
    }
  }
}

export default Heatmap;
